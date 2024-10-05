import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FadeInView from "react-native-fade-in-view";
import ScalableImage from "react-native-scalable-image";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const AllAppointments = ({ items, translate }) => {
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
          console.log("EVENTSSS", events);
          const formatEvents = events.map((event) => {
            console.log("debug allEvents", new Date(event.eventTimestamp));
            return {
              calendarEventType: event.eventType,
              startUtc: event.eventTimestamp,
              location: event.location,
              notes: event.details,
              endUtc: "Not defined",
            };
          });
          const filterEvents = items.filter((event) => {
            return event.calendarEventType === "Appointment";
          });
          const allEvents = [...formatEvents, ...filterEvents];
          console.log("debug allEvents", allEvents);
          getPastEvents(allEvents);
        }
      })
      .catch((error) => {
        const filterEvents = items.filter((event) => {
          return event.calendarEventType === "Appointment";
        });
        getPastEvents(filterEvents);
      });
  };

  const getPastEvents = (events) => {
    const currentDate = new Date();

    const pastEvents = events.filter((event) => {
      console.log("debug new Date(event.startUtc)", new Date(event.startUtc));
      return new Date(event.startUtc) < currentDate;
    });

    pastEvents.sort((a, b) => new Date(b.startUtc) - new Date(a.startUtc));
    console.log("debug pastEvents", pastEvents);
    if (pastEvents?.length > 0) {
      setEvents(pastEvents);
    } else {
      setEvents([]);
    }
  };

  const convertUTCtoLocal = (utcString) => {
    const date = new Date(utcString);

    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);

    return `${month}/${day}`;
  };

  const convertUTCtoTime = (utcString) => {
    const date = new Date(utcString);

    let hours = date.getHours();
    const minutes = ("0" + date.getMinutes()).slice(-2);

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = ("0" + hours).slice(-2); // padding

    return `${hours}:${minutes} ${ampm}`;
  };

  if (events?.length === 0) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: "Eina03-Regular",
            color: "#000",
            fontSize: DeviceInfo.isTablet() ? 22 : 15,
            marginTop: DeviceInfo.isTablet() ? 50 : 35,
          }}
        >
          {translate("noPrevious")}
        </Text>
      </View>
    );
  }

  const renderItem = (item) => {
    const { startUtc, endUtc, title, location, notes, calendarEventType } =
      item.item;

    const handleOnPress = () => {
      const alertMessage =
        `Title: ${title}\n` +
        `Location: ${location}\n` +
        `Start UTC: ${startUtc}\n` +
        `End UTC: ${endUtc}\n` +
        `Notes: ${notes}\n` +
        `Calendar Event Type: ${calendarEventType}`;

      Alert.alert("More details", alertMessage);
    };

    return (
      <FadeInView duration={750}>
        <View style={styles.activeNote}>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <View
              style={{
                flex: 1,
              }}
            >
              <View style={{ width: "100%" }}>
                <Text
                  allowFontScaling={false}
                  style={{
                    fontFamily: "Eina03-Regular",
                    color: "#333",
                    fontSize: 25,
                    marginBottom: 10,
                    marginTop: 10,
                    textAlign: "center",
                  }}
                >
                  {convertUTCtoLocal(startUtc)}
                </Text>
              </View>
              <View style={{ width: "100%" }}>
                <Text
                  allowFontScaling={false}
                  style={{ color: "#555", fontSize: 14, textAlign: "center" }}
                >
                  {convertUTCtoTime(startUtc)}
                </Text>
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                }}
              >
                {location ? location : "[location-missing]"}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#eff6fe",
                  textAlign: "center",
                  borderRadius: 8,
                  paddingVertical: 10,
                  alignItems: "center",
                  paddingHorizontal: 5,
                }}
                onPress={handleOnPress}
              >
                <Text
                  style={{
                    fontFamily: "Eina03-Regular",
                    color: "#2a99fb",
                    fontSize: 12,
                    textAlign: "center",
                  }}
                >
                  More Details
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </FadeInView>
    );
  };

  return (
    <View>
      {events.map((event, index) => {
        return renderItem({ item: event, index });
      })}
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
  noteContainer: {
    fontFamily: "Eina03-Bold",
    position: "absolute",
    top: -22,
    right: -18,
    paddingTop: 1,
    paddingHorizontal: 5,
    backgroundColor: "red",
    borderRadius: 10,
    alignItems: "center",
    maxWidth: 20,
  },
  note: {
    fontFamily: "Eina03-Regular",
    marginLeft: "5%",
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
  },
  activeNote: {
    fontFamily: "Eina03-Regular",
    borderWidth: 1,
    borderColor: "green",
    marginLeft: "5%",
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 10,
    paddingHorizontal: 10,
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

export default AllAppointments;
