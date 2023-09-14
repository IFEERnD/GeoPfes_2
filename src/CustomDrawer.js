import React, {Component} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Platform,
    Linking,
    Share
} from "react-native";
import cs_string from "./untils/strings";

export default class CustomDrawer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    _sendCommentToMail = () => {
        Linking.openURL('mailto:info@ifee.edu.vn?subject=Phản hồi về ứng dụng Geopfes')
    };

    _shareApp = async () => {
        try {
            const result = await Share.share({
                message: cs_string.share_string
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {

                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    _openTutorialGuid = () => {
        Linking.openURL(cs_string.link_guild);
    };
    _openFanpage = () => {
        Linking.openURL(cs_string.link_fanpage);
    };
    _openHomePage = () => {
        Linking.openURL(cs_string.link_homepage);
    };

    render() {
        const {navigate} = this.props.navigation;
        return (
            <View style={styles.container}>
                <View style={{height: 40}}/>
                <View style={styles.containertopRow}>
                    <View style={{flexDirection: 'row', alignItems: 'center', width: '90%'}}>
                        <Image
                            style={styles.imageTopRow}
                            source={require("../src/images/icon_ifee.png")}
                        />
                        <View style={{width: 20}}/>
                        <View style={{paddingTop: 10}}>
                            <Text
                                style={{color: 'white', fontSize: 18, fontWeight: "bold"}}>{cs_string.title_home}</Text>
                            <Text style={{color: 'white', fontSize: 14}}>{cs_string.version}</Text>
                        </View>
                    </View>
                    <View style={{height: 10}}/>
                    <Text style={{color: 'white', fontSize: 12, fontWeight: "bold"}}>{cs_string.name_vien}</Text>
                    <View style={{height: 3}}/>
                    <Text style={{color: 'white', fontSize: 11, fontWeight: "bold"}}>{cs_string.name_dh}</Text>
                    <View style={{height: 10}}/>
                </View>

                <View style={{flex: 1, backgroundColor: 'white'}}>
                    {/*<TouchableOpacity*/}
                    {/*    onPress={() => this.props.navigation.closeDrawer()}*/}
                    {/*    style={styles.containerBottomItem}*/}
                    {/*>*/}
                    {/*    <View style={styles.button}>*/}
                    {/*        <Text style={{color: '#363636', fontSize: 16, fontWeight: "bold"}}>{cs_string.title_home}</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableOpacity>*/}

                    <TouchableOpacity
                        onPress={this._openHomePage}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/home_page.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>Trang chủ</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={this._openTutorialGuid}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/guide_black.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>{cs_string.menu_tutorial}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this._shareApp}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/share_black.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>{cs_string.menu_share}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this._sendCommentToMail}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/send_black.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>{cs_string.menu_comment}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigate("Profile", {title: "Drawer - Second"})}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/info_black.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>{cs_string.menu_profile}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={this._openFanpage}
                        style={styles.containerBottomItem}
                    >
                        <View style={styles.button}>
                            <Image style={{width: 25, height: 25}}
                                   source={require("../src/images/facebook.png")}>
                            </Image>
                            <View style={{width: 10}}/>
                            <Text style={{
                                color: '#363636',
                                fontSize: 16,
                                fontWeight: "bold"
                            }}>Fanpage</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#17BED0"
    },
    containertopRow: {
        marginTop: 10,
        marginLeft: 10,
        justifyContent: "center",
        alignItems: "center"
    },
    txtBottom: {
        marginLeft: 10,
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "bold"
    },
    imageTopRow: {
        height: 80,
        width: 80,
        ...Platform.select({
            ios: {
                borderRadius: 80 / 2
            },
            android: {
                borderRadius: 80
            }
        })
    },
    icon: {
        height: 25,
        width: 25,
        marginRight: 10
    },
    button: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start"
    },

    containertopRowText: {
        flexDirection: "column",
        marginLeft: 5
    },

    containerBottom: {
        // backgroundColor: "#17BED0"
    },
    containerBottomItem: {
        padding: 10,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "flex-start",
    }
});
