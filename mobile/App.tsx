import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import CustomerDashboard from './src/screens/customer/CustomerDashboard';
import RoomsScreen from './src/screens/customer/RoomsScreen';
import RoomDetailScreen from './src/screens/customer/RoomDetailScreen';
import BookingFormScreen from './src/screens/customer/BookingFormScreen';
import CleaningDashboard from './src/screens/cleaning/CleaningDashboard';

const Stack = createStackNavigator();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="Loading" 
            component={() => null}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {user?.role === 'customer' && (
              <>
                <Stack.Screen name="CustomerDashboard" component={CustomerDashboard} />
                <Stack.Screen name="Rooms" component={RoomsScreen} />
                <Stack.Screen name="RoomDetail" component={RoomDetailScreen} />
                <Stack.Screen name="BookingForm" component={BookingFormScreen} />
              </>
            )}
            {user?.role === 'cleaning' && (
              <Stack.Screen name="CleaningDashboard" component={CleaningDashboard} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;