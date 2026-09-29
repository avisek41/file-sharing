import { Platform } from "react-native";
import { StyleSheet } from "react-native";
import { Colors } from "../utils/Constants";

export const bottomTabStyles = StyleSheet.create({
  container: {
    width: '100%',
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    elevation: 10,
    zIndex: 10,
    borderTopWidth: 1,
    borderColor: Colors.border,
    shadowRadius: 12,
    shadowColor: Colors.primary,
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCode: {
    width: 58,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 29,
    backgroundColor: Colors.primary,
    bottom: 18,
    borderWidth: 4,
    borderColor: Colors.surface,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    elevation: 8,
    shadowRadius: 10,
    shadowColor: Colors.primary,
  },
});

