import React from "react";
import {
    View,
    Image,
    FlatList
    , ActivityIndicator
} from "react-native";
import {
    Header,
    Button,
    Text,
    Card,
    CardItem,
    Body,
    Right,
    Title,
    Left,
    Toast
} from "native-base";
import styles from "../../untils/styles";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger
} from "react-native-popup-menu";
import DocumentPicker from "react-native-document-picker";
import Modal from "react-native-modal";
import cs_string from "../../untils/strings";
import { withNavigationFocus } from "react-navigation";
import {
    getListFile, insertFile, removeFile
} from "../../database/databaseServices";
import { zip, unzip } from 'react-native-zip-archive'
import colors from '../../untils/colors';
import { dirHome } from "../../database/projectJson";

const RNFS = require('react-native-fs');

class LayoutListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            can_open_other_screen: false,
            loading: false,
            list_file: [],
            active: false,
            modal_visible: false,
            project_id: null,
            fileName: "",
            emptyList: false,
        };
    }


    componentDidMount = () => {
        this._sub = this.props.navigation.addListener(
            "didFocus",
            this._componentFocused
        );
    };

    componentWillUnmount() {
        this._sub.remove();
    }

    _componentFocused = () => {
        this.setState({
            project_id: this.props.navigation.state.params.project_id,
            can_open_other_screen: true,
            // loading: true,
        }, function () {
            getListFile()
                .then(files => {
                    this.setState({
                        // loading: false,
                        list_file: files.filtered(`type_file = "${cs_string.layout_type}"`)
                    }, function () {
                        if (this.state.list_file.length > 0) {
                            this.setState({ emptyList: false })
                        } else {
                            this.setState({ emptyList: true })
                        }

                    });
                })
                .catch(error => {
                    console.error(error);
                    // this.setState({loading: false});
                });
        });
    };

    _addFileFromZip = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.zip]
            });
            console.log(res);
            if (!('.zip'.indexOf(res.name) > -1)) {
                try {
                    await RNFS.mkdir(dirHome);
                    await RNFS.copyFile(res.uri, dirHome + '/' + res.name);
                } catch (e) {
                }
                const targetPath = dirHome + '/' + res.name;
                const name = res.name.replace('.zip', '');
                const charset = 'UTF-8';
                await unzip(targetPath, targetPath.replace('.zip', ''), charset)
                    .then((path) => {
                        insertFile(name, name, cs_string.layout_type);
                        this._componentFocused();
                    })
                    .catch((error) => {
                        alert(error);
                        console.log(error)
                    });
                RNFS.unlink(targetPath)
                    .then(() => console.log('FILE DELETED', targetPath))
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
    };

    _removeFile = async (folder) => {
        await removeFile(folder);
        this._componentFocused()
    };

    useProject = async (folder) => {
        this.setState({
            loading: true
        }, function () {
            this._changeUse(folder)
        });
    };

    _changeUse = async (folder) => {
        await RNFS.exists(dirHome + '/' + this.state.project_id + '/title')
            .then((res) => {
                if (res) {
                    RNFS.unlink(dirHome + '/' + this.state.project_id + '/title')
                        .then(() => console.log('FILE DELETED', dirHome + '/' + this.state.project_id + '/title'));
                }
            }
            );
        await zip(dirHome + '/' + folder, dirHome + '/' + folder + '.zip')
            .then((path) => {
                RNFS.copyFile(dirHome + '/' + folder + '.zip',
                    dirHome + '/' + this.state.project_id + '/title.zip')
                    .then((res) => {
                        const charset = 'UTF-8';
                        const targetPath = dirHome + '/' + this.state.project_id + '/title.zip';
                        unzip(targetPath, targetPath.replace('.zip', ''), charset)
                            .then((path) => {
                                RNFS.unlink(targetPath)
                                    .then(() => console.log('FILE DELETED', targetPath));
                                RNFS.unlink(dirHome + '/' + folder + '.zip')
                                    .then(() => console.log('FILE DELETED', dirHome + '/' + folder + '.zip'));
                                this.setState({
                                    loading: false
                                });
                                Toast.show({
                                    text: 'Sử dụng thành công',
                                    type: "success"
                                });
                            })
                    });
            })
            .catch((error) => {
                console.log(error)
                this.setState({
                    loading: true
                })
            });
    };

    _renderItem(item) {
        return <Card style={{ marginLeft: 0, marginRight: 0 }}>
            <CardItem>
                <Body style={{ flex: 0.9 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{cs_string.layout_name + item.name_file}</Text>
                    <Text>{cs_string.date_create + item.date_create}</Text>
                    <Text>{cs_string.folder_contain + item.folder}</Text>
                </Body>
                <Right style={{ flex: 0.1 }}>

                    {this.state.project_id !== null && <Menu>
                        <MenuTrigger>
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/more_vert_black.png")}>
                            </Image>
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this.useProject(item.folder)}>
                                <Text>{cs_string.use_layout}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._removeFile(item.folder)}>
                                <Text>{cs_string.delete_layout}</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>}

                    {this.state.project_id === null && <Menu>
                        <MenuTrigger>
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/more_vert_black.png")}>
                            </Image>
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this._removeFile(item.folder)}>
                                <Text>{cs_string.delete_layout}</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>}

                </Right>
            </CardItem>
        </Card>;
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    style={{ backgroundColor: colors.head_bg, barStyle: "light-content", height: 80, paddingTop: 30 }}
                    androidStatusBarColor={colors.head_bg}
                >
                    <Left style={{ flex: 0.1 }}>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/arrow_back_white.png")}>
                            </Image>
                        </Button>
                    </Left>

                    <Body
                        style={{
                            flex: 0.8,
                            alignContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Title style={{ color: "white" }}>{cs_string.layout_file}</Title>
                    </Body>
                    <Right style={{ flex: 0.1 }}>
                        <Menu>
                            <MenuTrigger>
                                <Image
                                    style={{ width: 30, height: 30 }}
                                    source={require("../../images/more_horiz_white.png")}>
                                </Image>
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption onSelect={() => this._addFileFromZip()}>
                                    <Text>{cs_string.import_layout_zip}</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </Right>
                </Header>
                {this.state.emptyList && <View
                    style={{ flex: 1, alignItems: 'center', alignContent: 'center', paddingTop: 50 }}
                >
                    <Text style={{ paddingBottom: 20 }}>Truy cập vào trang chuyển đổi để tạo lớp Layout</Text>
                    <Image
                        style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'contain' }}
                        source={require("../../images/convert_intro.png")}
                    >
                    </Image>
                    <Text>{cs_string.non_layout}</Text>
                    <View style={{ height: 30 }} />
                    <Button onPress={() => this._addFileFromZip()}>
                        <Text upercase={false}>Thêm lớp bản đồ</Text>
                    </Button>

                </View>}

                <View style={{ flex: 1 }}>
                    <FlatList
                        data={this.state.list_file}
                        keyExtractor={({ id }, index) => index}
                        renderItem={data => this._renderItem(data.item)}
                    />
                </View>

                <Modal
                    style={{ alignContent: 'center', alignItems: 'center' }}
                    visible={this.state.loading}
                    transparent={true}
                    animationType={"none"}
                    onRequestClose={() => null}
                >
                    <View style={styles.activityIndicatorWrapper}>
                        <ActivityIndicator animating={this.state.loading} color={'red'} />
                        <Text style={styles.title} numberOfLines={1}>
                            Đang xử lý...
                        </Text>
                    </View>
                </Modal>

            </View>
        );
    }
}

export default withNavigationFocus(LayoutListScreen);
