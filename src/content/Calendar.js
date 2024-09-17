import React, { Component } from 'react';
import { StyleSheet, Text, View, ScrollView,TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';

const styles = StyleSheet.create({

});
export default class Home extends Component {
  static navigationOptions = {
    //To hide the NavigationBar from current Screen
    title: 'Details',
  };
  changeTab=()=>{
    this.props.changeTab('home');
  }
	render() {
		return (
			<ScrollView style={{ flex: 1}}>
				<View style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <View style={{flexDirection:'row',width:'100%' ,backgroundColor:'white',height:50,alignItems:'center'}}>
            <TouchableOpacity onPress={this.changeTab} style={{width:'30%'}}>
            <Icon  name="arrow-left" type="font-awesome" color={'grey'} size={15}/>
            </TouchableOpacity>
            <Text style={{width:'40%',textAlign:'center',color:'#1d80ac', fontWeight:'bold', fontSize:18}}>Calendars</Text>
            <TouchableOpacity style={{width:'30%'}}><Icon  name="plus-circle" type="font-awesome" color={'#76c2db'} size={20}/></TouchableOpacity>
            
          </View>
          <View style={{padding:20}}>
              <Calendar
              // Initially visible month. Default = Date()
              // current={'2012-03-01'}
              // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
              minDate={'2012-05-10'}
              // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
              maxDate={'2050-05-30'}
              // Handler which gets executed on day press. Default = undefined
              onDayPress={(day) => {console.log('selected day', day)}}
              // Handler which gets executed on day long press. Default = undefined
              onDayLongPress={(day) => {console.log('selected day', day)}}
              // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
              monthFormat={'yyyy MM'}
              // Handler which gets executed when visible month changes in calendar. Default = undefined
              onMonthChange={(month) => {console.log('month changed', month)}}
              // Hide month navigation arrows. Default = false
              // hideArrows={true}
              // Replace default arrows with custom ones (direction can be 'left' or 'right')
              // renderArrow={(direction) => (<Arrow />)}
              // Do not show days of other months in month page. Default = false
              hideExtraDays={true}
              // If hideArrows=false and hideExtraDays=false do not switch month when tapping on greyed out
              // day from another month that is visible in calendar page. Default = false
              // disableMonthChange={true}
              // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
              firstDay={1}
              // Hide day names. Default = false
              // hideDayNames={true}
              // Show week numbers to the left. Default = false
              // showWeekNumbers={true}
              // Handler which gets executed when press arrow icon left. It receive a callback can go back month
              // onPressArrowLeft={substractMonth => substractMonth()}
              // Handler which gets executed when press arrow icon left. It receive a callback can go next month
              // onPressArrowRight={addMonth => addMonth()}
            />
            <View style={{flexDirection:'row',width:'100%' ,backgroundColor:'white',height:80,alignItems:'center', padding:20, borderWidth:1, borderRadius:5, borderColor:'#69bfea',marginBottom:20}}>
              <View style={{width:'30%',padding:20}}>
                <Text style={{color:'#1d80ac',fontSize:12}}>Apr</Text>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>17</Text>
              </View>
              <View style={{width:'70%',padding:20}}>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>Meeting with Susan</Text>
                <Text style={{color:'#1d80ac',fontSize:12}}>9:30AM to 10:30AM</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',width:'100%' ,backgroundColor:'white',height:80,alignItems:'center', padding:20, borderWidth:1, borderRadius:5, borderColor:'#69bfea',marginBottom:20}}>
              <View style={{width:'30%',padding:20}}>
                <Text style={{color:'#1d80ac',fontSize:12}}>Apr</Text>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>20</Text>
              </View>
              <View style={{width:'70%',padding:20}}>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>Desing Review</Text>
                <Text style={{color:'#1d80ac',fontSize:12}}>7:00AM to 8:00AM</Text>
              </View>
            </View>
            <View style={{flexDirection:'row',width:'100%' ,backgroundColor:'white',height:80,alignItems:'center', padding:20, borderWidth:1, borderRadius:5, borderColor:'#69bfea',marginBottom:20}}>
              <View style={{width:'30%',padding:20}}>
                <Text style={{color:'#1d80ac',fontSize:12}}>Apr</Text>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>29</Text>
              </View>
              <View style={{width:'70%',padding:20}}>
                <Text style={{color:'#1d80ac', fontWeight:'bold'}}>New UI Kit Publishing</Text>
                <Text style={{color:'#1d80ac',fontSize:12}}>9:30AM to 11:00AM</Text>
              </View>
            </View>
          </View>
          

				</View>
			</ScrollView>
		);
	}
}

