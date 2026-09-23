import {
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, {FC, useEffect, useState} from 'react';
import {useTCP} from '../service/TCPProvider';
import Icon from '../components/global/Icon';
import {resetAndNavigate} from '../utils/NavigationUtil';
import LinearGradient from 'react-native-linear-gradient';
import {sendStyles} from '../styles/sendStyles';
import {connectionStyles} from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import Options from '../components/home/Options';
import {formatFileSize} from '../utils/libraryHelpers';
import {Colors, BrandGradients} from '../utils/Constants';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform} from 'react-native';

const ConnectionScreen: FC = () => {
  const {
    connectedDevice,
    disconnect,
    sendFileAck,
    sentFiles,
    receivedFiles,
    totalReceivedBytes,
    totalSentBytes,
    isConnected,
  } = useTCP();

  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVED'>('SENT');

  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case '.mp3':
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
      case '.mp4':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="videocam" size={18} color="#10B981" iconFamily="Ionicons" />
          </View>
        );
      case '.jpg':
      case '.png':
      case '.jpeg':
        return (
          <View style={connectionStyles.fileIconWrapper}>
            <Icon name="image" size={18} color="#F59E0B" iconFamily="Ionicons" />
          </View>
        );
      case '.pdf':
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

  const onMediaPickedUp = (image: any) => {
    console.log('Picked image:', image);
    sendFileAck(image, 'image');
  };

  const onFilePickedUp = (file: any) => {
    console.log('Picked file:', file);
    sendFileAck(file, 'file');
  };

  useEffect(() => {
    if (!isConnected) {
      resetAndNavigate('HomeScreen');
    }
  }, [isConnected]);

  const handleTabChange = (tab: 'SENT' | 'RECEIVED') => {
    setActiveTab(tab);
  };

  const renderItem = ({item}: any) => {
    return (
      <View style={connectionStyles.fileItem}>
        <View style={connectionStyles.fileInfoContainer}>
          {renderThumbnail(item?.mimeType)}
          <View style={connectionStyles?.fileDetails}>
            <CustomText numberOfLines={1} fontFamily="Okra-Bold" fontSize={11} color={Colors.text}>
              {item?.name}
            </CustomText>
            <CustomText fontFamily="Okra-Medium" fontSize={10} color={Colors.text_secondary} style={{marginTop: 2}}>
              {item?.mimeType} • {formatFileSize(item.size)}
            </CustomText>
          </View>
        </View>

        {item?.available ? (
          <TouchableOpacity
            style={connectionStyles.openButton}
            activeOpacity={0.8}
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
            }}>
            <CustomText
              numberOfLines={1}
              color="#fff"
              fontFamily="Okra-Bold"
              fontSize={10}>
              Open
            </CustomText>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator color={Colors.primary} size="small" />
        )}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={BrandGradients.connection}
      style={sendStyles.container}
      start={{x: 0, y: 1}}
      end={{x: 0, y: 0}}>
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={connectionStyles.container}>
          <View style={connectionStyles.connectionContainer}>
            <View style={{width: '60%'}}>
              <CustomText numberOfLines={1} fontFamily="Okra-Medium" fontSize={11} color={Colors.text_secondary}>
                Connected with
              </CustomText>

              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={15}
                color={Colors.text}>
                {connectedDevice || 'Unknown'}
              </CustomText>
            </View>

            <TouchableOpacity
              onPress={() => disconnect()}
              style={connectionStyles.disconnectButton}>
              <Icon
                name="close-circle"
                size={14}
                color="#EF4444"
                iconFamily="Ionicons"
              />
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={11}
                color="#EF4444">
                Disconnect
              </CustomText>
            </TouchableOpacity>
          </View>

          <Options
            onMediaPickedUp={onMediaPickedUp}
            onFilePickedUp={onFilePickedUp}
          />

          <View style={connectionStyles.fileContainer}>
            <View style={connectionStyles.sendReceiveContainer}>
              <View style={connectionStyles.sendReceiveButtonContainer}>
                <TouchableOpacity
                  onPress={() => handleTabChange('SENT')}
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'SENT'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}>
                  <Icon
                    name="cloud-upload"
                    size={13}
                    color={activeTab === 'SENT' ? '#fff' : Colors.primary}
                    iconFamily="Ionicons"
                  />
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={10}
                    color={activeTab === 'SENT' ? '#fff' : Colors.text}>
                    SENT
                  </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleTabChange('RECEIVED')}
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'RECEIVED'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}>
                  <Icon
                    name="cloud-download"
                    size={13}
                    color={activeTab === 'RECEIVED' ? '#fff' : Colors.primary}
                    iconFamily="Ionicons"
                  />
                  <CustomText
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={10}
                    color={activeTab === 'RECEIVED' ? '#fff' : Colors.text}>
                    RECEIVED
                  </CustomText>
                </TouchableOpacity>
              </View>

              <View style={connectionStyles.sendReceiveDataContainer}>
                <CustomText fontFamily="Okra-Bold" fontSize={9}>
                  {formatFileSize(
                    (activeTab === 'SENT'
                      ? totalSentBytes
                      : totalReceivedBytes) || 0,
                  )}
                </CustomText>

                <CustomText fontFamily="Okra-Bold" fontSize={12}>
                  /
                </CustomText>

                <CustomText fontFamily="Okra-Bold" fontSize={10}>
                  {activeTab === 'SENT'
                    ? formatFileSize(
                        sentFiles?.reduce(
                          (total: number, file: any) => total + file.size,
                          0,
                        ),
                      )
                    : formatFileSize(
                        receivedFiles?.reduce(
                          (total: number, file: any) => total + file.size,
                          0,
                        ),
                      )}
                </CustomText>
              </View>
            </View>



            {(activeTab === 'SENT'
              ? sentFiles?.length
              : receivedFiles?.length) > 0 ? (
              <FlatList
                data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={connectionStyles.fileList}
              />
            ) : (
              <View style={connectionStyles.noDataContainer}>
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Medium"
                  fontSize={11}>
                  {activeTab === 'SENT'
                    ? 'No files sent yet.'
                    : 'No files received yet.'}
                </CustomText>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => resetAndNavigate('HomeScreen')}
          style={sendStyles.backButton}>
          <Icon
            name="arrow-back"
            iconFamily="Ionicons"
            size={16}
            color="#000"
          />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ConnectionScreen;
