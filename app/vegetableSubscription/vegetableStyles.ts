import { StyleSheet } from "react-native";

export default StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    width: "92%",
    paddingVertical: 15,
    borderRadius: 20,
    alignSelf: "center",
    alignItems: "center",

    // Shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,

    marginVertical: 20,
  },

  /* Image Strip */
  imageRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },

  vegImage: {
    width: 70,
    height: 70,
    resizeMode: "cover",
    borderRadius: 10,
    marginHorizontal: 5,
  },

  /* Title Text */
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F2472",
    textAlign: "center",
  },

  /* Subscription Badge */
  badge: {
    marginTop: 8,
    backgroundColor: "#FFD400",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#002060",
  },
});
