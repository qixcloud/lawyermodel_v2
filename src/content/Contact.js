import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, Button } from 'react-native';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import axios from 'axios';

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: 'lightgrey',
        padding: 8,
        //color: 'white',
        borderRadius: 5,
        fontSize: 18,
        fontWeight: '500',
    }

});
export default class Contact extends Component {
    constructor(props) {
        super(props);
        this.state = {
            contactId: global.contactId,
            name: global.name,
            phone: global.phone,
            email: global.email,
            errorTxt: "",
        }
    }

    static navigationOptions = {
        //To hide the NavigationBar from current Screen
        title: 'Details',
    };
    changeTab = () => {
        this.props.changestatus(1);
    }
    onChangeText = (key, val) => {
        this.setState({ [key]: val })
    }
    saveContactInfo = () => {
        this.setState({ errorTxt: "" });
        if (this.state.inputPhone === "") {
            this.setState({ errorTxt: "* Please input phone number." });
        } else {
            const params = new FormData();
            params.append('method', 'update');
            params.append('contact_id', this.state.contactId);
            params.append('phone', this.state.phone);
            params.append('name', this.state.name);
            params.append('email', this.state.email);
            axios({
                method: 'post',
                headers: {
                  'Content-Type': 'multipart/form-data'
                },
                url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
                data: params
            }).then(res => {
                console.log(res);
                if (res.data.status == "success") {
                    this.setState({ errorTxt: "* Saved!" });
                    global.phone = this.state.phone;
                    global.name = this.state.name;
                    global.email = this.state.email;
                }else{
                    this.setState({ errorTxt: "* Failed." });
                }
            });
        }
    }
    render() {
        console.log(this.state);
        return (
            <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
                <View style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <View style={{ flexDirection: 'row', width: '100%', backgroundColor: '#eeeeee', height: 50, alignItems: 'center' }}>
                        <TouchableOpacity onPress={this.changeTab} style={{ width: '30%' }}>
                            <Icon name="arrow-left" type="font-awesome" color={'grey'} size={15} />
                        </TouchableOpacity>
                        <Text style={{ width: '40%', textAlign: 'center', color: '#1d80ac', fontWeight: 'bold', fontSize: 18 }}>Account</Text>
                        <TouchableOpacity style={{ width: '30%' }}>
                            {/* <Icon  name="plus-circle" type="font-awesome" color={'#76c2db'} size={20}/> */}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: 20 }}>
                    <View>
                        <View style={{ paddingTop: 20, paddingBottom: 20 }}>
                            <Image source={require('./profile.png')} />
                        </View>
                        <Text style={{ fontSize: 20 }}>Conact ID: {this.state.contactId}</Text>
                        <Text style={{ fontSize: 11 }}>This is the information that companies will have access to</Text>
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ fontSize: 11 }}>Account Name</Text>
                            <TextInput
                                style={styles.input}
                                autoCapitalize="none"
                                onChangeText={val => this.onChangeText('name', val)}
                                value={this.state.name}
                            />
                        </View>
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 11 }}>Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            onChangeText={val => this.onChangeText('phone', val)}
                            value={this.state.phone}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 11 }}>Email</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            onChangeText={val => this.onChangeText('email', val)}
                            value={this.state.email}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 11 }}>Emergency Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            autoCapitalize="none"
                            onChangeText={val => this.onChangeText('emergencyPhone', val)}
                        />
                    </View>
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ fontSize: 11 }}>{this.state.errorTxt}</Text>
                        <Button onPress={() => this.saveContactInfo()}
                            color="#324b5f"
                            title="Save"
                        />
                    </View>
                </View>
            </ScrollView >
        );
    }
}

