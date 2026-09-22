import { StyleSheet } from "react-native";
import { Colors, screenHeight, screenWidth } from "../utils/Constants";

export const homeHeaderStyles = StyleSheet.create({
    mainContainer: {
        backgroundColor: Colors.primary_dark,
    },
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 4,
    },
    curve: {
        position: 'absolute',
        bottom: -screenHeight * 0.09,
        zIndex: 3,
        width: '100%',
    },
    logo: {
        width: screenWidth * 0.42,
        height: screenHeight * 0.052,
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