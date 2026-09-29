import 'react-native-get-random-values';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import {useChunkStore} from '../db/chunkStore';
import TcpSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import {Alert, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {v4 as uuidv4} from 'uuid';
import {produce} from 'immer';
import {
  receiveChunkAck,
  receiveFileAck,
  sendChunkAck,
  CHUNK_SIZE,
  MAX_FILE_SIZE_MB,
  MAX_FILES_PER_BATCH,
  normalizeUri,
} from './TCPUtils';

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevice: any;
  sentFiles: any;
  receivedFiles: any;
  totalSentBytes: number;
  totalReceivedBytes: number;
  fileQueue: any[];
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  sendMessage: (message: string | Buffer) => void;
  sendFileAck: (file: any, type: 'file' | 'image') => void;
  disconnect: () => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = (): TCPContextType => {
  const context = useContext(TCPContext);
  if (!context) {
    throw new Error('useTCP must be used within a TCPProvider');
  }
  return context;
};

const options = {
  keystore: require('../../tls_certs/server-keystore.p12'),
};

export const TCPProvider: FC<{children: React.ReactNode}> = ({children}) => {
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [serverSocket, setServerSocket] = useState<any>(null);
  const [sentFiles, setSentFiles] = useState<any>([]);
  const [receivedFiles, setReceivedFiles] = useState<any>([]);
  const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
  const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);

  const {currentChunkSet, setCurrentChunkSet, setChunkStore, enqueueFile, dequeueFile, clearQueue, fileQueue} = useChunkStore();

  // DISCONNECT

  const disconnect = useCallback(() => {
    if (client) {
      client.destroy();
    }
    if (server) {
      server.close();
    }
    setReceivedFiles([]);
    setSentFiles([]);
    setCurrentChunkSet(null);
    setTotalReceivedBytes(0);
    setChunkStore(null);
    clearQueue();
    setIsConnected(false);
  }, [client, server]);

  // START SERVER

  const startServer = useCallback(
    (port: number) => {
      if (server) {
        console.log('Server Already Running');
        return;
      }

      const newServer = TcpSocket.createTLSServer(options, socket => {
        console.log('Client Connected: ', socket.address());

        setServerSocket(socket);
        socket.setNoDelay(true);
        socket.readableHighWaterMark = 1024 * 1024 * 1;
        socket.writableHighWaterMark = 1024 * 1024 * 1;

        socket.on('data', async data => {
          const parsedData = JSON.parse(data?.toString());

          if (parsedData?.event === 'connect') {
            setIsConnected(true);
            setConnectedDevice(parsedData?.deviceName);
          }

          if (parsedData.event === 'file_ack') {
            receiveFileAck(parsedData?.file, socket, setReceivedFiles);
          }

        if (parsedData.event === 'send_chunk_ack') {
            sendChunkAck(
              parsedData?.chunkNo,
              socket,
              setTotalSentBytes,
              setSentFiles,
              () => processNextInQueueRef.current(),
            );
          }

          if (parsedData.event === 'receive_chunk_ack') {
            receiveChunkAck(
              parsedData?.chunk,
              parsedData?.chunkNo,
              socket,
              setTotalReceivedBytes,
              finalizeReceivedFile,
            );
          }
        });

        socket.on('close', () => {
          console.log('Client Disconnected');
          setReceivedFiles([]);
          setSentFiles([]);
          setCurrentChunkSet(null);
          setTotalReceivedBytes(0);
          setChunkStore(null);
          setIsConnected(false);
          disconnect();
        });

        socket.on('error', err => console.error('Socket Error:', err));
      });

      newServer.listen({port, host: '0.0.0.0'}, () => {
        const address = newServer.address();
        console.log(`Server running on ${address?.address}:${address?.port}`);
      });

      newServer.on('error', err => console.error('Server Error:', err));
      setServer(newServer);
    },
    [server],
  );

  // START CLIENT

  const connectToServer = useCallback(
    (host: string, port: number, deviceName: string) => {
      const newClient = TcpSocket.connectTLS(
        {
          host,
          port,
          cert: true,
          ca: require('../../tls_certs/server-cert.pem'),
        },
        () => {
          console.log('connect')
          setIsConnected(true);
          setConnectedDevice(deviceName);
          const myDeviceName = DeviceInfo.getDeviceNameSync();
          newClient.write(
            JSON.stringify({event: 'connect', deviceName: myDeviceName}),
          );
        },
      );

      newClient.setNoDelay(true);
      newClient.readableHighWaterMark = 1024 * 1024 * 1;
      newClient.writableHighWaterMark = 1024 * 1024 * 1;

      newClient.on('data', async data => {
        const parsedData = JSON.parse(data?.toString());

        if (parsedData.event === 'file_ack') {
          receiveFileAck(parsedData?.file, newClient, setReceivedFiles);
        }

        if (parsedData.event === 'send_chunk_ack') {
          sendChunkAck(
            parsedData?.chunkNo,
            newClient,
            setTotalSentBytes,
            setSentFiles,
            () => processNextInQueueRef.current(),
          );
        }

        if (parsedData.event === 'receive_chunk_ack') {
          receiveChunkAck(
            parsedData?.chunk,
            parsedData?.chunkNo,
            newClient,
            setTotalReceivedBytes,
            finalizeReceivedFile,
          );
        }
      });

      newClient.on('close', () => {
        console.log('Connection Closed');
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setTotalReceivedBytes(0);
        setChunkStore(null);
        setIsConnected(false);
        disconnect();
      });

      newClient.on('error', err => {
        console.error('Client Error:', err);
      });

      setClient(newClient);
    },
    [],
  );

  // GENERATE FILE → replaced with finalizeReceivedFile
  // File is already fully written to disk by receiveChunkAck (streamed chunk-by-chunk).
  // This function only handles post-write tasks: updating state + Android MediaStore indexing.
  const finalizeReceivedFile = async (
    filePath: string,
    id: string,
    mimeType: string,
    name: string,
  ) => {
    try {
      setReceivedFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const idx = draftFiles?.findIndex((f: any) => f.id === id);
          if (idx !== -1) {
            draftFiles[idx] = {
              ...draftFiles[idx],
              uri: filePath,
              available: true,
            };
          }
        }),
      );

      console.log('FILE SAVED SUCCESSFULLY ✅', filePath);

      // Android only: index into MediaStore so file appears in Downloads / Gallery immediately
      if (Platform.OS === 'android') {
        try {
          await RNFS.scanFile(filePath);
          console.log('Android MediaScanner: scanned successfully');
        } catch (scanErr) {
          console.log('scanFile note:', scanErr);
        }

        try {
          await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
            {
              name,
              parentFolder: 'ShareApp',
              mimeType: mimeType || '*/*',
            },
            'Download',
            filePath,
          );
          console.log('Android MediaStore: indexed successfully');
        } catch (mediaErr) {
          console.log('copyToMediaStore note:', mediaErr);
        }
      }
    } catch (error) {
      console.error('Error finalizing received file:', error);
    }
  };

  // ─── SEND MESSAGE ───────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    (message: string | Buffer) => {
      if (client) {
        client.write(JSON.stringify(message));
        console.log('Sent from client:', message);
      } else if (serverSocket) {
        serverSocket.write(JSON.stringify(message));
        console.log('Sent from server:', message);
      } else {
        console.error('No Client or Server Socket available');
      }
    },
    [client, serverSocket],
  );

  // ─── PROCESS NEXT FILE IN QUEUE ────────────────────────────────────────────
  // Ref so socket data-handlers always call the latest version (no stale closure)
  const processNextInQueueRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const processNextInQueue = useCallback(async () => {
    const next = dequeueFile();
    if (!next) {
      console.log('Queue empty — all files sent ✅');
      return;
    }

    const normalizedPath = normalizeUri(next.uri);

    setCurrentChunkSet({
      id: next.id,
      uri: normalizedPath,
      totalChunks: next.totalChunks,
    });

    const socket = client || serverSocket;
    if (!socket) return;

    try {
      console.log('Starting queued file 📤', next.name);
      socket.write(JSON.stringify({event: 'file_ack', file: next}));
    } catch (error) {
      console.error('Error starting next queued file:', error);
    }
  }, [client, serverSocket, dequeueFile, setCurrentChunkSet]);

  // Keep ref in sync so the socket handlers always call latest version
  processNextInQueueRef.current = processNextInQueue;


  // ─── SEND FILE ACK ─────────────────────────────────────────────────────────
  const sendFileAck = async (file: any, type: 'image' | 'file') => {
    // ── Size restriction ──
    const fileSize = type === 'file' ? file?.size : file?.fileSize;
    const MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (fileSize > MAX_BYTES) {
      Alert.alert(
        'File Too Large',
        `Maximum allowed size is ${MAX_FILE_SIZE_MB} MB. This file is ${(fileSize / 1024 / 1024).toFixed(1)} MB.`,
      );
      return;
    }

    // ── Count restriction (queue + currently sending) ──
    if (fileQueue.length >= MAX_FILES_PER_BATCH) {
      Alert.alert(
        'Queue Full',
        `You can send at most ${MAX_FILES_PER_BATCH} files at a time.`,
      );
      return;
    }

    const normalizedPath = normalizeUri(file?.uri ?? '');

    // Calculate total chunks WITHOUT reading the whole file into memory
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

    const rawData = {
      id: uuidv4(),
      name: type === 'file' ? file?.name : file?.fileName,
      size: fileSize,
      mimeType: type === 'file' ? 'file' : '.jpg',
      totalChunks,
      uri: normalizedPath,
    };

    setSentFiles((prevData: any) =>
      produce(prevData, (draft: any) => {
        draft.push({...rawData, uri: file?.uri});
      }),
    );

    const isBusy = currentChunkSet != null;

    if (isBusy) {
      // Sender is already transferring — add to queue
      enqueueFile(rawData);
      console.log('Queued file:', rawData.name, '| Queue length:', fileQueue.length + 1);
      return;
    }

    // ✅ Not busy — start sending immediately
    setCurrentChunkSet({
      id: rawData.id,
      uri: normalizedPath,
      totalChunks,
    });

    const socket = client || serverSocket;
    if (!socket) return;

    try {
      console.log('FILE ACKNOWLEDGE DONE ✅');
      socket.write(JSON.stringify({event: 'file_ack', file: rawData}));
    } catch (error) {
      console.log('Error Sending File:', error);
    }
  };

  return (
    <TCPContext.Provider
      value={{
        server,
        client,
        connectedDevice,
        sentFiles,
        receivedFiles,
        totalReceivedBytes,
        totalSentBytes,
        isConnected,
        fileQueue,
        startServer,
        connectToServer,
        disconnect,
        sendMessage,
        sendFileAck,
      }}>
      {children}
    </TCPContext.Provider>
  );
};
