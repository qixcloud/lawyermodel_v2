import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TextInput, Dimensions, Image, Button, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as Progress from 'react-native-progress';
import FadeInView from 'react-native-fade-in-view';
// import 
export default class Glossary extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
			back: 0,
			apps: [],
            checked : false,
			next : false,
			searchKey: this.props.searchGlossaryKey,
			displaySubmissionForm: false,
			question: ""
		}
	}

    componentDidMount = () => {
		if(this.state.searchKey != ""){
			this.onSearchGlossary();
		}else{
			const params = new FormData();
			params.append('key', '');
			params.append('lang', global.lang);
			axios({
			method: 'post',
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			url: global.baseUrl+'wp-admin/admin-ajax.php?action=getGuideGlossary',
			data: params
			}).then(res => {
				console.log(res.data);
				global.apps = [];
				if(res.data.glossary.length > 0){
					global.apps = res.data.glossary;
				}else{
					global.apps[0] = "no";
				}
				this.setState({apps: global.apps});
			});
		}
	}
	onSearchGlossary = () => {
		console.log(this.state.searchKey);
		if(this.state.searchKey != ""){
			this.setState({apps: []});
			const params = new FormData();
			params.append('key', this.state.searchKey);
			params.append('lang', global.lang);
			axios({
			method: 'post',
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			url: global.baseUrl+'wp-admin/admin-ajax.php?action=getGuideGlossary',
			data: params
			}).then(res => {
				console.log(res.data.glossary.length);
				global.apps = [];
				if(res.data.glossary.length > 0){
					global.apps = res.data.glossary;
				}else{
					global.apps[0] = "no";
				}
				this.setState({apps: global.apps});
			});
		}
	}
	viewSubmissionForm = () => {
		this.setState({displaySubmissionForm: true});
	}
	submissionQuestion = () => {
		if(this.state.question != ""){
			const params = new FormData();
			params.append('contact_id', global.contactId); 
			params.append('question', this.state.question);
			params.append('submitType', 'Glossary');
			axios({
			method: 'post',
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			url: global.baseUrl+'wp-admin/admin-ajax.php?action=putSubmissionsFromApp',
			data: params
			}).then(res => {
				this.setState({displaySubmissionForm: false});
				this.setState({question: ""});
			});
		}
	}
	render() {

		return (
			<>          

			<View style={{ flexDirection: 'row', marginHorizontal: 30, alignItems: "center", marginTop:20 }}>
				<View style={{justifyContent: "center", marginRight: "2%",alignItems:"center", width: "38%", backgroundColor: "#fff", borderColor: '#ccc', marginBottom: 10, paddingVertical:15}}>
					<Image source={require('./images/glossary.jpg')} style={{ width: 150, height:150, marginLeft:10 }} />
				</View>
				<View style={{justifyContent: "center", marginLeft: "2%", alignItems:"center", width: "58%", backgroundColor: "#fff", borderColor: '#ccc', marginBottom: 10, paddingVertical:15}}>
					<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular',fontSize: 20, color: '#333', textAlign: 'right',width:"100%"}}>{this.props.translate("wanttoknow")}</Text>
					<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular',fontSize: 18, color: '#333', textAlign: 'right',width:"100%"}}>{this.props.translate("whatsomthingmeans")}?</Text>
					<View style={{flexDirection: 'row'}}>
						<TextInput onChangeText={(text) => this.setState({ searchKey: text })} style={styles.inputSearch} value={this.state.searchKey} placeholder="Search..." placeholderTextColor="#555"  ></TextInput>
						<TouchableOpacity style={styles.searchButton} onPress={() => this.onSearchGlossary()}>
							<Image source={require('./images/search.png')} style={{width: 24, height: 24}} />
						</TouchableOpacity>
					</View>	
				</View>
			</View>
			<View style={{marginHorizontal: 20 }}>
				{this.state.displaySubmissionForm ? (
					<>
					<TextInput onChangeText={(text) => this.setState({ question: text })} style={styles.inputQuestion} multiline={true} value={this.state.question} numberOfLines={5} placeholderTextColor="#555"  ></TextInput>
					<TouchableOpacity onPress={() => this.submissionQuestion()} style={styles.button}>
						<Text style={{ fontFamily: 'Quicksand-Regular',textAlign: 'center', fontSize: 20, color: '#fff' }}>{this.props.translate("submit")}</Text>
					</TouchableOpacity>
					</>
				):(
					<TouchableOpacity onPress={() => this.viewSubmissionForm()} style={styles.button}>
						<Text style={{ fontFamily: 'Quicksand-Regular',textAlign: 'center', fontSize: 20, color: '#fff' }}>{this.props.translate("submitQuestion")}</Text>
					</TouchableOpacity>				
				)}
			</View>
            <ScrollView style={{minHeight: 100, width: '100%', textAlign: 'center', marginBottom: 50, paddingTop: 10,marginTop: 15, backgroundColor: "#fff"}}>
            {
					this.state.apps.length > 0 ? (		
						this.state.apps[0] != "no" ? (			
							this.state.apps.map((app) =>{
								return (
									<FadeInView duration={750}>
									<View style={app.noteCount > 0 ? (styles.activeNote) : (styles.note)}>
										<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 30, fontWeight: 'bold', marginBottom: 15}}>{app.name}</Text>  
										<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15,color: 'blue', marginBottom: 5}}>Definition</Text>    	
										<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15, marginBottom: 10}}>{app.definition}</Text>    	
										<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15,color: 'blue', marginBottom: 5}}>Instruction</Text>    	
										<Text allowFontScaling={false} style={{ fontFamily: 'Quicksand-Regular', color: '#555', fontSize: 15, marginBottom: 10}}>{app.instruction}</Text>    										
									</View> 
									</FadeInView>
								)
							})
						):(
							<View style={{alignItems: 'center', justifyContent: 'center'}}>
								<Text style={{ fontFamily: 'Quicksand-Regular',color: '#000' }}>{this.props.translate("noResults")}</Text>
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
		fontFamily: 'Quicksand-Regular', marginLeft: '5%', marginBottom: 10, width: '90%', backgroundColor:'#fff', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 10, borderWidth: 1
    },
    activeNote: {
        fontFamily: 'Quicksand-Regular',  borderWidth: 1, borderColor: 'green', marginLeft: '5%', marginBottom: 10, width: '90%', backgroundColor:'#fff', paddingHorizontal: 15, paddingVertical: 15, borderRadius: 10, borderWidth: 1
    },
	inputSearch: {
		fontFamily: 'Quicksand-Regular',
		height: 40, borderRadius: 15, borderColor: '#000', backgroundColor: '#fff', fontSize: 15, paddingLeft: 10,borderWidth:1, width: "100%", marginTop: 20
	},
	inputQuestion:{
		fontFamily: 'Quicksand-Regular',
		minHeight: 100, borderRadius: 5, borderColor: '#000', backgroundColor: '#fff', fontSize: 15, padding: 10,borderWidth:1, width: "100%", marginBottom: 10
	},
    searchButton: {
      position: 'absolute',
      bottom: 7,
      right: 5,
    },
	button: {
		fontFamily: 'Quicksand-Regular', backgroundColor: '#599cdd',padding: 10, borderRadius: 5, marginHorizontal:10
	},
});