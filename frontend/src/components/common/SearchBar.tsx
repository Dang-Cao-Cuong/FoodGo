import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
  value?: string;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 500,
  value: externalValue,
  onClear,
}) => {
  const [internalValue, setInternalValue] = useState(externalValue || '');
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Use external value if provided, otherwise use internal state
  const value = externalValue !== undefined ? externalValue : internalValue;

  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  const handleChangeText = (text: string) => {
    // Update internal state if not controlled
    if (externalValue === undefined) {
      setInternalValue(text);
    }

    // Clear existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      onSearch(text);
    }, debounceMs);

    setDebounceTimeout(timeout);
  };

  const handleClear = () => {
    if (externalValue === undefined) {
      setInternalValue('');
    }
    
    if (onClear) {
      onClear();
    } else {
      onSearch('');
    }

    // Clear timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Icon */}
      <Icon name="magnify" size={24} color="#666" style={styles.searchIcon} />

      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={handleChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Icon name="close-circle" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default SearchBar;
