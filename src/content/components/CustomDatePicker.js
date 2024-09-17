import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, Linking, TextInput, Dimensions, Image, Button, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
// import 
export default class CustomDatePicker extends Component {
	constructor(props) {
		super(props);
		this.state = {
			show: false,
            placeholder: this.props.placeholder
		}
	}

    componentDidMount = () => {
        if(this.props.date != "" && this.props.date != undefined){
            let pDate = this.props.date.split("-");
            //this.setState({placeholder: this.props.date});
            this.setState({placeholder: pDate[1]+"/"+pDate[2] +"/"+pDate[0]});
        }
	}
    onChange = (event, selectedDate) => {
        let date = new Date(selectedDate);
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        console.log(m+"/"+d+"/"+y);
        this.setState({placeholder: m+"/"+d+"/"+y});
        this.setState({show: false});
        this.props.onDateChange(y+"-"+m+"-"+d);
        console.log(selectedDate);
    }
	render() {

		return (
			<>
            <TouchableOpacity onPress={() => this.setState({show: true})}>
            <Text style={styles.input}>{this.state.placeholder}</Text>
            </TouchableOpacity>
            {this.state.show && (
                <DateTimePicker
                    value={new Date()}
                    mode="date"
                    is24Hour={true}
                    onChange={this.onChange}
                    />
            )}
			</>
		);
	}
}

const styles = StyleSheet.create({
	input:{
        color: '#000',
        backgroundColor: '#fff',
        padding: 5,
        borderRadius: 5,
        marginBottom: 10
    }
});