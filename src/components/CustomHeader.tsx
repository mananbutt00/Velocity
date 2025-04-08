// CustomHeader.js
import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomHeader = ({title, onPress, iconName, iconSize, iconColor}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

        flex: 0.1,
      }}>
      <View />
      <Text
        style={{
          color: 'white',
          fontSize: 25,
          fontWeight: 'bold',
        }}>
        {title}
      </Text>
      <TouchableOpacity onPress={onPress}>
        <Icon name={iconName} size={iconSize} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default CustomHeader;
