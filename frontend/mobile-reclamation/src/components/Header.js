import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Header = ({ title, showBack, onBack, rightIcon, onRightPress }) => {
  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.rightContainer}>
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress}>
            <Icon name={rightIcon} size={24} color="#333" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftContainer: {
    width: 40,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  backButton: {
    padding: 4,
  },
});

export default Header;