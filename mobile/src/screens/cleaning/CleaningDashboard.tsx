import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { cleaningAPI } from '../../services/api';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  status: string;
  cleaningStatus: string;
  floor: number;
}

const CleaningDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await cleaningAPI.getRoomsNeedingCleaning();
      setRooms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

  const handleStartCleaning = async (roomId: string) => {
    try {
      await cleaningAPI.updateCleaningStatus(roomId, 'cleaning');
      Alert.alert('Thành công', 'Đã bắt đầu dọn dẹp phòng');
      fetchRooms(); // Refresh list
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const handleFinishCleaning = async (roomId: string) => {
    try {
      await cleaningAPI.updateCleaningStatus(roomId, 'clean');
      Alert.alert('Thành công', 'Đã hoàn thành dọn dẹp phòng');
      fetchRooms(); // Refresh list
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'needs_cleaning':
        return '#e74c3c';
      case 'cleaning':
        return '#f39c12';
      case 'available':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'needs_cleaning':
        return 'Cần dọn dẹp';
      case 'cleaning':
        return 'Đang dọn dẹp';
      case 'available':
        return 'Có sẵn';
      default:
        return 'Không xác định';
    }
  };

  const getCleaningStatusColor = (cleaningStatus: string) => {
    switch (cleaningStatus) {
      case 'dirty':
        return '#e74c3c';
      case 'cleaning':
        return '#f39c12';
      case 'clean':
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const getCleaningStatusText = (cleaningStatus: string) => {
    switch (cleaningStatus) {
      case 'dirty':
        return 'Bẩn';
      case 'cleaning':
        return 'Đang dọn';
      case 'clean':
        return 'Sạch';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          🧹 Xin chào, {user?.fullName}!
        </Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>🏨 Phòng cần dọn dẹp</Text>
        
        {rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎉 Tất cả phòng đã sạch!</Text>
            <Text style={styles.emptySubtext}>Không có phòng nào cần dọn dẹp</Text>
          </View>
        ) : (
          rooms.map((room) => (
            <View key={room._id} style={styles.roomCard}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomNumber}>
                  🏨 Phòng {room.roomNumber}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(room.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusText(room.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.roomDetails}>
                <Text style={styles.roomInfo}>
                  📍 Tầng {room.floor} - {room.roomType}
                </Text>
                <View style={styles.cleaningStatusContainer}>
                  <Text style={styles.cleaningStatusLabel}>Tình trạng dọn dẹp:</Text>
                  <View
                    style={[
                      styles.cleaningStatusBadge,
                      { backgroundColor: getCleaningStatusColor(room.cleaningStatus) },
                    ]}
                  >
                    <Text style={styles.cleaningStatusText}>
                      {getCleaningStatusText(room.cleaningStatus)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtons}>
                {room.status === 'needs_cleaning' && (
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleStartCleaning(room._id)}
                  >
                    <Text style={styles.startButtonText}>Bắt đầu dọn</Text>
                  </TouchableOpacity>
                )}
                
                {room.status === 'cleaning' && (
                  <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => handleFinishCleaning(room._id)}
                  >
                    <Text style={styles.finishButtonText}>Hoàn thành</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  roomCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  roomDetails: {
    marginBottom: 12,
  },
  roomInfo: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
  },
  cleaningStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cleaningStatusLabel: {
    fontSize: 14,
    color: '#34495e',
    marginRight: 8,
  },
  cleaningStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cleaningStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  startButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CleaningDashboard;
