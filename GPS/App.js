/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import type { Node } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  PermissionsAndroid,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

// Navigation

import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

//Geolocation

import Geolocation, { getCurrentPosition } from 'react-native-geolocation-service';
import { tsConstructorType } from '@babel/types';

// Map

import MapView, { AnimatedRegion, Animated } from 'react-native-maps';

// App

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: Colors.darker,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Navigation screens
//Home Screen

const HomeScreen = ({ navigation }) => {
  return (
    <Button
      title="Go to Joacims profile"
      onPress={() => navigation.navigate('Profile', { name: 'Joacim' })}
    />
  );
};

// Map Screen

const ProfileScreen = ({ navigation, route }) => {
  // var hasLocationPermission = true;
  const [latitude, setLatitude] = React.useState(0);
  const [longitude, setLongitude] = React.useState(1);

  Geolocation.getCurrentPosition(
    (position) => {
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
    },
    (error) => {
      console.log(error);
    },
    { enableHighAccuracy: true }
  );

  console.log((latitude + " " + longitude));
  var region = {
    latitude: latitude,
    longitude: longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };
  
  return (
    <View>
      <Text>This is {route.params.name}'s profile</Text>
      <MapView style={{top: 0, left: 0, height: 450}}
        initialRegion={region}
      />
    </View>
  )
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

});

export default App;
