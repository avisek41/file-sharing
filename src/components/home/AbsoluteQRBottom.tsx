import {View, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {bottomTabStyles} from '../../styles/bottomTabStyle';
import {navigate} from '../../utils/NavigationUtil';
import Icon from '../global/Icon';
import QRScannerModal from '../modals/QRScannerModal';
import {Colors} from '../../utils/Constants';

const AbsoluteQRBottom = () => {
  const [isVisible, setVisible] = useState(false);

  return (
    <>
      <View style={bottomTabStyles.container}>
        <TouchableOpacity
          style={bottomTabStyles.navItem}
          activeOpacity={0.7}
          onPress={() => navigate('HomeScreen')}>
          <Icon
            name="home"
            iconFamily="Ionicons"
            color={Colors.primary}
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={bottomTabStyles.qrCode}
          activeOpacity={0.85}
          onPress={() => setVisible(true)}>
          <Icon
            name="qrcode-scan"
            iconFamily="MaterialCommunityIcons"
            color="#fff"
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={bottomTabStyles.navItem}
          activeOpacity={0.7}
          onPress={() => navigate('ReceivedFileScreen')}>
          <Icon
            name="folder-open-outline"
            iconFamily="Ionicons"
            color={Colors.text_secondary}
            size={24}
          />
        </TouchableOpacity>
      </View>

      {isVisible && (
        <QRScannerModal visible={isVisible} onClose={() => setVisible(false)} />
      )}
    </>
  );
};

export default AbsoluteQRBottom;
