import { StyleSheet, Platform, StatusBar } from "react-native";
import { Colors, screenHeight, screenWidth } from "../utils/Constants";

const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0;

export const homeHeaderStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: Colors.primary_dark,
    },
    container: {
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? statusBarHeight + 10 : 8,
        paddingBottom: 14,
        zIndex: 4,
    },
    curve: {
        position: 'absolute',
        bottom: -screenHeight * 0.09,
        zIndex: 3,
        width: '100%',
    },
    logoWrapper: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    logo: {
        width: Math.min(screenWidth * 0.44, 160),
        height: 38,
        resizeMode: 'contain',
    },
    headerButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.9)',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    profile: {
        width: 40,
        height: 40,
        borderRadius: 20,
        resizeMode: 'cover',
    },
});