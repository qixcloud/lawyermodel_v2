import React, { Component } from 'react';
import { StyleSheet, Text, View, AsyncStorage , TouchableOpacity, TextInput, Dimensions, Image, Alert, Linking } from 'react-native';
import ScalableImage from 'react-native-scalable-image';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
// import 
export default class step1 extends Component {
constructor(props) {
  super(props);
  this.state = {
      token: global.twilioToken,
  }          
}

componentDidMount() {
  messaging().onMessage(async remoteMessage => {
    var title = remoteMessage.notification.title;
    if(title == "Great News!" || title == "¡Buenas noticias!"){
      this.props.nextstep(5);
    }
  });
}

nextstep = () => {
      this.props.nextstep(2);
}
render() {
  return (
    <>
    <View>
      <ScalableImage source={require('../images/steps/activation_image.png')} width={Dimensions.get('window').width * 0.8} />		
    </View>
        <Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 20, marginTop: 10, letterSpacing: 5}}>{this.props.translate("account").toUpperCase()}</Text>	
        <Text style={{fontFamily: 'Quicksand-Regular',fontWeight: 'bold', fontSize: 20, marginBottom: 10, letterSpacing: 5}}>{this.props.translate("activation").toUpperCase()}</Text>	        
        <Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("activation_content1")}</Text>	
        <Text style={{fontFamily: 'Quicksand-Regular',paddingVertical: 3, letterSpacing: 2}}>{this.props.translate("activation_content2")}</Text>	
    <View>
      <TouchableOpacity onPress={() => this.props.gotoChat()}>
        <ScalableImage source={require('../images/steps/chat_button.png')} width={150} />
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
