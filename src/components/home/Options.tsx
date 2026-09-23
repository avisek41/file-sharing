import {View, Text, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {optionStyles} from '../../styles/optionsStyles';
import Icon from '../global/Icon';
import {Colors} from '../../utils/Constants';
import CustomText from '../global/CustomText';
import {useTCP} from '../../service/TCPProvider';
import {navigate} from '../../utils/NavigationUtil';
import {pickDocument, pickImage, pickAudio, pickContact} from '../../utils/libraryHelpers';

const Options: FC<{
  isHome?: boolean;
  onMediaPickedUp?: (media: any) => void;
  onFilePickedUp?: (file: any) => void;
}> = ({isHome, onFilePickedUp, onMediaPickedUp}) => {
  const {isConnected} = useTCP();

  const handleUniversalPicker = async (type: string) => {
    if (isHome) {
      if (isConnected) {
        navigate('ConnectionScreen');
      } else {
        navigate('SendScreen');
      }
      return;
    }

    if (type === 'images' && onMediaPickedUp) {
      pickImage(onMediaPickedUp);
    } else if (type === 'audio' && onFilePickedUp) {
      pickAudio(onFilePickedUp);
    } else if (type === 'contacts' && onFilePickedUp) {
      pickContact(onFilePickedUp);
    } else if (type === 'file' && onFilePickedUp) {
      pickDocument(onFilePickedUp);
    } else if (onFilePickedUp) {
      pickDocument(onFilePickedUp);
    }
  };

  return (
    <View style={optionStyles.container}>
      <TouchableOpacity
        style={optionStyles.subContainer}
        activeOpacity={0.7}
        onPress={() => handleUniversalPicker('images')}>
        <View style={optionStyles.iconCircle}>
          <Icon
            name="images"
            iconFamily="Ionicons"
            color={Colors.primary}
            size={22}
          />
        </View>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={12}
          color={Colors.text}
          style={{textAlign: 'center'}}>
          Photos
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        style={optionStyles.subContainer}
        activeOpacity={0.7}
        onPress={() => handleUniversalPicker('audio')}>
        <View style={optionStyles.iconCircle}>
          <Icon
            name="musical-notes-sharp"
            iconFamily="Ionicons"
            color={Colors.primary}
            size={22}
          />
        </View>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={12}
          color={Colors.text}
          style={{textAlign: 'center'}}>
          Audio
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        style={optionStyles.subContainer}
        activeOpacity={0.7}
        onPress={() => handleUniversalPicker('file')}>
        <View style={optionStyles.iconCircle}>
          <Icon
            name="folder-open"
            iconFamily="Ionicons"
            color={Colors.primary}
            size={22}
          />
        </View>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={12}
          color={Colors.text}
          style={{textAlign: 'center'}}>
          Files
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        style={optionStyles.subContainer}
        activeOpacity={0.7}
        onPress={() => handleUniversalPicker('contacts')}>
        <View style={optionStyles.iconCircle}>
          <Icon
            name="contacts"
            iconFamily="MaterialCommunityIcons"
            color={Colors.primary}
            size={22}
          />
        </View>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={12}
          color={Colors.text}
          style={{textAlign: 'center'}}>
          Contacts
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default Options;
