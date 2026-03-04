import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import ServicesScreen from '../screens/ServicesScreen';
import AboutScreen from '../screens/AboutScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import COLORS from '@shared/constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Store stack: Products → ProductDetail → About ──────────────────────────
const StoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
  </Stack.Navigator>
);

// ── Badge del carrito ────────────────────────────────────────────────────────
const CartTabIcon = ({ color, focused }) => {
  const { itemCount } = useCart();
  return (
    <View style={{ width: 24, height: 24 }}>
      <Ionicons
        name={focused ? 'cart' : 'cart-outline'}
        size={24}
        color={color}
      />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
        </View>
      )}
    </View>
  );
};

// ── Tab Navigator principal ──────────────────────────────────────────────────
const AppTabs = () => {
  const { isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.textMuted : COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surface,
          borderTopColor: isDark ? COLORS.borderDark : COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 6,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
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
        name="Carrito"
        component={CartScreen}
        options={{
          tabBarIcon: (props) => <CartTabIcon {...props} />,
        }}
      />
      <Tab.Screen
        name="Servicios"
        component={ServicesScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'car-sport' : 'car-sport-outline'} size={24} color={color} />
          ),
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

// ── Root Navigator ───────────────────────────────────────────────────────────
const AppNavigator = () => (
  <NavigationContainer>
    <AppTabs />
  </NavigationContainer>
);

export default AppNavigator;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
