import React, { Component } from "react";
import {
    View,
    TouchableOpacity,
    ImageBackground,
    StyleSheet,
} from "react-native";

export default class BlockBoxs extends Component {
    render() {
        const { boxs, gotoPage } = this.props;

        return (
            <View style={styles.container}>
                <TouchableOpacity
                    onPress={() => gotoPage(boxs.link1)}
                    style={styles.touchable}
                >
                    <ImageBackground
                        style={styles.imageBackground}
                        source={{
                            uri: boxs.image1.includes("http")
                                ? boxs.image1
                                : global.devUrl + boxs.image1,
                        }}
                        imageStyle={styles.imageStyle}
                    >
                        <View style={styles.innerView}></View>
                    </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => gotoPage(boxs.link2)}
                    style={styles.touchable}
                >
                    <ImageBackground
                        style={[styles.imageBackground, styles.imageBackgroundAlt]}
                        source={{
                            uri: boxs.image2.includes("http")
                                ? boxs.image2
                                : global.devUrl + boxs.image2,
                        }}
                        imageStyle={styles.imageStyle}
                    >
                        <View style={styles.innerView}></View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        margin: 15,
    },
    touchable: {
        width: "50%",
    },
    imageBackground: {
        borderRadius: 10,
        minHeight: 150,
        padding: 20,
        marginLeft: 10,
        marginRight: 10,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    imageBackgroundAlt: {
        backgroundColor: "#b9d1d7",
    },
    imageStyle: {
        borderRadius: 10,
    },
    innerView: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
});
