/*
 * @format
 * @flow strict-local
 */

// 57.77839, 14.26678
// 57.78839, 14.26678
// skiljer 593m på 0.01 longitud => 59300m/longitud => 1m = 0.0000168634 longitud
// skiljer 1110m på 0.01 latitud => 111000m/latitud => 1m = 0.000009009 latitud

import * as React from 'react';
import type { Node } from 'react';
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
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

// Sensors
import {
  accelerometer,
  magnetometer,
  setUpdateIntervalForType,
  SensorTypes,
} from 'react-native-sensors';

setUpdateIntervalForType(SensorTypes.accelerometer, 100);
setUpdateIntervalForType(SensorTypes.magnetometer, 100);
setUpdateIntervalForType(SensorTypes.gyroscope, 100);

//Storage
import * as RNFS from 'react-native-fs'
var logDate = new Date()
var pathDate = logDate.toISOString()
var path = RNFS.DownloadDirectoryPath + '/INS_Log_' + pathDate + '.txt';

// App
const App: () => Node = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'INS App' }}
        />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Navigation screens
//Home Screen
const HomeScreen = ({ navigation }) => {
  return (
    <Button title="Go to Map" onPress={() => navigation.navigate('Map')} />
  );
};

// Map Screen
const MapScreen = () => {

  // Toggle for start/stop
  const [centerOnUser, setCenterOnUser] = React.useState(false);

  //INS Sensor data
  //Accelerometer
  const [accX, setAccX] = React.useState(0);
  const [accY, setAccY] = React.useState(0);
  const [accZ, setAccZ] = React.useState(0);

  //Magnetometer
  const [magX, setMagX] = React.useState(0);
  const [magY, setMagY] = React.useState(0);
  const [magZ, setMagZ] = React.useState(0);

  //Gyroscope
  const [gyrX, setGyrX] = React.useState(0);
  const [gyrY, setGyrY] = React.useState(0);
  const [gyrZ, setGyrZ] = React.useState(0);

  //Reducer interval
  const [interval, SetInterval] = React.useState(0);

  // Init coords
  React.useEffect(() => {
    // Subscribe to accelerometer data and measure speed
    const accelSub = accelerometer.subscribe(({ x, y, z }) => {
      setAccX(parseFloat(x));
      setAccY(parseFloat(y));
      setAccZ(parseFloat(z));
    });

    //Subscribe to magnetometer data and measure angle
    const magSub = magnetometer.subscribe(({ x, y, z }) => {
      setMagX(parseFloat(x));
      setMagY(parseFloat(y));
      setMagZ(parseFloat(z));
    });

    const gyrSub = magnetometer.subscribe(({ x, y, z }) => {
      setGyrX(parseFloat(x));
      setGyrY(parseFloat(y));
      setGyrZ(parseFloat(z));
    });

    //Handle leaving screen
    return () => {
      accelSub.unsubscribe();
      magSub.unsubscribe();
      gyrSub.unsubscribe();
    };
  }, []);
  // state.counter === 10 ? 0 :
  //Reducer Hook
  function reducer(state) {
    return {
      counter: parseInt(state.counter < 10 ? state.counter + 1 : 0),
      data: [{
        accelx: accX, accely: accY, accelz: accZ,
        gyrox: gyrX, gyroy: gyrY, gyroz: gyrZ,
        magnetx: magX, magnety: magY, magnetz: magZ,
      }, ...state.data],
    };
  }

  const [state, dispatch] = React.useReducer(reducer, {
    counter: 0,
    data: [{
      accelx: accX, accely: accY, accelz: accZ,
      gyrox: gyrX, gyroy: gyrY, gyroz: gyrZ,
      magnetx: magX, magnety: magY, magnetz: magZ,
    }],
  });
  // Returns View
  return (
    <View>
      <ScrollView scrolling={true}>
        <View>
          <Button
            title="Start measurement"
            onPress={() => {
              if (!centerOnUser) {
                setCenterOnUser(true);

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
                SetInterval(clearInterval(interval));

                RNFS.write(path, JSON.stringify(state.data))
                  .then((success) => {
                    console.log('FILE WRITTEN AT' + path);
                  })
                  .catch((err) => {
                    console.log(err.message);
                  })
              }
            }}
          />
        </View>
        <View>
          <Text>Accelerometer: X: {accX.toFixed(2)}, Y: {accY.toFixed(2)}, Z: {accZ.toFixed(2)}</Text>
          <Text>Magnetometer: X: {magX.toFixed(2)}, Y: {magY.toFixed(2)}, Z: {magZ.toFixed(2)}</Text>
          <Text>Gyroscope: X. {gyrX.toFixed(2)}, Y: {gyrY.toFixed(2)}, Z: {gyrZ.toFixed(2)}</Text>
          <Text>Counter: {state.counter}</Text>
          <Text>No of elements: {state.data.length} </Text>
          <View>
            <FlatList
              data={state}
              renderItem={({ item }) => (
                <Text>
                  {JSON.stringify(item.data)}
                </Text>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
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




// latitude:
//         state.latitude === -1
//           ? startLat
//           : state.counter === 10
//             ? parseFloat(
//               state.latitude +
//               state.speed * Math.sin(state.angle) * 0.000009009,
//             )
//             : state.latitude,
//       longitude:
//         state.longitude === -1
//           ? startLong
//           : state.counter === 10
//             ? parseFloat(
//               state.longitude -
//               state.speed * Math.cos(state.angle) * 0.0000168634,
//             )
//             : state.longitude,
//       coordinates:
//         state.counter === 10
//           ? state.coordinates[0].lat === -1
//             ? [{ lat: startLat, long: startLong }]
//             : [
//               { lat: state.latitude, long: state.longitude },
//               ...state.coordinates,
//             ]
//           : state.coordinates,