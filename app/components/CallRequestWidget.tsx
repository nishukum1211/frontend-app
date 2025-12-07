import { getUserData } from "@/app/auth/action";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "react-native-gifted-chat";

// This type should now match the `callRequestPayload` from `callRequest.tsx`
export type CallRequest = {
  id: string;
  paid: boolean;
  user_id: string;
  user_name: string;
  message: string;
  request_time: string;
  status: "requested" | "fulfilled" | "cancelled";
};

// Extend the IMessage interface to include our custom data
declare module "react-native-gifted-chat" {
  interface IMessage {
    type?: "call-request" | "call-request-paid"; // Discriminator for custom message type
    data?: CallRequest; // The actual data for the call request
  }
}
type CallRequestWidgetProps = {
  data: CallRequest;
  heading: string;
  currentUser: User;
};

const CallRequestWidget: React.FC<CallRequestWidgetProps> = ({
  heading,
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
    alert(`Call request for "${data.message}" approved!`);
  };

  return (
    <View
      style={[
        styles.widgetContainer,
        {
          borderColor: data.paid
            ? "#8b0707ff"
            : isAgent
            ? "#E5E7EB"
            : "#4F46E5",
          borderWidth: 2,
          backgroundColor: data.paid ? "#FEE2E2" : "#ffffffff",
        },
      ]}
    >
      <View style={styles.headingContainer}>
        <MaterialIcons name="call" size={20} color="#1F2937" />
        <Text style={styles.heading}>{heading}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.message}>{data.message}</Text>

      {isAgent ? (
        <TouchableOpacity
          style={[
            styles.button,
            data.status === "fulfilled" ? styles.approvedButton : styles.approveButton,
          ]}
          onPress={handleApprove}
          disabled={data.status === "fulfilled"}
        >
          <Text style={styles.buttonText}>
            {data.status === "fulfilled" ? "Approved" : "Approve"}
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
    // backgroundColor is now set dynamically
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
