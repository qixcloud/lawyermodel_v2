import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Dimensions, Image, Button, CheckBox } from 'react-native';
import axios from 'axios';
// import 
export default class step3 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			files: "",
			stepNum: this.props.maxStep
		}
		const params = new FormData();
		params.append('method', 'check_upload');
		params.append('contact_id', global.contactId);
		
		axios({
		  method: 'post',
		  headers: {
			'Content-Type': 'multipart/form-data'
		  },
		  url: global.baseUrl+'wp-admin/admin-ajax.php?action=contact_api',
		  data: params
		}).then(res => {
		  if (res.data.check_upload == "success") {
			console.log(res.data.files);
			this.props.updatefiles(res.data.files);
			this.props.updatestep(4);
			this.setState({stepNum: 4});
		  }
		});
	}

	gotoUpload = () => {
        this.props.gotoUpload();
	}
	nextstep = () => {
        this.props.nextstep(4);
	}
	render() {

		return (
			<>
			<View>
			  <Image source={require('../images/steps/step3_top.png')} style={{width: Dimensions.get('window').width* 0.8, height: Dimensions.get('window').width* 0.4}} />		
			</View>	
			<Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 30, marginTop: 15, letterSpacing: 5}}>{this.props.translate("upload").toUpperCase()}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 30, marginBottom: 10, letterSpacing: 5}}>{this.props.translate("documents").toUpperCase()}</Text>	        
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("uploadRequire")}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("documentsTo")}</Text>	
			<Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2, fontWeight: 'bold'}}>{global.title}</Text>	
			<View style={styles.barCells}>
				<Text style={this.props.maxStep > 1 ? styles.barCellCompleted : styles.barCellPending}  onPress={() => this.props.selectstep(1)}>1</Text>		
				<Text style={styles.barCell}></Text>	
				<Text style={this.props.maxStep > 2 ? styles.barCellCompleted : this.props.maxStep == 2 ? styles.barCellPending: styles.barCell} onPress={() => this.props.selectstep(2)}>2</Text>
				<Text style={styles.barCell}></Text>						
				<Text style={this.props.maxStep > 3 ? styles.barCellCompleted : this.props.maxStep == 3 ? styles.barCellPending: styles.barCell}  onPress={() => this.props.selectstep(3)}>3</Text>
				<Text style={styles.barCell}></Text>						
				<Text style={this.props.maxStep > 4 ? styles.barCellCompleted : this.props.maxStep == 4 ? styles.barCellPending: styles.barCell}  onPress={() => this.props.selectstep(4)}>4</Text>
				{/* <TouchableOpacity style={styles.barCell3}  onPress={() => this.props.selectstep(5)}><Text>1</Text></TouchableOpacity>	 */}
			</View>
			<View>
			<TouchableOpacity onPress={() => this.gotoUpload()}>
				<Image source={require('../images/steps/step3_btn.png')} style={{width: 150, height: 40}} />	
			</TouchableOpacity>
			</View>
			</>
		);
	}
}

const styles = StyleSheet.create({
	bar: {
		width: 330, height: 50, marginTop: 20
    },
    barCells:{
        flexDirection: 'row', width: 330, marginTop: 10, marginBottom: 20, justifyContent: 'center'
    },
    barCell: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: '#555', fontWeight: 'bold'
    },
    barCellPending: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: '#fbb225', fontWeight: 'bold'
    },
    barCellCompleted: {
		fontFamily: 'Quicksand-Regular',padding: 8, fontSize: 20, color: 'green', fontWeight: 'bold'
    },
	barCell1: {
		paddingTop: 20, textAlign: 'left', width: '12%', height: 50
	},
	barCell2: {
		paddingTop: 20, textAlign: 'center', width: '25%', height: 50
	},
	barCell3: {
		paddingTop: 20, textAlign: 'right', width: '12%', height: 50
	},
	button: {
		width: 100, backgroundColor: '#599cdd',paddingVertical: 5, paddingHorizontal:10, borderRadius: 5, marginRight:10, marginTop: 10
	}
});