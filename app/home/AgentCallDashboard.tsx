import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CallRequest, CallService, CallStatus } from '../api/call';

type RootStackParamList = {
  AgentCallRequests: { refresh?: boolean } | undefined;
  CallRequestDetails: { request: CallRequest };
};

type AgentCallRequestsScreenRouteProp = RouteProp<RootStackParamList, 'AgentCallRequests'>;
type SortKey = keyof Pick<CallRequest, 'user_name' | 'message' | 'request_time' | 'status'>;
type SortDirection = 'asc' | 'desc';


const AgentCallRequestsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<AgentCallRequestsScreenRouteProp>();

  const [allRequests, setAllRequests] = useState<CallRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<CallRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortConfig, setSortConfig] =
    useState<{ key: SortKey; direction: SortDirection } | null>(null);

  const [filterType, setFilterType] = useState<'all' | 'free' | 'paid'>('all');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CallRequest | null>(null);
  const [modalRemarks, setModalRemarks] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  //---------------------------------------------------------------------------
  // Fetch call requests
  //---------------------------------------------------------------------------
  const fetchRequests = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    setError(null);

    try {
      const requests = await CallService.getAllCallRequests();
      if (requests) setAllRequests(requests);
      else setError('Failed to fetch call requests or no requests found.');
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching data.');
    } finally {
      if (!isRefresh) setLoading(false);
      setRefreshing(false);
    }
  };

  //---------------------------------------------------------------------------
  // First load
  //---------------------------------------------------------------------------
  useEffect(() => {
    fetchRequests();
  }, []);

  //---------------------------------------------------------------------------
  // Refresh when navigating back with { refresh: true }
  //---------------------------------------------------------------------------
  useEffect(() => {
    if (route.params?.refresh) {
      navigation.setParams({ refresh: false });
      fetchRequests();
    }
  }, [route.params?.refresh]);

  //---------------------------------------------------------------------------
  // Filtering + sorting
  //---------------------------------------------------------------------------
  useEffect(() => {
    let requests = [...allRequests];

    if (filterType === 'free') requests = requests.filter(r => !r.paid);
    if (filterType === 'paid') requests = requests.filter(r => r.paid);

    if (sortConfig) {
      requests.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key])
          return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key])
          return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredRequests(requests);
  }, [allRequests, filterType, sortConfig]);

  //---------------------------------------------------------------------------
  // Sorting handler
  //---------------------------------------------------------------------------
  const handleSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';

    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc')
      direction = 'desc';

    setSortConfig({ key, direction });
  };

  //---------------------------------------------------------------------------
  // Open row modal
  //---------------------------------------------------------------------------
  const handleRowPress = (item: CallRequest) => {
    setSelectedRequest(item);
    setModalRemarks(item.remarks || '');
    setModalVisible(true);
  };

  //---------------------------------------------------------------------------
  // Update request to fulfilled
  //---------------------------------------------------------------------------
  const handleUpdate = async () => {
    if (!selectedRequest) return;

    if (selectedRequest.status === CallStatus.FULFILLED) {
      Alert.alert('Already Fulfilled', 'This call request has already been fulfilled.');
      return;
    }

    try {
      const success = await CallService.fulfillCallRequest(selectedRequest.id, modalRemarks);
      if (success) {
        const updatedRequest = await CallService.getCallRequest(selectedRequest.id);
        if (updatedRequest) {
          setAllRequests(prev =>
            prev.map(req => (req.id === updatedRequest.id ? updatedRequest : req))
          );
        } else {
          fetchRequests();
        }

        Alert.alert('Success', 'Call request has been fulfilled.');
        setModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update call request.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred while updating.');
    }
  };

  //---------------------------------------------------------------------------
  // Helpers
  //---------------------------------------------------------------------------
  const getSortIndicator = (key: SortKey) =>
    sortConfig?.key === key ? (sortConfig.direction === 'asc' ? ' ▲' : ' ▼') : '';

  const getStatusStyle = (status: CallStatus) => {
    switch (status) {
      case CallStatus.FULFILLED:
        return { row: styles.fulfilledRow, text: styles.statusFulfilled };
      case CallStatus.REQUESTED:
        return { row: styles.requestedRow, text: styles.statusRequested };
      default:
        return { row: {}, text: {} };
    }
  };

  //---------------------------------------------------------------------------
  // Render row
  //---------------------------------------------------------------------------
  const renderItem = ({ item }: { item: CallRequest }) => (
    <TouchableOpacity
      style={[styles.row, getStatusStyle(item.status).row]}
      onPress={() => handleRowPress(item)}
    >
      <Text style={[styles.cell, { flex: 2 }]}>
        {item.user_name}
        {item.paid && <Text style={styles.paidText}> (Paid)</Text>}
      </Text>

      <Text style={[styles.cell, { flex: 3 }]} numberOfLines={1}>
        {item.message}
      </Text>

      <Text style={[styles.cell, { flex: 2 }]}>
        {new Date(item.request_time).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: '2-digit'
        })}
      </Text>

      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={[styles.statusBadge, getStatusStyle(item.status).text]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  //---------------------------------------------------------------------------
  // Counters
  //---------------------------------------------------------------------------
  const paidCallsCount = allRequests.filter(r => r.paid).length;
  const freeCallsCount = allRequests.length - paidCallsCount;

  //---------------------------------------------------------------------------
  // Loading / error
  //---------------------------------------------------------------------------
  if (loading && !allRequests.length)
    return <ActivityIndicator size="large" style={styles.centered} />;

  if (error)
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );

  //---------------------------------------------------------------------------
  // Render UI
  //---------------------------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* ------------------------- MODAL ------------------------- */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => {
          setModalRemarks('');
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedRequest && (
              <>
                <Text style={styles.modalTitle}>Call Request Details</Text>

                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Name:</Text> {selectedRequest.user_name}
                </Text>

                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Date:</Text>{' '}
                  {new Date(selectedRequest.request_time).toLocaleString()}
                </Text>

                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Paid:</Text>{' '}
                  {selectedRequest.paid ? 'Yes' : 'No'}
                </Text>

                <Text style={styles.modalText}>
                  <Text style={styles.modalLabel}>Message:</Text> {selectedRequest.message}
                </Text>

                <Text style={styles.modalLabel}>Remarks:</Text>

                {selectedRequest.status === CallStatus.FULFILLED ? (
                  <Text style={[styles.modalText, { fontStyle: 'italic' }]}>
                    {modalRemarks || 'No remarks provided.'}
                  </Text>
                ) : (
                  <TextInput
                    style={styles.remarksInput}
                    value={modalRemarks}
                    onChangeText={setModalRemarks}
                    placeholder="Add remarks..."
                    multiline
                  />
                )}
              </>
            )}

            {selectedRequest?.status !== CallStatus.FULFILLED && (
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.buttonText}>Fulfill Request</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setModalRemarks('');
              }}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ------------------------- MAIN LIST ------------------------- */}
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchRequests(true)}
          />
        }

        ListEmptyComponent={<Text style={styles.centered}>No call requests found.</Text>}
        ListHeaderComponent={
          <>
            {/* TOP BAR (now scrollable, enables pull-to-refresh) */}
            <View style={styles.topBar}>
              <Text style={styles.title}>Call Dashboard</Text>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => setFilterType(prev => (prev === 'free' ? 'all' : 'free'))}
                >
                  <View
                    style={[
                      styles.counterContainer,
                      { backgroundColor: '#E0E0E0' },
                      filterType === 'free' && styles.activeFilter
                    ]}
                  >
                    <Text style={[styles.counterText, { color: '#555' }]}>
                      F{freeCallsCount}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFilterType(prev => (prev === 'paid' ? 'all' : 'paid'))}
                >
                  <View
                    style={[
                      styles.counterContainer,
                      { backgroundColor: '#FADBD8' },
                      filterType === 'paid' && styles.activeFilter
                    ]}
                  >
                    <Text style={[styles.counterText, { color: '#A52A2A' }]}>
                      P{paidCallsCount}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.headerRow}>
              <TouchableOpacity
                style={[styles.headerCell, { flex: 2 }]}
                onPress={() => handleSort('user_name')}
              >
                <Text style={styles.headerText}>
                  Name{getSortIndicator('user_name')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, { flex: 3 }]}
                onPress={() => handleSort('message')}
              >
                <Text style={styles.headerText}>
                  Message{getSortIndicator('message')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, { flex: 2 }]}
                onPress={() => handleSort('request_time')}
              >
                <Text style={styles.headerText}>
                  Date{getSortIndicator('request_time')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerCell, { flex: 2 }]}
                onPress={() => handleSort('status')}
              >
                <Text style={styles.headerText}>
                  Status{getSortIndicator('status')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </View>
  );
};

export default AgentCallRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },

  centered: { textAlign: 'center', marginTop: 20 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },

  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eef2f5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 5
  },

  headerCell: { flex: 1, paddingHorizontal: 5 },

  headerText: { fontWeight: 'bold', color: '#333' },

  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 4,
    elevation: 1
  },

  cell: { flex: 1, paddingHorizontal: 5, color: '#555' },

  fulfilledRow: { backgroundColor: '#e8f5e9' },
  requestedRow: { backgroundColor: '#fffde7' },

  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12
  },

  statusFulfilled: { backgroundColor: '#4CAF50', color: 'white' },
  statusRequested: { backgroundColor: '#FFC107', color: 'white' },

  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    width: '90%',
    alignItems: 'flex-start',
    elevation: 5
  },

  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },

  modalText: { marginBottom: 15, fontSize: 16 },

  modalLabel: { fontWeight: 'bold' },

  remarksInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
    fontSize: 16
  },

  updateButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    alignSelf: 'center',
    marginTop: 15
  },

  closeButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    alignSelf: 'center',
    marginTop: 10
  },

  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },

  paidText: { color: 'red', fontWeight: 'bold' },

  counterContainer: {
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 6,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },

  counterText: { fontWeight: 'bold', fontSize: 16 },

  activeFilter: { borderColor: '#007AFF', elevation: 4 }
});
