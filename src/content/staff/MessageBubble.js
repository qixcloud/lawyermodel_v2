import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, ScrollView, View, Dimensions, Image} from 'react-native';
import ScalableImage from 'react-native-scalable-image';

export default class MessageBubble extends Component {
	constructor(props) {
		super(props);
		this.state = {
			answerStyle1: styles.answer,
			answerStyle2: styles.answer,
			answerValue: 0,
            shared: 0,
            referral_phone: "",
            imageLoading: styles.imageShow,
            imageMsg: styles.imageHide
		}
  }
  componentDidMount = () => {
    var text = this.props.text.trim();
    if(text.indexOf('Survey-') > -1)
    {
      var msgs = text.split('Survey-');
      if(msgs.length > 1){
        var tmp = msgs[1].trim().split('\n');
        var objSurvey = JSON.parse(tmp[0]);
        if(objSurvey.response == 1)this.setState({answerStyle1: styles.selectedAnswer});
        if(objSurvey.response == 2)this.setState({answerStyle2: styles.selectedAnswer});
        if(objSurvey.response > 0)this.setState({answerValue: objSurvey.response});
      }
    }
    if(text.indexOf('Referral-') > -1)
    {
      var msgs = text.split('Referral-');
      if(msgs.length > 1){
        var tmp = msgs[1].trim().split('\n');
        var objSurvey = JSON.parse(tmp[0]);
        this.setState({shared: objSurvey.phones.length});
        //this.setState({shared: 0});
      }else{
        this.setState({shared: 0});
      }
    }
  }
  surveyAnswer = (id,idx) => {    
    console.log(id);
    var answer = idx;
    var data = new FormData();
    data.append('method', 'surveyAnswer');
    data.append('contact_id', global.contactId);
    data.append('id', id);
    data.append('answer', idx);
    data.append('app_phone', global.phone);
    var path = global.baseUrl+"wp-admin/admin-ajax.php?action=contact_api";
    fetch(path,{
      header: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
      },
      method:'POST',
      body: data
    }).then((response) => response.json())
    .then((responseJson) => {
      if(answer == 1){
        this.setState({answerStyle1: styles.selectedAnswer});
        this.setState({answerStyle2: styles.answer});
      }else{
        this.setState({answerStyle2: styles.selectedAnswer});
        this.setState({answerStyle1: styles.answer});
      }
      this.setState({answerValue: answer});
      Alert.alert("Success!");
      console.log(responseJson)
    })
    .catch((error) => {
      console.error(error);
    });
  }
  referralShare = (id) =>{
    if(this.state.referral_phone != ""){
      var data = new FormData();
      data.append('method', 'referralShare');
      data.append('contact_id', global.contactId);
      data.append('id', id);
      data.append('phone', this.state.referral_phone);
      data.append('app_phone', global.phone);
      var path = global.baseUrl+"wp-admin/admin-ajax.php?action=contact_api";
      fetch(path,{
        header: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        method:'POST',
        body: data
      }).then((response) => response.json())
      .then((responseJson) => {
        this.setState({shared: 1});
        Alert.alert("Thanks!");
        console.log(responseJson)
      })
      .catch((error) => {
        console.error(error);
      });
    }
  }
  changeReferralPhone = (text) => {
    this.setState({referral_phone: text});
  }
  imgLoaded = () => {
    this.setState({imageLoading: styles.imageHide});
  }
  render() {
    var leftSpacer = this.props.direction === 'left' ? null : <View style={{width: 70}}/>;
    var rightSpacer = this.props.direction === 'left' ? <View style={{width: 70}}/> : null;
    var bubbleStyles = this.props.direction === 'left' ? [styles.messageBubble, styles.messageBubbleLeft] : [styles.messageBubble, styles.messageBubbleRight];
    var msg = this.props.text.trim();
    // var bubbleTextStyle = this.props.direction === 'left' ? styles.messageBubbleTextLeft : styles.messageBubbleTextRight;
    var bubbleTextStyleImage = styles.messageBubbleImage;
    var fileName = msg.split('\n')[0].split("/").pop();
    var survey_id = 0;var survey_name = "";var survey_question= "";var survey_a1 = "";var survey_a2 = "";
    var referral_id = 0; var referral_name = ""; var referral_message = ""; var referral_sms = ""; var referral_link = "";
    var messageTxt = "";
    var messageDate = "";
    var bubbleTextStyle = "";
    if(this.props.direction === 'left'){
      bubbleTextStyle = msg.indexOf('-SMS') > -1 ? styles.messageBubbleTextLeftSMS : styles.messageBubbleTextLeft;
    }else{
      bubbleTextStyle = msg.indexOf('-SMS') > -1 ? styles.messageBubbleTextRightSMS : styles.messageBubbleTextRight;
    }
    if(msg.indexOf('Survey-') > -1)
    {
      msgs = msg.split('Survey-');
      if(msgs.length > 1){
        tmp = msgs[1].trim().split('\n');
        obj = JSON.parse(tmp[0]);
        survey_id = obj.id;
        survey_name = obj.name;
        survey_question = obj.question;
        survey_a1 = obj.answer1;
        survey_a2 = obj.answer2;
      }
    }else if(msg.indexOf('Referral-') > -1 )
    {
      var msgs = msg.split('Referral-');
      if(msgs.length > 1){
        var tmp = msgs[1].trim().split('\n');
        var obj = JSON.parse(tmp[0]);
        referral_id = obj.id;
        referral_name = obj.name;
        referral_message = obj.message;
        referral_sms = obj.sms;
        referral_link = obj.link;
      }
    }else if(msg.substring(0, 4) == "http" ){

    }else{
      var tmp = this.props.text.split("\n");
      if(tmp.length > 1){
        messageTxt = tmp[0].replace("-SMS", "");
        messageDate = tmp[1];
      }else{
        messageTxt = tmp[0].replace("-SMS", "");
        messageDate = this.props.date;
      }
    }
    messageTxt = messageTxt.replace("-SMS", "").replace("-FRONT", "");
    return (
        <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
            {leftSpacer}
            <View style={bubbleStyles}>     
            {this.props.direction === 'left' && (
              <>
              {msg.indexOf('-SMS') > -1 ? (
                <Image source={require('../images/leftSMS.png')} style={{ width: 13, height:13, marginRight: -7 }} />
              ):(
                <Image source={require('../images/left.png')} style={{ width: 13, height:13, marginRight: -7 }} />
              )}
              </>
            )}         
            {msg.substring(0, 4) == "http" || msg.indexOf('/tm/') > -1 || msg.indexOf('/m/') > -1 || msg.indexOf('http://') > -1 || msg.indexOf('https://') > -1 ? (
                <>
                {/* {msg.indexOf('/tm/') > -1 || msg.indexOf('/m/') > -1 ? (      */}
                {msg.substring(0, 4) != "http" ? (     
                  <Text style={bubbleTextStyle} onPress={() => Linking.openURL(this.props.text.trim().split('\n')[1])}>
                    {this.props.text}
                  </Text>  
                ):(
                  <>
                  {msg.toLowerCase().indexOf('page=comunications&type=') > -1 ?(        
                    <Text style={bubbleTextStyle} onPress={() => Linking.openURL(this.props.text.trim().split('\n')[0])}>
                      {this.props.text}
                    </Text>                    
                  ):(
                    <>
                    {fileName.toLowerCase().indexOf('.jpeg') > -1 || fileName.toLowerCase().indexOf('.jpg') > -1 || fileName.toLowerCase().indexOf('.png')  > -1 || fileName.toLowerCase().indexOf('.bmp') > -1 ? (
                      <TouchableOpacity style={bubbleTextStyleImage} onPress={() => Linking.openURL(this.props.text.trim().split('\n')[0])}>
                      <ScalableImage onLoadEnd={(e) => this.imgLoaded()} source={{uri:this.props.text.trim().split('\n')[0]}} width={100} />
                      <View style={{alignItems: "center", width: 100}, this.state.imageLoading}>
                        <Progress.Circle size={30} indeterminate={true} />
                      </View>
                    </TouchableOpacity>
                    ):( 
                      <>
                      {fileName.toLowerCase().indexOf('.pdf') > -1 ? (
                        <TouchableOpacity style={bubbleTextStyleImage} onPress={() => Linking.openURL(this.props.text.trim().split('\n')[0])}>
                          <ScalableImage source={require('../images/file_icons/pdf.png')} width={50} />
                          <Text>{fileName}</Text>
                        </TouchableOpacity>
                      ):( 
                        <TouchableOpacity style={bubbleTextStyleImage} onPress={() => Linking.openURL(this.props.text.trim().split('\n')[0])}>
                          <ScalableImage source={require('../images/file_icons/new_document.png')} width={50} />
                          <Text>{fileName}</Text>
                        </TouchableOpacity>
                      )} 
                      </>
                    )} 
                    </>
                  )} 
                </>
                )} 
                </>
              ): (  
                <> 
                {msg.indexOf('Survey-') > -1 || msg.indexOf('Referral-') > -1 ? (
                <>  
                {msg.indexOf('Survey-') > -1 ? (
                  <View style={{backgroundColor: "white", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                  {/* <PowerTranslator text={survey_name} style={{fontSize: 20, marginBottom: 10}} />
                  <PowerTranslator text={survey_question} style={{marginBottom: 10}} /> */}
                  <Text style={{fontSize: 20, marginBottom: 10}} >{survey_name}</Text>
                  <Text style={{ marginBottom: 10}} >{survey_question}</Text>
                    {this.state.answerValue > 0 ? (
                      <View style={{alignItems: "center", padding: 10}}>
                        <ScalableImage source={require('../images/check.png')} width={30} />
                      </View>
                    ) : (
                      <>
                      <TouchableOpacity onPress={() => this.surveyAnswer(survey_id, 1)} style={this.state.answerStyle1}>
                        <Text>{survey_a1}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => this.surveyAnswer(survey_id, 2)} style={this.state.answerStyle2}>
                        <Text>{survey_a2}</Text>
                      </TouchableOpacity>
                    </>
                    )}
                  </View>               
                ):(
                  <View style={{backgroundColor: "white", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                  {/* <PowerTranslator text={referral_name} style={{fontSize: 20, marginBottom: 10}} />
                  <PowerTranslator text={referral_message} style={{marginBottom: 10}} /> */}
                  <Text style={{fontSize: 20, marginBottom: 10}} >{referral_name}</Text>
                  <Text style={{marginBottom: 10}} >{referral_message}</Text>
                    {this.state.shared > 0 ? (
                      <View style={{alignItems: "center", padding: 10}}>
                        <ScalableImage source={require('../images/check.png')} width={30} />
                      </View>
                    ) : (
                      <>
                    <TextInput onChangeText={(text) => this.changeReferralPhone(text)} defaultValue={this.state.referral_phone} keyboardType={'numeric'} style={{marginBottom: 10, borderWidth: 1, borderRadius: 5, padding: 5}} placeholder="INSERT PHONE #" placeholderTextColor="#555"></TextInput>
                    {this.state.referral_phone.length < 1 ? (
                      <View style={{backgroundColor: "#eee", alignItems: "center",marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                        <Text>Share</Text>
                      </View>
                    ):(
                      <TouchableOpacity onPress={() => this.referralShare(referral_id)} style={{backgroundColor: "#bde0fe", alignItems: "center",marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5}}>
                        <Text>Share</Text>
                      </TouchableOpacity>
                    )}
                    </>
                    )}
                  </View>  
                )}
                </>
                ) : (
                  <View style={bubbleTextStyle}>
                  {/* <PowerTranslator text={messageTxt} style={{fontSize: 16}} /> */}
                  <Text  style={{fontSize: 16}} >{messageTxt}</Text>
                  <Text style={{fontSize: 10}}>
                    {messageDate}
                  </Text>
                  </View>
                )}
                </>
              )}
              {this.props.direction === 'right' && (
              <>
              {msg.indexOf('-SMS') > -1 ? (
                <Image source={require('../images/rightSMS.png')} style={{ width: 13, height:13, marginLeft: -7 }} />
              ):(
                <Image source={require('../images/right.png')} style={{ width: 13, height:13, marginLeft: -7 }} />
              )}
              </>
              )}                
            </View>
            {rightSpacer}
          </View>
      );
    }
  }
  const styles = StyleSheet.create({

    //ChatView
  
    outer: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: 'white'
    },
  
    messages: {
        height: Dimensions.get('window').height-200,
        borderWidth: 0,
        margin: 5,
        borderColor: '#fff',
    },
  
    //InputBar
  
    inputBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      paddingVertical: 3,
      marginBottom: 50
    },
  
    textBox: {
      borderRadius: 5,
      borderWidth: 0,
      borderColor: '#ccc',
      flex: 1,
      fontSize: 16,
      marginLeft: 15,
      padding: 5,
      position: 'absolute',
      bottom: -25,
      width: Dimensions.get('window').width-90,
      paddingRight: 100,
      backgroundColor: "#fff"
    },
    txtCounter: {
      position: 'absolute',
      bottom: -20,
      right: 110
    },
    sendFile:{
      width:25,
      height:22
    },
    sendFileButton: {
      position: 'absolute',
      bottom: -20,
      right: 80,
    },
    sendButton: {
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      paddingLeft: 15,
      right: 0,
      // paddingRight: 15,
      borderRadius: 5,
      backgroundColor: 'transparent',
      position: 'absolute',
      bottom: -25
    },
  
    //MessageBubble
  
    messageBubble: {
        borderRadius: 5,
        marginTop: 8,
        marginRight: 10,
        marginLeft: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        flexDirection:'row',
        flex: 1,
        alignItems: "flex-end"
    },
  
    messageBubbleLeft: {
      
    },
    answer: {
      backgroundColor: "#eeeeee", 
      alignItems: "center",
      marginBottom: 10, 
      paddingHorizontal: 10, 
      paddingVertical: 5, 
      borderRadius: 5
    },
    selectedAnswer: {
      backgroundColor: "#bde0fe", 
      alignItems: "center",
      marginBottom: 10, 
      paddingHorizontal: 10, 
      paddingVertical: 5, 
      borderRadius: 5
    },
    imageShow: {
      display: "flex"
    },
    imageHide: {
      display: "none"
    },
  
    messageBubbleTextLeftSMS: {
      backgroundColor: '#3ddf81',
      color: 'black',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      overflow: 'hidden'
    },
  
    messageBubbleTextLeft: {
      backgroundColor: '#badae7',
      color: 'black',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      overflow: 'hidden'
    },
  
    messageBubbleImage: {
      backgroundColor: 'transparent',
      borderRadius: 5,
      overflow: 'hidden'
    },
    messageBubbleRight: {
      justifyContent: 'flex-end'
    },
  
    messageBubbleTextRight: {
      backgroundColor: '#abbfc8',
      color: 'white',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      overflow: 'hidden'
    },
    messageBubbleTextRightSMS: {
      backgroundColor: '#3ddf81',
      color: 'white',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 10,
      overflow: 'hidden'
    },
	container: {
		fontFamily: 'Quicksand-Regular',
    backgroundColor: "#152030",
		flex: 1,
		...Platform.select({
			ios: {
			  paddingTop: 30,
			},
		}),
	},
	title: {
		alignItems: "center",
		fontFamily: 'Quicksand-Regular',
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
		fontFamily: 'Quicksand-Regular',
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
	noteContainer: {
		fontFamily: 'Quicksand-Regular',
		fontWeight: 'bold', marginLeft: 15, paddingTop: 1, paddingHorizontal: 5, backgroundColor: 'red',borderRadius: 10, alignItems: 'center', maxWidth: 20
	},
	button: {
		fontFamily: 'Quicksand-Regular',
		backgroundColor: '#599cdd',padding: 10, borderRadius: 5
	},
});