import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Linking,
  TextInput,
  Dimensions,
  Image,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import * as Progress from "react-native-progress";
import FadeInView from "react-native-fade-in-view";
import crypto from "crypto-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHeaders } from "./Helper";
import { questionData } from "./questionData";
// import
export default class Questions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: 0,
      back: 0,
      apps: [],
      checked: false,
      next: false,
      searchKey: "",
      displaySubmissionForm: false,
      displayFeedbackForm: false,
      question: "",
      feedback: "",
      expanded: [],
      questionData: questionData,
    };
  }

  componentDidMount = () => {};
  onSearchQuestions = () => {};
  viewSubmissionForm = () => {
    this.setState({ displaySubmissionForm: true });
  };
  submissionQuestion = () => {
    if (this.state.question != "") {
      const params = new FormData();
      params.append("contact_id", global.contactId);
      params.append("question", this.state.question);
      params.append("submitType", "Question");
      axios({
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        url:
          global.baseUrl +
          "wp-admin/admin-ajax.php?action=putSubmissionsFromApp",
        data: params,
      }).then((res) => {
        this.setState({ displaySubmissionForm: false });
        this.setState({ question: "" });
      });
    }
  };
  submissionFeedback = async () => {
    // const headers = await getHeaders();
    //
    // axios
    //   .post(
    //     "https://api.filevine.io/core/notes",
    //     {
    //       typeTag: "note",
    //       isUnread: false,
    //       isCompleted: false,
    //       body: "#app #feedback " + this.state.feedback,
    //       isEdited: false,
    //       allowEditing: true,
    //       projectId: {
    //         native: this.props.projectId,
    //         partner: null,
    //       },
    //       isLoaded: false,
    //       canBeShared: true,
    //       isPinnedToProject: false,
    //       isPinnedToFeed: false,
    //     },
    //     {
    //       headers: headers,
    //     }
    //   )
    //   .then((res) => {
    //     this.setState({ feedback: "" });
    //     this.setState({ displayFeedbackForm: false });
    //     Alert.alert("", "Feedback sent!");
    //   });
  };
  render() {
    return (
      <>
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 30,
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <View
            style={{
              justifyContent: "center",
              marginRight: "2%",
              alignItems: "center",
              width: "38%",
              backgroundColor: "#fff",
              borderColor: "#ccc",
              marginBottom: 10,
              paddingVertical: 15,
            }}
          >
            <Image
              source={require("./images/question.jpg")}
              style={{ width: 150, height: 150, marginLeft: 10 }}
            />
          </View>
          <View
            style={{
              justifyContent: "center",
              marginLeft: "2%",
              alignItems: "center",
              width: "58%",
              backgroundColor: "#fff",
              borderColor: "#ccc",
              marginBottom: 10,
              paddingVertical: 15,
            }}
          >
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Eina03-Regular",
                fontSize: 20,
                color: "#333",
                textAlign: "right",
                width: "100%",
              }}
            >
              {this.props.translate("haveaquestion")}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                fontFamily: "Eina03-Regular",
                fontSize: 18,
                color: "#333",
                textAlign: "right",
                width: "100%",
              }}
            >
              {this.props.translate("aboutsomthing")}?
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TextInput
                onChangeText={(text) => {
                  const filteredQuestions = questionData.filter(
                    (item) =>
                      item.question
                        .toLowerCase()
                        .includes(text.toLowerCase()) ||
                      item.answer.toLowerCase().includes(text.toLowerCase())
                  );

                  this.setState({ questionData: filteredQuestions });
                }}
                style={styles.inputSearch}
                // value={this.state.searchKey}
                placeholder="Search..."
                placeholderTextColor="#555"
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => this.onSearchQuestions()}
              >
                <Image
                  source={require("./images/search.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ marginHorizontal: 20 }}>
          {this.state.displaySubmissionForm ? (
            <>
              <TextInput
                onChangeText={(text) => this.setState({ question: text })}
                style={styles.inputQuestion}
                multiline={true}
                value={this.state.question}
                numberOfLines={5}
                placeholderTextColor="#555"
              ></TextInput>
              <TouchableOpacity
                onPress={() => this.submissionQuestion()}
                style={styles.button}
              >
                <Text
                  style={{
                    fontFamily: "Eina03-Regular",
                    textAlign: "center",
                    fontSize: 20,
                    color: "#fff",
                  }}
                >
                  {this.props.translate("submit")}
                </Text>
              </TouchableOpacity>
            </>
          ) : this.state.displayFeedbackForm ? (
            <>
              <TextInput
                onChangeText={(text) => this.setState({ feedback: text })}
                style={styles.inputQuestion}
                multiline={true}
                value={this.state.feedback}
                numberOfLines={5}
                placeholderTextColor="#555"
              ></TextInput>
              <TouchableOpacity
                onPress={() => this.submissionFeedback()}
                style={styles.button}
              >
                <Text
                  style={{
                    fontFamily: "Eina03-Regular",
                    textAlign: "center",
                    fontSize: 20,
                    color: "#fff",
                  }}
                >
                  {this.props.translate("submit")}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <TouchableOpacity
                onPress={() => this.viewSubmissionForm()}
                style={styles.button}
              >
                <Text
                  style={{
                    fontFamily: "Eina03-Regular",
                    textAlign: "center",
                    fontSize: 20,
                    color: "#fff",
                  }}
                >
                  {this.props.translate("submitQuestion")}
                </Text>
              </TouchableOpacity>
              {/*<TouchableOpacity*/}
              {/*  onPress={() => {*/}
              {/*    this.setState({ displayFeedbackForm: true });*/}
              {/*  }}*/}
              {/*  style={[styles.button, { marginTop: 20 }]}*/}
              {/*>*/}
              {/*  <Text*/}
              {/*    style={{*/}
              {/*      fontFamily: "Eina03-Regular",*/}
              {/*      textAlign: "center",*/}
              {/*      fontSize: 20,*/}
              {/*      color: "#fff",*/}
              {/*    }}*/}
              {/*  >*/}
              {/*    {this.props.translate("submitFeedback")}*/}
              {/*  </Text>*/}
              {/*</TouchableOpacity>*/}
            </View>
          )}
        </View>
        <ScrollView
          style={{
            minHeight: 100,
            width: "100%",
            textAlign: "center",
            paddingTop: 10,
            marginTop: 15,
            backgroundColor: "#fff",
            marginBottom: 10,
          }}
        >
          {this.state.questionData.map(({ question, answer }, index) => {
            return (
              <FadeInView duration={750}>
                <View style={true ? styles.activeNote : styles.note}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Eina03-Regular",
                      fontSize: 15,
                      color: "blue",
                      marginBottom: 5,
                    }}
                  >
                    Question
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Eina03-Regular",
                      color: "#555",
                      fontSize: 15,
                      marginBottom: 10,
                    }}
                  >
                    {question}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Eina03-Regular",
                      fontSize: 15,
                      color: "blue",
                      marginBottom: 5,
                    }}
                  >
                    Answer
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontFamily: "Eina03-Regular",
                      color: "#555",
                      fontSize: 15,
                      marginBottom: 10,
                    }}
                    numberOfLines={
                      !this.state.expanded.includes(index) ? 2 : undefined
                    }
                  >
                    {answer}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      let newExpanded = this.state.expanded;
                      if (!newExpanded.includes(index)) {
                        newExpanded.push(index);
                      } else {
                        newExpanded = newExpanded.filter(
                          (item) => item !== index
                        );
                      }
                      this.setState({ expanded: newExpanded });
                    }}
                  >
                    {!this.state.expanded.includes(index) ? (
                      <Text style={{ textAlign: "right", color: "#599cdd" }}>
                        See more...
                      </Text>
                    ) : (
                      <Text style={{ textAlign: "right", color: "#599cdd" }}>
                        Hide
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </FadeInView>
            );
          })}
        </ScrollView>
      </>
    );
  }
}

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
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeNote: {
    fontFamily: "Eina03-Regular",
    borderWidth: 1,
    borderColor: "green",
    marginLeft: "5%",
    marginBottom: 10,
    width: "90%",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  inputSearch: {
    fontFamily: "Eina03-Regular",
    height: 40,
    borderRadius: 15,
    borderColor: "#000",
    backgroundColor: "#fff",
    fontSize: 15,
    paddingLeft: 10,
    borderWidth: 1,
    width: "100%",
    marginTop: 20,
  },
  inputQuestion: {
    fontFamily: "Eina03-Regular",
    minHeight: 100,
    borderRadius: 5,
    borderColor: "#000",
    backgroundColor: "#fff",
    fontSize: 15,
    padding: 10,
    borderWidth: 1,
    width: "100%",
    marginBottom: 10,
  },
  searchButton: {
    position: "absolute",
    bottom: 7,
    right: 5,
  },
  button: {
    fontFamily: "Eina03-Regular",
    backgroundColor: "#599cdd",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
});
