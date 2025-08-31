import React, {useEffect, useState} from 'react';
import {ScrollView, Text, StyleSheet, Platform, View, TouchableOpacity, Image, ActivityIndicator} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {accelerometer, gyroscope, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const AccidentPanel = ({onClosePress}) => {
    const [location, setLocation] = useState({latitude: 0, longitude: 0, speed: 0});
    const [accel, setAccel] = useState({x: 0, y: 0, z: 0});
    const [gyro, setGyro] = useState({x: 0, y: 0, z: 0});
    const [lastUpdate, setLastUpdate] = useState(null);

    const [isLoading, setIsLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const requestPermissions = async () => {
        let result;
        if (Platform.OS === 'ios') {
            result = await request(PERMISSIONS.IOS.LOCATION_ALWAYS);
            await request(PERMISSIONS.IOS.MOTION);
        } else {
            result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            await request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION);
            await request(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
            await request(PERMISSIONS.ANDROID.BODY_SENSORS);
        }
        return result;
    };

    useEffect(() => {
        (async () => {
            console.log("🔄 Iniciando useEffect");
            setIsLoading(true);
            const permission = await requestPermissions();
            console.log("📌 Resultado permisos:", permission);

            if (permission !== RESULTS.GRANTED) {
                console.log("❌ Permisos denegados");
                setPermissionDenied(true);
                setIsLoading(false);
                return;
            }

            console.log("✅ Permisos concedidos, iniciando watchPosition...");
            Geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        speed: pos.coords.speed != null ? pos.coords.speed * 3.6 : 0,
                    });
                    setLastUpdate(new Date());
                    setIsLoading(false);
                },
                (err) => {
                    console.log("❌ getCurrentPosition error:", err);
                    setIsLoading(false);
                },
                {enableHighAccuracy: true, timeout: 20000, maximumAge: 1500}
            );
            let lastPos = null;

            const watchId = Geolocation.watchPosition((pos) => {
                    if (lastPos) {
                        const R = 6371e3; // radio tierra en metros
                        const toRad = (d) => (d * Math.PI) / 180;

                        const lat1 = toRad(lastPos.coords.latitude);
                        const lat2 = toRad(pos.coords.latitude);
                        const dLat = lat2 - lat1;
                        const dLon = toRad(pos.coords.longitude - lastPos.coords.longitude);

                        const a =
                            Math.sin(dLat / 2) ** 2 +
                            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
                        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        const distance = R * c; // metros

                        const time = (pos.timestamp - lastPos.timestamp) / 1000; // seg
                        const speed = time > 0 ? (distance / time) * 3.6 : 0; // km/h
                        setLastUpdate(new Date());

                        setLocation({
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            speed,
                        });
                    }
                    lastPos = pos;
                },
                (err) => console.log("⚠️ Error ubicación:", err),
                {
                    enableHighAccuracy: true,
                    distanceFilter: 0,
                    interval: 1000,
                    fastestInterval: 500,
                    showsBackgroundLocationIndicator: true,
                }
            );

            console.log("🧭 Watch ID:", watchId);

            setUpdateIntervalForType(SensorTypes.accelerometer, 100);
            setUpdateIntervalForType(SensorTypes.gyroscope, 100);

            const accelSub = accelerometer.subscribe(({x, y, z}) => {
                setAccel({x, y, z});
            });
            const gyroSub = gyroscope.subscribe(({x, y, z}) => {
                setGyro({x, y, z});
            });

            return () => {
                console.log("🧹 Limpiando subscripciones");
                Geolocation.clearWatch(watchId);
                accelSub.unsubscribe();
                gyroSub.unsubscribe();
            };
        })();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Accident Detection</Text>
                <TouchableOpacity onPress={onClosePress} style={styles.closeButton}>
                    <Image
                        source={require('./images/close.png')}
                        style={styles.closeIcon}
                    />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#cfe0c3"/>
                    <Text style={{color: '#cfe0c3', marginTop: 10}}>Getting location...</Text>
                </View>
            ) : permissionDenied ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'red', fontSize: 16}}>Permission denied</Text>
                </View>
            ) : (
                <ScrollView>
                    <Text style={styles.section}>
                        Location {lastUpdate ? `- Last update: ${lastUpdate.toLocaleTimeString()}` : ''}
                    </Text>
                    <Text style={styles.label}>GPS & Speed of the User</Text>
                    <Text style={styles.value}>latitude: {location.latitude.toFixed(6)}</Text>
                    <Text style={styles.value}>longitude: {location.longitude.toFixed(6)}</Text>
                    <Text style={styles.value}>speed: {location.speed.toFixed(2)} km/h</Text>

                    <Text style={styles.section}>Accelerometer</Text>
                    <Text style={styles.label}>Linear Acceleration of the device</Text>
                    <Text style={styles.value}>X: {accel.x.toFixed(2)}</Text>
                    <Text style={styles.value}>Y: {accel.y.toFixed(2)}</Text>
                    <Text style={styles.value}>Z: {accel.z.toFixed(2)}</Text>

                    <Text style={styles.section}>Gyroscope</Text>
                    <Text style={styles.label}>Angular Velocity around the 3 axes</Text>
                    <Text style={styles.value}>X: {gyro.x.toFixed(2)}</Text>
                    <Text style={styles.value}>Y: {gyro.y.toFixed(2)}</Text>
                    <Text style={styles.value}>Z: {gyro.z.toFixed(2)}</Text>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2a5934',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#cfe0c3',
    },
    closeButton: {
        padding: 5,
    },
    closeIcon: {
        width: 25,
        height: 25,
    },
    section: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#cfe0c3',
        marginTop: 15,
    },
    label: {
        color: '#cfe0c3',
        marginBottom: 5,
    },
    value: {
        color: '#a8c1a0',
        marginBottom: 2,
    },
});
