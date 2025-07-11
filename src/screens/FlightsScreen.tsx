import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { searchFlights, FlightSearchParams, FlightItinerary, CabinClass, SortBy } from '../api/flightsService';
import { colors } from '../theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';

const cabinClasses: { label: string; value: CabinClass }[] = [
  { label: 'Economy', value: 'economy' },
  { label: 'Premium Economy', value: 'premium_economy' },
  { label: 'Business', value: 'business' },
  { label: 'First', value: 'first' },
];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Best', value: 'best' },
  { label: 'Cheapest', value: 'price_high' },
  { label: 'Fastest', value: 'fastest' },
  { label: 'Outbound Take Off', value: 'outbound_take_off_time' },
  { label: 'Outbound Landing', value: 'outbound_landing_time' },
  { label: 'Return Take Off', value: 'return_take_off_time' },
  { label: 'Return Landing', value: 'return_landing_time' },
];

const FlightsScreen = () => {
  const [params, setParams] = useState<FlightSearchParams>({
    originSkyId: '',
    destinationSkyId: '',
    originEntityId: '',
    destinationEntityId: '',
    date: '',
    cabinClass: 'economy',
    adults: 1,
    sortBy: 'best',
    currency: 'USD',
    market: 'en-US',
    countryCode: 'US',
  });
  const [showResults, setShowResults] = useState(false);
  const [formError, setFormError] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState<'depart' | 'return' | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['searchFlights', params],
    queryFn: () => searchFlights(params),
    enabled: false,
  });

  const handleInput = (key: keyof FlightSearchParams, value: string | number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!params.originSkyId || !params.destinationSkyId || !params.originEntityId || !params.destinationEntityId || !params.date) {
      setFormError('All fields are required.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSearch = () => {
    if (!validate()) return;
    setShowResults(true);
    refetch();
  };

  const handleDateConfirm = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    if (datePickerVisible === 'depart') {
      handleInput('date', formatted);
    } else if (datePickerVisible === 'return') {
      handleInput('returnDate', formatted);
    }
    setDatePickerVisible(null);
  };

  const swapAirports = () => {
    setParams((prev) => ({
      ...prev,
      originSkyId: prev.destinationSkyId,
      destinationSkyId: prev.originSkyId,
      originEntityId: prev.destinationEntityId,
      destinationEntityId: prev.originEntityId,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search Flights</Text>
      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Origin SkyId (e.g. LOND)"
            value={params.originSkyId}
            onChangeText={(v) => handleInput('originSkyId', v)}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Origin EntityId (e.g. 27544008)"
            value={params.originEntityId}
            onChangeText={(v) => handleInput('originEntityId', v)}
          />
          <TouchableOpacity style={styles.swapBtn} onPress={swapAirports}>
            <Icon name="swap-horizontal" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Destination SkyId (e.g. NYCA)"
            value={params.destinationSkyId}
            onChangeText={(v) => handleInput('destinationSkyId', v)}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Destination EntityId (e.g. 27537542)"
            value={params.destinationEntityId}
            onChangeText={(v) => handleInput('destinationEntityId', v)}
          />
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.input, styles.dateBtn]} onPress={() => setDatePickerVisible('depart')}>
            <Icon name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.dateText}>{params.date ? params.date : 'Departure Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.input, styles.dateBtn]} onPress={() => setDatePickerVisible('return')}>
            <Icon name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.dateText}>{params.returnDate ? params.returnDate : 'Return Date (optional)'}</Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={!!datePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(null)}
        />
        <View style={styles.row}>
          <Text style={styles.label}>Cabin Class:</Text>
          {cabinClasses.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.chip, params.cabinClass === c.value && styles.chipActive]}
              onPress={() => handleInput('cabinClass', c.value)}
            >
              <Text style={styles.chipText}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Adults:</Text>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            value={String(params.adults || 1)}
            onChangeText={(v) => handleInput('adults', Number(v))}
          />
          <Text style={styles.label}>Children:</Text>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            value={String(params.childrens || 0)}
            onChangeText={(v) => handleInput('childrens', Number(v))}
          />
          <Text style={styles.label}>Infants:</Text>
          <TextInput
            style={styles.inputSmall}
            keyboardType="numeric"
            value={String(params.infants || 0)}
            onChangeText={(v) => handleInput('infants', Number(v))}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sort By:</Text>
          {sortOptions.map((s) => (
            <TouchableOpacity
              key={s.value}
              style={[styles.chip, params.sortBy === s.value && styles.chipActive]}
              onPress={() => handleInput('sortBy', s.value)}
            >
              <Text style={styles.chipText}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <TouchableOpacity style={styles.button} onPress={handleSearch} disabled={isFetching}>
          <Text style={styles.buttonText}>{isFetching ? 'Searching...' : 'Search Flights'}</Text>
        </TouchableOpacity>
      </View>
      {showResults && (
        <View style={styles.results}>
          {isLoading && <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />}
          {error && <Text style={styles.error}>Error: {String(error)}</Text>}
          {data && data.data.itineraries.length === 0 && <Text style={styles.empty}>No flights found.</Text>}
          <FlatList
            data={data?.data.itineraries || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FlightCard itinerary={item} />}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>
      )}
    </View>
  );
};

const FlightCard: React.FC<{ itinerary: FlightItinerary }> = ({ itinerary }) => (
  <View style={styles.card}>
    <Text style={styles.cardPrice}>{itinerary.price.formatted}</Text>
    {itinerary.legs.map((leg, i) => (
      <View key={leg.id} style={styles.leg}>
        <Text style={styles.legText}>{leg.origin.name} ({leg.origin.displayCode}) → {leg.destination.name} ({leg.destination.displayCode})</Text>
        <Text style={styles.legText}>Dep: {leg.departure.replace('T', '  ')} | Arr: {leg.arrival.replace('T', '  ')}</Text>
        <Text style={styles.legText}>Stops: {leg.stopCount} | Duration: {Math.floor(leg.durationInMinutes / 60)}h {leg.durationInMinutes % 60}m</Text>
        <Text style={styles.legText}>Carrier: {leg.carriers.marketing.map((c: any) => c.name).join(', ')}</Text>
      </View>
    ))}
    <View style={styles.tagsRow}>
      {itinerary.tags.map((tag) => (
        <Text key={tag} style={styles.tag}>{tag}</Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.primary, marginBottom: 12 },
  form: { marginBottom: 16 },
  input: { backgroundColor: colors.surface, borderRadius: 8, padding: 12, fontSize: 16, borderColor: colors.border, borderWidth: 1, marginBottom: 8 },
  inputSmall: { width: 50, backgroundColor: colors.surface, borderRadius: 8, padding: 8, fontSize: 16, borderColor: colors.border, borderWidth: 1, marginHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' },
  label: { color: colors.primary, fontWeight: 'bold', marginRight: 8 },
  chip: { backgroundColor: colors.surface, borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, marginRight: 8, marginBottom: 4 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: 'bold' },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: colors.error, marginBottom: 8, fontSize: 15 },
  results: { flex: 1 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 32, fontSize: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  cardPrice: { fontSize: 22, fontWeight: 'bold', color: colors.primary, marginBottom: 8 },
  leg: { marginBottom: 8 },
  legText: { fontSize: 15, color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: { backgroundColor: colors.primary, color: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 6, fontSize: 12, marginBottom: 2 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingVertical: 0, paddingHorizontal: 8 },
  dateText: { marginLeft: 8, color: colors.text, fontSize: 16 },
  swapBtn: { marginLeft: 8, marginRight: 8, padding: 8, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignSelf: 'center' },
});

export default FlightsScreen; 