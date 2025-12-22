import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    paddingHorizontal: 18,
  },

  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    marginBottom: 18,

    // Soft shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 7 },

    // Shadow for Android
    elevation: 7,

    borderWidth: 1,
    borderColor: "#E6E6E6",

    alignItems: "center",
  },

  unit: {
    fontSize: 13,
    color: "black",
    marginTop: -3,
    fontWeight: "bold",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0057D9",
    marginTop: 6,
  },

  subtitle: {
    backgroundColor: "#EAF3FF",
    paddingHorizontal: 13,
    paddingVertical: 3,
    borderRadius: 8,
    color: "#007BFF",
    fontSize: 14,
    marginTop: 6,
    fontWeight: "600",
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
  },

  matra: {
    fontSize: 14,
    marginHorizontal: 5,
    color: "black",
    fontWeight: "bold",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  nameCard: {
    backgroundColor: "green",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    color: "white",
    borderColor: "#ccc",
    marginLeft: 10,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});
