import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, Filter, X } from 'lucide-react-native';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  startDate: string | null;
  endDate: string | null;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeChange,
  startDate,
  endDate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartDateChange = useCallback((text: string) => {
    onDateRangeChange(text || null, endDate);
  }, [onDateRangeChange, endDate]);

  const handleEndDateChange = useCallback((text: string) => {
    onDateRangeChange(startDate, text || null);
  }, [onDateRangeChange, startDate]);

  const handleClearFilter = useCallback(() => {
    onDateRangeChange(null, null);
  }, [onDateRangeChange]);

  const hasActiveFilter = startDate || endDate;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.filterButton, hasActiveFilter && styles.activeFilterButton]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <Filter size={16} color={hasActiveFilter ? '#2563eb' : '#64748b'} />
        <Text style={[styles.filterButtonText, hasActiveFilter && styles.activeFilterText]}>
          Date Filter
        </Text>
        {hasActiveFilter && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearFilter}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={14} color="#64748b" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.dateInputRow}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date</Text>
              <View style={styles.dateInputWrapper}>
                <Calendar size={16} color="#64748b" style={styles.calendarIcon} />
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={startDate || ''}
                  onChangeText={handleStartDateChange}
                />
              </View>
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date</Text>
              <View style={styles.dateInputWrapper}>
                <Calendar size={16} color="#64748b" style={styles.calendarIcon} />
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={endDate || ''}
                  onChangeText={handleEndDateChange}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.quickFilters}>
            <Text style={styles.quickFiltersLabel}>Quick Filters:</Text>
            <View style={styles.quickFiltersRow}>
              <TouchableOpacity
                style={styles.quickFilterButton}
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  onDateRangeChange(today, today);
                }}
              >
                <Text style={styles.quickFilterText}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickFilterButton}
                onPress={() => {
                  const today = new Date();
                  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  onDateRangeChange(weekAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.quickFilterText}>Last 7 Days</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quickFilterButton}
                onPress={() => {
                  const today = new Date();
                  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  onDateRangeChange(monthAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]);
                }}
              >
                <Text style={styles.quickFilterText}>Last 30 Days</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  activeFilterButton: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    flex: 1,
  },
  activeFilterText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  clearButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  expandedContent: {
    backgroundColor: '#ffffff',
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  calendarIcon: {
    marginRight: 8,
  },
  dateInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  quickFilters: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  quickFiltersLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  quickFiltersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickFilterButton: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
});