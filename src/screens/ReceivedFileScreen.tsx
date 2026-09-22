import {View, Platform, ActivityIndicator, FlatList} from 'react-native';
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
import {TouchableOpacity} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {goBack} from '../utils/NavigationUtil';

const ReceivedFileScreen: FC = () => {
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
      }));
      setTimeout(() => {
        setReceivedFiles(formattedFiles);
        setIsLoading(false);
      }, 3000);
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

  return (
    <LinearGradient
      colors={['#FFFFFF', '#F0F7FF', '#BAE6FD', '#38BDF8']}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />

      <View style={sendStyles.mainContainer}>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={16}
          color={Colors.text}
          style={{textAlign: 'center', marginVertical: 14}}>
          All Received Files
        </CustomText>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{marginTop: 40}} />
        ) : (
          <>
            {receivedFiles?.length > 0 ? (
              <FlatList
                key={receivedFiles.length}
                data={receivedFiles}
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

        <TouchableOpacity onPress={goBack} style={sendStyles.backButton}>
          <Icon
            name="arrow-back"
            iconFamily="Ionicons"
            size={20}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ReceivedFileScreen;
