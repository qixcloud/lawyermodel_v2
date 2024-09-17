import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Dimensions, Image, KeyboardAvoidingView, Linking, Alert, ScrollView, SafeAreaView, ImageBackground } from 'react-native';
import * as Progress from 'react-native-progress';
import axios from 'axios';
import SearchInput, { createFilter } from 'react-native-search-filter';
// import 
const KEYS_TO_FILTERS = ['label'];

export default class CallSetTarget extends Component {
    constructor(props) {
		super(props);
		this.state = {
			clientUsers:[],
            viewSearchList: 0,
            searchTerm: "",
            selectedUser: 0,
            clientPhoneNumber: "",
            userHasApp: 0,
            selectedPhone: ""
		}
	}
	componentDidMount = async () =>{
		this.getChatUserListForStaff();
	}
    
	getChatUserListForStaff = () => {		
		const params = new FormData();			
		params.append('method', "chatUserListForStaff");  
		params.append('staffId', global.staffId); 
		axios({
		  method: 'post',
          headers: {
            'Content-Type': 'multipart/form-data'
          },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
			console.log("Items", res.data);
			this.setState({"clientUsers": res.data.users})
		});
	}
	selectHandler = (item, label, app, phone) => {
		console.log('app', app);
		this.setState({ userHasApp: app })
		this.setState({ selectedUser: item });
		this.setState({ selectedUserLabel: label });
		this.setState({ userHasApp: app });
		this.setState({ selectedPhone: phone });
		this.setState({ viewSearchList: 0 });
        this.setState({ clientPhoneNumber: "" });
	}
	searchUpdated = (term) => {
		this.viewSearchList();
		this.setState({ searchTerm: term })
		this.setState({ selectedUserLabel: term })
	}
	viewSearchList = () => {
		this.setState({ viewSearchList: 1 })
	}
    startCall = () => {
        if(this.state.clientPhoneNumber == "" && this.state.selectedUser > 0){
            console.log('this.state.userHasApp' , this.state.userHasApp);
            this.props.startEndCall(this.state.selectedUser, this.state.selectedPhone, this.state.userHasApp);
        }else if(this.state.clientPhoneNumber != ""){
            const params = new FormData();			
            params.append('phone', this.state.clientPhoneNumber); 
            params.append('from', 'app'); 
            axios({
              method: 'post',
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              url: global.baseUrl+'wp-admin/admin-ajax.php?action=addNewConversation',
              data: params
            }).then(res => {
                //console.log("Items", res.data);
                this.props.startEndCall(0, res.data.phone, res.data.app);
            });
        }
    }
    render() {
        const keyboardVerticalOffset = Platform.OS === 'ios' ? -180 : -180;
        const filteredClients = this.state.clientUsers.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
        return (
            <ScrollView style={styles.container}>
            <View style={{flexDirection: 'row', alignItems: 'center',marginTop: 100}}>
                <Text>+1</Text><TextInput onChangeText={(text) => this.setState({ clientPhoneNumber: text })} style={{minWidth: 150, marginTop: 1}} placeholderTextColor="#555" placeholder="" keyboardType={'numeric'} ></TextInput>
            </View>
            <KeyboardAvoidingView behavior='position' keyboardVerticalOffset={keyboardVerticalOffset}>
                <TextInput 
                    onChangeText={(term) => { this.searchUpdated(term) }} 
                    style={styles.searchInput}
                    placeholder={this.props.translate("selectClient") + '...'}
                    value={this.state.selectedUserLabel}
                    onFocus={() => this.viewSearchList()}
                    // onBlur={() => { this.hideSearchList() }} 
                />
                <ScrollView style={{flex: 1, maxHeight: 200}}>
                    {filteredClients.map(client => {
                        return (
                            <>
                            {this.state.viewSearchList ? (
                                <TouchableOpacity key={client.value} onPress={()=>this.selectHandler(client.value, client.label, client.app, client.phone)} style={styles.clientItem}>
                                    <View>
                                    <Text>{client.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            ):(<></>)}
                            </>
                        )
                    })}
                </ScrollView>
            </KeyboardAvoidingView>
            <TouchableOpacity  onPress={() => this.startCall()} style={{alignItems: 'center'}}>
                <Text style={{fontSize: 20, color: 'blue'}}>Call</Text>
            </TouchableOpacity>
        </ScrollView>
        )
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
        paddingHorizontal: 15,
		paddingBottom: 20
	},
	clientItem:{
	  borderBottomWidth: 0.5,
	  borderColor: 'rgba(0,0,0,0.3)',
	  padding: 10
	}
});