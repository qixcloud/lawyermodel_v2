import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TextInput, Dimensions, Image, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import FadeInView from 'react-native-fade-in-view';
import Hyperlink from 'react-native-hyperlink';
import { Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
// import 
export default class Inbox extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
			back: 0,
			data: [],
            checked : false,
            next : false,
			post_id: 0
		}
	}
	componentDidMount = () => {
		this.getContactPostsReminders();
	}
    getContactPostsReminders = () => {
		this.setState({data: []});
		const params = new FormData();
		console.log("this.props.appoType", this.props.appoType);
		params.append('method', 'getContactPostsReminders');
		params.append('contact_id', global.contactId);
		params.append('phone', global.phone);
        console.log(params);
		axios({
		  method: 'post',
		  headers: {
			'Content-Type': 'multipart/form-data'
		  },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
			//console.log(res.data[0].meta);
            this.setState({data: res.data});
		});
	}
	submitAsk = (id,option) => {
		const params = new FormData();
		params.append('method', 'submitContactPosts');
		params.append('post_id', id);
		params.append('author_id', global.contactId);
		params.append('author', global.name);
		params.append('meta_key', "Ask");
		params.append('meta_value', option);
		console.log('submitContactPosts');
		axios({
		  method: 'post',
		  headers: {
			'Content-Type': 'multipart/form-data'
		  },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
			console.log(res.data);
			Alert.alert(this.props.translate("Success"));
			this.getContactPostsReminders();
		});
	}
	_onSendFileProcessing = (url, name, type) => {
		const second = Math.floor(Date.now() / 1000);
		var data = new FormData();
		data.append('file', {
		  uri: url,
		  name: global.contactId + '-' + name,//second + '-' + name,
		  type: type
		});
		data.append('method', 'submitContactPosts');
		data.append('author_id', global.contactId);
		data.append('post_id', this.state.post_id);
		data.append('author', global.name);
		data.append('meta_key', "Request");
		var path = global.baseUrl+"wp-admin/admin-ajax.php?action=contact_api";
		this.setState({uploadingStatue: 1});
		fetch(path,{
		  header: {
			'Accept': 'application/json',
			'Content-Type': 'multipart/form-data'
		  },
		  method:'POST',
		  body: data
		}).then((response) => response.json())
		.then((responseJson) => {
		  console.log(responseJson);
		  this.setState({uploadingStatue: 0});
		  Alert.alert(this.props.translate("Success"));
		})
		.catch((error) => {
		  console.error(error);
		});
	  }
	  brower = () => {	
		ImagePicker.launchImageLibrary(this.options, (response) => {	
		  console.log(response);
		  if(!response.didCancel){this._onSendFileProcessing(response.uri, "photo.jpg", response.type);}
		});
	  }
	  fileBrowser = async () => {
		try {
		  const res = await DocumentPicker.pick({
			type: [DocumentPicker.types.allFiles],
		  });
		  this._onSendFileProcessing(res.uri, res.name, res.type);
		} catch (err) {
		  if (DocumentPicker.isCancel(err)) {
		  } else {
			throw err;
		  }
		}
	  }
	  _onSendFilePressed = () =>{
		Alert.alert(
		  "Select Library.",
		  "",
		  [
			{
			  text: "Photo",
			  onPress: () => {this.brower();}
			},
			{ text: "File", onPress: () => {this.fileBrowser()} }
		  ],
		  { cancelable: false }
		);
		
		return false;
	  }
	uploadDocument = (id) => {
		this.setState({post_id: id});
		this.fileBrowser();
	}
	donwloadAttached = (id, file) =>{
		const params = new FormData();
		params.append('method', 'submitContactPosts');
		params.append('post_id', id);
		params.append('author_id', global.contactId);
		params.append('author', global.name);
		params.append('meta_key', "Attach");
		params.append('meta_value', 1);
		console.log('submitContactPosts');
		axios({
		  method: 'post',
		  headers: {
			'Content-Type': 'multipart/form-data'
		  },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
			Linking.openURL(file);
		});		
	}
	render() {

		return (
			<>
            
            <ScrollView style={{minHeight: 100, width: '100%', textAlign: 'center', marginBottom: 50, paddingTop: 10}}>
            {
					this.state.data.length > 0 ? (		
						this.state.data[0] != "no" ? (			
							this.state.data.map((app) =>{
								if(app.appMsgType == "Ask"){
									var ask = 0;
									var i; var meta = app.meta;
									for (i = 0; i < meta.length; i++) {
										if(meta[i].meta_key == "Ask"){
											ask = meta[i].meta_value;
										}
									}
								}
								return (
									<FadeInView duration={750}>
									<View style={app.noteCount > 0 ? (styles.activeNote) : (styles.note)}>
										<View style={{width: '100%'}}>
											<Hyperlink linkDefault={ true }  linkStyle={ { color: '#2980b9'} }>
												<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#000', fontSize: 18, marginBottom: 10}}>{app.message}</Text>  
											</Hyperlink>
										</View>
										<View style={{width: '100%', flexDirection: 'row'}}>
											{app.status = "Send to user" ? (
												<>
												<Text allowFontScaling={false} style={{ color: '#000', fontSize: 15}}>By: </Text>
												<Text allowFontScaling={false} style={{ color: '#000', fontSize: 15}}>{app.author}   </Text>
												</>
											):(
												<Text allowFontScaling={false} style={{ color: '#000', fontSize: 15}}>{app.status} </Text>
											)}
											<Text allowFontScaling={false} style={{ color: '#000', fontSize: 15}}>{app.date}</Text>
										</View>
										{app.appMsgType == "Ask" && (
											<View style={{width: '100%', flexDirection: 'row'}}>										
												<TouchableOpacity onPress={() => this.submitAsk(app.id,1)} style={ask=="1" ? styles.button1 : styles.button2}>
													<Text style={ask=="1" ? styles.button1Txt : styles.button2Txt}>{app.option1}</Text>
												</TouchableOpacity>										
												<TouchableOpacity onPress={() => this.submitAsk(app.id,2)} style={ask=="2" ? styles.button1 : styles.button2}>
													<Text style={ask=="2" ? styles.button1Txt : styles.button2Txt}>{app.option2}</Text>
												</TouchableOpacity>
											</View>
										)}
										{app.appMsgType == "Request" && (
											<>
											{app.meta.map((m) =>{
												if(m.meta_key == "Request"){
													fileNameIndex = m.meta_value.lastIndexOf("/") + 1;
													filename = m.meta_value.substr(fileNameIndex);
												}
												return (
												m.meta_key == "Request" && (
													<View style={{width: '100%', flexDirection: 'row'}}>	
														<TouchableOpacity onPress={() => Linking.openURL(m.meta_value)}>
															<Text style={{fontSize: 15, marginTop: 10}}>{filename}</Text>
														</TouchableOpacity>
													</View>
												))
											})}
											<View style={{width: '100%', flexDirection: 'row'}}>												
												<TouchableOpacity onPress={() => this.uploadDocument(app.id)} style={styles.button}>
													<Image source={require('./images/upload.png')} style={{ width: 25, height:20, position: "absolute", left: 5, top: 5}} />
													<Text style={{fontSize: 15, marginLeft: 30}}>{this.props.translate("UploadDocument")}</Text>
												</TouchableOpacity>
											</View>
											</>
										)}
										{app.appMsgType == "Attach" && (
											<View style={{width: '100%', flexDirection: 'row'}}>												
												<TouchableOpacity onPress={() => this.donwloadAttached(app.id, app.attachmentUrl)} style={styles.button}>
													<Image source={require('./images/book.png')} style={{ width: 15, height:21, position: "absolute", left: 5, top: 3}} />
													<Text style={{fontSize: 15, marginLeft: 20}}>{this.props.translate("DownloadDocument")}</Text>
												</TouchableOpacity>
											</View>
										)}
									</View> 
									</FadeInView>
								)
							})
						):(
							<View style={{alignItems: 'center', justifyContent: 'center'}}>
								<Text style={{ fontFamily: 'Quicksand-Regular', }}>{this.props.translate("noResults")}</Text>
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
		fontFamily: 'Quicksand-Regular', 
		fontWeight: 'bold',
		position: 'absolute', 
		top: -22, 
		right: -18, 
		paddingTop: 1, 
		paddingHorizontal: 5, 
		backgroundColor: 'red',
		borderRadius: 10, 
		alignItems: 'center', 
		maxWidth: 20
    },
    note: {
		fontFamily: 'Quicksand-Regular', 
		marginLeft: '5%', 
		marginBottom: 10, 
		width: '90%', 
		backgroundColor:'#fff', 
		paddingHorizontal: 20, 
		paddingVertical: 20, 
		borderRadius: 10,
		borderWidth: 1
    },
    activeNote: {
		fontFamily: 'Quicksand-Regular',  
		borderWidth: 1, 
		borderColor: 'green', 
		marginLeft: '5%', 
		marginBottom: 10, 
		width: '90%', 
		backgroundColor:'#fff', 
		paddingHorizontal: 20, 
		paddingVertical: 20, 
		borderRadius: 10
    },
	button: {
		fontFamily: 'Quicksand-Regular',paddingHorizontal: 10, paddingVertical: 3, marginTop: 10, marginRight: 10
	},
	button1: {
		fontFamily: 'Quicksand-Regular',paddingHorizontal: 15, paddingVertical: 3, marginTop: 10, marginRight: 20, borderRadius: 5, backgroundColor: "#41b2f8", color: "#fff"
	},
	button1Txt:{
		fontSize: 15,color: "#fff"
	},
	button2: {
		fontFamily: 'Quicksand-Regular',paddingHorizontal: 15, paddingVertical: 3, marginTop: 10, marginRight: 20, borderRadius: 5, backgroundColor: "#eee"
	},
	button2Txt: {
		fontSize: 15
	}
});