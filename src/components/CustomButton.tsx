import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
const CustomButton = ({
  onPress,
  title,
  bgColor,
  height,
  width,
  color,
  fontSize,
  borderBottomWidth,
  borderColor,
  style,
  textStyle,
}) => {
  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.button,
          {backgroundColor: bgColor},
          height && {height},
          width && {width},
          style,
        ]}>
        <Text
          style={[
            styles.buttonText,
            {
              color: color,
              fontSize: fontSize,
              borderBottomWidth: borderBottomWidth,
              borderColor: borderColor,
            },
            textStyle,
          ]}>
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 40,
    width: 150,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CustomButton;
