import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  setParams,
  setModalOpen,
  swapPlaces,
  PLACES,
} from '../store/flightsSlice';
import { useQuery } from '@tanstack/react-query';
import { searchFlights } from '../api/flightsService';
import { colors } from '../theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { format } from 'date-fns';
import { Dropdown } from 'react-native-element-dropdown';

const cabinClasses = [
  { label: 'Economy', value: 'economy' },
  { label: 'Premium Economy', value: 'premium_economy' },
  { label: 'Business', value: 'business' },
  { label: 'First', value: 'first' },
];
const sortOptions = [
  { label: 'Best', value: 'best' },
  { label: 'Cheapest', value: 'price_high' },
  { label: 'Fastest', value: 'fastest' },
  { label: 'Outbound Take Off', value: 'outbound_take_off_time' },
  { label: 'Outbound Landing', value: 'outbound_landing_time' },
  { label: 'Return Take Off', value: 'return_take_off_time' },
  { label: 'Return Landing', value: 'return_landing_time' },
];

const FlightsScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { params, modalOpen } = useSelector(
    (state: RootState) => state.flights,
  );
  const [datePickerVisible, setDatePickerVisible] = React.useState<
    'depart' | 'return' | null
  >(null);
  const [formError, setFormError] = React.useState('');
  const [showResults, setShowResults] = React.useState(false);

  const fromOptions = PLACES.filter(p => p.skyId !== params.destinationSkyId);
  const toOptions = PLACES.filter(p => p.skyId !== params.originSkyId);
  const [fromFocus, setFromFocus] = React.useState(false);
  const [toFocus, setToFocus] = React.useState(false);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['searchFlights', params],
    queryFn: () => searchFlights(params as any),
    enabled: false,
  });

  const handleSelectPlace = useCallback(
    (type: 'origin' | 'destination', skyId: string) => {
      const place = PLACES.find(p => p.skyId === skyId);
      if (!place) return;
      if (type === 'origin') {
        dispatch(
          setParams({
            originSkyId: place.skyId,
            originEntityId: place.entityId,
          }),
        );
      } else {
        dispatch(
          setParams({
            destinationSkyId: place.skyId,
            destinationEntityId: place.entityId,
          }),
        );
      }
    },
    [dispatch],
  );

  const handleDateConfirm = (date: Date) => {
    const formatted = format(date, 'yyyy-MM-dd');
    if (datePickerVisible === 'depart') {
      dispatch(setParams({ date: formatted }));
    } else if (datePickerVisible === 'return') {
      dispatch(setParams({ returnDate: formatted }));
    }
    setDatePickerVisible(null);
  };

  const validate = () => {
    if (
      !params.originSkyId ||
      !params.destinationSkyId ||
      !params.originEntityId ||
      !params.destinationEntityId ||
      !params.date
    ) {
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

  const renderAdvancedModal = () => (
    <Modal
      visible={modalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => dispatch(setModalOpen(false))}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Advanced Options</Text>
            <Text style={styles.label}>Cabin Class</Text>
            <View style={styles.row}>
              {cabinClasses.map(c => (
                <TouchableOpacity
                  key={c.value}
                  style={[
                    styles.chip,
                    params.cabinClass === c.value && styles.chipActive,
                  ]}
                  onPress={() => dispatch(setParams({ cabinClass: c.value }))}
                >
                  <Text style={styles.chipText}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Adults:</Text>
              <TextInput
                style={[styles.input, { width: 50, marginHorizontal: 4 }]}
                keyboardType="numeric"
                value={String(params.adults || 1)}
                onChangeText={v => dispatch(setParams({ adults: Number(v) }))}
              />
              <Text style={styles.label}>Children:</Text>
              <TextInput
                style={[styles.input, { width: 50, marginHorizontal: 4 }]}
                keyboardType="numeric"
                value={String(params.childrens || 0)}
                onChangeText={v =>
                  dispatch(setParams({ childrens: Number(v) }))
                }
              />
              <Text style={styles.label}>Infants:</Text>
              <TextInput
                style={[styles.input, { width: 50, marginHorizontal: 4 }]}
                keyboardType="numeric"
                value={String(params.infants || 0)}
                onChangeText={v => dispatch(setParams({ infants: Number(v) }))}
              />
            </View>
            <Text style={styles.label}>Sort By</Text>
            <View style={styles.row}>
              {sortOptions.map(s => (
                <TouchableOpacity
                  key={s.value}
                  style={[
                    styles.chip,
                    params.sortBy === s.value && styles.chipActive,
                  ]}
                  onPress={() => dispatch(setParams({ sortBy: s.value }))}
                >
                  <Text style={styles.chipText}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Currency</Text>
            <TextInput
              style={styles.input}
              value={params.currency}
              onChangeText={v => dispatch(setParams({ currency: v }))}
            />
            <Text style={styles.label}>Market</Text>
            <TextInput
              style={styles.input}
              value={params.market}
              onChangeText={v => dispatch(setParams({ market: v }))}
            />
            <Text style={styles.label}>Country Code</Text>
            <TextInput
              style={styles.input}
              value={params.countryCode}
              onChangeText={v => dispatch(setParams({ countryCode: v }))}
            />
            <Text style={styles.label}>Limit</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(params.limit || 0)}
              onChangeText={v => dispatch(setParams({ limit: Number(v) }))}
            />
            <Text style={styles.label}>Carriers IDs (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={params.carriersIds || ''}
              onChangeText={v => dispatch(setParams({ carriersIds: v }))}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => dispatch(setModalOpen(false))}
            >
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchCard}>
        <Text style={styles.title}>Search Flights</Text>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>From</Text>
            <Dropdown
              style={[
                styles.dropdown,
                fromFocus && { borderColor: colors.accent },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={fromOptions}
              search
              maxHeight={200}
              labelField="label"
              valueField="skyId"
              placeholder={!fromFocus ? 'Select origin' : '...'}
              searchPlaceholder="Search..."
              value={params.originSkyId}
              onFocus={() => setFromFocus(true)}
              onBlur={() => setFromFocus(false)}
              onChange={item => {
                handleSelectPlace('origin', item.skyId);
                setFromFocus(false);
              }}
              renderLeftIcon={() => (
                <Icon
                  name="airplane-outline"
                  size={18}
                  color={fromFocus ? colors.accent : colors.primary}
                  style={{ marginRight: 6 }}
                />
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={() => dispatch(swapPlaces())}
          >
            <Icon name="swap-horizontal" size={24} color={colors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>To</Text>
            <Dropdown
              style={[
                styles.dropdown,
                toFocus && { borderColor: colors.accent },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={toOptions}
              search
              maxHeight={200}
              labelField="label"
              valueField="skyId"
              placeholder={!toFocus ? 'Select destination' : '...'}
              searchPlaceholder="Search..."
              value={params.destinationSkyId}
              onFocus={() => setToFocus(true)}
              onBlur={() => setToFocus(false)}
              onChange={item => {
                handleSelectPlace('destination', item.skyId);
                setToFocus(false);
              }}
              renderLeftIcon={() => (
                <Icon
                  name="location-outline"
                  size={18}
                  color={toFocus ? colors.accent : colors.primary}
                  style={{ marginRight: 6 }}
                />
              )}
            />
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.input, styles.dateBtn, { flex: 1, marginRight: 8 }]}
            onPress={() => setDatePickerVisible('depart')}
          >
            <Icon name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.dateText}>
              {params.date ? params.date : 'Departure Date'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.input, styles.dateBtn, { flex: 1, marginLeft: 8 }]}
            onPress={() => setDatePickerVisible('return')}
          >
            <Icon name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.dateText}>
              {params.returnDate ? params.returnDate : 'Return Date'}
            </Text>
          </TouchableOpacity>
        </View>
        <DateTimePickerModal
          isVisible={!!datePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(null)}
        />
        <TouchableOpacity
          style={styles.advBtn}
          onPress={() => dispatch(setModalOpen(true))}
        >
          <Icon name="options-outline" size={18} color={colors.accent} />
          <Text style={styles.advBtnText}>Show More Options</Text>
        </TouchableOpacity>
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}
          disabled={isFetching}
        >
          <Text style={styles.buttonText}>
            {isFetching ? 'Searching...' : 'Search Flights'}
          </Text>
        </TouchableOpacity>
      </View>
      {renderAdvancedModal()}
      {showResults && (
        <View style={styles.results}>
          {/* Destination Banner */}
          {/* {data?.data?.destinationImageUrl && (
            <View style={styles.bannerContainer}>
              <Image source={{ uri: data.data.destinationImageUrl }} style={styles.bannerImg} />
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.0)']}
                style={styles.bannerOverlay}
              />
              <Text style={styles.bannerText}>Flights to {toOptions.find(p => p.skyId === params.destinationSkyId)?.label?.split('(')[0]?.trim() || 'Destination'}</Text>
            </View>
          )} */}
          {isLoading && (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 32 }}
            />
          )}
          {error && <Text style={styles.error}>Error: {String(error)}</Text>}
          {data && data.data.itineraries.length === 0 && (
            <View style={styles.emptyContainer}>
              <Image
                source={{
                  uri: 'https://cdn.dribbble.com/users/2046015/screenshots/6015405/no_results_found.png',
                }}
                style={styles.emptyImg}
              />
              <Text style={styles.empty}>No flights found.</Text>
            </View>
          )}
          <FlatList
            data={data?.data.itineraries || []}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <FlightCard
                itinerary={item}
                from={params.originSkyId}
                to={params.destinationSkyId}
              />
            )}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </View>
      )}
    </View>
  );
};

const FlightCard: React.FC<{ itinerary: any; from: string; to: string }> = ({
  itinerary,
  from,
  to,
}) => {
  const firstLeg = itinerary.legs[0];
  const mainCarrier = firstLeg?.carriers?.marketing?.[0];
  const img = mainCarrier?.logoUrl;
  return (
    <View style={styles.card}>
      <Image source={{ uri: img }} style={styles.cardImg} resizeMode='contain' resizeMethod='resize' />
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardPrice}>{itinerary.price.formatted}</Text>
        {img && <Image source={{ uri: img }} style={styles.carrierLogo} />}
      </View>
      {itinerary.legs?.map((leg: any) => (
        <View key={leg.id} style={styles.leg}>
          <Text style={styles.legText}>
            {leg.origin.name} ({leg.origin.displayCode}) →{' '}
            {leg.destination.name} ({leg.destination.displayCode})
          </Text>
          <Text style={styles.legText}>
            Dep: {leg.departure.replace('T', '  ')} | Arr:{' '}
            {leg.arrival.replace('T', '  ')}
          </Text>
          <Text style={styles.legText}>
            Stops: {leg.stopCount} | Duration:{' '}
            {Math.floor(leg.durationInMinutes / 60)}h{' '}
            {leg.durationInMinutes % 60}m
          </Text>
          <View style={styles.carrierRow}>
            {leg.carriers?.marketing?.map((c: any) => (
              <View key={c.id} style={styles.carrierChip}>
                <Image
                  source={{ uri: c.logoUrl }}
                  style={styles.carrierLogoSmall}
                />
                <Text style={styles.carrierName}>{c.name}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.tagsRow}>
        {itinerary.tags?.map((tag: string) => (
          <Text key={tag} style={styles.tag}>
            {tag}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 8 },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  form: { marginBottom: 16 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderColor: colors.border,
    borderWidth: 1,
    marginBottom: 8,
  },
  dropdown: {
    height: 48,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    marginBottom: 4,
  },
  placeholderStyle: { color: colors.textSecondary, fontSize: 16 },
  selectedTextStyle: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  inputSearchStyle: { height: 40, fontSize: 16, color: colors.text },
  iconStyle: { width: 20, height: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  label: { color: colors.primary, fontWeight: 'bold', marginBottom: 2 },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 4,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.text, fontWeight: 'bold' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  error: { color: colors.error, marginBottom: 8, fontSize: 15 },
  results: { flex: 1 },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: { alignItems: 'center', marginTop: 32 },
  emptyImg: { width: 180, height: 120, resizeMode: 'contain', marginBottom: 8 },
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
  cardImg: { width: '100%', height: 120, borderRadius: 12, marginBottom: 8 },
  cardPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  leg: { marginBottom: 8 },
  legText: { fontSize: 15, color: colors.text },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  tag: {
    backgroundColor: colors.primary,
    color: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    fontSize: 12,
    marginBottom: 2,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  dateText: { marginLeft: 8, color: colors.text, fontSize: 16 },
  swapBtn: {
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.accent,
    alignSelf: 'center',
  },
  advBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 8,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  advBtnText: { color: colors.accent, fontWeight: 'bold', marginLeft: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  bannerContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 16,
  },
  bannerText: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  carrierLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    backgroundColor: '#fff',
  },
  carrierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  carrierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  carrierLogoSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
    backgroundColor: '#fff',
  },
  carrierName: { color: colors.text, fontSize: 13, fontWeight: 'bold' },
});

export default FlightsScreen;
