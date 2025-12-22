import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F4FBF5",
    paddingBottom: 20,
  },

  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#000",
    textAlign: "center",
  },

  highlight: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 20,
  },

  row: {
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#DDF0E1",
    borderRadius: 14,
    paddingTop: 30, // space below icon
    paddingHorizontal: 12,

    marginTop: 35,
    minHeight: 100,
    alignItems: "center",
    position: "relative", // <-- required
  },

  iconCircle: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#1B5E20",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute", // <-- add this
    top: -20, // <-- half of height (40/2)
    zIndex: 10,
  },

  iconText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },

  cardText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
    fontFamily: "Mukta-Regular",
    fontWeight: "bold",
  },
});
