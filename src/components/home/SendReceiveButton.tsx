import {View, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {FC} from 'react';
import {Colors, screenHeight, screenWidth} from '../../utils/Constants';
import {navigate} from '../../utils/NavigationUtil';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';

const SendReceiveButton: FC = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigate('SendScreen')}>
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/icons/send.jpg')}
            style={styles.img}
          />
        </View>
        <View style={styles.cardContent}>
          <CustomText fontFamily="Okra-Bold" fontSize={15} color={Colors.text}>
            Send Files
          </CustomText>
          <CustomText fontFamily="Okra-Medium" fontSize={11} color={Colors.text_secondary} style={{marginTop: 2}}>
            High-speed P2P
          </CustomText>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => navigate('ReceiveScreen')}>
        <View style={styles.imageWrapper}>
          <Image
            source={require('../../assets/icons/receive.jpg')}
            style={styles.img}
          />
        </View>
        <View style={styles.cardContent}>
          <CustomText fontFamily="Okra-Bold" fontSize={15} color={Colors.text}>
            Receive Files
          </CustomText>
          <CustomText fontFamily="Okra-Medium" fontSize={11} color={Colors.text_secondary} style={{marginTop: 2}}>
            Instant connection
          </CustomText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default SendReceiveButton;

const styles = StyleSheet.create({
  container: {
    marginTop: screenHeight * 0.035,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 100,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
  },
  img: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 12,
  },
});

