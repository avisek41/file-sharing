import { StyleSheet } from "react-native";
import { Colors, screenHeight } from "../utils/Constants";

export const modalStyles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    qrContainer: {
        marginHorizontal: 24,
        marginTop: screenHeight * 0.08,
        padding: 24,
        borderRadius: 24,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignSelf: 'center',
        justifyContent: "center",
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
    },
    noCameraImage: {
        width: '100%',
        height: "100%",
        resizeMode: 'cover'
    },
    camera: {
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
    },
    info: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 24,
    },
    infoText1: {
        fontFamily: 'Okra-Bold',
        textAlign: "center",
        fontSize: 15,
        color: Colors.text,
        marginBottom: 8,
    },
    infoText2: {
        fontFamily: 'Okra-Medium',
        textAlign: "center",
        fontSize: 13,
        color: Colors.text_secondary,
        lineHeight: 19,
    },
    skeleton: {
        width: 250,
        height: 250,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: Colors.secondary_light,
    },
    shimmerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    shimmerGradient: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        padding: 8,
        borderRadius: 100,
        zIndex: 4,
        position: 'absolute',
        top: 16,
        right: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        elevation: 3,
        shadowRadius: 6,
        shadowColor: "#000",
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border_light,
    }
})