import React, { Component } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import Icon from'react-native-vector-icons/FontAwesome5';

interface Props {
    onPress?: any;
    iconName: string;
    backgroundColor: string;
    style?: any;
    color: string;
    fontSize: number;
}
export default function Button(props: Props) {
    return (
        <View>
            <TouchableOpacity
            onPress={props.onPress}
            style={[
                {backgroundColor: props.backgroundColor},
                props.style,
                styles.button,
            ]}
            >
                <Icon name={props.iconName} color={props.color} size={props.fontSize} />
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    button:{
        width: 60,
        height: 60,
        padding: 10,
        // elevation: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    }
});