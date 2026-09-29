import {produce} from 'immer';
import {Alert, Platform} from 'react-native';
import {useChunkStore} from '../db/chunkStore';
import {Buffer} from 'buffer';
import RNFS from 'react-native-fs';

// ─── Transfer constants ────────────────────────────────────────────────────────
export const CHUNK_SIZE = 1024 * 64;    // 64 KB per chunk
export const MAX_FILE_SIZE_MB = 1024;   // 1 GB per-file limit (streaming makes this safe)
export const MAX_FILES_PER_BATCH = 10;  // max files per send session

// ─── Platform-safe base directory ─────────────────────────────────────────────
// iOS:     Documents/ — private app sandbox, accessible via Files app if UIFileSharingEnabled
// Android: ExternalStorageDirectoryPath — visible in Downloads / file managers
export const getBaseDir = (): string =>
  Platform.OS === 'ios'
    ? RNFS.DocumentDirectoryPath
    : RNFS.ExternalStorageDirectoryPath ?? RNFS.ExternalDirectoryPath;

// ─── Ensure app directory exists ──────────────────────────────────────────────
export const ensureAppDir = async (): Promise<string> => {
  const appDir = `${getBaseDir()}/ShareApp`;
  const exists = await RNFS.exists(appDir);
  if (!exists) {
    await RNFS.mkdir(appDir);
  }
  return appDir;
};

// ─── Strip file:// prefix safely (iOS URIs from picker include it) ─────────────
export const normalizeUri = (uri: string): string =>
  Platform.OS === 'ios' ? uri.replace(/^file:\/\//, '') : uri;

// ─── receiveFileAck ────────────────────────────────────────────────────────────
// Called when the sender announces a file. Creates the destination file on disk
// immediately so chunks can be appended as they arrive (no RAM accumulation).
export const receiveFileAck = async (
  data: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const {setChunkStore, chunkStore} = useChunkStore.getState();
  if (chunkStore) {
    Alert.alert('Busy', 'Still receiving another file. Please wait.');
    return;
  }

  try {
    const appDir = await ensureAppDir();
    const filePath = `${appDir}/${data?.name}`;

    // ✅ Create empty file upfront — chunks will be appended here one by one
    await RNFS.writeFile(filePath, '', 'utf8');

    setChunkStore({
      id: data?.id,
      totalChunks: data?.totalChunks,
      name: data?.name,
      size: data?.size,
      mimeType: data?.mimeType,
      receivedChunks: 0,
      filePath,
    });

    setReceivedFiles((prevData: any) =>
      produce(prevData, (draft: any) => {
        draft.push({...data, uri: filePath, available: false});
      }),
    );

    if (!socket) {
      console.log('Socket not available');
      return;
    }

    console.log('FILE RECEIVED 🗳️ — destination:', filePath);
    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: 0}));
  } catch (error) {
    console.error('Error preparing file for receive:', error);
  }
};

// ─── sendChunkAck ──────────────────────────────────────────────────────────────
// Reads exactly one 64 KB chunk from disk at the right byte offset and sends it.
// The full file is NEVER loaded into RAM — safe for any file size.
export const sendChunkAck = async (
  chunkIndex: number,
  socket: any,
  setTotalSentBytes: any,
  setSentFiles: any,
  onFileComplete?: () => void,
) => {
  const {currentChunkSet, resetCurrentChunkSet} = useChunkStore.getState();

  if (!currentChunkSet) {
    console.warn('sendChunkAck: no currentChunkSet');
    return;
  }

  if (!socket) {
    console.error('Socket not available');
    return;
  }

  const {uri, totalChunks} = currentChunkSet;
  const offset = chunkIndex * CHUNK_SIZE;

  try {
    // ✅ iOS & Android: RNFS.read(path, length, position, encoding) — works on both
    const chunkBase64: string = await RNFS.read(uri, CHUNK_SIZE, offset, 'base64');
    const chunkByteLength = Buffer.from(chunkBase64, 'base64').length;

    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: chunkBase64,
        chunkNo: chunkIndex,
      }),
    );

    setTotalSentBytes((prev: number) => prev + chunkByteLength);

    if (chunkIndex + 1 >= totalChunks) {
      console.log('ALL CHUNKS SENT ✅ 🔴 —', uri);
      setSentFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const idx = draftFiles?.findIndex(
            (f: any) => f.id === currentChunkSet.id,
          );
          if (idx !== -1) {
            draftFiles[idx].available = true;
          }
        }),
      );
      resetCurrentChunkSet();
      onFileComplete?.();
    }
  } catch (error) {
    console.error('Error streaming chunk:', error);
  }
};

// ─── receiveChunkAck ───────────────────────────────────────────────────────────
// Appends each incoming chunk directly to disk — zero RAM accumulation.
// Works on both iOS and Android via RNFS.appendFile.
export const receiveChunkAck = async (
  chunk: string,
  chunkNo: number,
  socket: any,
  setTotalReceivedBytes: any,
  finalizeReceivedFile: (filePath: string, id: string, mimeType: string, name: string) => Promise<void>,
) => {
  const {chunkStore, setChunkStore, resetChunkStore} = useChunkStore.getState();
  if (!chunkStore) {
    console.log('Chunk Store is null');
    return;
  }

  try {
    // ✅ Append decoded bytes directly to disk — no Buffer array in memory
    await RNFS.appendFile(chunkStore.filePath, chunk, 'base64');

    const chunkByteLength = Buffer.from(chunk, 'base64').length;
    setTotalReceivedBytes((prev: number) => prev + chunkByteLength);

    const newCount = chunkStore.receivedChunks + 1;
    setChunkStore({...chunkStore, receivedChunks: newCount});

    const isComplete = newCount >= chunkStore.totalChunks;

    if (isComplete) {
      console.log('All Chunks Received ✅ 🔴 — finalizing:', chunkStore.filePath);
      const {filePath, id, mimeType, name} = chunkStore;
      resetChunkStore();
      await finalizeReceivedFile(filePath, id!, mimeType ?? '*/*', name);
      return;
    }
  } catch (error) {
    console.log('Error writing chunk to disk:', error);
  }

  if (!socket) {
    console.log('Socket not available');
    return;
  }

  try {
    socket.write(
      JSON.stringify({event: 'send_chunk_ack', chunkNo: chunkNo + 1}),
    );
  } catch (error) {
    console.error('Error requesting next chunk:', error);
  }
};

