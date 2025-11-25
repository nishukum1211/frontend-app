import { getUserData } from "@/app/auth/action";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "react-native-gifted-chat";

export type CallRequest = {
  id: string;
  type: string;
  heading: string;
  message: string;
  crops: string[];
  status: 0 | 1; // 0: pending, 1: approved
};

// Extend the IMessage interface to include our custom data
declare module "react-native-gifted-chat" {
  interface IMessage {
    type?: "call-request"; // Discriminator for custom message type
    data?: CallRequest; // The actual data for the call request
  }
}
type CallRequestWidgetProps = {
  data: CallRequest;
  currentUser: User;
};

const CallRequestWidget: React.FC<CallRequestWidgetProps> = ({
  data,
}) => {
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      // Since the currentUser from GiftedChat might not have the 'role',
      // we fetch the full user data from our authentication store.
      const detailedUser = await getUserData();
      if (detailedUser?.role === "agent") {
        setIsAgent(true);
      }
    };

    checkUserRole();
  }, []);

  const handleApprove = () => {
    // In a real app, you would call an API to update the status
    console.log("Approving call request:", data.id);
    alert(`Call request for "${data.crops.join(", ")}" approved!`);
  };

  return (
    <View
      style={[
        styles.widgetContainer,
        { borderColor: isAgent ? "#E5E7EB" : "#4F46E5", borderWidth: 2 },
      ]}
    >
      <View style={styles.headingContainer}>
        <MaterialIcons name="call" size={20} color="#1F2937" />
        <Text style={styles.heading}>{data.heading}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.message}>{data.message}</Text>

      <View style={styles.cropsContainer}>
        {/* <Text style={styles.cropsLabel}>Crop:</Text> */}
        <Text style={styles.cropsText}>{data.crops.join(", ")}</Text> 
      </View>

      {isAgent ? (
        <TouchableOpacity
          style={[
            styles.button,
            data.status === 1 ? styles.approvedButton : styles.approveButton,
          ]}
          onPress={handleApprove}
          disabled={data.status === 1}
        >
          <Text style={styles.buttonText}>
            {data.status === 1 ? "Approved" : "Approve"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={[styles.button, styles.requestedButton]}>
          <Text style={styles.buttonText}>Requested</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  widgetContainer: {
    backgroundColor: "#ffffffff", // Soft white background
    borderRadius: 10,
    padding: 15,
    width: "100%",
    shadowColor: "#000", // subtle shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB", // Light gray divider line
    marginVertical: 10, // Space above and below the divider
    width: "100%",
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
  },
  cropsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cropsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginRight: 5,
  },
  cropsText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "bold",
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: "#50C878", // A more vibrant green
  },
  approvedButton: {
    backgroundColor: "#A9A9A9", // A softer gray
  },
  requestedButton: {
    backgroundColor: "#3B82F6", // A brighter blue
  },
  buttonText: {
    color: "white", // White text for better contrast
    fontWeight: "bold",
  },
});

export default CallRequestWidget;
