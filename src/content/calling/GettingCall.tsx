import React, { Component, useState, useRef, useEffect } from "react"
import { View, Text, StyleSheet, Vibration, TouchableOpacity } from "react-native"
import Button from './Button';
import axios from 'axios';
import Ringtone from './Ringtone';
import ScalableImage from 'react-native-scalable-image';

interface Props {
    hangup: () => void;
    join: () => void;
    staffId: string;
    baseUrl: string;
    translate?: any;
}
export default function GettingCall(props: Props) {
    const [userName, setuserName] = useState("");
    const [avatar, setavatar] = useState("");
    const params = new FormData();		
    Vibration.vibrate(2 * 1000);
    params.append('method', "getStaffOrClientName");  
    params.append('user', props.staffId); 
    //console.log(params);
    axios({
        method: 'post',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        url: props.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
        data: params
    }).then(res => {
        setuserName(res.data.userName);
        setavatar(res.data.avatar);
    });
    return (
        <View style={styles.container}>
            <View style={styles.image}>
                {avatar != "" && (
                <ScalableImage source={{uri: avatar}} width={70} style={{marginBottom: 10}} />
                )}
                <Text style={{color: '#ffffff', fontSize: 20}}>{props.translate('videoCallFrom')}</Text>
                <Text style={{color: '#ffffff', fontSize: 15, marginBottom: 30}}>{userName}</Text>
            </View>
            <View style={styles.bContainer}>
                <Button iconName="phone" backgroundColor="green" onPress={props.join} color="white" fontSize={30} style={{marginRight: 30}} />
                {/* <Button iconName="phone-slash" backgroundColor="red" onPress={props.hangup} color="white" fontSize={20} style={{marginLeft: 30}} />    */}
                <TouchableOpacity  onPress={props.hangup}>
                    <ScalableImage source={require("../images/end-call.png")} height={60} />
                </TouchableOpacity>	             
            </View>
            <Ringtone soundFile = "ringtone.mp3" />
        </View>
    );
}
const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    image: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center'
    },
    bContainer: {
        flexDirection: 'row',
        bottom: 30
    }
});