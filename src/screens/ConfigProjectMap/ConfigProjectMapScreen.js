import React, { Component } from "react";
import {
    View,
    TextInput,
    ScrollView
} from "react-native";
import {
    Header,
    Icon,
    Left,
    Body,
    Text,
    Button,
    Title,
    Picker
} from "native-base";
import styles from "../../untils/styles";
import DocumentPicker from "react-native-document-picker";
import cs_string from "../../untils/strings";
import {MbTile} from "react-native-maps";

class ConfigProjectMapScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            select_network: "0",
            name_mbtitle_file: ""
        };
    }

    _onPressButton = async () => {
        try {
            const results = await DocumentPicker.pickMultiple({
                type: [DocumentPicker.types.allFiles]
            });
            MbTile.load
            for (const res of results) {
                this.setState({ name_mbtitle_file: res.name });
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                throw err;
            }
        }
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header
                    style={{ backgroundColor: "blue", barStyle: "light-content", height: 80, paddingTop: 30 }}
                    androidStatusBarColor={"blue"}
                >
                    <Left style={{ flex: 0.1 }}>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon name="arrow-back" style={{ color: "white" }} />
                        </Button>
                    </Left>
                    <Body
                        style={{
                            flex: 0.9,
                            alignContent: "flex-start",
                            alignItems: "flex-start"
                        }}
                    >
                        <Title style={{ color: "white" }}>
                            {cs_string.select_project_map}
                        </Title>
                    </Body>
                </Header>
                <ScrollView
                    style={{ flexGrow: 1, padding: 10 }}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={{ height: 20 }} />
                    <View style={{ flexDirection: "row" }}>
                        <Text>Lựa chọn bản đồ nền</Text>
                    </View>
                    <View
                        style={{
                            width: "100%",
                            alignContent: "flex-start",
                            alignItems: "flex-start",
                            padding: 10
                        }}
                    >
                        <Picker
                            selectedValue={this.state.select_network}
                            iosIcon={<Icon name="arrow-down" />}
                            iosHeader="Lựa chọn bản đồ nền"
                            style={{ width: "100%", paddingLeft: 0, paddingRight: 0 }}
                            itemStyle={{ fontSize: 14 }}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({
                                    select_network: itemValue
                                    // index_select_network: itemIndex
                                })
                            }
                        >
                            <Picker.Item label="None" value="0" />
                            <Picker.Item label="Bản đồ Giao thông" value="1" />
                            <Picker.Item label="Bản đồ Vệ tinh" value="2" />
                            <Picker.Item label="Bản đồ Địa hình" value="3" />
                            <Picker.Item label="Bản đồ tích hợp" value="4" />
                        </Picker>
                    </View>

                    <View style={{ height: 20 }} />
                    <View style={{ flexDirection: "row" }}>
                        <Text>Chọn file mbtiles</Text>

                        <View
                            style={{
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 10
                            }}
                        >
                            <View style={styles.textInput}>
                                <TextInput
                                    value={this.state.name_mbtitle_file}
                                    style={{ width: "90%" }}
                                    placeholderColor="#c4c3cb"
                                    onChangeText={text =>
                                        this.setState({ name_mbtitle_file: text })
                                    }
                                />
                                <Button onPress={this._onPressButton}>
                                    <Icon name="ios-search" />
                                </Button>
                            </View>
                        </View>
                    </View>

                    <View style={{ height: 30 }} />

                    <Button
                        primary
                        block
                        onPress={() => this.props.navigation.navigate("HomeScreen")}
                    >
                        <Text uppercase={false} style={{ fontSize: 14 }}>
                            Thêm vào bản đồ
                        </Text>
                    </Button>
                </ScrollView>
            </View>
        );
    }
}

export default ConfigProjectMapScreen;
