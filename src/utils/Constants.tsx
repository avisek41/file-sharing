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
export const multiColor = ['#0052CC', '#0066FF', '#00A3FF', '#38BDF8', '#0284C7', '#2563EB'];
export const svgPath = "M0,100L120,120C240,140,480,180,720,180C960,180,1200,140,1320,120L1440,100L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z";

export enum Colors {
  primary = '#0066FF',
  primary_light = '#00A3FF',
  primary_dark = '#0052CC',
  background = '#FFFFFF',
  surface = '#FFFFFF',
  card = '#F8FAFC',
  text = '#0F172A',
  text_secondary = '#64748B',
  text_light = '#94A3B8',
  theme = '#0066FF',
  secondary = '#EFF6FF',
  secondary_light = '#F8FAFC',
  tertiary = '#0284C7',
  accent = '#38BDF8',
  border = '#E2E8F0',
  border_light = '#F1F5F9',
  shadow = 'rgba(0, 102, 255, 0.08)',
}

export const BrandGradients = {
  primary: ['#0052CC', '#0066FF', '#00A3FF'] as const,
  send: ['#FFFFFF', '#F0F9FF', '#BAE6FD', '#0284C7'] as const,
  receive: ['#FFFFFF', '#EFF6FF', '#60A5FA', '#0066FF'] as const,
  connection: ['#FFFFFF', '#F0F7FF', '#BAE6FD', '#38BDF8'] as const,
  card: ['#FFFFFF', '#F8FAFC'] as const,
};