import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, KeyboardAvoidingView } from 'react-native';
import SignUpSteps from './SignUpSteps';
import axios from 'axios';
// import 
export default class Information extends Component {
	constructor(props) {
		super(props);
		this.state = {
			login: 0,
			back: 0,
		}
    }
    
	submitData = () => {
		//this.setState({ settings: 1 });  
	}
	render() {
		const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 0;

		return (
			<>
			{this.state.back === 1 ? (
				<SignUpSteps />
			) : (<></>)}
				{this.state.back === 0 ? (
					<ScrollView style={styles.container}>						
						<TouchableOpacity onPress={() => this.setState({ back: 1 })}  style={{flexDirection: 'row',justifyContent: "center", alignItems: "center", marginBottom: 15 }}>
							<View style={{paddingTop: 25, width: '70%' }}>
								<Text style={{ fontSize: 25, color: '#afbec5'}}>Information</Text>
							</View>							
							<View style={{paddingTop: 20, textAlign: 'right' }}>
								<Image source={global.logo} style={{ width: 50, height:50 }} />
							</View>										
						</TouchableOpacity>	
                        <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset} style={{justifyContent: "center", alignItems: "center" }}>
                            <View style={{width: Dimensions.get('window').width * 0.8, padding: 15, borderRadius: 5, backgroundColor: '#eee', shadowColor: '#000',borderWidth: 1,borderColor: '#ddd'}}>
                                <View style={{ paddingTop: 10 }}>
                                    <Text style={{ fontSize: 25, color: '#555', marginBottom: 10}}>{global.name}</Text>
                                    <TextInput onChangeText={(text) => this.setState({ inputName: text })} style={styles.input} placeholder="Date of Incident" placeholderTextcolor="grey"></TextInput>
                                    <Text style={{ fontSize: 11, color: 'red', padding: 5 }}>{this.state.errorName}</Text>                                       
                                    <TextInput onChangeText={(text) => this.setState({ inputEmail: text })} multiline numberOfLines={4} style={styles.inputmultiple} placeholder="Please describe how the incident happened..." placeholderTextcolor="grey"></TextInput>
                                    <Text style={{ fontSize: 11, color: 'red', padding: 5 }}>{this.state.errorEmail}</Text>                                   
                                </View>
								<TouchableOpacity onPress={() => this.submitData()} style={styles.button}>
									<Text style={{ textAlign: 'center', fontSize: 20, color: '#fff' }}>Submit</Text>
								</TouchableOpacity>
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
			  paddingTop: 50,
			},
		}),
	},
	title: {
		alignItems: "center",
		...Platform.select({
			ios: {
				marginTop: 50,
			},
			android: {
				marginTop: 10,
			},
			default: {
				marginTop: 10,
			},
		}),
	},
	input: {
		height: 40, borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10,
	},
	inputmultiple: {
		borderRadius: 5, borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10,		
		...Platform.select({
			ios: {
				height: 160,
			},
			android: {
				height: 160,
			},
			default: {
				height: 160,
			},
		}),
	},
	button: {
		backgroundColor: '#599cdd',padding: 10, borderRadius: 5
	},
});
