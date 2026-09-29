import {create} from 'zustand';

export interface QueuedFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  totalChunks: number;
}

interface ChunkState {
  // RECEIVE side: writes chunks directly to disk (no RAM accumulation)
  chunkStore: {
    id: string | null;
    name: string;
    size: number;
    totalChunks: number;
    receivedChunks: number; // count of chunks written to disk so far
    filePath: string;       // destination path — chunks appended here as they arrive
    mimeType?: string;
  } | null;

  // SEND side: currently-sending file metadata (no chunk array — streamed from disk)
  currentChunkSet: {
    id: string | null;
    uri: string;
    totalChunks: number;
  } | null;

  // SEND side: queue of files waiting to be sent
  fileQueue: QueuedFile[];

  setChunkStore: (chunkStore: any) => void;
  resetChunkStore: () => void;
  setCurrentChunkSet: (currentChunkSet: any) => void;
  resetCurrentChunkSet: () => void;
  enqueueFile: (file: QueuedFile) => void;
  dequeueFile: () => QueuedFile | null;
  clearQueue: () => void;
}

export const useChunkStore = create<ChunkState>((set, get) => ({
  chunkStore: null,
  currentChunkSet: null,
  fileQueue: [],

  setChunkStore: chunkStore => set(() => ({chunkStore})),
  resetChunkStore: () => set(() => ({chunkStore: null})),
  setCurrentChunkSet: currentChunkSet => set(() => ({currentChunkSet})),
  resetCurrentChunkSet: () => set(() => ({currentChunkSet: null})),

  enqueueFile: file =>
    set(state => ({fileQueue: [...state.fileQueue, file]})),

  dequeueFile: () => {
    const {fileQueue} = get();
    if (fileQueue.length === 0) return null;
    const [next, ...rest] = fileQueue;
    set(() => ({fileQueue: rest}));
    return next;
  },

  clearQueue: () => set(() => ({fileQueue: [], currentChunkSet: null})),
}));
