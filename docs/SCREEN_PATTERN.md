# 📱 Screen Pattern Guide - FoodGo

## Tổng quan

FoodGo sử dụng pattern **Self-Contained Screen** - mỗi màn hình tự chứa toàn bộ logic của nó bao gồm:
- State management
- API calls (axios)
- UI rendering
- Event handlers

Pattern này đơn giản, dễ hiểu và phù hợp cho việc học tập.

---

## 🏗️ Cấu trúc Screen

### 1. **Imports**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, ... } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
```

### 2. **API Configuration**
```typescript
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.1.5:3000/api'; // Android
    }
    return 'http://localhost:3000/api'; // iOS
  }
  return 'https://your-production-api.com/api'; // Production
};

const API_BASE_URL = getBaseURL();
```

### 3. **Interfaces**
```typescript
interface Restaurant {
  id: number;
  name: string;
  description: string;
  // ... other fields
}
```

### 4. **Component State**
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 5. **API Functions**
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('@foodgo_token');
    const response = await axios.get(`${API_BASE_URL}/endpoint`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setData(response.data);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Error message');
  } finally {
    setLoading(false);
  }
};
```

### 6. **Event Handlers**
```typescript
const handlePress = (id: number) => {
  navigation.navigate('DetailScreen', { id });
};

const onRefresh = useCallback(() => {
  setRefreshing(true);
  fetchData();
}, []);
```

### 7. **Effects**
```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    fetchData();
  });
  return unsubscribe;
}, [navigation]);
```

### 8. **Render Methods**
```typescript
const renderItem = ({ item }) => (
  <TouchableOpacity onPress={() => handlePress(item.id)}>
    <Text>{item.name}</Text>
  </TouchableOpacity>
);

const renderEmptyState = () => (
  <View>
    <Text>No data found</Text>
  </View>
);
```

### 9. **Main Render**
```typescript
return (
  <View style={styles.container}>
    {loading ? (
      <ActivityIndicator size="large" />
    ) : (
      <FlatList
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    )}
  </View>
);
```

### 10. **Styles**
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // ... other styles
});
```

---

## 📋 Complete Example - RestaurantListScreen

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ==================== CONFIG ====================
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://192.168.1.5:3000/api';
    }
    return 'http://localhost:3000/api';
  }
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getBaseURL();

// ==================== INTERFACES ====================
interface Restaurant {
  id: number;
  name: string;
  description: string;
  address: string;
  cover_url: string;
  is_open: boolean;
  rating: number;
}

// ==================== COMPONENT ====================
const RestaurantListScreen = ({ navigation }) => {
  // STATE
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ==================== API FUNCTIONS ====================
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('@foodgo_token');
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        params: { limit: 50 },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setRestaurants(response.data.restaurants);
      console.log('Restaurants loaded:', response.data.restaurants.length);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError(err.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchRestaurants = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      fetchRestaurants();
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('@foodgo_token');
      const response = await axios.get(`${API_BASE_URL}/restaurants`, {
        params: { search: query },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      setRestaurants(response.data.restaurants);
    } catch (err: any) {
      console.error('Error searching:', err);
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // ==================== EVENT HANDLERS ====================
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery('');
    fetchRestaurants();
  }, []);

  const handleRestaurantPress = (restaurantId: number) => {
    navigation.navigate('RestaurantDetail', { restaurantId });
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRestaurants();
    });
    return unsubscribe;
  }, [navigation]);

  // ==================== RENDER HELPERS ====================
  const renderItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleRestaurantPress(item.id)}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.row}>
        <Icon name="map-marker" size={16} color="#666" />
        <Text style={styles.address}>{item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="store-off" size={80} color="#ccc" />
      <Text style={styles.emptyText}>No restaurants found</Text>
    </View>
  );

  // ==================== MAIN RENDER ====================
  if (loading && restaurants.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <Searchbar
        placeholder="Search restaurants..."
        onChangeText={searchRestaurants}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Restaurant List */}
      <FlatList
        data={restaurants}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF6B6B']}
          />
        }
      />
    </View>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  address: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});

export default RestaurantListScreen;
```

---

## 🎯 So sánh với Service Pattern

### Service Pattern (Trước đây)
```
Screen
  ↓
Service (restaurantService.ts)
  ↓
Axios
  ↓
API
```

**Ưu điểm:**
- Tái sử dụng code
- Dễ test
- Tách biệt concerns

**Nhược điểm:**
- Phức tạp hơn
- Nhiều file hơn
- Khó theo dõi flow

### Self-Contained Pattern (Hiện tại)
```
Screen (tất cả trong 1 file)
  ↓
Axios
  ↓
API
```

**Ưu điểm:**
- ✅ Đơn giản, dễ hiểu
- ✅ Tất cả logic ở 1 chỗ
- ✅ Dễ giải thích cho người mới
- ✅ Dễ debug

**Nhược điểm:**
- Code bị duplicate
- File dài hơn
- Khó test riêng lẻ

---

## 📚 Best Practices

### 1. **Tổ chức Code**
- Nhóm imports theo thứ tự: React → React Native → Libraries → Local
- Dùng comment sections để tách các phần
- Config luôn đặt đầu file

### 2. **Error Handling**
```typescript
try {
  const response = await axios.get(url);
  setData(response.data);
} catch (err: any) {
  console.error('Error:', err);
  setError(err.response?.data?.message || 'Default error message');
}
```

### 3. **Loading States**
```typescript
// Show loading on first load
if (loading && data.length === 0) {
  return <ActivityIndicator />;
}

// Show pull-to-refresh while data exists
<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
```

### 4. **Authentication**
```typescript
const token = await AsyncStorage.getItem('@foodgo_token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
```

### 5. **Navigation Listener**
```typescript
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    fetchData(); // Reload when screen is focused
  });
  return unsubscribe; // Cleanup
}, [navigation]);
```

---

## 🔧 Common Patterns

### GET Request
```typescript
const fetchData = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('@foodgo_token');
    const response = await axios.get(`${API_BASE_URL}/endpoint`, {
      params: { limit: 20 },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    setData(response.data);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Failed to load');
  } finally {
    setLoading(false);
  }
};
```

### POST Request
```typescript
const createItem = async (data: any) => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem('@foodgo_token');
    const response = await axios.post(`${API_BASE_URL}/endpoint`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Created:', response.data);
    navigation.goBack();
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Failed to create');
  } finally {
    setLoading(false);
  }
};
```

### DELETE Request
```typescript
const deleteItem = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem('@foodgo_token');
    await axios.delete(`${API_BASE_URL}/endpoint/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setData(prev => prev.filter(item => item.id !== id));
  } catch (err: any) {
    Alert.alert('Error', err.response?.data?.message || 'Failed to delete');
  }
};
```

---

## 🎓 Học tập từ Pattern này

### Bước 1: Hiểu luồng dữ liệu
```
User Action → Event Handler → API Call → Update State → Re-render UI
```

### Bước 2: Debug hiệu quả
- Thêm `console.log()` trong mỗi function
- Check state changes trong React DevTools
- Xem Network tab để debug API

### Bước 3: Mở rộng
- Thêm pagination
- Thêm filtering
- Thêm sorting
- Thêm infinite scroll

---

## 📝 Checklist cho Screen mới

- [ ] Import axios và AsyncStorage
- [ ] Setup API_BASE_URL
- [ ] Define interfaces
- [ ] Create state variables
- [ ] Implement fetch function
- [ ] Implement event handlers
- [ ] Setup useEffect with navigation listener
- [ ] Create render methods
- [ ] Handle loading state
- [ ] Handle error state
- [ ] Handle empty state
- [ ] Add pull-to-refresh
- [ ] Style components
- [ ] Test with real API

---

## 🚀 Kết luận

Pattern **Self-Contained Screen** phù hợp cho:
- ✅ Học tập và giảng dạy
- ✅ Prototyping nhanh
- ✅ Small to medium apps
- ✅ Team nhỏ

Khi project lớn hơn, có thể refactor sang Service Pattern để:
- Tái sử dụng code
- Dễ maintain
- Dễ test
- Tách biệt concerns

**FoodGo hiện tại sử dụng Self-Contained Pattern để đơn giản hóa việc học tập!**
