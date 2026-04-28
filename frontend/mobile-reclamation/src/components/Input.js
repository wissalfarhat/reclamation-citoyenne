import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  icon,
  error,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <Icon name={icon} size={20} color="#666" style={styles.icon} />}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
});

export default Input;