import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Text, Title, HelperText } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
  });

  /**
   * Update form field
   */
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      phone: '',
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Full name validation
    if (!formData.full_name) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 2 || formData.full_name.length > 100) {
      newErrors.full_name = 'Full name must be between 2-100 characters';
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10-11 digits';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  /**
   * Handle register
   */
  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    try {
      await register({
        email: formData.email.toLowerCase(),
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone || undefined,
      });
      // Navigation handled by App.tsx based on auth state
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account');
    }
  };

  /**
   * Navigate to login
   */
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Title style={styles.title}>Create Account 🎉</Title>
            <Text style={styles.subtitle}>Join FoodGo today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name Input */}
            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(value) => updateField('full_name', value)}
              mode="outlined"
              autoCapitalize="words"
              autoComplete="name"
              error={!!errors.full_name}
              disabled={isLoading}
              left={<TextInput.Icon icon="account" />}
              style={styles.input}
            />
            {errors.full_name ? (
              <HelperText type="error" visible={!!errors.full_name}>
                {errors.full_name}
              </HelperText>
            ) : null}

            {/* Email Input */}
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              disabled={isLoading}
              left={<TextInput.Icon icon="email" />}
              style={styles.input}
            />
            {errors.email ? (
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            ) : null}

            {/* Phone Input */}
            <TextInput
              label="Phone (Optional)"
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              mode="outlined"
              keyboardType="phone-pad"
              autoComplete="tel"
              error={!!errors.phone}
              disabled={isLoading}
              left={<TextInput.Icon icon="phone" />}
              style={styles.input}
              placeholder="0901234567"
            />
            {errors.phone ? (
              <HelperText type="error" visible={!!errors.phone}>
                {errors.phone}
              </HelperText>
            ) : null}

            {/* Password Input */}
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              error={!!errors.password}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
            />
            {errors.password ? (
              <HelperText type="error" visible={!!errors.password}>
                {errors.password}
              </HelperText>
            ) : null}

            {/* Confirm Password Input */}
            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              mode="outlined"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              error={!!errors.confirmPassword}
              disabled={isLoading}
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              style={styles.input}
            />
            {errors.confirmPassword ? (
              <HelperText type="error" visible={!!errors.confirmPassword}>
                {errors.confirmPassword}
              </HelperText>
            ) : null}

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}>
              Create Account
            </Button>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Button
                mode="text"
                onPress={navigateToLogin}
                disabled={isLoading}
                compact>
                Login
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 48,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 24,
    paddingVertical: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
});

export default RegisterScreen;
