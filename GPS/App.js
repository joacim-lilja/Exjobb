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

//Storage
import * as RNFS from 'react-native-fs'
var logDate = new Date(1);
var pathDate = logDate.toISOString();
var path = RNFS.DownloadDirectoryPath + '/GPS_Log_' + pathDate + '.txt';

// App
const App: () => Node = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'GPS App' }}
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
    const [latitude, setLatitude] = React.useState(-1);
    const [longitude, setLongitude] = React.useState(-1);
    const [interval, SetInterval] = React.useState(0);

    function reducer(state) {
        Geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
            },
            (error) => {
                console.log(error);
            },
            { enableHighAccuracy: true },
            {interval: 100},
            {fastestInterval: 100},
            {distanceFilter: 0.1}
        );


        return {
            counter: parseInt(state.counter < 10 ? state.counter + 1 : 0),
            data: [{
                latitude: latitude,
                longitude: longitude,
            }, ...state.data]
        }
    }
    // state.latitude === -1 ? startLat : latitude
    // state.longitude === -1 ? startLong : longitude
    const [state, dispatch] = React.useReducer(reducer, {
        counter: 0,
        data: [{
            latitude: -1,
            longitude: -1
        }],
    });

    // Returns View
    return (
        <ScrollView>
            <View>
                <Button title="Start measurement" onPress={() => {
                    if (!centerOnUser) {
                        setCenterOnUser(true);

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

                        RNFS.write(path, JSON.stringify(state.data))
                            .then((success) => {
                                console.log('FILE WRITTEN AT' + path);
                            })
                            .catch((err) => {
                                console.log(err.message);
                            })
                    }
                }} />
            </View >
            <View>
                <Text>Coordinates:</Text>
                <Text>Latitude: {latitude.toFixed(5)} Longitude: {longitude.toFixed(5)}</Text>
                <Text>Counter: {state.counter}</Text>
                <Text>No of elements: {state.data.length} </Text>
                {/* <View>
                    <FlatList
                        data={state.data}
                        renderItem={({ item }) => (
                            <Text>
                                {item}
                            </Text>
                        )}
                    />
                </View> */}
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
