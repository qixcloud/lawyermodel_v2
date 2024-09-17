import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Linking, Alert } from 'react-native';
import DialogInput from 'react-native-dialog-input';
import axios from 'axios';
// import 
export default class step5 extends Component {
	constructor(props) {
		super(props);
		this.state = {
            isDialogVisible: false,
		}
	}

	yelpaccount = (idx) => {
        if(idx == 1){
			this.setState({ isDialogVisible: true });   
		}else{			 
			Alert.alert(
				"Would you like to create a Yelp account now?",
				"",
				[
				  {
				  text: "No",
				  onPress: () => console.log("Cancel Pressed"),
				  style: "cancel"
				  },
				  { text: "Yes", onPress: () => Linking.openURL("https://www.yelp.com/signup") }
				],
				{ cancelable: false }
				);
		}
	}
	sendYelp = (user_name) => {
		if(user_name != ""){			      
			const params = new FormData();
			params.append('method', 'yelp_user_name');
			params.append('contact_id', global.contactId);
			params.append('user_name', user_name);
			
			axios({
			method: 'post',
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
			data: params
			}).then(res => {
				if (res.data.status == "success") {
					this.setState({ isDialogVisible: false });
					this.props.completeSignup();
				}else{
					Alert.alert("Failed."); 
				}
			});			   
		}else{
			Alert.alert("Please input Yelp user name");
		}
	}
	hideDialog = () => {
		this.setState({ isDialogVisible: false });   
	}
	render() {

		return (
			<>                    
                    <Image source={require('../images/step-5.png')} style={styles.bar} />		
                    <View style={styles.barCells}>
                        <TouchableOpacity style={styles.barCell1}  onPress={() => this.props.selectstep(1)}></TouchableOpacity>							
                        <TouchableOpacity style={styles.barCell2}  onPress={() => this.props.selectstep(2)}></TouchableOpacity>							
                        <TouchableOpacity style={styles.barCell2}  onPress={() => this.props.selectstep(3)}></TouchableOpacity>							
                        <TouchableOpacity style={styles.barCell2}  onPress={() => this.props.selectstep(4)}></TouchableOpacity>							
                        <TouchableOpacity style={styles.barCell3}  onPress={() => this.props.selectstep(5)}></TouchableOpacity>	
                    </View>
                    <View style={{width: Dimensions.get('window').width * 0.8, padding: 20, borderRadius: 5, backgroundColor: '#eee', shadowColor: '#000',borderWidth: 1,borderColor: '#ddd'}}>
                        <Text style={{ fontSize: 20, color: '#555', textAlign: 'center' }}>Link Yelp Account</Text>
						{global.signup > 0 ? (
							<View style={{alignItems: 'center', marginTop: 15}}><Image source={require('../images/check.png')} style={{width: 25, height:25}} /></View>     
							):( 
                        <View style={{ marginTop: 15 }}>
							<Text style={{ fontSize: 15, color: '#555', textAlign: 'center' }}>Do you have Yelp account now?</Text> 
							
							<View style={{flexDirection: 'row',justifyContent: "center", alignItems: "center" }}>
								<TouchableOpacity onPress={() => this.yelpaccount(1)} style={styles.button}>
									<Text style={{ textAlign: 'center', fontSize: 20, color: '#fff' }}>Yes</Text>
								</TouchableOpacity>    
								<TouchableOpacity onPress={() => this.yelpaccount(0)} style={styles.button}>
									<Text style={{ textAlign: 'center', fontSize: 20, color: '#fff' }}>No</Text>
								</TouchableOpacity>                        
							</View>
                        </View>
							)}
                    </View>
					<DialogInput isDialogVisible={this.state.isDialogVisible}
					title={"Yelp"}
					message={"Please input Yelp user name."}
					hintInput={"User Name"}
					submitInput={(inputText)=>{this.sendYelp(inputText)}}
					closeDialog={()=>{this.hideDialog()}}
					>
					</DialogInput>
			</>
		);
	}
}

const styles = StyleSheet.create({
	bar: {
		width: 330, height: 50, marginTop: 20
    },
    barCells:{
        flexDirection: 'row', width: 330, marginBottom: 20, marginTop: -40
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
		backgroundColor: '#599cdd',paddingVertical: 5, paddingHorizontal:10, borderRadius: 5, marginRight:10, marginTop: 10
	},
});