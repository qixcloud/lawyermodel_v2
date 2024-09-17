import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, KeyboardAvoidingView, Alert } from 'react-native';
import axios from 'axios';
// import 
export default class AdvancedSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			logout: 0,
            back: 0
		}
    }
    componentDidMount = () => {
	}
	
	gotoback = () =>{
		this.props.advancedBackFunc();
	}
	deleteAccount = () => {
        Alert.alert(
            this.props.translate("areYouSure"),
            "",
            [
              // The "Yes" button
              {
                text: "Yes",
                onPress: () => {
                    const params = new FormData();
                    params.append('contact_id', global.contactId);
                    axios({
                      method: 'post',
					  headers: {
						'Content-Type': 'multipart/form-data'
					  },
                      url: global.baseUrl+'wp-admin/admin-ajax.php?action=deletectContactAccount',
                      data: params
                    }).then(res => {                      
                        this.props.advancedDeleteBackFunc();
                    });
                },
              },
              // The "No" button
              // Does nothing but dismiss the dialog when tapped
              {
                text: "No",
              },
            ]
          );
	}
	render() {
		return (
			
            <ScrollView style={styles.container}>						
                <TouchableOpacity onPress={() => this.gotoback()}  style={{flexDirection: 'row',justifyContent: "center", alignItems: "center" }}>
                    <View style={{paddingTop: 25, width: '70%' }}>
                        <Text style={{ fontSize: 25, color: '#d8941c'}}>{this.props.translate("advancedSettings")}</Text>
                    </View>	
                    <TouchableOpacity onPress={() => this.gotoback()} style={{marginTop: 25}}>
                        <Image  source={require('./images/close.png')} style={{ width: 25, height:25, marginHorizontal: 10 }} />
                    </TouchableOpacity>										
                </TouchableOpacity>                
                    <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 100}}>
                    <TouchableOpacity onPress={() => this.deleteAccount()} style={styles.button1}>
                        <Text style={{fontSize: 15, textAlign: 'center'}}>{this.props.translate("deleteAccount")}</Text>
                    </TouchableOpacity>
                    </View>
            </ScrollView>
				
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		...Platform.select({
			ios: {
			  paddingTop: 30,
			},
		}),
		backgroundColor: "#152030",
	},
	title: {
		alignItems: "center",
		...Platform.select({
			ios: {
				marginTop: 5,
			},
			android: {
				marginTop: 5,
			},
			default: {
				marginTop: 5,
			},
		}),
	},
	input: {
		color: "#000",height: 35, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 5, marginBottom: 8
	},
	inputdate: {
		color: "#000",height: 30, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', paddingLeft: 5,marginBottom: 8, width: '100%'
	},
	inputmultiple: {
		color: "#000",borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10,		
		...Platform.select({
			ios: {
				height: 60,
			},
			android: {
				height: 60,
			},
			default: {
				height: 60,
			},
		}),
	},
	button: {
		backgroundColor: '#fff',padding: 10, borderRadius: 5, marginTop:15
	},
	button1: {
		backgroundColor: '#fff',padding: 10, borderRadius: 5, marginTop:15, maxWidth: 200
	},
});