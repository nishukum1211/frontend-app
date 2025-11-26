import { Dimensions, StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    position: 'relative', // Add this line
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 15,
    width: Dimensions.get('window').width * 0.5, // Adjust width as needed
  },
  buttonFree: {
    backgroundColor: "#2196F3",
  },
  buttonPaid: {
    backgroundColor: "#FF5733", // Example: a shade of red
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  input: {
    marginTop: 10,
    height: 80, // Increased height
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: Dimensions.get('window').width * 0.7, // Adjust width as needed
    borderRadius: 5,
    textAlignVertical: 'top', // Align text to the top for multiline
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width * 0.7,
    marginTop: 15,
  },
  dropdown: {
    width: Dimensions.get('window').width * 0.7, // Match input width
    marginTop: 15,
  },
});


export default styles;
