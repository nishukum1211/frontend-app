import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { FarmingCourseOfflineCreate } from "../../api/farmingCourse";
import { User, UserService } from "../../api/user";

interface FarmingAddUserModalProps {
  visible: boolean;
  courseId: string;
  price: number;
  onClose: () => void;
  onAdded: () => void;
  onCreateOfflineSubscription: (
    userId: string,
    data: FarmingCourseOfflineCreate
  ) => Promise<any | null>;
}

export default function FarmingAddUserModal({
  visible,
  courseId,
  price,
  onClose,
  onAdded,
  onCreateOfflineSubscription,
}: FarmingAddUserModalProps) {
  const [phone, setPhone] = useState("");
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetState = () => {
    setPhone("");
    setSearchedUser(null);
    setSearching(false);
    setSubmitting(false);
  };

  const searchUser = async () => {
    if (!phone.trim()) {
      Alert.alert("Validation", "Phone number is required.");
      return;
    }

    setSearching(true);
    const user = await UserService.fetchUserByMobileNumber(phone.trim().replace(/\s/g, ""));
    setSearching(false);

    if (!user) {
      Alert.alert("Not found", "No user found for this number.");
      return;
    }

    setSearchedUser(user);
  };

  const addUser = async () => {
    if (!searchedUser) {
      return;
    }

    setSubmitting(true);
    const response = await onCreateOfflineSubscription(searchedUser.id, {
      course_id: courseId,
      order_id: `offline_${Date.now()}`,
      price_paid: price,
    });
    setSubmitting(false);

    if (!response) {
      Alert.alert("Error", "Unable to add user to this course.");
      return;
    }

    Alert.alert("Success", "User added to course.");
    onAdded();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={resetState}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.box}>
              <Text style={styles.title}>Add User to Course</Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone number"
                  placeholderTextColor="#94A3B8"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity style={styles.searchBtn} onPress={searchUser} disabled={searching}>
                  <Text style={styles.searchBtnText}>{searching ? "..." : "Search"}</Text>
                </TouchableOpacity>
              </View>

              {searching ? <ActivityIndicator color="#0E7490" style={{ marginTop: 14 }} /> : null}

              {searchedUser ? (
                <View style={styles.userPanel}>
                  <Text style={styles.userName}>{searchedUser.name}</Text>
                  <Text style={styles.userPhone}>{searchedUser.mobile_number}</Text>

                  <TouchableOpacity style={styles.addBtn} onPress={addUser} disabled={submitting}>
                    {submitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addBtnText}>Add User</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  box: {
    width: "90%",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  searchBtn: {
    borderRadius: 10,
    backgroundColor: "#0E7490",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  userPanel: {
    marginTop: 14,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  userPhone: {
    marginTop: 4,
    color: "#334155",
  },
  addBtn: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  closeBtn: {
    marginTop: 14,
    alignSelf: "center",
  },
  closeBtnText: {
    color: "#475569",
    fontWeight: "600",
  },
});
