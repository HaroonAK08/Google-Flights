import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { getUserLocation, fetchNearbyAirports } from '../store/airportsSlice';
import { AirportData } from '../api/airportsService';
import { searchAirports } from '../api/airportsService';
import { colors } from '../theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const AirportCard: React.FC<{ airport: AirportData; index: number }> = ({
  airport,
  index,
}) => {
  const [scale] = React.useState(new Animated.Value(0.95));
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      delay: index * 50,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <AnimatedTouchable
      style={[styles.card, { transform: [{ scale }] }]}
      activeOpacity={0.8}
    >
      <Text style={styles.cardTitle}>
        {airport.presentation.suggestionTitle}
      </Text>
      <Text style={styles.cardSubtitle}>{airport.presentation.subtitle}</Text>
      <Text style={styles.cardCity}>{airport.presentation.title}</Text>
    </AnimatedTouchable>
  );
};

const AirportsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { airports, loading, error } = useSelector((state: RootState) => state.airports);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'airport' | 'city'>('all');
  const [searchResults, setSearchResults] = React.useState<AirportData[]>([]);
  const [searching, setSearching] = React.useState(false);

  const handleGetLocation = useCallback(() => {
    dispatch(getUserLocation()).then((action: any) => {
      if (getUserLocation.fulfilled.match(action)) {
        dispatch(fetchNearbyAirports(action.payload));
      }
    });
  }, [dispatch]);

  const handleSearch = useCallback(async (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const response = await searchAirports(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  const displayAirports = search.length >= 2 ? searchResults : airports;
  const isLoading = loading || searching;

  const filteredAirports = displayAirports.filter(a => {
    if (filter === 'all') return true;
    return a.navigation.entityType.toLowerCase() === filter;
  });

  const renderError = () => {
    if (!error) return null;
    
    const isPermissionError = error.includes('permission') || error.includes('denied');
    const isLocationError = error.includes('location') || error.includes('timeout');
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.error}>
          {isPermissionError 
            ? 'Location permission is required to find nearby airports. Please grant location access in your device settings.'
            : isLocationError
            ? 'Unable to get your location. Please check your GPS settings and try again.'
            : error
          }
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleGetLocation}>
          <Text style={styles.retryButtonText}>
            {isPermissionError ? 'Grant Permission & Retry' : 'Retry Location'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.errorNote}>
          You can also search for airports manually using the search bar above.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>
          {search.length >= 2 ? 'Search Results' : 'Nearby Airports'}
        </Text>
        <TextInput
          style={styles.search}
          placeholder="Search airports or cities..."
          value={search}
          onChangeText={handleSearch}
        />
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={styles.filterText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === 'airport' && styles.filterActive,
            ]}
            onPress={() => setFilter('airport')}
          >
            <Text style={styles.filterText}>Airports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              filter === 'city' && styles.filterActive,
            ]}
            onPress={() => setFilter('city')}
          >
            <Text style={styles.filterText}>Cities</Text>
          </TouchableOpacity>
        </View>
      </View>
      {isLoading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 32 }}
        />
      )}
      {renderError()}
      <FlatList
        data={filteredAirports}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <AirportCard airport={item} index={index} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          !isLoading && !error ? (
            <Text style={styles.empty}>No airports found.</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topBar: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardCity: {
    fontSize: 16,
    color: colors.text,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 32,
    fontSize: 16,
  },
  error: {
    color: colors.error,
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  errorNote: {
    marginTop: 10,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default AirportsScreen;
