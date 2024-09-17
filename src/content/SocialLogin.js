import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, Text, Image, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
// import { GoogleSignin, GoogleSigninButton, statusCodes } from 'react-native-google-signin';
//import { SignInWithAppleButton } from 'react-native-apple-authentication';
// var { FBLogin, FBLoginManager } = require('react-native-facebook-login');

export default class SocialLogin extends Component {
    constructor(props) {
        super(props);
        FBLoginManager.logout(function(error, data){});
    }
    componentDidMount = () =>{
      GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/userinfo.email'], // what API you want to access on behalf of the user, default is email and profile
        webClientId: '1064213150621-b3tanm0plagm3eoj7sv7tdg3ut4n47gf.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
        offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        //hostedDomain: 'google.com', // specifies a hosted domain restriction
        //loginHint: '', // [iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible. [See docs here](https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd)
        forceConsentPrompt: true, // [Android] if you want to show the authorization prompt at each login.
        //accountName: '', // [Android] specifies an account name on the device that should be used
        iosClientId: '1064213150621-5le0opv0kqh8i4tj8jc0nksttvrqqnpd.apps.googleusercontent.com', //1:756890141556:ios:0e53263a73dac38c1d6221 [iOS] optional, if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      });
      //this.getCurrentUserInfo();
    }
    getCurrentUserInfo = async () => {
      try {
        const userInfo = await GoogleSignin.signInSilently();
        console.log( userInfo );
      } catch (error) {
        if (error.code === statusCodes.SIGN_IN_REQUIRED) {          
          console.log(error);
        } else {          
          this.signOut();
        }
      }
    };
    signOut = async () => {
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        console.error(error);
      }
    };
    signIn = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        console.log(userInfo.user.email);
        this.props.checkLogin(userInfo.user.email, "google");
    } catch (error) {
        console.log(error.code);
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (f.e. sign in) is in progress already
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
        } else {
        // some other error happened
        }
    }
    };
    appleSignIn = (result) => {
      this.props.checkLogin(result.email,result.user);
    };
  render() {
    var _this = this;
    return (
      <View style={{marginTop: 20, alignItems: 'center'}}>
        <TouchableOpacity onPress={this.signIn} style={{flexDirection: 'row', width: 210,  backgroundColor: "#fff", borderColor: '#ccc', marginBottom: 10, paddingVertical:5, paddingHorizontal: 5, borderWidth: 1, borderRadius: 3}}>
          <Image source={require('./images/google.png')} style={{ width: 18, height:18 }} />
          <Text style={{ marginLeft: 6,fontSize: 15, fontWeight: '500', color: '#333'}}>Continue with Google</Text>
        </TouchableOpacity>
        <FBLogin style={{ fontFamily: 'Quicksand-Regular', marginBottom: 10, width: 210, flex:0 }}
            ref={(fbLogin) => { this.fbLogin = fbLogin }}
            permissions={["email"]}
            loginBehavior={FBLoginManager.LoginBehaviors.Native}
            onLogin={function(data){
                console.log("Logged in!");
                fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + data.credentials.token)
                .then((response) => response.json())
                .then((json) => {
                    console.log(json.email);
                    FBLoginManager.logout(function(error, data){});
                    _this.props.checkLogin(json.email, "facebook");
                })
                .catch(() => {
                    reject('ERROR GETTING DATA FROM FACEBOOK')
                })
                _this.setState({ user : null });
            }}
            onLogout={function(){
                console.log("Logged out.");
                _this.setState({ user : null });
            }}
            onLoginFound={function(data){
                console.log("Existing login found.");
                console.log(data);
                _this.setState({ user : null });
            }}
            onLoginNotFound={function(){
                console.log("No user logged in.");
                _this.setState({ user : null });
            }}
            onError={function(data){
                console.log("ERROR");
                console.log(data);
            }}
            onCancel={function(){
              console.log("User cancelled.");
            }}
            onPermissionsMissing={function(data){
                console.log("Check permissions!");
                console.log(data);
            }}
            
        />
        {/* {SignInWithAppleButton(styles.appleBtn, this.appleSignIn)} */}
      </View>
    );
  }
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  appleBtn: { height: 30, width: 210 }
});