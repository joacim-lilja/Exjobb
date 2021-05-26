/*
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
    StyleSheet,
    Text,
    View,
    Button,
} from 'react-native';



// Navigation
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();


//Geolocation
import Geolocation from 'react-native-geolocation-service';


// Map
import MapView, { } from 'react-native-maps';


// Sensors
import {
    accelerometer,
    gyroscope,
    setUpdateIntervalForType,
    SensorTypes
} from 'react-native-sensors';

setUpdateIntervalForType(SensorTypes.accelerometer, 200);
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

    //INS Speed and Distance
    const [speed, setSpeed] = React.useState(0);
    const [distance, setDistance] = React.useState(0);

    //INS Rotation and Direction
    const [rotation, setRotation] = React.useState(0);
    const [direction, setDirection] = React.useState(0);


    // Init coords
    React.useEffect(() => {
        // Get initial Coordinates from GPS
        Geolocation.getCurrentPosition(
            (position) => {
                setStartLat(position.coords.latitude);
                setStartLong(position.coords.longitude);
            },
            (error) => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );

        // Subscribe to accelerometer data and measure speed and distance
        const accelSub = accelerometer.subscribe(({ x, y, z }) => {
            setSpeed(parseFloat((speed * 0.9 + (x + y + z - 9.82) * 0.1).toFixed(2)));
        });

        //Subscribe to gyroscope data and measure direction and rotation
        const gyroSub = gyroscope.subscribe(({ z }) => {
            setRotation(parseFloat((rotation * 0.9 + z * 0.1).toFixed(2)));
        });
        return () => {
            accelSub.unsubscribe();
            gyroSub.unsubscribe();
        }
    }, []);

    // Update coords on map on user movement
    React.useEffect(() => {
        //Measures Acceleration from Accelerometer to measure Distance
        setDistance(
            parseFloat(
                (distance + Math.abs(speed)).toFixed(2)
            )
        );
        //Measures Rotation from Gyroscope to measaure Direction
        setDirection(
            parseFloat(
                (direction + rotation).toFixed(2)
            )
        );
    }, [count]);

    var myRegion = {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2
    };

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
                    setEndLat(-1);
                    setEndLong(-1);
                }} />
                <MapView
                    region={myRegion}
                    style={{ top: 0, left: 0, height: 450 }}
                    showsUserLocation={true}
                    userLocationUpdateInterval={1000}
                    onUserLocationChange={() => {
                        if (centerOnUser) {
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
                <Text>Speed: {speed}</Text>
                <Text>Rotation: {rotation}</Text>
                <Text>Direction: {direction}</Text>
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
