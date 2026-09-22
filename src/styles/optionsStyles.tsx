import { StyleSheet } from "react-native";
import { Colors } from "../utils/Constants";

export const optionStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    elevation: 3,
    shadowRadius: 10,
    shadowColor: Colors.primary,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    borderColor: Colors.border,
  },
  subContainer: {
    justifyContent: 'center',
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
});