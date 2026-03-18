import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = 'vizionrd-favorites';

const FavoritesContext = createContext(null);

const serializeFavorite = (product) => ({
  id: product.id,
  name: product.name,
  category: product.category || '',
  description: product.description || '',
  price: product.price || 0,
  image: product.image || product.thumbnail || '',
  thumbnail: product.thumbnail || product.image || '',
  sku: product.sku || '',
});

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setFavorites(JSON.parse(stored));
        }
      })
      .finally(() => {
        setLoaded(true);
      });
  }, []);

  const persistFavorites = async (nextFavorites) => {
    setFavorites(nextFavorites);
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
  };

  const favoriteIds = useMemo(
    () => new Set(favorites.map((product) => product.id)),
    [favorites]
  );

  const toggleFavorite = async (product) => {
    if (!product?.id) {
      return { added: false };
    }

    const exists = favoriteIds.has(product.id);
    const nextFavorites = exists
      ? favorites.filter((item) => item.id !== product.id)
      : [serializeFavorite(product), ...favorites.filter((item) => item.id !== product.id)];

    await persistFavorites(nextFavorites);

    return { added: !exists };
  };

  const removeFavorite = async (productId) => {
    const nextFavorites = favorites.filter((item) => item.id !== productId);
    await persistFavorites(nextFavorites);
  };

  const clearFavorites = async () => {
    await persistFavorites([]);
  };

  const value = useMemo(
    () => ({
      favorites,
      favoriteCount: favorites.length,
      loaded,
      isFavorite: (productId) => favoriteIds.has(productId),
      toggleFavorite,
      removeFavorite,
      clearFavorites,
    }),
    [favoriteIds, favorites, loaded]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  }

  return context;
};
