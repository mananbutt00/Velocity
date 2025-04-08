import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import * as Animatable from 'react-native-animatable';
const SplashScreen = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate('HomeScreen');
    }, 3000);
  }, []);
  return (
    <View style={{flex: 1, justifyContent: 'center', backgroundColor: 'black'}}>
      <Animatable.Text
        style={{
          fontSize: 30,
          fontWeight: 'bold',
          color: 'white',
          textAlign: 'center',
        }}
        animation="flipInX"
        duration={3000}>
        Velocity
      </Animatable.Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
