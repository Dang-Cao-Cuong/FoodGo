import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AddToCartModalProps {
  visible: boolean;
  menuItemName: string;
  price: number;
  onClose: () => void;
  onAddToCart: (quantity: number, notes: string) => void;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({
  visible,
  menuItemName,
  price,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(quantity, notes);
    // Reset state
    setQuantity(1);
    setNotes('');
  };

  const handleClose = () => {
    // Reset state
    setQuantity(1);
    setNotes('');
    onClose();
  };

  const total = price * quantity;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.container}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{menuItemName}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Quantity Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  onPress={handleDecrease}
                  style={[
                    styles.quantityButton,
                    quantity === 1 && styles.quantityButtonDisabled,
                  ]}
                  disabled={quantity === 1}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="minus"
                    size={24}
                    color={quantity === 1 ? '#ccc' : '#333'}
                  />
                </TouchableOpacity>

                <Text style={styles.quantity}>{quantity}</Text>

                <TouchableOpacity
                  onPress={handleIncrease}
                  style={styles.quantityButton}
                  activeOpacity={0.7}
                >
                  <Icon name="plus" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Special Instructions</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any special requests (optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>{notes.length}/200</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>
            <Button
              mode="contained"
              onPress={handleAddToCart}
              style={styles.addButton}
              buttonColor="#FF6B6B"
              contentStyle={styles.addButtonContent}
              labelStyle={styles.addButtonLabel}
            >
              Add to Cart
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 32,
    minWidth: 40,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  addButton: {
    borderRadius: 12,
    elevation: 0,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
  addButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddToCartModal;
