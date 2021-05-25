/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

// 57.77839, 14.26678
// 57.78839, 14.26678
// skiljer 593m på 0.01 longitud => 59300m/longitud
// skiljer 1110m på 0.01 latitud => 111000m/latitud


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
    NativeEventEmitter,
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
import { tsConstructorType, whileStatement } from '@babel/types';


// Map
import MapView, { AnimatedRegion, Animated } from 'react-native-maps';
import { moveSyntheticComments } from 'typescript';


// Sensors
import {
    accelerometer,
    gyroscope,
    magnetometer,
    setUpdateIntervalForType,
    SensorTypes
} from 'react-native-sensors';

setUpdateIntervalForType(SensorTypes.accelerometer, 100);
setUpdateIntervalForType(SensorTypes.gyroscope, 100);


// App
const App: () => Node = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'Welcome' }}
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
        <Button
            title="Go to Map"
            onPress={() => navigation.navigate('Map')}
        />
    );
};

// Map Screen
const MapScreen = () => {
    // Coordinates
    const [latitude, setLatitude] = React.useState(0);
    const [longitude, setLongitude] = React.useState(0);

    // Toggle for map update
    const [count, setCount] = React.useState(true);

    //Center map on user
    const [centerOnUser, setCenterOnUser] = React.useState(false);

    // Measured coordinates
    const [startLat, setStartLat] = React.useState(-1);
    const [startLong, setStartLong] = React.useState(-1);
    const [endLat, setEndLat] = React.useState(-1);
    const [endLong, setEndLong] = React.useState(-1);

    //INS speed and distance
    const [speed, setSpeed] = React.useState(0);
    const [distance, setDistance] = React.useState(0);

    //INS rotation and angle
    const [rotation, setRotation] = React.useState(0);
    const [angle, setAngle] = React.useState(0);


    // Init coords
    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setEndLat(position.coords.latitude);
                setEndLong(position.coords.longitude);
            },
            (error) => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // Update coords on map on user movement
    React.useEffect(() => {
        // Subscribe to accelerometer data and measure speed and distance
        const accelSub = accelerometer.subscribe(({ x, y, z }) => {
            console.log(x.toFixed(2), y.toFixed(2), z.toFixed(2));
            setSpeed(parseFloat((speed * 0.85 + (x + y + z - 9.82) * 0.15).toFixed(2)));
            setDistance(parseFloat((distance + speed).toFixed(2)));
        });

        //Subscribe to gyroscope data and measure angle and rotation
        const gyroSub = gyroscope.subscribe(({ x, y, z }) => {
            setRotation(parseFloat(rotation*0.85 + z*0.15).toFixed(2));
            console.log(rotation);
            setAngle(parseFloat(angle + rotation).toFixed(2));
            console.log(parseFloat(angle + rotation));
        });
        return () => {
            accelSub.unsubscribe();
            gyroSub.unsubscribe();
        }
    }, [count]);

    var myRegion = { latitude: latitude, longitude: longitude, latitudeDelta: 0.5, longitudeDelta: 0.3 };

    // Returns View
    return (
        <View>
            <View>
                <Button title="Start measurement" onPress={() => {
                    setCenterOnUser(true);
                    setStartLat(latitude);
                    setStartLong(longitude);
                }} />
                <Button title="Stop measurement" onPress={() => {
                    setCenterOnUser(false);
                    setEndLat(latitude);
                    setEndLong(longitude);
                }} />
                <MapView
                    region={myRegion}
                    style={{ top: 0, left: 0, height: 450 }}
                    showsUserLocation={true}
                    userLocationUpdateInterval={100}
                    onUserLocationChange={() => {
                        if (centerOnUser) {
                            setLatitude(latitude);
                            setLongitude(longitude);
                            setCount(!count);
                            console.log('mapRender');
                        }
                    }}
                />
            </View >
            <View>
                <Text>
                    Starting Coordinates:
                </Text>
                <Text>
                    Latitude: {startLat}       Longitude: {startLong}
                </Text>
                <Text>
                    Ending Coordinates:
                </Text>
                <Text>
                    Latitude: {endLat}        Longitude: {endLong}
                </Text>
                <Text>Distance: {distance}</Text>
                <Text>Speed: {speed}</Text>
                <Text>Rotation: {rotation}</Text>
                <Text>Angle: {angle}</Text>
                <Text>{centerOnUser ? 'measuring' : 'waiting'}</Text>
            </View >
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
