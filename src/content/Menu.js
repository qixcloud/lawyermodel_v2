import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Image, KeyboardAvoidingView, Linking, Alert } from 'react-native';
import { Avatar, Badge, Icon, withBadge } from 'react-native-elements'
import Dashboard from './Dashboard';
import DeviceInfo from 'react-native-device-info';
let uniqueId = DeviceInfo.getUniqueId();
// import 
export default class Menu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			badgeCount: this.props.Badge,
			badgeInboxCount: this.props.badgeInbox
		}	
	}
	gotoMenu = (select) => {
		this.props.gotoMenuItem(select);
	}
	render() {
		const keyboardVerticalOffset = Platform.OS === 'ios' ? 40 : 5;
		const supportedURL = global.baseUrl;
		return (
			<>		
				<ScrollView style={{padding: 20, backgroundColor: '#152030'}}>
					<View style={{flexDirection: 'row',justifyContent: 'flex-start', alignItems: "center", marginBottom: 20, width: '100%' }}>	
						<Text allowFontScaling={false} style={{textAlign: 'left',fontFamily: 'Quicksand-Regular',fontSize: 30, fontWeight: 'bold', marginVertical: 10, color: '#d8941c', width: '85%'}}>{this.props.translate("menu")}</Text>						
                        <TouchableOpacity onPress={() => this.props.changeDisplay(0)}>
                            <Image  source={require('./images/close.png')} style={{ width: 25, height:25, marginHorizontal: 10 }} />
                        </TouchableOpacity>
					</View>
					<TouchableOpacity onPress={() => this.gotoMenu(1)} style={styles.menuWrap}>
						<Text style={styles.menuItem}>{this.props.translate("appointments")}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(2)} style={styles.menuWrap}>
						<View style={{ flexDirection: 'row'}}>
							<Text style={styles.menuItem}>{this.props.translate("chatwithsupport")}</Text>						
							{this.state.badgeCount > 0 && (
								<Badge value={this.state.badgeCount} status="error" left={5} top={5}/>
							)}
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(3)} style={styles.menuWrap}>
						<Text style={styles.menuItem}>{this.props.translate("glossary")}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(4)} style={styles.menuWrap}>
						<Text style={styles.menuItem}>{this.props.translate("questions")}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(5)} style={styles.menuWrap}>
						<View style={{ flexDirection: 'row'}}>
							<Text style={styles.menuItem}>{this.props.translate("inbox")}</Text>							
							{this.state.badgeInboxCount > 0 && (
								<Badge value={this.state.badgeInboxCount} status="error" left={5} top={5}/>
							)}
						</View>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(6)} style={styles.menuWrap}>
						<Text style={styles.menuItem}>{this.props.translate("account")}</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => this.gotoMenu(7)}  style={{flexDirection: 'row', justifyContent: "center", alignItems:"center", width: 150, backgroundColor: "#fff", marginBottom: 10, paddingVertical:10, borderRadius: 10}}>
                        <Text style={{ fontFamily: 'Quicksand-Regular',fontSize: 15, color: '#333', textAlign: 'center', width: 90}}>{this.props.translate("likeUsClickHere")}</Text>
                        <Image source={require('./images/28like.png')} style={{ width: 34, height:34, marginLeft:5, marginTop: -5 }} />
					</TouchableOpacity>
                </ScrollView>	
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
		width: "90%",
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
		fontFamily: 'Quicksand-Regular',height: 40, borderRadius: 5, color: '#000', borderColor: 'grey', backgroundColor: '#fff', fontSize: 12, paddingLeft: 10,marginBottom: 10
	},	
	menuWrap: {
		fontFamily: 'Quicksand-Regular', marginBottom: 20
	},	
	menuItem: {
		fontFamily: 'Quicksand-Regular',textAlign: 'left', fontSize: 20, color: '#fff'
	},
	cancelButton: {
		fontFamily: 'Quicksand-Regular',backgroundColor: '#599cdd',paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5, marginHorizontal: 10, marginTop: 10
	},
});
