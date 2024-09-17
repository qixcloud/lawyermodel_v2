import React, { Component, useState, useRef, useEffect } from "react"
import { View, AppRegistry, StyleSheet, NativeSegmentedControlIOSChangeEvent, DeviceEventEmitter} from "react-native"
// import {EventOnAddStream, MediaStream, RTCPeerConnection, RTCSessionDescription, RTCIceCandidate,mediaDevices} from'react-native-webrtc';
import Button from './calling/Button';
import GettingCall from './calling/GettingCall';
import Video from './calling/Video';
import Utils from './Utils';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore'
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
// import IncomingCall from 'react-native-incoming-call';
// import RNUnlockDevice from 'react-native-unlock-device';

const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
interface Props {
    changeCallStatus?: any;
    sellectCollee?: any;
    translate?: any;
    caller: string;
    callee: string; 
    baseUrl: string; 
    callerType: string;
}
export default function Call(props: Props) {
    const [localStream, setLocalStream] = useState<MediaStream | null>()
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>()
    const [gettingCall, setGettingCall] = useState(false);
    const pc = useRef<RTCPeerConnection>()
    const connecting = useRef(false);
    const [staffId, setstaffId] = useState("");
    const [notificationTitle, setnotificationTitle] = useState("");
    var data;

    useEffect(()=>{
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            console.log('Message handled in the background--------------------', remoteMessage.notification.title, staffId);
            if (remoteMessage.notification.title === 'Video Call') {
                RNUnlockDevice.unlock();
              // Display incoming call activity.      
              /*setnotificationTitle(remoteMessage.notification.title);
                const params = new FormData();
                params.append('method', "getStaffOrClientName");  
                params.append('user', "1"); 
                //console.log(params);
                axios({
                    method: 'post',
                    url: props.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
                    data: params
                }).then(res => {
                    IncomingCall.display(
                      'callUUIDv4', // Call UUID v4
                      res.data.userName, // Username
                      res.data.avatar, // Avatar URL
                      remoteMessage.notification.title, // Info text
                      20000 // Timeout for end call after 20s
                    );
                });*/
                //join();                
                IncomingCall.backToForeground();
            } else if (remoteMessage.notification.title === 'Missed Call') {
              // Terminate incoming activity. Should be called when call expired.
              IncomingCall.dismiss();
            }    
            
        });
            //this.viewedNotification();
        DeviceEventEmitter.addListener("endCall", payload => {
            // End call action here
        });
        DeviceEventEmitter.addListener("answerCall", (payload) => {
            console.log('answerCall', payload);
            if (payload.isHeadless) {
                // Called from killed state
                IncomingCall.openAppFromHeadlessMode(payload.uuid);
            } else {
                // Called from background state
                join();
                IncomingCall.backToForeground();
            }
        });

        const cRef = firestore().collection('meet').doc('chatId');
        const subscribe = cRef.onSnapshot(snapshot=>{
            data = snapshot.data();
            //On answer start the call
            if(pc.current && !pc.current.remoteDescription && data && data.answer){
                pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }

            // If there is offer for chatId set the getting call flag
            if(data && data.offer && !connecting.current){
                if(data.offer.toId == props.callee){
                    setstaffId(data.offer.fromId);                    
                    if(props.callerType =="client"){ 
                        props.changeCallStatus(1);  
                    }
                    setGettingCall(true);
                }
            }
        });

        // On Delete of collection call hangup
        // The other side has clicked on hangup
        const subscribeDelete = cRef.collection('callee'+props.callee).onSnapshot(snapshot=>{
            snapshot.docChanges().forEach(change=>{
                if(change.type == 'removed'){
                    hangup();
                }
            });
        });
        return () => {
            subscribe();
            subscribeDelete();
        };
    }, [])

    if(gettingCall){
        const cRef = firestore().collection('meet').doc('chatId');
        const subscribe = cRef.onSnapshot(snapshot=>{
            data = snapshot.data();
            if(data && data.offer){
                //console.log(data.offer.fromId);
            }else{
                hangup();
            }
        });
    }
    const setupWebrtc = async () =>{
        pc.current = new RTCPeerConnection(configuration);
        // Get the audio and video stream for the call
        const stream =  await Utils.getStream()
        if(stream){
            setLocalStream(stream);
            pc.current.addStream(stream);
        }
        // Get the remote stream once it is available
        pc.current.onaddstream = (event: EventOnAddStream) => {
            console.log(event.stream);
            setRemoteStream(event.stream)
        }
    }
    const create = async () =>{
        if(props.callerType=="staff" && props.callee == "0"){
            props.sellectCollee(props.callerType);
        }else{
            console.log("Calling");
            connecting.current = true;
            props.changeCallStatus(1);
            // setUp webrtc
            await setupWebrtc();

            // Document for the call
            const cRef = firestore().collection("meet").doc("chatId");

            // Existing the ICE candidates between the caller and callee
            collectIceCandidates(cRef, "caller"+props.caller, "callee"+props.callee);
            if(pc.current){
                // Create the offer for the call
                // Store the offer under the document
                const offer = await pc.current.createOffer();
                pc.current.setLocalDescription(offer);

                const cWithOffer = {
                    offer: {
                        type: offer.type,
                        sdp: offer.sdp,
                        fromId: props.caller,
                        toId: props.callee
                    },
                };

                cRef.set(cWithOffer);
            }
        }
    }
    const join = async () =>{
        console.log("Joinning the call");
        connecting.current = true;
        setGettingCall(false);
        props.changeCallStatus(1);

        const cRef = firestore().collection('meet').doc('chatId');
        const offer = (await cRef.get()).data()?.offer;

        if(offer){
            // Setup Webrtc
            await setupWebrtc();

            // Exchange the ICE candidates
            // Check the parameters, Its reversed. Since the joining part is callee
            collectIceCandidates(cRef, "callee"+props.callee, "caller"+staffId);
            if(pc.current){
                pc.current.setRemoteDescription(new RTCSessionDescription(offer));

                // Create the answer for the call
                // Update the document with answer
                const answer = await pc.current.createAnswer();
                pc.current.setLocalDescription(answer);
                const cWithAnswer = {
                    answer: {
                        type: answer.type,
                        sdp: answer.sdp,
                        fromId: props.caller,
                        toId: props.callee
                    },
                };
                cRef.update(cWithAnswer);
            }
        }
    }

    /**
     * For disconnecting the call close the connection, release the stream
     * And delete the document for the call
     */
    const hangup = async () =>{
        setGettingCall(false);    
        props.changeCallStatus(0);    
        connecting.current = false;
        streamCleanUp();
        fireStoreCleanUp();
        if(pc.current){
            pc.current.close();
        }
        setnotificationTitle("");
        setstaffId("");
    };

    // Helper function
    const streamCleanUp = async () =>{
        if(localStream){
            localStream.getTracks().forEach(t=>t.stop());
            localStream.release();
        }
        setLocalStream(null);
        setRemoteStream(null);
    };
    const fireStoreCleanUp = async () =>{
        const cRef = firestore().collection('meet').doc('chatId');

        if(cRef){
            const calleeCandidates = await cRef.collection('callee'+props.callee).get();
            calleeCandidates.forEach(async (candidate)=>{
                await candidate.ref.delete();
            })
            const callerCandidates = await cRef.collection('caller'+staffId).get();
            callerCandidates.forEach(async (candidate)=>{
                await candidate.ref.delete();
            })

            cRef.delete();
        }
    };



    const collectIceCandidates = async (
        cRef: FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentReference>,
        localName: string,
        remoteName: string
    )=>{
        const candidateCollection = cRef.collection(localName);
        if(pc.current){
            // On new ICE candidate add it to firestore
            pc.current.onicecandidate = (event) => {
                if(event.candidate){
                    candidateCollection.add(event.candidate);
                }
            }
        }
        // Get the ICE candidate added to firestore and update the local PC
        cRef.collection(remoteName).onSnapshot(snapshot =>{
            snapshot.docChanges().forEach((change: any)=>{                
                if(change.type == 'added'){
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current?.addIceCandidate(candidate)
                }
            })
        })
    };
    
    if(props.caller != "0" && props.callee != "0" && props.callerType == "staff" && !connecting.current){           
        const cRef = firestore().collection('meet').doc('chatId');
        const subscribeDelete = cRef.collection('callee'+props.callee).onSnapshot(snapshot=>{
            snapshot.docChanges().forEach(change=>{
                if(change.type == 'removed'){
                    hangup();
                }
            });
        });     
        setstaffId(props.caller);
        create();
        
        const params = new FormData();	
        params.append('method', "sendCallNotification");  
        params.append('staff', props.caller); 
        params.append('to', props.callee); 
        params.append('title', "Video Call"); 
        console.log(params);
        axios({
            method: 'post',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            url: props.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
            data: params
        }).then(res => {
            console.log(res);
        });
    }
    //Display the gettingCall Component
    if(gettingCall){
        return <GettingCall hangup={hangup} join={join} staffId={staffId} baseUrl={props.baseUrl} translate={props.translate} />
    }
    
    // Display local stream on calling
    // Display nboth local and remote stream once call is connected
    if(localStream){
         return (
             <Video hangup={hangup} localStream={localStream} remoteStream={remoteStream} />
         )
    }
    // Display the call button
    return (
        <>
        {props.callerType == "staff" ? (
            <View style={styles.container}>
                <Button iconName="phone" backgroundColor="white" color="grey" fontSize={30}  style={{marginHorizontal: 15}} />
                <Button iconName="video" backgroundColor="white" onPress={create} color="grey" fontSize={30} style={{marginHorizontal: 15}} />
                <Button iconName="comment-dots" backgroundColor="white" color="grey"  fontSize={30} style={{marginHorizontal: 15}} />
            </View>
        ):(<></>)}
        </>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 5
    }
})