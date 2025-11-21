import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  innerWrapper: {
    width: "92%",
    alignItems: "center",
  },

  card: {
    width: "100%",
    height: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  smallImage: {
    width: "100%",
    height: 260, // make it a bit taller than the card
    resizeMode: "cover",
    position: "absolute",
  },

  overlayContainer: {
    position: "absolute",
    top: 15,
    left: 3,
    zIndex: 10, // ALWAYS ABOVE IMAGE

    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#D3EED8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  textColumn: {
    justifyContent: "center",
  },

  callMainText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },

  callSubText: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
    color: "#1E293B",
  },
});
