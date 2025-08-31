import React, { Component } from "react";
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    StyleSheet,
} from "react-native";

export default class AccidentDetection extends Component {
    render() {
        const {  translate, onPress } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.wrapper}>
                    <TouchableOpacity onPress={onPress} style={styles.touchable}>
                        <Image
                            source={require("../images/layout3.png")}
                            borderRadius={10}
                            style={styles.backgroundImage}
                        />
                        <View style={styles.overlay}>
                            <View style={styles.textContainer}>
                                <Text style={styles.subtitle}>
                                    Accident Detection
                                </Text>
                            </View>
                            <View style={styles.arrowContainer}>
                                <Image
                                    source={require("../images/white_arrow.png")}
                                    style={styles.arrow}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 15,
        marginHorizontal: 25,
    },
    wrapper: {
        borderWidth: 0,
    },
    touchable: {
        overflow: "hidden",
        borderRadius: 10,
    },
    backgroundImage: {
        overflow: "hidden",
        height: 100,
        width: Dimensions.get("window").width - 50,
    },
    overlay: {
        width: "100%",
        height: "100%",
        position: "absolute",
        flex: 1,
        justifyContent: "space-around",
        flexDirection: "row",
        alignItems: "center",
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: "#fff",
        paddingLeft: 20,
        fontSize: 16,
        fontWeight: "bold",
    },
    subtitle: {
        color: "#fff",
        paddingHorizontal: 20,
        marginTop: 6,
    },
    arrowContainer: {
        flex: 1,
    },
    arrow: {
        width: 35,
        height: 35,
        alignSelf: "flex-end",
        marginRight: 30,
    },
});
