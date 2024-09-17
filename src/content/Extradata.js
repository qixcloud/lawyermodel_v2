import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, KeyboardAvoidingView, Alert } from 'react-native';
import SignUpSteps from './SignUpSteps';
import axios from 'axios';
import CustomDatePicker from './components/CustomDatePicker';
//import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import {Picker} from '@react-native-picker/picker';
// import 
export default class Extradata extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
            back: 0,
            inputName: "",
			phone: "",
			birthday: "",
            incident: "",
            dismissal: "",
			isChecked: false,
			errorTxt: "",
        }
        console.log(global.contactId);
    }
    componentDidMount = () => {
	}
	submitData = () => {
		this.setState({errorTxt: ""});
		if(this.state.email == ""){
			this.setState({errorTxt: "Please input email."});
			Alert.alert("Please input email.");
		}else if(this.state.phone == ""){
			this.setState({errorTxt: "Please input phone number."});
			Alert.alert("Please input phone number.");
		}else{
			console.log(global.contactId);
			const params = new FormData();
			params.append('method', 'save_extra_data');
			params.append('contact_id', global.contactId);
			params.append('name', this.state.inputName);
			params.append('dismissal', this.state.dismissal);
			params.append('incident', this.state.incident);
			params.append('phone', this.state.phone);
			params.append('birthday', this.state.birthday);
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
				global.name = this.state.inputName;
				global.phone = this.state.phone;
				global.email = this.state.email;
				Alert.alert("Saved!");
				this.gotoback();
			  }
			});			
		}
	}
	gotoback = () =>{
		if(global.phone != "" ){
            this.props.changeSocial(0);
            this.setState({ back: 1 });	
        }
	}
	render() {
		const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

		return (
			<>
			{this.state.back == 1 ? (
				<SignUpSteps settings = {0} />
			) : (<></>)}
				{this.state.back === 0 ? (
					<ScrollView style={styles.container}>						
						<TouchableOpacity style={{flexDirection: 'row',justifyContent: "center", alignItems: "center" }}>
							<View style={{paddingTop: 25, width: '70%' }}>
								<Text style={{ fontSize: 25, color: '#afbec5'}}>{this.props.translate("extraData")}</Text>
							</View>							
							<View style={{paddingTop: 20, textAlign: 'right' }}>
								<Image source={global.logo} style={{ width: 50, height:50 }} />
							</View>										
						</TouchableOpacity>						
						<View style={styles.title}>
                            <Text style={{ fontSize: 25, color: '#555', marginBottom: 0}}>{global.name}</Text>
						</View>
                        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset-70} style={{justifyContent: "center", alignItems: "center" }}>
                            <View style={{width: Dimensions.get('window').width * 0.8, padding: 15, borderRadius: 5, backgroundColor: '#eee', shadowColor: '#000',borderWidth: 1,borderColor: '#ddd'}}>
                                <View style={{ paddingTop: 10 }}>
                                <TextInput onChangeText={(text) => this.setState({ inputName: text })} style={styles.input} placeholder={this.props.translate("name")} placeholderTextColor="#555" ></TextInput>
                                <TextInput onChangeText={(text) => this.setState({ phone: text })} style={styles.input} placeholder={this.props.translate("phone")} placeholderTextColor="#555" defaultValue={this.state.phone}></TextInput>  
								 
								<CustomDatePicker date={this.state.birthday} placeholder={this.props.translate("birthday")} onDateChange={(date) => {this.setState({birthday: date})}} />
								<View style={{backgroundColor: '#fff', marginBottom: 10, borderRadius: 5, padding: 5}}>
                                {/* <RNPickerSelect
                                    placeholder={{
                                        label: this.props.translate("selectInjuryType")+'...',
                                        value: '',
                                    }}
                                    onValueChange={(value) => this.setState({ dismissal: value })}
                                    items={[
										{ label: this.props.translate("injuredAtWork"), value: 'Injured at Work' },
										{ label: this.props.translate("injuredOutsideWork"), value: 'Injured outside Work' },
										{ label: this.props.translate("vehicleAccident"), value: 'Vehicle Accident' },
										{ label: this.props.translate("unfairDismissal"), value: 'Unfair Dismissal' },
                                    ]} style={pickerStyle} 
                                /> */}
								
									<Picker
										// selectedValue={selectedLanguage}
										onValueChange={(value) => this.setState({ dismissal: value })}>
										<Picker.Item label={this.props.translate("injuredAtWork")} value="Injured at Work" />
										<Picker.Item label={this.props.translate("injuredOutsideWork")} value="Injured outside Work" />
										<Picker.Item label={this.props.translate("vehicleAccident")} value="Vehicle Accident" />
										<Picker.Item label={this.props.translate("unfairDismissal")} value="Unfair Dismissal" />
									</Picker>
								</View>
								<DatePicker
									style={styles.inputdate}
									date={this.state.incident}
									mode="date"
									placeholder={this.props.translate("incidentDate")}
									format="MM/DD/YYYY"
									confirmBtnText={this.props.translate("confirm")}
									cancelBtnText={this.props.translate("cancel")}
									customStyles={{
									dateIcon: {
										position: 'absolute',
										right: 0,
										top: 2,
										marginRight: 0,
										height: 25
									},
									dateInput: {
										position: 'absolute',
										left: 0,
										borderWidth: 0,
										textAlign: 'left',
										alignItems: 'flex-start',
										height: 25,
										top: 3
									}
									}}
									onDateChange={(date) => {this.setState({incident: date})}}
								/> 
                                </View>
								{this.state.incident != "" && this.state.dismissal != "" && this.state.birthday != "" && this.state.phone != "" && this.state.inputName != "" ? (
									<TouchableOpacity onPress={() => this.submitData()} style={styles.button}>
										<Text style={{ textAlign: 'center', fontSize: 20, color: '#fff' }}>{this.props.translate("save")}</Text>
									</TouchableOpacity>
								): (
									<TouchableOpacity style={styles.prebutton}>
										<Text style={{ textAlign: 'center', fontSize: 20, color: '#fff' }}>{this.props.translate("save")}</Text>
									</TouchableOpacity>
								)}
                                </View>
                            </KeyboardAvoidingView>
					</ScrollView>
				) : (<></>)}

			</>
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
		color: "#000", height: 35, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 5, marginBottom: 10
	},
	inputdate: {
		color: "#000",height: 30, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', paddingLeft: 5,marginBottom: 10, width: '100%'
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
	prebutton: {
		backgroundColor: 'grey',padding: 10, borderRadius: 5
	},
	button: {
		backgroundColor: '#599cdd',padding: 10, borderRadius: 5
	},
});

const pickerStyle = StyleSheet.create({
	inputIOS: {
		color: "#000", fontFamily: 'Quicksand-Regular', height: 30, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10,marginBottom: 10
	},
	inputAndroid: {
		color: "#000", fontFamily: 'Quicksand-Regular', height: 30, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10
	}
  });