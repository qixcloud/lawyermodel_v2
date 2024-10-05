import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  FlatList,
} from "react-native";
import FadeInView from "react-native-fade-in-view";
import ScalableImage from "react-native-scalable-image";
import DeviceInfo from "react-native-device-info";
import { Icon } from "react-native-elements";
// import CalendarIcon from "../../assets/calendarIcon";
import { convertUTCtoLocal } from "../Helper";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DirectionIcon from "../../assets/directionsIcon";
import { BackgroundImage } from "react-native-elements/dist/config";

const Appointment = ({ items, translate }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getEventsFromChat();
  }, [items]);

  const getEventsFromChat = async () => {
    const jwt = await AsyncStorage.getItem("jwtToken");

    await axios({
      method: "get",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      url: "https://api.qix.cloud/conversation",
    })
      .then(async (res) => {
        if (res?.data?.events) {
          const events = res.data.events;
          console.log("EVENTSS", events);
          const formatEvents = events.map((event) => {
            return {
              calendarEventType: event.eventType,
              startUtc: event.eventTimestamp,
              location: event.location,
              notes: event.details,
              endUtc: "Not defined",
            };
          });
          const filterEvents = items?.filter((event) => {
            return event.calendarEventType === "Appointment";
          });
          const allEvents = [...formatEvents, ...filterEvents];
          getNextEvents(allEvents);
        }
      })
      .catch((error) => {
        const filterEvents = items.filter((event) => {
          return event.calendarEventType === "Appointment";
        });
        getNextEvents(filterEvents);
      });
  };

  const getNextEvents = (events) => {
    const currentDate = new Date();
    const futureEvents = events.filter(
      (event) => new Date(event.startUtc) > currentDate
    );
    console.log("futureEvents", futureEvents);
    futureEvents.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));

    if (futureEvents?.length > 0) {
      setEvents(futureEvents);
    } else {
      setEvents([]);
    }
  };
  console.log("EVENTS", events);
  if (events.length === 0) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <ScalableImage
          source={require("../images/Sleep_app.png")}
          width={DeviceInfo.isTablet() ? 275 : 220}
        />
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: "Eina03-Regular",
            fontSize: DeviceInfo.isTablet() ? 22 : 15,
            marginTop: DeviceInfo.isTablet() ? 48 : 10,
          }}
        >
          {translate("RelaxYoudeserveit")}
        </Text>
      </View>
    );
  }

  const handleOnPress = (item) => {
    const alertMessage =
      `Title: ${item.title}\n` +
      `Location: ${item.location}\n` +
      `Start UTC: ${item.startUtc}\n` +
      `End UTC: ${item.endUtc}\n` +
      `Notes: ${item.notes}\n` +
      `Calendar Event Type: ${item.calendarEventType}`;

    Alert.alert("More details", alertMessage);
  };

  const openLocation = (address) => {
    const encodedAddress = encodeURIComponent(address);
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    let url = scheme + encodedAddress;
    console.log("url", url);
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          //console.error("No se pudo abrir la URL de mapas");
          url = "https://maps.google.com/?q=" + encodedAddress;
          Linking.openURL(url);
        }
      })
      .catch((err) => console.error("Ocurrió un error", err));
  };

  const renderItem = ({ item }) => {
    const onlyOne = events?.length === 1;
    return (
      <View
        style={[
          styles.activeNote,
          onlyOne && { width: Dimensions.get("window").width - 30 },
        ]}
      >
        <View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {/*<CalendarIcon size={DeviceInfo.isTablet() ? 38 : undefined} />*/}

              <Text
                allowFontScaling={false}
                style={{
                  fontFamily: "Eina03-Regular",
                  color: "#333",
                  fontSize: 18,
                  marginLeft: 15,
                }}
              >
                {translate("yournextappointment")}
              </Text>
            </View>

            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Eina03-Regular",
                color: "#333",
                fontSize: 25,
                marginBottom: 10,
                marginTop: 10,
              }}
            >
              {convertUTCtoLocal(item.startUtc)}
            </Text>
          </View>
          <View>
            <Text
              allowFontScaling={false}
              style={{ color: "#555", fontSize: 18, marginBottom: 10 }}
            >
              {item.location ? item.location : "[location-missing]"}
            </Text>
            <Text
              allowFontScaling={false}
              style={{ color: "#555", fontSize: 18 }}
            >
              {item.calendarEventType}
            </Text>

            {item.location ? (
              <TouchableOpacity
                style={{
                  marginVertical: 20,
                  marginRight: 10,
                  borderRadius: 12,
                  overflow: "hidden",
                }}
                onPress={() => openLocation(item.location)}
              >
                <BackgroundImage
                  source={require("../../assets/directions.png")}
                  style={{
                    height: 50,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      alignSelf: "center",
                      flexDirection: "row",
                    }}
                  >
                    <DirectionIcon />
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        marginLeft: 15,
                        color: "black",
                      }}
                    >
                      Get directions
                    </Text>
                  </View>
                </BackgroundImage>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{
              marginRight: 25,
              backgroundColor: "#eff6fe",
              textAlign: "center",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 20,
              maxWidth: "65%",
            }}
            onPress={() => handleOnPress(item)}
          >
            <Text
              style={{
                fontFamily: "Eina03-Regular",
                color: "#2a99fb",
                fontSize: 18,
                textAlign: "center",
              }}
            >
              More Details
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => this.props.searchGlossary(app.event_type)}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#fef0ef",
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}
          >
            <Text
              allowFontScaling={false}
              // onPress={() => Linking.openURL(global.baseUrl + "a/" + app.u_id)}
              style={{
                fontFamily: "Eina03-Regular",
                color: "#b03e40",
                fontSize: 18,
              }}
            >
              {translate("cancel")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={events}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    ...Platform.select({
      ios: {
        paddingTop: 10,
      },
    }),
  },
  activeNote: {
    fontFamily: "Eina03-Regular",
    borderWidth: 1,
    borderColor: "green",
    marginBottom: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    width: Dimensions.get("window").width - 60,
    marginHorizontal: 15,
    justifyContent: "space-between",
  },
  button: {
    fontFamily: "Eina03-Regular",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    marginTop: 10,
  },
});

export default Appointment;
