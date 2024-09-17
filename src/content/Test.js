import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import axios from 'axios';
export default class Test extends Component {
    constructor(props) {
        super(props);
        // FBLoginManager.logout(function(error, data){});
    }
    
	componentDidMount = () => {
		 const params = new FormData();
		 params.append('method', 'signed_in');
		 params.append('uniqueId', 'uniqueId');
		 console.log("params", params);
		 axios({
		 	method: 'POST',
			 headers: {
			   'Content-Type': 'multipart/form-data'
			 },
		 	url: 'https://qix.cloud/lawyermodel/wp-admin/admin-ajax.php?action=app_axios_test',
		 	data: params
		 }).then(res => {		
		 	console.log("res", res.data);
		 });
	}
	render() {
		return (
		<Text>test</Text>
		);
	}
}
const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777'
  },
  textBold: {
    fontWeight: '500',
    color: '#000'
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)'
  },
  buttonTouchable: {
    padding: 16
  }
});