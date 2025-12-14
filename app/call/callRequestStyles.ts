import { StyleSheet } from "react-native";

const callRequestStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  /* ------------------ Dropdown Top ------------------ */
  dropdownBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },
  dropdownText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "500",
  },

  /* ------------------ Buttons Inside Cards ------------------ */

  freeButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  paidButton: {
    backgroundColor: "#F43F5E",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  /* ------------------ Modals ------------------ */

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    backgroundColor: "#FFF",
    padding: 22,
    borderRadius: 14,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#111827",
  },

  modalLabel: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 10,
  },

  modalValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 10,
  },

  sendButton: {
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 22,
    width: "100%",
  },

  sendButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  closeText: {
    color: "#2563EB",
    marginTop: 14,
    fontSize: 16,
    textAlign: "center",
  },
});

export default callRequestStyles;
