import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setParams, setModalOpen } from '../store/priceCalendarSlice';
import { useQuery } from '@tanstack/react-query';
import { getPriceCalendar, Root as PriceCalendarRoot, PriceCalendarGroup } from '../api/priceCalendarService';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/Ionicons';
import { PLACES } from '../store/flightsSlice';

const GROUP_COLORS: Record<string, string> = {
  low: '#4CAF50', // green
  medium: '#FFC107', // amber
  high: '#F44336', // red
};


const CURRENCIES = [
  { label: 'USD', value: 'USD' },
  { label: 'INR', value: 'INR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'EUR', value: 'EUR' },
];

const PriceCalendarScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { params, modalOpen } = useSelector((state: RootState) => state.priceCalendar);

  const { data, isLoading, error, isFetching } = useQuery<PriceCalendarRoot>({
    queryKey: ['priceCalendar', params],
    queryFn: () => getPriceCalendar(params),
    enabled: true,
  });

  // Prepare marked dates for the calendar
  const markedDates = useMemo(() => {
    const days = data?.data?.flights?.days || [];
    const marks: any = {};
    days.forEach((d: any) => {
      marks[d.day] = {
        customStyles: {
          container: {
            backgroundColor: GROUP_COLORS[d.group] || colors.accent,
            borderRadius: 8,
          },
          text: {
            color: '#fff',
            fontWeight: 'bold',
          },
        },
        price: d.price,
        group: d.group,
      };
    });
    return marks;
  }, [data]);

  // Render price below each date
  const renderDay = (day: any) => {
    const mark = markedDates[day.dateString];
    return (
      <View style={{ alignItems: 'center',  }}>
        <Text style={{ color: mark ? '#fff' : colors.text, fontWeight: mark ? 'bold' : 'normal', }}>{day.day}</Text>
        {mark && (
          <Text style={{ fontSize: 12, color: '#fff', backgroundColor: GROUP_COLORS[mark.group] || colors.accent, borderRadius: 10, paddingHorizontal: 2, marginTop: 2, padding: 4, margin: 4 }}>{mark.price}</Text>
        )}
      </View>
    );
  };

  // Render price group legend
  const renderLegend = () => {
    const groups: PriceCalendarGroup[] = data?.data?.flights?.groups || [];
    return (
      <View style={styles.legendRow}>
        {groups.map(g => (
          <View key={g.id} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: GROUP_COLORS[g.id] || colors.accent }]} />
            <Text style={styles.legendLabel}>{g.id}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderOptionsModal = () => (
    <Modal
      visible={modalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => dispatch(setModalOpen(false))}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Calendar Options</Text>
            <Text style={styles.label}>From</Text>
            <Dropdown
              style={styles.dropdown}
              data={PLACES}
              labelField="label"
              valueField="skyId"
              value={params.originSkyId}
              onChange={item => dispatch(setParams({ originSkyId: item.skyId }))}
              renderLeftIcon={() => <Icon name="airplane-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />}
            />
            <Text style={styles.label}>To</Text>
            <Dropdown
              style={styles.dropdown}
              data={PLACES}
              labelField="label"
              valueField="skyId"
              value={params.destinationSkyId}
              onChange={item => dispatch(setParams({ destinationSkyId: item.skyId }))}
              renderLeftIcon={() => <Icon name="location-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />}
            />
            <Text style={styles.label}>Currency</Text>
            <Dropdown
              style={styles.dropdown}
              data={CURRENCIES}
              labelField="label"
              valueField="value"
              value={params.currency}
              onChange={item => dispatch(setParams({ currency: item.value }))}
              renderLeftIcon={() => <Icon name="cash-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />}
            />
            <TouchableOpacity style={styles.button} onPress={() => dispatch(setModalOpen(false))}>
              <Text style={styles.buttonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const days = data?.data?.flights?.days || [];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Price Calendar</Text>
        <TouchableOpacity style={styles.optionsBtn} onPress={() => dispatch(setModalOpen(true))}>
          <Text style={styles.optionsBtnText}>Options</Text>
        </TouchableOpacity>
      </View>
      {renderOptionsModal()}
      {renderLegend()}
      {isLoading || isFetching ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 32 }} />
      ) : error ? (
        <Text style={styles.error}>Error: {String(error)}</Text>
      ) : !days.length ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.empty}>No price data found for these dates.</Text>
        </View>
      ) : (
        <Calendar
          markingType={'custom'}
          markedDates={markedDates}
          dayComponent={({ date }) => renderDay(date)}
          style={styles.calendar}
          theme={{
            backgroundColor: colors.background,
            calendarBackground: colors.background,
            textSectionTitleColor: colors.primary,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: '#fff',
            todayTextColor: colors.accent,
            dayTextColor: colors.text,
            textDisabledColor: colors.textSecondary,
            arrowColor: colors.accent,
            monthTextColor: colors.primary,
            indicatorColor: colors.accent,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.primary },
  optionsBtn: { backgroundColor: colors.accent, borderRadius: 8, padding: 10 },
  optionsBtnText: { color: '#fff', fontWeight: 'bold' },
  calendar: { borderRadius: 16, elevation: 2, marginTop: 8 },
  error: { color: colors.error, marginTop: 16, fontSize: 16 },
  empty: { textAlign: 'center', color: colors.textSecondary, marginTop: 12, fontSize: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.surface, borderRadius: 18, padding: 24, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 12, textAlign: 'center' },
  button: { backgroundColor: colors.accent, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendColor: { width: 18, height: 10, borderRadius: 4, marginRight: 6 },
  legendLabel: { color: colors.text, fontSize: 14 },
  label: { color: colors.primary, fontWeight: 'bold', marginBottom: 2, marginTop: 8 },
  dropdown: { height: 48, borderColor: colors.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, backgroundColor: colors.background, marginBottom: 4 },
});

export default PriceCalendarScreen; 