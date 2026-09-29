import {View, SafeAreaView, TouchableOpacity, StatusBar, Image} from 'react-native';
import React, {useState} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {homeHeaderStyles} from '../../styles/homeHeaderStyles';
import Icon from '../global/Icon';
import CustomText from '../global/CustomText';
import QRGenerateModal from '../modals/QRGenerateModal';

const HomeHeader = () => {
  const [isVisible, setVisible] = useState(false);

  return (
    <LinearGradient
      colors={['#4C1D95', '#6D28D9', '#7C3AED']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={homeHeaderStyles.mainContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView />

      <View style={homeHeaderStyles.container}>
        {/* Left Action: Menu / Grid */}
        <TouchableOpacity
          style={homeHeaderStyles.headerButton}
          activeOpacity={0.7}>
          <Icon iconFamily="Ionicons" name="grid-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Center: Sleek Brandmark */}
        <View style={homeHeaderStyles.brandContainer}>
          <View style={homeHeaderStyles.logoBadge}>
            <Icon
              iconFamily="Ionicons"
              name="flash"
              size={15}
              color="#F59E0B"
            />
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText
              fontFamily="Okra-Bold"
              fontSize={17}
              color="#FFFFFF"
              style={{letterSpacing: 0.6}}>
              SHARE
            </CustomText>
            <CustomText
              fontFamily="Okra-Bold"
              fontSize={17}
              color="#C084FC"
              style={{letterSpacing: 0.6, marginLeft: 3}}>
              APP
            </CustomText>
          </View>
        </View>

        {/* Right Action: Profile Avatar with Live Status Dot */}
        <TouchableOpacity
          style={homeHeaderStyles.profileButton}
          activeOpacity={0.8}
          onPress={() => setVisible(true)}>
          <Image
            source={require('../../assets/images/profile.jpg')}
            style={homeHeaderStyles.profile}
          />
          <View style={homeHeaderStyles.onlineDot} />
        </TouchableOpacity>
      </View>

      {isVisible && (
        <QRGenerateModal
          visible={isVisible}
          onClose={() => setVisible(false)}
        />
      )}
    </LinearGradient>
  );
};

export default HomeHeader;
