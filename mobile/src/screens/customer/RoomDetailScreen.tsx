import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { roomsAPI } from '../../services/api';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  basePrice: number;
  hourlyPrice: {
    firstHour: number;
    additionalHour: number;
  };
  floor: number;
  bedType: string;
  amenities: string[];
  status: string;
  maxOccupancy: number;
  description: string;
  images: string[];
}

interface RoomDetailScreenProps {
  route: {
    params: {
      roomId: string;
    };
  };
  navigation: any;
}

const { width } = Dimensions.get('window');

const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { roomId } = route.params;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState({
    checkIn: '',
    checkOut: '',
  });

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    try {
      const response = await roomsAPI.getRoom(roomId);
      setRoom(response.data.data);
    } catch (error) {
      console.error('Error fetching room details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getRoomTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      standard: 'Standard',
      deluxe: 'Deluxe',
      suite: 'Suite',
      single: 'Single',
      presidential: 'Presidential',
    };
    return typeMap[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#27ae60';
      case 'reserved':
        return '#f39c12';
      case 'occupied':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'reserved':
        return 'Đã đặt';
      case 'occupied':
        return 'Đang sử dụng';
      default:
        return 'Không xác định';
    }
  };

  const handleBookRoom = () => {
    if (!selectedDate.checkIn || !selectedDate.checkOut) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày check-in và check-out');
      return;
    }

    if (new Date(selectedDate.checkIn) >= new Date(selectedDate.checkOut)) {
      Alert.alert('Lỗi', 'Ngày check-out phải sau ngày check-in');
      return;
    }

    // Navigate to booking form
    navigation.navigate('BookingForm', {
      room: room,
      selectedDate: selectedDate,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy phòng</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết phòng</Text>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomNumber}>🏨 Phòng {room.roomNumber}</Text>
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

        <Text style={styles.roomType}>
          {getRoomTypeName(room.roomType)} - Tầng {room.floor}
        </Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Giá phòng:</Text>
          <Text style={styles.priceValue}>
            {formatCurrency(room.basePrice)}/đêm
          </Text>
        </View>

        <View style={styles.hourlyPriceContainer}>
          <Text style={styles.hourlyPriceLabel}>Giá theo giờ:</Text>
          <Text style={styles.hourlyPriceValue}>
            {formatCurrency(room.hourlyPrice.firstHour)}/giờ đầu
          </Text>
          <Text style={styles.hourlyPriceSubtext}>
            {formatCurrency(room.hourlyPrice.additionalHour)}/giờ tiếp theo
          </Text>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>📋 Thông tin chi tiết</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🛏️ Loại giường:</Text>
          <Text style={styles.detailValue}>{room.bedType}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>👥 Sức chứa:</Text>
          <Text style={styles.detailValue}>{room.maxOccupancy} người</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🏢 Tầng:</Text>
          <Text style={styles.detailValue}>{room.floor}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📝 Mô tả:</Text>
          <Text style={styles.detailValue}>{room.description || 'Không có mô tả'}</Text>
        </View>
      </View>

      <View style={styles.amenitiesSection}>
        <Text style={styles.sectionTitle}>✨ Tiện nghi</Text>
        <View style={styles.amenitiesList}>
          {room.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityItem}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bookingSection}>
        <Text style={styles.sectionTitle}>📅 Đặt phòng</Text>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>Ngày đến:</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                {selectedDate.checkIn || 'Chọn ngày'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInput}>
            <Text style={styles.dateLabel}>Ngày đi:</Text>
            <TouchableOpacity style={styles.dateButton}>
              <Text style={styles.dateButtonText}>
                {selectedDate.checkOut || 'Chọn ngày'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.bookButton,
            room.status !== 'available' && styles.bookButtonDisabled,
          ]}
          onPress={handleBookRoom}
          disabled={room.status !== 'available'}
        >
          <Text style={styles.bookButtonText}>
            {room.status === 'available' ? 'Đặt phòng ngay' : 'Phòng không khả dụng'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  roomInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  roomType: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#34495e',
    marginRight: 8,
  },
  priceValue: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  hourlyPriceContainer: {
    marginBottom: 8,
  },
  hourlyPriceLabel: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  hourlyPriceValue: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: '600',
  },
  hourlyPriceSubtext: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#34495e',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
  amenitiesSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  bookingSection: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  dateContainer: {
    marginBottom: 20,
  },
  dateInput: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  bookButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoomDetailScreen;
