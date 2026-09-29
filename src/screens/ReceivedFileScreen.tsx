import {View, Platform, ActivityIndicator, FlatList, TouchableOpacity, StatusBar} from 'react-native';
import React, {FC, useEffect, useState, useMemo, useCallback} from 'react';
import RNFS from 'react-native-fs';
import Icon from '../components/global/Icon';
import LinearGradient from 'react-native-linear-gradient';
import {sendStyles} from '../styles/sendStyles';
import {SafeAreaView} from 'react-native';
import CustomText from '../components/global/CustomText';
import {Colors} from '../utils/Constants';
import {connectionStyles} from '../styles/connectionStyles';
import {formatFileSize} from '../utils/libraryHelpers';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {goBack} from '../utils/NavigationUtil';
import {useIsFocused} from '@react-navigation/native';
import {useTCP} from '../service/TCPProvider';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const ReceivedFileScreen: FC = () => {
  const {receivedFiles: sessionReceivedFiles} = useTCP();
  const [diskFiles, setDiskFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFilesFromDirectory = useCallback(async () => {
    setIsLoading(true);
    const baseDir =
      Platform.OS === 'android'
        ? RNFS.DownloadDirectoryPath
        : RNFS.DocumentDirectoryPath;
    const appDir = `${baseDir}/ShareApp`;

    try {
      const exists = await RNFS.exists(appDir);
      if (!exists) {
        await RNFS.mkdir(appDir);
        setDiskFiles([]);
        setIsLoading(false);
        return;
      }

      const files = await RNFS.readDir(appDir);
      let actualFiles = files.filter(file => {
        if (!file.name || file.name.startsWith('.')) {
          return false;
        }
        return typeof file.isFile === 'function' ? file.isFile() : true;
      });

      // On iOS, also include files in root DocumentDirectory if any
      if (Platform.OS === 'ios') {
        try {
          const rootFiles = await RNFS.readDir(baseDir);
          const rootActual = rootFiles.filter(file => {
            if (!file.name || file.name.startsWith('.') || file.name === 'ShareApp') {
              return false;
            }
            return typeof file.isFile === 'function' ? file.isFile() : true;
          });
          rootActual.forEach(rf => {
            if (!actualFiles.some(f => f.name === rf.name)) {
              actualFiles.push(rf);
            }
          });
        } catch (e) {
          // ignore
        }
      }

      const formattedFiles = actualFiles.map(file => ({
        id: file.name,
        name: file.name,
        size: file.size,
        uri: file.path,
        mimeType: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        mtime: file.mtime ? new Date(file.mtime).getTime() : 0,
        dateFormatted: file.mtime ? new Date(file.mtime).toLocaleDateString() : '',
        available: true,
      }));

      // Sort by newest received first
      formattedFiles.sort((a, b) => b.mtime - a.mtime);

      setDiskFiles(formattedFiles);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching received files:', error);
      setDiskFiles([]);
      setIsLoading(false);
    }
  }, []);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getFilesFromDirectory();
    }
  }, [isFocused, getFilesFromDirectory]);

  // Synchronize saved disk files with active in-memory session received files
  const combinedFiles = useMemo(() => {
    const list = [...diskFiles];
    if (sessionReceivedFiles && sessionReceivedFiles.length > 0) {
      sessionReceivedFiles.forEach((sFile: any) => {
        const existingIdx = list.findIndex(
          d => d.name === sFile.name || (sFile.id && d.id === sFile.id),
        );
        if (existingIdx !== -1) {
          list[existingIdx] = {
            ...list[existingIdx],
            ...sFile,
            uri: list[existingIdx].uri || sFile.uri,
            available: sFile.available !== undefined ? sFile.available : true,
          };
        } else {
          list.unshift({
            id: sFile.id || sFile.name,
            name: sFile.name,
            size: sFile.size || 0,
            uri: sFile.uri,
            mimeType: (sFile.name || '').split('.').pop()?.toLowerCase() || 'unknown',
            available: sFile.available !== undefined ? sFile.available : false,
            dateFormatted: 'Today',
            mtime: Date.now(),
          });
        }
      });
    }
    return list;
  }, [diskFiles, sessionReceivedFiles]);

  const renderThumbnail = (mimeType: string) => {
    const iconStyle = {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: 'rgba(124, 58, 237, 0.08)',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    };

    switch (mimeType) {
      case 'mp3':
      case 'wav':
      case 'aac':
        return (
          <View style={iconStyle}>
            <Icon
              name="musical-notes"
              size={20}
              color={Colors.primary}
              iconFamily="Ionicons"
            />
          </View>
        );
      case 'mp4':
      case 'mkv':
      case 'mov':
        return (
          <View style={[iconStyle, {backgroundColor: 'rgba(16, 185, 129, 0.1)'}]}>
            <Icon name="videocam" size={20} color="#10B981" iconFamily="Ionicons" />
          </View>
        );
      case 'jpg':
      case 'png':
      case 'jpeg':
      case 'webp':
        return (
          <View style={[iconStyle, {backgroundColor: 'rgba(245, 158, 11, 0.1)'}]}>
            <Icon name="image" size={20} color="#F59E0B" iconFamily="Ionicons" />
          </View>
        );
      case 'pdf':
        return (
          <View style={[iconStyle, {backgroundColor: 'rgba(239, 68, 68, 0.1)'}]}>
            <Icon name="document-text" size={20} color="#EF4444" iconFamily="Ionicons" />
          </View>
        );
      default:
        return (
          <View style={iconStyle}>
            <Icon name="folder" size={20} color={Colors.primary} iconFamily="Ionicons" />
          </View>
        );
    }
  };

  const renderItem = ({item}: any) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 14,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: 'rgba(124, 58, 237, 0.1)',
          shadowColor: Colors.primary,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.14,
          shadowRadius: 10,
          elevation: 4,
        }}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles.fileDetails}>
            <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={13} color={Colors.text}>
              {item.name}
            </CustomText>
            <CustomText
              numberOfLines={1}
              fontFamily="Okra-Medium"
              fontSize={11}
              color={Colors.text_secondary}
              style={{marginTop: 3}}>
              {item.mimeType?.toUpperCase()} • {formatFileSize(item.size)} {item.dateFormatted ? `• ${item.dateFormatted}` : ''}
            </CustomText>
          </View>
        </View>

        {item?.available !== false ? (
          <TouchableOpacity
            onPress={() => {
              const normalizedPath =
                Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;

              if (Platform.OS === 'ios') {
                ReactNativeBlobUtil.ios
                  .openDocument(normalizedPath)
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file:', err));
              } else {
                ReactNativeBlobUtil.android
                  .actionViewIntent(normalizedPath, '*/*')
                  .then(() => console.log('File opened successfully'))
                  .catch(err => console.error('Error opening file:', err));
              }
            }}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 18,
              paddingVertical: 7,
              paddingHorizontal: 16,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: Colors.primary,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 3,
            }}
            activeOpacity={0.8}>
            <CustomText
              numberOfLines={1}
              color="#fff"
              fontFamily="Okra-Bold"
              fontSize={11}>
              Open
            </CustomText>
          </TouchableOpacity>
        ) : (
          <View style={{paddingHorizontal: 8, alignItems: 'center'}}>
            <ActivityIndicator color={Colors.primary} size="small" />
            <CustomText
              fontFamily="Okra-Medium"
              fontSize={9}
              color={Colors.primary}
              style={{marginTop: 3}}>
              Receiving...
            </CustomText>
          </View>
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#FAF5FF', '#F3E8FF', '#EDE9FE']}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView />

      <View style={[sendStyles.mainContainer, {paddingTop: statusBarHeight + 6}]}>
        {/* Top Header Row with Back Button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: '#FFFFFF',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(124, 58, 237, 0.15)',
              shadowColor: Colors.primary,
              shadowOffset: {width: 0, height: 3},
              shadowOpacity: 0.2,
              shadowRadius: 6,
              elevation: 4,
            }}>
            <Icon
              name="arrow-back"
              iconFamily="Ionicons"
              size={20}
              color={Colors.text}
            />
          </TouchableOpacity>

          <CustomText fontFamily="Okra-Bold" fontSize={18} color={Colors.text}>
            Received Files
          </CustomText>

          <View style={{width: 42}} />
        </View>

        {/* Location Indicator Pill */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 14,
            marginBottom: 14,
            gap: 6,
            borderWidth: 1,
            borderColor: 'rgba(124, 58, 237, 0.14)',
          }}>
          <Icon name="folder-open" size={13} color={Colors.primary} iconFamily="Ionicons" />
          <CustomText fontFamily="Okra-Medium" fontSize={11} color={Colors.primary}>
            {Platform.OS === 'android'
              ? 'Stored in: Internal Storage > Download > ShareApp'
              : 'Stored in: Files > On My iPhone > Share App'}
          </CustomText>
        </View>

        {isLoading ? (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <View style={{flex: 1}}>
            {combinedFiles?.length > 0 ? (
              <FlatList
                style={{flex: 1}}
                data={combinedFiles}
                keyExtractor={(item, index) => item.id || item.name || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 28, flexGrow: 1}}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={[connectionStyles.noDataContainer, {flex: 1, alignItems: 'center', justifyContent: 'center'}]}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: 'rgba(124, 58, 237, 0.08)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: 'rgba(124, 58, 237, 0.15)',
                    shadowColor: Colors.primary,
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 3,
                  }}>
                  <Icon name="folder-open-outline" iconFamily="Ionicons" size={36} color={Colors.primary} />
                </View>
                <CustomText
                  fontFamily="Okra-Bold"
                  fontSize={16}
                  color={Colors.text}>
                  No files received yet
                </CustomText>
                <CustomText
                  fontFamily="Okra-Medium"
                  fontSize={12}
                  color={Colors.text_secondary}
                  style={{marginTop: 6, textAlign: 'center', paddingHorizontal: 32}}>
                  Files shared with you from other devices will appear here automatically.
                </CustomText>
              </View>
            )}
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default ReceivedFileScreen;
