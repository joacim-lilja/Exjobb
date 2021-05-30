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
    ScrollView,
    StyleSheet,
    Text,
    View,
    Button,
    FlatList,
} from 'react-native';

// Navigation
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

//Geolocation
import Geolocation from 'react-native-geolocation-service';

// Map
import MapView from 'react-native-maps';

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

const MapScreen = ({ navigation, route }) => {
    // var hasLocationPermission = true;
    const [centerOnUser, setCenterOnUser] = React.useState(false);
    const [startLat, setStartLat] = React.useState(-1);
    const [startLong, setStartLong] = React.useState(-1);
    const [latitude, setLatitude] = React.useState(-1);
    const [longitude, setLongitude] = React.useState(-1);
    const [interval, SetInterval] = React.useState(0);

    function reducer(state) {
        return {
            counter: parseInt(state.counter < 10 ? state.counter + 1 : 0),
            latitude: state.latitude === -1 ? startLat : latitude,
            longitude: state.longitude === -1 ? startLong : longitude,
            coordinates:
                state.counter === 10
                    ? state.coordinates[0].lat === -1
                        ? [{ lat: startLat, long: startLong }]
                        : [
                            { lat: state.latitude, long: state.longitude },
                            ...state.coordinates,
                        ]
                    : state.coordinates,

        }
    }

    const [state, dispatch] = React.useReducer(reducer, {
        counter: 0,
        latitude: startLat,
        longitude: startLong,
        coordinates: [{ lat: startLat, long: startLong }],
    });

    // Update coords on map on user movement
    React.useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                if (startLat === -1) {
                    setStartLat(position.coords.latitude);
                    setStartLong(position.coords.longitude);
                }
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                console.log(error);
            },
            { enableHighAccuracy: true }
        );
    }, [state.counter]);

    var myRegion = { latitude: latitude, longitude: longitude, latitudeDelta: 0.007, longitudeDelta: 0.007 };
    console.log(myRegion);
    // Returns View
    return (
        <ScrollView>
            <View>
                <Button title="Start measurement" onPress={() => {
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
                }} />
                <Button title="Stop measurement" onPress={() => {
                    if (centerOnUser) {
                        setCenterOnUser(false);
                        SetInterval(clearInterval(interval));
                    }
                }} />
                <MapView
                    region={myRegion}
                    style={{ top: 0, left: 0, height: 450 }}
                    showsUserLocation={true}
                    userLocationUpdateInterval={1000}
                />
            </View >
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
                <Text>Counter: {state.counter}</Text>
                <Text>{centerOnUser ? 'measuring' : 'waiting'}</Text>
                <Text>No of elements: {state.coordinates.length} </Text>
                <View>
                    <FlatList
                        data={state.coordinates}
                        renderItem={({ item }) => (
                            <Text>
                                {item.lat.toFixed(5)} {item.long.toFixed(5)}
                            </Text>
                        )}
                    />
                </View>
            </View >
        </ScrollView>
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
