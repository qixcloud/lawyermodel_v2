import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Button, CheckBox } from 'react-native';
import axios from 'axios';
// import 
export default class main extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
			back: 0,
			inputName: "",
			inputPhone: "",
			inputEmail: "",
			errorName: "",
			errorPhone: "",
            errorEmail: "",
            checked : false,
            next : false,
		}
	}

	sendSignup = () => {
        this.setState({ errorName: "" });
        this.setState({ errorPhone: "" });
        this.setState({ errorEmail: "" });
		if (this.state.inputName === "") {
			this.setState({ errorName: "* Please input Name." });
		}else if(this.state.inputPhone === ""){
            this.setState({ errorPhone: "* Please input phone number." });
        }else if(this.state.inputEmail === ""){
            this.setState({ errorEmail: "* Please input Email." });
        }else {
            this.setState({ next: true });
			/*const params = new FormData();
			params.append('method', 'sign_up');
			params.append('inputName', this.state.inputName);
			params.append('phone_number', this.state.inputPhone);
			params.append('inputEmail', this.state.inputEmail);
			axios({
				method: 'post',
				url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
				data: params
			}).then(res => {
				console.log(res);
				if (res.data.sign_in == "success") {
					this.setState({ login: 1 });
				}else{
					this.setState({ errorTxt: "* Invalid phone number." });
				}
			});*/
		}
	}
	render() {

		return (
			<>
            
            <View style={styles.container}>
                <Text style={{ fontSize: 20, color: '#555', textAlign: 'center' }}>Notifications</Text>                         
            </View>
            <ScrollView style={{minHeight: 100, width: '100%', textAlign: 'center'}}>
                <TouchableOpacity style={{flexDirection: 'row', marginLeft: '15%', marginBottom: 10, width: '70%', backgroundColor:'#545454', padding: 10, borderRadius: 20 }}>
                    <View style={{width: '20%'}}><Image source={require('../images/bell.png')} style={{ marginLeft: 5, width: 18, height:18 }} /></View>
                    <Text style={{ fontSize: 13, color: '#fff', textAlign: 'right', width: '75%' }}>Reminder Notification</Text>                                   
                </TouchableOpacity> 
                <TouchableOpacity style={{flexDirection: 'row', marginLeft: '15%', marginBottom: 10, width: '70%', backgroundColor:'#545454', padding: 10, borderRadius: 20 }}>
                    <View style={{width: '20%'}}><Image source={require('../images/calendar.png')} style={{ marginLeft: 5, width: 18, height:18 }} /></View>
                    <Text style={{ fontSize: 13, color: '#fff', textAlign: 'right', width: '75%' }}>Appointment Notification</Text>                                   
                </TouchableOpacity> 
                <TouchableOpacity style={{flexDirection: 'row', marginLeft: '15%', marginBottom: 10, width: '70%', backgroundColor:'#545454', padding: 10, borderRadius: 20 }}>
                    <View style={{width: '20%'}}><Image source={require('../images/chat.png')} style={{ marginLeft: 5, width: 18, height:18 }} /></View>
                    <Text style={{ fontSize: 13, color: '#fff', textAlign: 'right', width: '75%' }}>Chat Notification</Text>                                   
                </TouchableOpacity>    
            </ScrollView>

			</>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 15,
		...Platform.select({
			ios: {
			  paddingTop: 10,
			},
		}),
	},
});