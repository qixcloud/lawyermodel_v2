import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Button, Linking } from 'react-native';
import DialogInput from 'react-native-dialog-input';
import axios from 'axios';
// import 
export default class step4 extends Component {
	constructor(props) {
		super(props);
	}

	nextstep = () => {			      
		const params = new FormData();
		params.append('method', 'zoom_download');
		params.append('contact_id', global.contactId);
		
		axios({
		method: 'post',
		headers: {
		  'Content-Type': 'multipart/form-data'
		},
		url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		data: params
		}).then(res => {
			if (res.data.status == "success") {
				this.props.completeSignup();
				//Linking.openURL("https://apps.apple.com/us/app/zoom-cloud-meetings/id546505307");
				Linking.openURL("https://play.google.com/store/apps/details?id=us.zoom.videomeetings");
			}else{
				Alert.alert("Failed."); 
			}
		});	
	}
	render() {

		return (
			<>
             
			<View>
			  <Image source={require('../images/steps/step4_top.png')} style={{width: Dimensions.get('window').width* 0.8, height: Dimensions.get('window').width* 0.4}} />		
			</View>	
			<Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 30, marginTop: 15, letterSpacing: 5}}>{this.props.translate("start").toUpperCase()}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 30, marginBottom: 10, letterSpacing: 5}}>{this.props.translate("videoCall").toUpperCase()}</Text>	        
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("downloadZoom")}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("toVideoCallWith")}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2, fontWeight: 'bold'}}>{global.title}</Text>	
			<View style={styles.barCells}>
				<Text style={this.props.maxStep > 1 ? styles.barCellCompleted : styles.barCellPending}  onPress={() => this.props.selectstep(1)}>1</Text>		
				<Text style={styles.barCell}></Text>	
				<Text style={this.props.maxStep > 2 ? styles.barCellCompleted : this.props.maxStep == 2 ? styles.barCellPending: styles.barCell} onPress={() => this.props.selectstep(2)}>2</Text>
				<Text style={styles.barCell}></Text>						
				<Text style={this.props.maxStep > 3 ? styles.barCellCompleted : this.props.maxStep == 3 ? styles.barCellPending: styles.barCell}  onPress={() => this.props.selectstep(3)}>3</Text>
				<Text style={styles.barCell}></Text>						
				<Text style={this.props.maxStep > 4 ? styles.barCellCompleted : this.props.maxStep == 4 ? styles.barCellPending: styles.barCell}  onPress={() => this.props.selectstep(4)}>4</Text>
				{/* <TouchableOpacity style={styles.barCell3}  onPress={() => this.props.selectstep(5)}><Text>1</Text></TouchableOpacity>	 */}
			</View>
			<View>
			<TouchableOpacity onPress={() => this.nextstep()}>
				<Image source={require('../images/steps/step4_btn.png')} style={{width: 150, height: 40}} />	
			</TouchableOpacity>
			</View>
			</>
		);
	}
}

const styles = StyleSheet.create({
	bar: {
		width: 330, height: 50, marginTop: 20
    },
    barCells:{
        flexDirection: 'row', width: 330, marginTop: 10, marginBottom: 20, justifyContent: 'center'
    },
    barCell: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: '#555', fontWeight: 'bold'
    },
    barCellPending: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: '#fbb225', fontWeight: 'bold'
    },
    barCellCompleted: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: 'green', fontWeight: 'bold'
    },
	barCell1: {
		paddingTop: 20, textAlign: 'left', width: '12%', height: 50
	},
	barCell2: {
		paddingTop: 20, textAlign: 'center', width: '25%', height: 50
	},
	barCell3: {
		paddingTop: 20, textAlign: 'right', width: '12%', height: 50
	},
	button: {
		width: 140, backgroundColor: '#599cdd',paddingVertical: 5, paddingHorizontal:10, borderRadius: 5, marginRight:10, marginTop: 10
	}
});