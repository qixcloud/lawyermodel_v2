import React, { Component } from 'react';
import { Text, View } from 'react-native'

import Home from './Home';
import Message from './Message';
import Calendar from './Calendar';
// import TabNavigator from 'react-native-tab-navigator';
//import Icon from 'react-native-vector-icons/FontAwesome';
import { Icon, Button, ThemeProvider } from 'react-native-elements';

export default class MainView extends Component {
    state = {
        selectedTab: "home",
    }
    changeTab =(str)=>{
        if(str){
            this.setState({selectedTab:str});
        }
    }
    checklogin =()=>{

    }
    changeHome=()=>{
        this.setState({ selectedTab: 'home' });
        
    }
    render() {
        return (
            // <View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <TabNavigator tabBarStyle={{ height: 60 }}>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'message'}
                    // title="Message"
                    renderIcon={() => <Icon name='sms' size={35} color="#666" />}
                    renderSelectedIcon={() => <Icon name="sms" size={35} color="#3496f0" />}
                    // renderBadge={() => <CustomBadgeView />}
                    onPress={() => this.setState({ selectedTab: 'message' })}>
                        <Message/>
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'home'}
                    // title="Home"
                    renderIcon={() => <Icon name='home' type="" size={35} color="#666" />}
                    renderSelectedIcon={() => <Icon name="home" type="" size={35} color="#3496f0" />}
                    // badgeText="1"
                    onPress={() => this.changeHome()}>
                        <Home />
                    
                </TabNavigator.Item>
                <TabNavigator.Item
                    selected={this.state.selectedTab === 'calendar'}
                    // title="Calendar"
                    renderIcon={() => <Icon name='calendar' type="" size={35} color="#666" />}
                    renderSelectedIcon={() => <Icon name="calendar" type="" size={35} color="#3496f0" />}
                    // renderBadge={() => <CustomBadgeView />}
                    onPress={() => this.setState({ selectedTab: 'calendar' })}>
                    <Calendar changeTab={this.changeTab}/>
                </TabNavigator.Item>
            </TabNavigator>
            // </View>
        );
    }
}
