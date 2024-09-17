import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import Contact from './Contact';
import Appointment from './appointment';
import { thisExpression } from '@babel/types';
import axios from 'axios';
const styles = StyleSheet.create({});
export default class Home extends Component {
	constructor(props) {
		super(props);
		this.state = {
			status: 1,
			Upcoming: '',
			Events: '',
			Completed: '',
			ComingUp: '',
			onTime: '',
			added: '',
			phone: global.phone,
		}
		var weeks = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

		this.week = weeks[new Date().getDay()];
		this.month = months[new Date().getMonth()];
	}

	UNSAFE_componentWillMount() {
		const params = new FormData();
		params.append('method', 'homeData');
		axios({
			method: 'post',
			headers: {
			  'Content-Type': 'multipart/form-data'
			},
			url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
			data: params
		}).then(res => {
			console.log(res);
			this.setState({
				Upcoming: res.data.data.Upcoming,
				Events: res.data.data.Events,
				Completed: res.data.data.Completed,
				ComingUp: res.data.data.ComingUp,
				onTime: res.data.data.onTime,
				added: res.data.data.added
			});
		});
	}
	changestatus = (num) => {
		if (num) {
			this.setState({ status: num });
		}
	}
	render() {
		return (
			<ScrollView style={{ flex: 1, backgroundColor: "#eeeeee" }}>
				{this.state.status === 1 ? (
					<>
						<View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
								<View style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Text style={{ fontSize: 20 }}>{this.week} {this.month}{new Date().getDate()}</Text>
										<TouchableOpacity onPress={() => this.changestatus(2)}>
											<Icon name="ellipsis-h" type="font-awesome" size={20} color={'grey'} />
										</TouchableOpacity>

									</View>
									<View><Text style={{ fontSize: 12 }}>{new Date().getHours()}:{new Date().getMinutes()}</Text></View>
								</View>
							</View>
						</View>
						<View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
								<View style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View>
										<Text style={{ fontSize: 20, fontWeight: "bold" }}>Hello {global.name},</Text>
										<Text style={{ fontSize: 20 }}>Your Dashboard</Text>
									</View>
								</View>
							</View>
						</View>
						<View style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
							<View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", height: 130 }}>
								<LinearGradient colors={['#9bbecf', '#5dbff0', '#5dbff0']} style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									{/* <View style={{ backgroundImage: "linear-gradient(#f00, #0f0);", flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}> */}
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Icon name="user" type="font-awesome" color={'white'} size={20} /><Icon name="ellipsis-h" type="font-awesome" color={'white'} size={20} /></View>
									<View>
										<Text style={{ fontSize: 16, color: "#fff" }}>{this.state.Upcoming}</Text>
										<Text style={{ fontSize: 10, color: "#fff" }}>Upcoming appointments</Text>
									</View>
									{/* </View> */}
								</LinearGradient>
								<LinearGradient colors={['#a2aeb4', '#7d8386', '#555555']} style={{ backgroundColor: "green", flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
										<TouchableOpacity onPress={() => this.changestatus(3)}>
											<Icon name="plus-circle" type="font-awesome" color={'white'} size={20} />
										</TouchableOpacity>
										<Icon name="ellipsis-h" type="font-awesome" color={'white'} size={20} />
									</View>
									<View>
										<Text style={{ fontSize: 16, color: "#fff" }}>{this.state.Events}</Text>
										<Text style={{ fontSize: 10, color: "#fff" }}>Events this week</Text>
									</View>
								</LinearGradient>
							</View>
							<View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", height: 130 }}>
								<View style={{ backgroundColor: "#fff", flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Icon name="check-circle" type="font-awesome" size={20} /><Icon name="ellipsis-h" type="font-awesome" size={20} color={'grey'} /></View>
									<View>
										<Text style={{ fontSize: 16 }}>{this.state.Completed}</Text>
										<Text style={{ fontSize: 10 }}>Completed Appointments</Text>
									</View>
								</View>
								<View style={{ backgroundColor: "#fff", flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Icon name="hourglass" type="font-awesome" size={20} /><Icon name="ellipsis-h" type="font-awesome" size={20} color={'grey'} /></View>
									<View>
										<Text style={{ fontSize: 16 }}>{this.state.ComingUp}</Text>
										<Text style={{ fontSize: 10 }}>coming up Location</Text>
									</View>
								</View>
							</View>
							<View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", height: 130 }}>
								<LinearGradient colors={['#99bbb3', '#5bb585', '#5bb585']} style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Icon name="user" type="font-awesome" color={'white'} size={20} /><Icon name="ellipsis-h" type="font-awesome" color={'white'} size={20} /></View>
									<View>
										<Text style={{ fontSize: 16, color: "#fff" }}>{this.state.onTime}</Text>
										<Text style={{ fontSize: 10, color: "#fff" }}>Appointments On-time</Text>
									</View>
								</LinearGradient>
								<LinearGradient colors={['#a2aeb4', '#7d8386', '#555555']} style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
									<View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}><Icon name="plus-circle" type="font-awesome" color={'white'} size={20} /><Icon name="ellipsis-h" type="font-awesome" color={'white'} size={20} /></View>
									<View>
										<Text style={{ fontSize: 16, color: "#fff" }}>{this.state.added}</Text>
										<Text style={{ fontSize: 10, color: "#fff" }}>Businesses added</Text>
									</View>
								</LinearGradient>
							</View>
						</View>
					</>
				) : (<Text />)}
				{this.state.status === 2 ? (
					<Contact changestatus={this.changestatus} />
				) : (<Text />)}
				{this.state.status === 3 ? (
					<Appointment changestatus={this.changestatus}/>
				):(<></>)}
			</ScrollView>
		);
	}
}
