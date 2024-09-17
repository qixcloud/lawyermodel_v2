import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TextInput, Dimensions, Image, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import FadeInView from 'react-native-fade-in-view';
import ScalableImage from 'react-native-scalable-image';
// import 
export default class Availability_appointments extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
			back: 0,
			apps: [],
            checked : false,
            next : false,
		}
	}

    componentDidMount = () => {
		const params = new FormData();
		console.log("this.props.appoType", this.props.appoType);
		params.append('method', 'availability_appointments');
		params.append('contact_id', global.contactId);
		params.append('phone', global.phone);
		params.append('type', this.props.appoType);
		axios({
		  method: 'post',
		  headers: {
			'Content-Type': 'multipart/form-data'
		  },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
			console.log(res.data);
		  if (res.data.status == "success") {
			  console.log(res.data.apps.length);
			  if(res.data.apps.length > 0){
			  	apps = res.data.apps;
			  }else{
				apps[0] = "no";
			  }
			  this.setState({apps: apps});
		  }
		});
	}
	render() {

		return (
			<>
            
            <ScrollView style={{minHeight: 100, width: '100%', textAlign: 'center', marginBottom: 50, paddingTop: 10}}>
            {
					this.state.apps.length > 0 ? (		
						this.state.apps[0] != "no" ? (			
							this.state.apps.map((app) =>{
								return (
									<FadeInView duration={750}>
										<View style={app.noteCount > 0 ? (styles.activeNote) : (styles.note)}>
											<View style={{width: '70%', paddingLeft: 10}}>
											<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 30, textAlign: 'left', fontWeight: 'bold', marginBottom: 5}}>{app.name}</Text>  
											<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15, textAlign: 'left'}}>{app.days}</Text>    
											<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15, textAlign: 'left'}}>{app.spot1} - {app.spot2}</Text>    
											</View>
											<View style={{width: '30%', padding: 10, justifyContent: 'center'}}>
												<Text allowFontScaling={false} onPress={() => Linking.openURL(app.link)} style={{ fontFamily: 'Quicksand-Regular', color: '#2a99fb', fontSize: 20, textAlign: 'center', fontWeight: 'bold' }}>Book it</Text>
											</View>
										</View> 
									</FadeInView>
								)
							})
						):(
							<View style={{alignItems: 'center', justifyContent: 'center'}}>								
								<ScalableImage source={require("../images/Sleep_app.png")} width={184} />
							</View>
						)
					):(
						<View style={{alignItems: 'center', justifyContent: 'center'}}>
							{/* <Image source={require('../images/loading.gif')} style={{ width: 50, height:50 }} /> */}
								<Progress.Circle size={30} indeterminate={true} />
						</View>
					)
            }
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
	noteContainer: {
		fontFamily: 'Quicksand-Regular', fontWeight: 'bold',position: 'absolute', top: -22, right: -18, paddingTop: 1, paddingHorizontal: 5, backgroundColor: 'red',borderRadius: 10, alignItems: 'center', maxWidth: 20
    },
    note: {
		fontFamily: 'Quicksand-Regular', flexDirection: 'row', marginLeft: '5%', marginBottom: 10, width: '90%', backgroundColor:'#fff', paddingHorizontal: 10, paddingVertical: 15, borderRadius: 10
    },
    activeNote: {
        fontFamily: 'Quicksand-Regular',  borderWidth: 1, borderColor: 'green', flexDirection: 'row', marginLeft: '5%', marginBottom: 10, width: '90%', backgroundColor:'#fff', paddingHorizontal: 10, paddingVertical: 15, borderRadius: 10
    }
});