import React, { useEffect } from 'react';
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

  useEffect(() => {
    dispatch(getUserLocation()).then((action: any) => {
      if (getUserLocation.fulfilled.match(action)) {
        dispatch(fetchNearbyAirports(action.payload));
      }
    });
  }, [dispatch]);

  const filteredAirports = airports.filter(a => {
    if (filter === 'all') return true;
    return a.navigation.entityType.toLowerCase() === filter;
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Nearby Airports</Text>
        <TextInput
          style={styles.search}
          placeholder="Search airports or cities..."
          value={search}
          onChangeText={setSearch}
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
            style={[styles.filterBtn, filter === 'city' && styles.filterActive]}
            onPress={() => setFilter('city')}
          >
            <Text style={styles.filterText}>Cities</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading && (
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={{ marginTop: 32 }}
        />
      )}
      {error && (
        <Text style={styles.error}>Error: {String(error)}</Text>
      )}
      <FlatList
        data={filteredAirports}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <AirportCard airport={item} index={index} />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          !loading && !error ? (
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
});

export default AirportsScreen;
