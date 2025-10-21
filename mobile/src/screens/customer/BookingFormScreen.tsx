import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { bookingsAPI } from '../../services/api';

interface Room {
  _id: string;
  roomNumber: string;
  roomType: string;
  basePrice: number;
  hourlyPrice: {
    firstHour: number;
    additionalHour: number;
  };
}

interface BookingFormScreenProps {
  route: {
    params: {
      room: Room;
      selectedDate: {
        checkIn: string;
        checkOut: string;
      };
    };
  };
  navigation: any;
}

const BookingFormScreen: React.FC<BookingFormScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const { room, selectedDate } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: selectedDate.checkIn,
    checkOut: selectedDate.checkOut,
    checkInTime: '13:00',
    checkOutTime: '12:00',
    guests: {
      adults: 1,
      children: 0,
    },
    notes: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGuestsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      guests: { ...prev.guests, [field]: value }
    }));
  };

  const calculateTotalPrice = () => {
    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const nights = Math.max(0, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    
    if (nights === 0) {
      // Same day booking - calculate by hours
      const checkInTime = new Date(`${formData.checkIn}T${formData.checkInTime}`);
      const checkOutTime = new Date(`${formData.checkOut}T${formData.checkOutTime}`);
      const hoursDiff = Math.max(1, Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60)));
      
      if (hoursDiff === 1) {
        return room.hourlyPrice.firstHour;
      } else {
        return room.hourlyPrice.firstHour + (hoursDiff - 1) * room.hourlyPrice.additionalHour;
      }
    } else {
      // Multi-day booking
      return nights * room.basePrice;
    }
  };

  const handleSubmitBooking = async () => {
    // Validation
    if (!formData.checkIn || !formData.checkOut) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày check-in và check-out');
      return;
    }

    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      Alert.alert('Lỗi', 'Ngày check-out phải sau ngày check-in');
      return;
    }

    if (formData.guests.adults < 1) {
      Alert.alert('Lỗi', 'Số người lớn phải ít nhất 1');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        customer: user?._id,
        room: room._id,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        guests: formData.guests,
        roomPrice: calculateTotalPrice(),
        totalAmount: calculateTotalPrice(),
        payment: {
          method: 'cash',
          status: 'pending'
        },
        notes: formData.notes,
        status: 'pending'
      };

      const response = await bookingsAPI.createBooking(bookingData);
      
      Alert.alert(
        'Thành công',
        `Đặt phòng thành công! Mã booking: ${response.data.data.bookingNumber}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CustomerDashboard')
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Lỗi', error.response?.data?.message || 'Đặt phòng thất bại');
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

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đặt phòng</Text>
        </View>

        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle}>🏨 Phòng {room.roomNumber}</Text>
          <Text style={styles.roomType}>{room.roomType}</Text>
          <Text style={styles.roomPrice}>
            {formatCurrency(room.basePrice)}/đêm
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>📅 Thông tin đặt phòng</Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.label}>Ngày đến:</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateButtonText}>
                  {formData.checkIn || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateInput}>
              <Text style={styles.label}>Ngày đi:</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateButtonText}>
                  {formData.checkOut || 'Chọn ngày'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeContainer}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Giờ check-in:</Text>
              <TextInput
                style={styles.timeInputField}
                value={formData.checkInTime}
                onChangeText={(value) => handleInputChange('checkInTime', value)}
                placeholder="13:00"
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.label}>Giờ check-out:</Text>
              <TextInput
                style={styles.timeInputField}
                value={formData.checkOutTime}
                onChangeText={(value) => handleInputChange('checkOutTime', value)}
                placeholder="12:00"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>👥 Thông tin khách</Text>
          
          <View style={styles.guestsContainer}>
            <View style={styles.guestInput}>
              <Text style={styles.label}>Người lớn:</Text>
              <View style={styles.guestCounter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestsChange('adults', Math.max(1, formData.guests.adults - 1))}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.guests.adults}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestsChange('adults', formData.guests.adults + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.guestInput}>
              <Text style={styles.label}>Trẻ em:</Text>
              <View style={styles.guestCounter}>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestsChange('children', Math.max(0, formData.guests.children - 1))}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.guests.children}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => handleGuestsChange('children', formData.guests.children + 1)}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.notesContainer}>
            <Text style={styles.label}>Ghi chú (tùy chọn):</Text>
            <TextInput
              style={styles.notesInput}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              placeholder="Nhập ghi chú nếu có..."
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.priceSummary}>
            <Text style={styles.sectionTitle}>💰 Tổng thanh toán</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tổng tiền:</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(calculateTotalPrice())}
              </Text>
            </View>
            <Text style={styles.priceNote}>
              * Thanh toán khi nhận phòng
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitBooking}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt phòng'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
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
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
  },
  roomPrice: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginRight: 8,
  },
  timeInputField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  guestsContainer: {
    marginBottom: 20,
  },
  guestInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  priceSummary: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  priceNote: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingFormScreen;
