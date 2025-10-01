import React, { useState, useCallback, memo, useMemo, useRef } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertTriangle, Calendar, Edit3, Plus, Search, Trash2 } from 'lucide-react-native';
import { useShopData } from '@/hooks/useShopData';
import { Part } from '@/types';
import { formatVND } from '@/utils/currency';
import { DateRangeFilter } from '@/components/DateRangeFilter';

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  
  // Convert both dates to Vietnam timezone for comparison
  const vietnamDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const vietnamNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  
  // Check if it's the same day in Vietnam timezone
  const isSameDay = vietnamDate.toDateString() === vietnamNow.toDateString();
  
  // Check if it's yesterday in Vietnam timezone
  const yesterday = new Date(vietnamNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = vietnamDate.toDateString() === yesterday.toDateString();
  
  if (isSameDay) {
    return `Today at ${date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    })}`;
  } else if (isYesterday) {
    return `Yesterday at ${date.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    })}`;
  } else {
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh'
    }) + ' at ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Ho_Chi_Minh'
    });
  }
};

interface AddPartFormProps {
  newPart: Partial<Part & { price: string | number; cost: string | number; stockQuantity: string | number; minStockLevel: string | number }>;
  onUpdateField: (field: keyof Part, value: string | number) => void;
  onSave: () => void;
  onCancel: () => void;
  existingParts: Part[];
}

interface AutocompleteInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  suggestions: string[];
  style?: any;
  placeholderTextColor?: string;
}

const AutocompleteInput = memo(({ value, onChangeText, placeholder, suggestions, style, placeholderTextColor }: AutocompleteInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);
    
    if (text.length > 0) {
      const filtered = suggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(text.toLowerCase()) && 
        suggestion.toLowerCase() !== text.toLowerCase()
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [suggestions, onChangeText]);

  const handleSuggestionPress = useCallback((suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
  }, [onChangeText]);

  const handleBlur = useCallback(() => {
    // Delay hiding suggestions to allow for suggestion tap
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  return (
    <View style={styles.autocompleteContainer}>
      <TextInput
        style={style}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={value}
        onChangeText={handleTextChange}
        onBlur={handleBlur}
        onFocus={() => {
          if (value.length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
      />
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={filteredSuggestions.slice(0, 5)} // Limit to 5 suggestions
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
});
AutocompleteInput.displayName = 'AutocompleteInput';

const AddPartForm = memo(({ newPart, onUpdateField, onSave, onCancel, existingParts }: AddPartFormProps) => {
  const handleNameChange = useCallback((text: string) => {
    onUpdateField('name', text);
    
    // Check if the entered text matches an existing part name exactly
    const matchingPart = existingParts.find(part => 
      part.name.toLowerCase() === text.toLowerCase()
    );
    
    if (matchingPart) {
      // Auto-fill all fields except quantity (stockQuantity)
      onUpdateField('partNumber', matchingPart.partNumber);
      onUpdateField('description', matchingPart.description);
      onUpdateField('price', matchingPart.price);
      onUpdateField('cost', matchingPart.cost);
      onUpdateField('minStockLevel', matchingPart.minStockLevel);
      onUpdateField('supplier', matchingPart.supplier);
      onUpdateField('category', matchingPart.category);
    }
  }, [onUpdateField, existingParts]);
  
  const existingPartNames = useMemo(() => {
    return [...new Set(existingParts.map(part => part.name))];
  }, [existingParts]);
  const handlePartNumberChange = useCallback((text: string) => onUpdateField('partNumber', text), [onUpdateField]);
  const handleDescriptionChange = useCallback((text: string) => onUpdateField('description', text), [onUpdateField]);
  const handlePriceChange = useCallback((text: string) => onUpdateField('price', text), [onUpdateField]);
  const handleCostChange = useCallback((text: string) => onUpdateField('cost', text), [onUpdateField]);
  const handleStockChange = useCallback((text: string) => onUpdateField('stockQuantity', text), [onUpdateField]);
  const handleMinStockChange = useCallback((text: string) => onUpdateField('minStockLevel', text), [onUpdateField]);
  const handleSupplierChange = useCallback((text: string) => onUpdateField('supplier', text), [onUpdateField]);
  const handleCategoryChange = useCallback((text: string) => onUpdateField('category', text), [onUpdateField]);

  return (
    <View style={styles.addForm}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContent}
      >
      <Text style={styles.addFormTitle}>Add New Part</Text>
      
      <AutocompleteInput
        style={styles.input}
        placeholder="Part Name"
        placeholderTextColor="#374151"
        value={newPart.name || ''}
        onChangeText={handleNameChange}
        suggestions={existingPartNames}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Part Number"
        placeholderTextColor="#374151"
        value={newPart.partNumber || ''}
        onChangeText={handlePartNumberChange}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#374151"
        value={newPart.description || ''}
        onChangeText={handleDescriptionChange}
        multiline
      />
      
      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <TextInput
            style={styles.input}
            placeholder="Sale Price (VND)"
            placeholderTextColor="#374151"
            value={typeof newPart.price === 'string' ? newPart.price : (newPart.price?.toString() || '')}
            onChangeText={handlePriceChange}
            keyboardType="numeric"
          />
          <Text style={styles.inputDescription}>Price you sell this part to customers</Text>
        </View>
        <View style={styles.halfInput}>
          <TextInput
            style={styles.input}
            placeholder="Cost Price (VND)"
            placeholderTextColor="#374151"
            value={typeof newPart.cost === 'string' ? newPart.cost : (newPart.cost?.toString() || '')}
            onChangeText={handleCostChange}
            keyboardType="numeric"
          />
          <Text style={styles.inputDescription}>Your cost to purchase this part</Text>
        </View>
      </View>
      
      <View style={styles.inputRow}>
        <View style={styles.halfInput}>
          <TextInput
            style={styles.input}
            placeholder="Stock Quantity"
            placeholderTextColor="#374151"
            value={typeof newPart.stockQuantity === 'string' ? newPart.stockQuantity : (newPart.stockQuantity?.toString() || '')}
            onChangeText={handleStockChange}
            keyboardType="numeric"
          />
          <Text style={styles.inputDescription}>Current number of parts in stock</Text>
        </View>
        <View style={styles.halfInput}>
          <TextInput
            style={styles.input}
            placeholder="Min Stock Level"
            placeholderTextColor="#374151"
            value={typeof newPart.minStockLevel === 'string' ? newPart.minStockLevel : (newPart.minStockLevel?.toString() || '')}
            onChangeText={handleMinStockChange}
            keyboardType="numeric"
          />
          <Text style={styles.inputDescription}>Alert when stock falls below this level</Text>
        </View>
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Supplier"
        placeholderTextColor="#374151"
        value={newPart.supplier || ''}
        onChangeText={handleSupplierChange}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Category"
        placeholderTextColor="#374151"
        value={newPart.category || ''}
        onChangeText={handleCategoryChange}
      />
      
      <View style={styles.formButtons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={onSave}
        >
          <Text style={styles.saveButtonText}>Add Part</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
});
AddPartForm.displayName = 'AddPartForm';

export default function InventoryScreen() {
  const { parts, addPart, deletePart, updatePart } = useShopData();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [newPart, setNewPart] = useState<Partial<Part>>({
    name: '',
    partNumber: '',
    description: '',
    price: 0,
    cost: 0,
    stockQuantity: 0,
    minStockLevel: 5,
    supplier: '',
    category: '',
  });

  // Sort parts by addedAt timestamp (most recent first) and then filter
  const sortedAndFilteredParts = useMemo(() => {
    let filtered = [...parts];
    
    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(part => {
        const partDate = new Date(part.addedAt || part.createdAt || 0);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && partDate < start) return false;
        if (end && partDate > end) return false;
        return true;
      });
    }
    
    // Sort by date
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.addedAt || b.createdAt || 0).getTime();
      return dateB - dateA; // Most recent first
    });
    
    // Filter by search query
    return sorted.filter(part =>
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [parts, searchQuery, startDate, endDate]);

  const handleAddPart = useCallback(async () => {
    if (newPart.name && newPart.partNumber) {
      try {
        const partToAdd = {
          ...newPart,
          price: typeof newPart.price === 'string' ? parseFloat(newPart.price) || 0 : (newPart.price || 0),
          cost: typeof newPart.cost === 'string' ? parseFloat(newPart.cost) || 0 : (newPart.cost || 0),
          stockQuantity: typeof newPart.stockQuantity === 'string' ? parseInt(newPart.stockQuantity) || 0 : (newPart.stockQuantity || 0),
          minStockLevel: typeof newPart.minStockLevel === 'string' ? parseInt(newPart.minStockLevel) || 0 : (newPart.minStockLevel || 5),
        };
        await addPart(partToAdd as Omit<Part, 'id' | 'createdAt' | 'updatedAt' | 'addedAt'>);
        setNewPart({
          name: '',
          partNumber: '',
          description: '',
          price: 0,
          cost: 0,
          stockQuantity: 0,
          minStockLevel: 5,
          supplier: '',
          category: '',
        });
        setShowAddForm(false);
      } catch (error) {
        console.error('Error adding part:', error);
      }
    }
  }, [newPart, addPart]);

  const handleDeletePart = useCallback((part: Part) => {
    Alert.alert(
      'Delete Part',
      `Are you sure you want to delete "${part.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePart(part.id),
        },
      ]
    );
  }, [deletePart]);

  const PartItem = memo(({ item, index }: { item: Part; index: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const isLowStock = item.stockQuantity <= item.minStockLevel;
    
    const handleEditPress = useCallback(() => {
      setIsEditing(true);
      setEditingItemId(item.id);
      setEditValue(item.minStockLevel.toString());
      
      // Scroll to item when editing starts, with extra offset for keyboard
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3, // Position item at 30% from top to ensure visibility above keyboard
        });
      }, 100);
    }, [item.minStockLevel, item.id, index]);
    
    const handleSavePress = useCallback(async () => {
      const newMinStock = parseInt(editValue) || 0;
      if (newMinStock >= 0) {
        await updatePart(item.id, { minStockLevel: newMinStock });
      }
      setIsEditing(false);
      setEditingItemId(null);
      setEditValue('');
      Keyboard.dismiss();
    }, [editValue, item.id, updatePart]);
    
    const handleCancelPress = useCallback(() => {
      setIsEditing(false);
      setEditingItemId(null);
      setEditValue('');
      Keyboard.dismiss();
    }, []);
    
    const handleDeletePress = useCallback(() => {
      handleDeletePart(item);
    }, [item]);
    
    const handleValueChange = useCallback((text: string) => {
      setEditValue(text);
    }, []);
    
    return (
      <View style={styles.partItem}>
        <View style={styles.partHeader}>
          <View style={styles.partInfo}>
            <Text style={styles.partName}>{item.name}</Text>
            <Text style={styles.partNumber}>#{item.partNumber}</Text>
          </View>
          <View style={styles.partActions}>
            <View style={styles.partPricing}>
              <Text style={styles.partPrice}>{formatVND(item.price)}</Text>
              {isLowStock && (
                <View style={styles.lowStockBadge}>
                  <AlertTriangle size={12} color="#ef4444" />
                  <Text style={styles.lowStockText}>Low</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              testID={`delete-part-${item.id}`}
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.partDetails}>
          <Text style={styles.partDescription}>{item.description}</Text>
          <View style={styles.partMeta}>
            <Text style={styles.partMetaText}>Qty: {item.stockQuantity}</Text>
            <Text style={styles.partMetaText}>•</Text>
            <View style={styles.minStockContainer}>
              {isEditing ? (
                <View style={styles.editMinStockContainer}>
                  <TextInput
                    style={styles.editMinStockInput}
                    value={editValue}
                    onChangeText={handleValueChange}
                    keyboardType="numeric"
                    placeholder="Min stock"
                    autoFocus
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={styles.saveMinStockButton}
                    onPress={handleSavePress}
                  >
                    <Text style={styles.saveMinStockText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelMinStockButton}
                    onPress={handleCancelPress}
                  >
                    <Text style={styles.cancelMinStockText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.minStockEditButton}
                  onPress={handleEditPress}
                >
                  <Text style={styles.partMetaText}>Min: {item.minStockLevel}</Text>
                  <Edit3 size={24} color="#94a3b8" style={styles.editIcon} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.partMetaText}>•</Text>
            <Text style={styles.partMetaText}>{item.category}</Text>
          </View>
          <Text style={styles.partSupplier}>Supplier: {item.supplier}</Text>
          {item.addedAt && (
            <View style={styles.addedAtContainer}>
              <Calendar size={12} color="#64748b" />
              <Text style={styles.addedAtText}>Added: {formatDateTime(item.addedAt)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  });
  PartItem.displayName = 'PartItem';

  const updatePartField = useCallback((field: keyof Part, value: string | number) => {
    setNewPart(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCancel = useCallback(() => {
    setShowAddForm(false);
  }, []);

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search parts..."
          placeholderTextColor="#374151"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {showAddForm && (
        <AddPartForm
          newPart={newPart}
          onUpdateField={updatePartField}
          onSave={handleAddPart}
          onCancel={handleCancel}
          existingParts={parts}
        />
      )}

      <FlatList
        ref={flatListRef}
        data={sortedAndFilteredParts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <PartItem item={item} index={index} />}
        contentContainerStyle={[
          styles.listContainer,
          editingItemId && { paddingBottom: Platform.OS === 'ios' ? 350 : 300 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentInsetAdjustmentBehavior="automatic"
        onScrollToIndexFailed={(info) => {
          // Fallback for scrollToIndex failures
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true, viewPosition: 0.3 });
          });
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No inventory entries found</Text>
            <Text style={styles.emptySubtext}>Add your first inventory entry to get started</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  partItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  partHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  partInfo: {
    flex: 1,
  },
  partName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  partNumber: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  partActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  partPricing: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 2,
  },
  partDetails: {
    gap: 4,
  },
  partDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  partMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  partSupplier: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
  },
  addForm: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  formContent: {
    padding: 16,
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  inputDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  suggestionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  addedAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  addedAtText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  minStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minStockEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
  },
  editIcon: {
    marginLeft: 2,
  },
  editMinStockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editMinStockInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 12,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    minWidth: 40,
    textAlign: 'center',
  },
  saveMinStockButton: {
    backgroundColor: '#10b981',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  saveMinStockText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cancelMinStockButton: {
    backgroundColor: '#ef4444',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  cancelMinStockText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});