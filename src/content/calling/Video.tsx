import React, { Component, useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity} from "react-native"
// import {MediaStream, RTCView} from'react-native-webrtc';
import Button from './Button';
import Ringtone from './Ringtone';
import InCallManager from 'react-native-incall-manager';
import ScalableImage from 'react-native-scalable-image';

interface Props {
    hangup: () => void;
    localStream?: MediaStream | null;
    remoteStream?: MediaStream | null;
}
function ButtonContainer(props: Props){
    return (
        <View style={styles.bContainer}>
            {/* <Button iconName="phone-slash" backgroundColor="red" color="white" fontSize={20} onPress={props.hangup} /> */}            
            <TouchableOpacity  onPress={props.hangup}>
                <ScalableImage source={require("../images/end-call.png")} height={60} />
            </TouchableOpacity>	 
        </View>
    );
}
export default function Video(props: Props) {
    useEffect(() => {
        if (props.localStream && props.remoteStream) {
            InCallManager.start({media: 'audio'});
            InCallManager.setForceSpeakerphoneOn(true);
            InCallManager.setSpeakerphoneOn(true);
        }
    })
    // On call we will just display the local stream
    if(props.localStream && !props.remoteStream){
        return (
        <View style={styles.container}>
            <RTCView
            streamURL={props.localStream.toURL()}
            objectFit={'cover'}
            style={styles.video}
            />
            <ButtonContainer hangup={props.hangup} />            
            <Ringtone soundFile = "dialtone.mp3" />
        </View>
        );
    }
    // Once the call is connected we will dsplay local Stream on top of remote stream
    if(props.localStream && props.remoteStream){
        return (
        <View style={styles.container}>
            <RTCView
            streamURL={props.remoteStream.toURL()}
            objectFit={'cover'}
            style={styles.video}
            />
            <RTCView
            streamURL={props.localStream.toURL()}
            objectFit={'cover'}
            style={styles.videoLocal}
            />
            <ButtonContainer hangup={props.hangup} />
        </View>
        );
    }
    return <ButtonContainer hangup={props.hangup} />;
}
const styles = StyleSheet.create({
    bContainer:{
        flexDirection: 'row',
        bottom: 30,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    video: {
        position: 'absolute',
        width: '100%',
        height: '100%'
    },
    videoLocal: {
        position: 'absolute',
        width: 100,
        height: 150,
        top: 0,
        left: 20,
        elevation: 10,
    }
});