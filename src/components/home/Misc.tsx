import {View, StyleSheet, Image, Platform} from 'react-native';
import React from 'react';
import CustomText from '../global/CustomText';
import {commonStyles} from '../../styles/commonStyles';
import {Colors} from '../../utils/Constants';
import {RFValue} from 'react-native-responsive-fontsize';

const Misc = () => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <CustomText fontSize={14} fontFamily="Okra-Bold" color={Colors.text}>
          Explore
        </CustomText>
        <View style={styles.badge}>
          <CustomText fontSize={10} fontFamily="Okra-Bold" color={Colors.primary}>
            FEATURED
          </CustomText>
        </View>
      </View>

      <View style={[commonStyles.flexRowBetween, styles.promoCard]}>
        <View style={styles.promoTextContainer}>
          <CustomText fontFamily="Okra-Bold" style={styles.text} fontSize={16} color={Colors.text}>
            #1 Fast & Secure File Sharing App
          </CustomText>
          <CustomText fontFamily="Okra-Medium" style={styles.subText} fontSize={11} color={Colors.text_secondary}>
            Direct P2P transfer with zero internet usage
          </CustomText>
        </View>
        <Image
          source={require('../../assets/icons/share_logo.jpg')}
          style={styles.image}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bannerWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    backgroundColor: Colors.surface,
  },
  adBanner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  promoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  promoTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  text: {
    lineHeight: RFValue(22),
    paddingBottom: 4,
  },
  subText: {
    marginTop: 6,
    lineHeight: RFValue(16),
    paddingBottom: 4,
  },
  image: {
    resizeMode: 'contain',
    height: 80,
    width: 80,
  },
});

export default Misc;
