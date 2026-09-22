import {View, Platform, ActivityIndicator, FlatList, TouchableOpacity, StatusBar} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
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
import {useRoute} from '@react-navigation/native';

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

const ReceivedFileScreen: FC = () => {
  const route = useRoute<any>();
  const [activeTab, setActiveTab] = useState<'files' | 'history'>(
    route?.params?.initialTab || 'files',
  );
  const [receivedFiles, setReceivedFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getFilesFromDirectory = async () => {
    setIsLoading(true);
    const platformPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/`
        : `${RNFS.DocumentDirectoryPath}/`;

    try {
      const exists = await RNFS.exists(platformPath);
      if (!exists) {
        setReceivedFiles([]);
        setIsLoading(false);
        return;
      }

      const files = await RNFS.readDir(platformPath);

      const formattedFiles = files.map(file => ({
        id: file.name,
        name: file.name,
        size: file.size,
        uri: file.path,
        mimeType: file.name.split('.').pop() || 'unknown',
        mtime: file.mtime ? new Date(file.mtime).getTime() : 0,
        dateFormatted: file.mtime ? new Date(file.mtime).toLocaleDateString() : '',
      }));
      setTimeout(() => {
        setReceivedFiles(formattedFiles);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error fetching files:', error);
      setReceivedFiles([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getFilesFromDirectory();
  }, []);

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case 'mp3':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon
              name="musical-notes"
              size={18}
              color={Colors.primary}
              iconFamily="Ionicons"
            />
          </View>
        );
      case 'mp4':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="videocam" size={18} color="#10B981" iconFamily="Ionicons" />
          </View>
        );
      case 'jpg':
      case 'png':
      case 'jpeg':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="image" size={18} color="#F59E0B" iconFamily="Ionicons" />
          </View>
        );
      case 'pdf':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="document-text" size={18} color="#EF4444" iconFamily="Ionicons" />
          </View>
        );
      default:
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="folder" size={18} color={Colors.primary} iconFamily="Ionicons" />
          </View>
        );
    }
  };

  const renderItem = ({item}: any) => {
    return (
      <View style={connectionStyles.fileItem}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles.fileDetails}>
            <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={11} color={Colors.text}>
              {item.name}
            </CustomText>
            <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={10} color={Colors.text_secondary} style={{marginTop: 2}}>
              {item.mimeType} • {formatFileSize(item.size)}
            </CustomText>
          </View>
        </View>

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
          style={connectionStyles.openButton}
          activeOpacity={0.8}>
          <CustomText
            numberOfLines={1}
            color="#fff"
            fontFamily="Okra-Bold"
            fontSize={10}>
            Open
          </CustomText>
        </TouchableOpacity>
      </View>
    );
  };

  const displayedFiles =
    activeTab === 'history'
      ? [...receivedFiles].sort((a, b) => (b.mtime || 0) - (a.mtime || 0))
      : receivedFiles;

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F0F7FF', '#BAE6FD', '#38BDF8']}
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
        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12}}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.9)',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.border,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Icon
              name="arrow-back"
              iconFamily="Ionicons"
              size={20}
              color={Colors.text}
            />
          </TouchableOpacity>

          <CustomText fontFamily="Okra-Bold" fontSize={17} color={Colors.text}>
            Received Files
          </CustomText>

          <View style={{width: 40}} />
        </View>

        {/* Segmented Tab Switcher */}
        <View style={{flexDirection: 'row', justifyContent: 'center', marginBottom: 14, gap: 10, paddingHorizontal: 16}}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('files')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 12,
              backgroundColor: activeTab === 'files' ? Colors.primary : 'rgba(255,255,255,0.85)',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: activeTab === 'files' ? Colors.primary : Colors.border,
              shadowColor: Colors.primary,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: activeTab === 'files' ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: activeTab === 'files' ? 3 : 1,
            }}>
            <Icon
              name="folder-open"
              iconFamily="Ionicons"
              size={15}
              color={activeTab === 'files' ? '#fff' : Colors.text_secondary}
            />
            <CustomText
              fontFamily="Okra-Bold"
              fontSize={13}
              color={activeTab === 'files' ? '#fff' : Colors.text_secondary}>
              All Files
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('history')}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 12,
              backgroundColor: activeTab === 'history' ? Colors.primary : 'rgba(255,255,255,0.85)',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: activeTab === 'history' ? Colors.primary : Colors.border,
              shadowColor: Colors.primary,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: activeTab === 'history' ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: activeTab === 'history' ? 3 : 1,
            }}>
            <Icon
              name="time"
              iconFamily="Ionicons"
              size={15}
              color={activeTab === 'history' ? '#fff' : Colors.text_secondary}
            />
            <CustomText
              fontFamily="Okra-Bold"
              fontSize={13}
              color={activeTab === 'history' ? '#fff' : Colors.text_secondary}>
              History
            </CustomText>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{marginTop: 40}} />
        ) : (
          <>
            {displayedFiles?.length > 0 ? (
              <FlatList
                key={`${activeTab}-${displayedFiles.length}`}
                data={displayedFiles}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={[connectionStyles.fileList, {paddingHorizontal: 16}]}
              />
            ) : (
              <View style={connectionStyles.noDataContainer}>
                <Icon name="folder-open-outline" iconFamily="Ionicons" size={48} color={Colors.text_light} />
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Medium"
                  fontSize={13}
                  color={Colors.text_secondary}
                  style={{marginTop: 10}}>
                  No files received yet.
                </CustomText>
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
};

export default ReceivedFileScreen;
