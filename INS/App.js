/*
 * @format
 * @flow strict-local
 */

// 57.77839, 14.26678
// 57.78839, 14.26678
// skiljer 593m på 0.01 longitud => 59300m/longitud => 1m = 0.0000168634 longitud
// skiljer 1110m på 0.01 latitud => 111000m/latitud => 1m = 0.000009009 latitud

import * as React from 'react';
import type {Node} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  FlatList,
  ScrollView,
} from 'react-native';

// Navigation
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

const Stack = createStackNavigator();

//Geolocation
import Geolocation from 'react-native-geolocation-service';

// Map
import MapView from 'react-native-maps';

// Sensors
import {
  accelerometer,
  gyroscope,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

setUpdateIntervalForType(SensorTypes.accelerometer, 100);
setUpdateIntervalForType(SensorTypes.magnetometer, 100);

// App
const App: () => Node = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Navigation screens
//Home Screen
const HomeScreen = ({navigation}) => {
  return (
    <Button title="Go to Map" onPress={() => navigation.navigate('Map')} />
  );
};

// Map Screen
const MapScreen = () => {
  // Coordinates

  // Toggle for INS Measurements update
  const [count] = React.useState(true);

  //Center map on user
  const [centerOnUser, setCenterOnUser] = React.useState(false);

  // Measured coordinates
  const [startLat, setStartLat] = React.useState(-1);
  const [startLong, setStartLong] = React.useState(-1);
  const [endLat, setEndLat] = React.useState(-1);
  const [endLong, setEndLong] = React.useState(-1);

  //INS Speed and Angle
  const [speed, setSpeed] = React.useState(0);

  //INS Rotation and Direction
  const [rotation, setRotation] = React.useState(0);

  //Reducer interval
  const [interval, SetInterval] = React.useState(0);

  // Init coords
  React.useEffect(() => {
    // Get initial Coordinates from GPS
    Geolocation.getCurrentPosition(
      position => {
        setStartLat(position.coords.latitude);
        setStartLong(position.coords.longitude);
      },
      error => {
        console.log(error);
      },
      {enableHighAccuracy: true},
    );

    // Subscribe to accelerometer data and measure speed and distance
    const accelSub = accelerometer.subscribe(({x, y}) => {
      setSpeed(parseFloat((speed * 0.05 + (x + y) * 0.95) / 10));
    });


    //Subscribe to gyroscope data and measure direction and rotation
    const gyroSub = gyroscope.subscribe(({z}) => {
        setRotation(
          parseFloat(
            ((rotation * 0.05 + z * 0.95 * (180 / Math.PI)) / 10).toFixed(2)
          )
        );
      });

    //Handle leaving screen
    return () => {
      accelSub.unsubscribe();
      gyroSub.unsubscribe();
    };
  }, []);

  //Reducer Hook
  function reducer(state) {
    switch (state.counter) {
      case 10:
        return {
          latitude: parseFloat(
            state.latitude +
              state.distance * Math.sin(state.direction) * 0.000009009,
          ),
          longitude: parseFloat(
            state.longitude -
              state.distance * Math.cos(state.direction) * 0.0000168634,
          ),
          distance: 0,
          coordinates:
            state.coordinates[0].lat === -1
              ? [{lat: startLat, long: startLong}]
              : [
                  {lat: state.latitude, long: state.longitude},
                  ...state.coordinates,
                ],
        };
      default:
        return {
          count: !state.count,
          distance: parseFloat(state.distance + speed),
          direction: parseFloat((state.direction + rotation).toFixed(2)),
          counter: parseInt(state.counter < 10 ? state.counter + 1 : 0),
          latitude: state.latitude === -1 ? startLat : state.latitude,
          longitude: state.longitude === -1 ? startLong : state.longitude,
          coordinates: state.coordinates,
        };
    }
  }
  const [state, dispatch] = React.useReducer(reducer, {
    count: false,
    distance: 0,
    direction: 90,
    counter: 0,
    latitude: startLat,
    longitude: startLong,
    coordinates: [{lat: startLat, long: startLong}],
  });
  var myRegion = {
    latitude: state.latitude === -1 ? startLat : state.latitude,
    longitude: state.longitude === -1 ? startLong : state.longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };
  // Returns View
  return (
    <ScrollView scrolling={true}>
      <View>
        <Button
          title="Start measurement"
          onPress={() => {
            if (!centerOnUser) {
              setCenterOnUser(true);
              setStartLat(startLat);
              setStartLong(startLong);
              SetInterval(
                setInterval(() => {
                  dispatch();
                }, 100),
              );
            }
          }}
        />
        <Button
          title="Stop measurement"
          onPress={() => {
            if (centerOnUser) {
              setCenterOnUser(false);
              setEndLat(-1);
              setEndLong(-1);
              SetInterval(clearInterval(interval));
            }
          }}
        />
      </View>
      <View>
        <MapView
          region={myRegion}
          style={{top: 0, left: 0, height: 450}}
          showsUserLocation={true}
          userLocationUpdateInterval={1000}
        />
      </View>
      <View>
        <Text>Starting Coordinates:</Text>
        <Text>
          Latitude: {startLat.toFixed(5)} Longitude: {startLong.toFixed(5)}
        </Text>
        <Text>Ending Coordinates:</Text>
        <Text>
          Latitude: {state.latitude.toFixed(5)} Longitude:{' '}
          {state.longitude.toFixed(5)}
        </Text>
        <Text>Distance: {state.distance.toFixed(2)}</Text>
        <Text>Speed: {speed.toFixed(2)}</Text>
        <Text>Bearing: {state.direction}</Text>
        <Text>Counter: {state.counter}</Text>
        <Text>{centerOnUser ? 'measuring' : 'waiting'}</Text>
        <Text>No of elements: {state.coordinates.length} </Text>
        <View>
          <FlatList
            data={state.coordinates}
            renderItem={({item}) => <Text>{item.lat.toFixed(5)} {item.long.toFixed(5)}</Text>}
          />
        </View>
      </View>
    </ScrollView>
  );
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
