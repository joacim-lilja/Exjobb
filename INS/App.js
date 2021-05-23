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
    setUpdateIntervalForType,
    SensorTypes,
    magnetometer
} from 'react-native-sensors';

import { map, filter } from 'rxjs/operators';

setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
setUpdateIntervalForType(SensorTypes.gyroscope, 1000);
setUpdateIntervalForType(SensorTypes.magnetometer, 1000);

// const subscriptiondeprecated = accelerometer
//     .pipe(map(({ x, y, z }) => x + y + z), filter(speed => speed > 20))
//     .subscribe(
//         speed => console.log(`You moved your phone with ${speed}`),
//         error => {
//             console.log("The sensor is not available");
//         }
//     );

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

const MapScreen = ({ navigation, route }) => {
    const [latitude, setLatitude] = React.useState(0);
    const [longitude, setLongitude] = React.useState(0);

    const [count, setCount] = React.useState(true);

    const [centerOnUser, setCenterOnUser] = React.useState(false);

    const [startLat, setStartLat] = React.useState(-1);
    const [startLong, setStartLong] = React.useState(-1);
    const [endLat, setEndLat] = React.useState(-1);
    const [endLong, setEndLong] = React.useState(-1);

    const [distance, setDistance] = React.useState(0);

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
        const accelSub = accelerometer.subscribe(({ x, y, z }) => {
            console.log('accelerometer');
            console.log("========XYZ=========");
            console.log(x, y, z);
            console.log("========XYZ=========");
            console.log("====================");
            console.log("====================");
            setDistance(parseFloat(distance + x + y + z));
            console.log("======distance======");
            console.log(distance);
            console.log("======distance======");
        });

        // const gyroSub = gyroscope.subscribe(({ x, y, z, timestamp }) => {
        //     setTimeout(() => {
        //         console.log('gyroscope');
        //         console.log({ x, y, z });
        //     }, 1000);
        // });
        /*
        Accelerometer summa = distans.
        Gyrometer "snurr" = vinkel.

        */

        // const magneSub = magnetometer.subscribe(({ x, y, z, timestamp }) => {
        //     setTimeout(() => {
        //         console.log('magnet');
        //         console.log({ x, y, z });
        //     }, 1000);
        // });
    }, [count]);

    var myRegion = { latitude: latitude, longitude: longitude, latitudeDelta: 0.5, longitudeDelta: 0.3 };
    
    React.useEffect(() => {
        return () => {
    setTimeout(() => {
        accelSub.unsubscribe();
        gyroSub.unsubscribe();
    }, 1000);
        }
    }, [])

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
                    userLocationUpdateInterval={1000}
                    onUserLocationChange={() => {
                        if (centerOnUser) {
                            setLatitude(latitude);
                            setLongitude(longitude);
                            setCount(!count);
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
