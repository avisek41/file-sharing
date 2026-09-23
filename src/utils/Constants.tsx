import { Dimensions, Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const requestPhotoPermission = async () => {
  if (Platform.OS !== 'ios') {
    return
  }
  try {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    if (result === RESULTS.GRANTED) {
      console.log('STORAGE PERMISSION GRANTED ✅');
    } else {
      console.log('STORAGE PERMISSION DENIED ❌');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  }
};

export const isBase64 = (str: string) => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  return base64Regex.test(str);
};

export const screenHeight = Dimensions.get('screen').height
export const screenWidth = Dimensions.get('screen').width
export const multiColor = ['#5B21B6', '#6D28D9', '#7C3AED', '#8B5CF6', '#A855F7', '#C084FC'];
export const svgPath = "M0,100L120,120C240,140,480,180,720,180C960,180,1200,140,1320,120L1440,100L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z";

export enum Colors {
  primary = '#7C3AED',
  primary_light = '#A855F7',
  primary_dark = '#5B21B6',
  amber = '#F59E0B',
  amber_light = '#FEF3C7',
  amber_dark = '#D97706',
  background = '#FFFFFF',
  surface = '#FFFFFF',
  card = '#FAF5FF',
  text = '#0F172A',
  text_secondary = '#64748B',
  text_light = '#94A3B8',
  theme = '#5B21B6',
  secondary = '#F5F3FF',
  secondary_light = '#FAF5FF',
  tertiary = '#9333EA',
  accent = '#A855F7',
  border = '#EDE9FE',
  border_light = '#F5F3FF',
  shadow = 'rgba(91, 33, 182, 0.12)',
}

export const BrandGradients = {
  primary: ['#5B21B6', '#7C3AED', '#A855F7'] as string[],
  send: ['#FFFFFF', '#FAF5FF', '#E9D5FF', '#5B21B6'] as string[],
  receive: ['#FFFFFF', '#FFFBEB', '#FDE68A', '#F59E0B'] as string[],
  connection: ['#FFFFFF', '#FAF5FF', '#E9D5FF', '#A855F7'] as string[],
  card: ['#FFFFFF', '#FAF5FF'] as string[],
};