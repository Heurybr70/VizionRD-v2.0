import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ContactScreen from '../screens/ContactScreen';
import AuthScreen from '../screens/AuthScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import RequestsScreen from '../screens/RequestsScreen';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import COLORS from '@shared/constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
  </Stack.Navigator>
);

const CountBadge = ({ value }) => {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{value > 9 ? '9+' : value}</Text>
    </View>
  );
};

const CartTabIcon = ({ color, focused }) => {
  const { itemCount } = useCart();

  return (
    <View style={styles.iconWrap}>
      <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
      <CountBadge value={itemCount} />
    </View>
  );
};

const FavoritesTabIcon = ({ color, focused }) => {
  const { favoriteCount } = useFavorites();

  return (
    <View style={styles.iconWrap}>
      <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
      <CountBadge value={favoriteCount} />
    </View>
  );
};

const AppTabs = () => {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.textMuted : COLORS.textSecondary,
        tabBarStyle: {
          height: 78,
          paddingBottom: 12,
          paddingTop: 10,
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255,255,255,0.98)',
          borderTopWidth: 0,
          shadowColor: '#020617',
          shadowOpacity: isDark ? 0.26 : 0.08,
          shadowOffset: { width: 0, height: -8 },
          shadowRadius: 18,
          elevation: 14,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: 0.7,
        },
        sceneStyle: {
          backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Tienda"
        component={StoreStack}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'storefront' : 'storefront-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritesScreen}
        options={{
          tabBarIcon: (props) => <FavoritesTabIcon {...props} />,
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CartScreen}
        options={{
          tabBarIcon: (props) => <CartTabIcon {...props} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Requests" component={RequestsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;

const styles = StyleSheet.create({
  iconWrap: {
    width: 26,
    height: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -7,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
});
