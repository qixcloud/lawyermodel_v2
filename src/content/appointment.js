import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
//import LinearGradient from 'react-native-linear-gradient';
import Contact from './Contact';
//import { thisExpression } from '@babel/types';
import axios from 'axios';
const styles = StyleSheet.create({

});
export default class Appointment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 1,
            laps: [],
            phone: global.phone,
        }
    }
    changestatus = (num) => {
        if (num) {
            this.setState({ status: num });
        }

    }
    UNSAFE_componentWillMount() {
        const params = new FormData();
        params.append('method', 'companyList');
        params.append('phone', this.state.phone);
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
                laps: res.data.lobbies,
            });
        });
    }
    changeTab = () => {
        this.props.changestatus(1);
    }
    bookButton = (num) => {
        if (num === 1) {
            return (
                <TouchableOpacity onPress={this.changeTab}>
                    <Text style={{ fontSize: 12, color: '#2aa4ff' }}>Book</Text>
                </TouchableOpacity>
            )
        } else {
            return (
                <Text style={{ fontSize: 12, color: 'grey' }}>Book</Text>
            )
        }
    }
    lapsList = () => {
        return this.state.laps.map((data) => {
            return (
                <View style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <View style={{ flex: 1, display: "flex", flexDirection: "row", justifyContent: "center", height: 80 }}>
                        <View style={{ flex: 1, justifyContent: "space-between", marginTop: 10, marginBottom: 10, marginLeft: 20, marginRight: 20, borderWidth: 1, borderRadius: 5, padding: 15, borderColor: '#ccc' }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={{ fontSize: 12 }}>{data.cName}</Text>
                                {this.bookButton(data.available)}
                            </View>
                            <Text style={{ fontSize: 10, color: data.color }}>{data.availableTxt}</Text>
                        </View>
                    </View>
                </View>
            )
        })

    }
    render() {
        console.log(this.state);
        return (
            <ScrollView style={{ flex: 1, backgroundColor: "#eeeeee" }}>
                {this.state.status === 1 ? (
                    <>
                        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                <View style={{ flex: 1, justifyContent: "space-between", margin: 10, borderRadius: 20, padding: 10 }}>
                                    <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                                        <TouchableOpacity onPress={() => this.props.changestatus(1)}>
                                        </TouchableOpacity>
                                        <Text style={{ fontFamily: 'Quicksand-Regular', fontSize: 18 }}>Add Appointment</Text>

                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                                <View style={{ flex: 1, justifyContent: "space-between", margin: 15, borderRadius: 20, padding: 10 }}>
                                    <View>
                                        <Text style={{ fontFamily: 'Quicksand-Regular', fontSize: 20, fontWeight: "bold" }}>Need an Appointment?</Text>
                                        <Text style={{ fontFamily: 'Quicksand-Regular', fontSize: 12 }}>here you can book an appointment from your linked companies</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        {this.lapsList()}
                    </>
                ) : (<Text />)}
                {this.state.status === 2 ? (
                    <Contact changestatus={this.changestatus} />
                ) : (<Text />)}
            </ScrollView>
        );
    }
}
