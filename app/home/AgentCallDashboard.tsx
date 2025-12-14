import { FontAwesome } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { CallRequest, CallService, CallStatus } from '../api/call';
import { AppEvents } from '../utils/eventEmitter';

type RootStackParamList = {
  AgentCallRequests: { refresh?: boolean } | undefined;
  CallRequestDetails: { request: CallRequest };
};

type AgentCallRequestsScreenRouteProp = RouteProp<RootStackParamList, 'AgentCallRequests'>;
type SortKey = keyof Pick<CallRequest, 'request_time' | 'status'>;
const SCREEN_IDENTIFIER = 'AgentCallRequests';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  //---------------------------------------------------------------------------
  // Refresh handler
  //---------------------------------------------------------------------------
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const requests = await CallService.getAllCallRequests();
      if (requests) {
        setAllRequests(requests);
      } else {
        setError('Failed to fetch call requests or no requests found.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching data.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  //---------------------------------------------------------------------------
  // Initial data fetch
  //---------------------------------------------------------------------------
  const fetchInitialRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const requests = await CallService.getAllCallRequests();
      if (requests) {
        setAllRequests(requests);
      } else {
        setError('Failed to fetch call requests or no requests found.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  };

  //---------------------------------------------------------------------------
  // First load
  //---------------------------------------------------------------------------
  useEffect(() => {
    fetchInitialRequests();
  }, []);

  //---------------------------------------------------------------------------
  // Refresh when navigating back with { refresh: true }
  //---------------------------------------------------------------------------
  useEffect(() => {
    if (route.params?.refresh) {
      navigation.setParams({ refresh: false });
      onRefresh();
    }
  }, [route.params?.refresh, onRefresh]);

  //---------------------------------------------------------------------------
  // Listen for refresh events from notifications
  //---------------------------------------------------------------------------
  useEffect(() => {
    const handleRefresh = (targetScreen: string) => {
      if (targetScreen === SCREEN_IDENTIFIER) {
        console.log('Refresh event received for AgentCallRequestsScreen, refreshing...');
        onRefresh();
      }
    };

    const unsubscribe = AppEvents.on('refresh-screen', handleRefresh);

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [onRefresh]);

  //---------------------------------------------------------------------------
  // Filtering + sorting
  //---------------------------------------------------------------------------
  useEffect(() => {
    let requests = [...allRequests];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      requests = requests.filter(
        r =>
          r.user_name.toLowerCase().includes(lowercasedQuery) ||
          (r.user_mobile && r.user_mobile.includes(lowercasedQuery)) ||
          r.message.toLowerCase().includes(lowercasedQuery)
      );
    }

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
  }, [allRequests, filterType, sortConfig, searchQuery]);

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
          onRefresh();
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
  const renderItem = ({ item }: { item: CallRequest }) => {
    const handleCall = () => {
      if (item.user_mobile) {
        Linking.openURL(`tel:${item.user_mobile.replace(/\s/g, "")}`);
      } else {
        Alert.alert("No Mobile Number", "This user does not have a mobile number.");
      }
    };

    return (
      <TouchableWithoutFeedback onPress={() => handleRowPress(item)}>
        <View style={[styles.card, getStatusStyle(item.status).row]}>
          <Text style={styles.cardDate}>
            {new Date(item.request_time).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>

          <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>

          <View style={styles.badgesContainer}>
            {item.paid && <Text style={styles.paidBadge}>Paid</Text>}
            <Text style={[styles.statusBadge, getStatusStyle(item.status).text]}>
              {item.status}
            </Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.cardNameFooter}>{item.user_name}</Text>
              <Text style={styles.cardMobile}>{item.user_mobile || 'No mobile'}</Text>
            </View>
            <View>
              <TouchableOpacity
                style={[styles.callButton, (!item.user_mobile || item.status === CallStatus.FULFILLED) && styles.disabledButton]}
                onPress={handleCall}
                disabled={!item.user_mobile || item.status === CallStatus.FULFILLED}
              >
                <FontAwesome name="phone" size={16} color="white" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  //---------------------------------------------------------------------------
  // Counters
  //---------------------------------------------------------------------------
  const pendingRequests = allRequests.filter(r => r.status === CallStatus.REQUESTED);
  const paidCallsCount = pendingRequests.filter(r => r.paid).length;
  const freeCallsCount = pendingRequests.filter(r => !r.paid).length;

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }

        ListEmptyComponent={<Text style={styles.centered}>No call requests found.</Text>}
        ListHeaderComponent={
          <>
            {/* TOP BAR (now scrollable, enables pull-to-refresh) */}
            <View style={styles.topBar}>
              <View style={styles.titleContainer}>
                <FontAwesome name="phone" size={22} color="#333" />
                <Text style={styles.title}>Dashboard</Text>
                <TouchableOpacity
                  onPress={onRefresh}
                  style={{ width: 22, height: 22, justifyContent: 'center', alignItems: 'center' }}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator color="#333" />
                  ) : (
                    <FontAwesome name="refresh" size={22} color="#333" />
                  )}
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
              <View style={[styles.headerCell, { flex: 3 }]}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <TouchableOpacity
                style={[styles.headerButton, { flex: 2 }]}
                onPress={() => handleSort('request_time')}
              >
                <Text style={styles.headerText}>
                  Date{getSortIndicator('request_time')}
                </Text>
                <FontAwesome name="sort" size={14} color="#333" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerButton, { flex: 2 }]}
                onPress={() => handleSort('status')}
              >
                <Text style={styles.headerText}>
                  Status{getSortIndicator('status')}
                </Text>
                <FontAwesome name="sort" size={14} color="#333" />
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

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },

  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#eef2f5',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingHorizontal: 5,
    gap: 8,
    alignItems: 'center',
  },

  headerCell: { flex: 1, paddingHorizontal: 5, justifyContent: 'center' },

  nameHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },

  headerButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 8,
    gap: 6,
  },

  headerText: { fontWeight: 'bold', color: '#333', fontSize: 14 },

  searchInput: {
    height: 36,
    borderColor: '#ccc', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, backgroundColor: 'white'
  },


  // Keep background colors for status, but remove row-specific styles that interfere with new border look
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
  statusRequested: { backgroundColor: '#FFC107', color: 'white', fontSize: 11,paddingHorizontal: 5 },

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

  paidBadge: {
    backgroundColor: '#e91e63',
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    fontSize: 12
  },

  counterContainer: {
    borderRadius: 15,
    paddingHorizontal: 22,
    paddingVertical: 6,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: 'transparent'
  },

  counterText: { fontWeight: 'bold', fontSize: 16 },

  activeFilter: { borderColor: '#007AFF', elevation: 4 },

  // Card styles
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000', // Keep shadow for depth
    shadowOffset: { width: 0, height: 1 }, // Keep shadow for depth
    shadowOpacity: 0.2, // Keep shadow for depth
    shadowRadius: 2, // Keep shadow for depth
    position: 'relative', // Needed for absolute positioning of the date
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardMobile: {
    fontSize: 16,
    color: '#0056b3',
    fontWeight: '600',
  },
  cardMessage: {
    fontSize: 14,
    marginTop: 30, // Add margin to avoid overlap with absolute positioned elements
    marginBottom: 12,
    color: '#555', // Keep color
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align call button to the right
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  cardDate: {
    position: 'absolute',
    top: -1,
    left: -1,
    backgroundColor: '#007AFF',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    fontWeight: 'bold',
    fontSize: 12,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardNameFooter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 15,
    flexDirection: 'row',
    gap: 4,
  },
});
