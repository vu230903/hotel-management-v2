import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  FlatList,
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
}

interface RoomsScreenProps {
  navigation: any;
}

const RoomsScreen: React.FC<RoomsScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');

  const roomTypes = [
    { value: 'all', label: 'Tất cả' },
    { value: 'standard', label: 'Standard' },
    { value: 'deluxe', label: 'Deluxe' },
    { value: 'suite', label: 'Suite' },
    { value: 'single', label: 'Single' },
    { value: 'presidential', label: 'Presidential' },
  ];

  const priceRanges = [
    { value: 'all', label: 'Tất cả' },
    { value: '0-500000', label: 'Dưới 500k' },
    { value: '500000-1000000', label: '500k - 1M' },
    { value: '1000000+', label: 'Trên 1M' },
  ];

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchText, selectedType, selectedPriceRange]);

  const fetchRooms = async () => {
    try {
      const response = await roomsAPI.getRooms();
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

  const filterRooms = () => {
    let filtered = rooms.filter(room => room.status === 'available');

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(room =>
        room.roomNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by room type
    if (selectedType !== 'all') {
      filtered = filtered.filter(room => room.roomType === selectedType);
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(room => {
        const price = room.basePrice;
        switch (selectedPriceRange) {
          case '0-500000':
            return price < 500000;
          case '500000-1000000':
            return price >= 500000 && price <= 1000000;
          case '1000000+':
            return price > 1000000;
          default:
            return true;
        }
      });
    }

    setFilteredRooms(filtered);
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

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => navigation.navigate('RoomDetail', { roomId: item._id })}
    >
      <View style={styles.roomHeader}>
        <Text style={styles.roomNumber}>🏨 Phòng {item.roomNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.roomDetails}>
        <Text style={styles.roomType}>
          {getRoomTypeName(item.roomType)} - Tầng {item.floor}
        </Text>
        <Text style={styles.roomInfo}>
          🛏️ {item.bedType} • 👥 {item.maxOccupancy} người
        </Text>
        <Text style={styles.roomPrice}>
          💰 {formatCurrency(item.basePrice)}/đêm
        </Text>
        <Text style={styles.hourlyPrice}>
          ⏰ {formatCurrency(item.hourlyPrice.firstHour)}/giờ đầu
        </Text>
      </View>

      <View style={styles.amenities}>
        {item.amenities.slice(0, 3).map((amenity, index) => (
          <Text key={index} style={styles.amenity}>
            {amenity}
          </Text>
        ))}
        {item.amenities.length > 3 && (
          <Text style={styles.amenity}>+{item.amenities.length - 3} khác</Text>
        )}
      </View>

      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.bookButtonText}>Đặt phòng</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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
          🏨 Danh sách phòng
        </Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm phòng..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedType === 'all' && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedType('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedType === 'all' && styles.filterButtonTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          {roomTypes.slice(1).map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterButton,
                selectedType === type.value && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedType === type.value && styles.filterButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.roomsList}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  roomsList: {
    padding: 20,
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
  roomType: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '600',
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  roomPrice: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 2,
  },
  hourlyPrice: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenity: {
    fontSize: 12,
    color: '#3498db',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RoomsScreen;
