import React from "react";
import {
    View,
    TouchableOpacity,
    Image,
    ScrollView,
    FlatList
} from "react-native";
import {
    Container,
    Header,
    Content,
    Button,
    Text,
    Icon,
    Card,
    CardItem,
    Body,
    Right,
    Title,
    Fab,
    Left
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
import {withNavigationFocus} from "react-navigation";
import { getListFile, insertFile, removeFile
} from "../../database/databaseServices";
import {zip, unzip} from 'react-native-zip-archive'

import {dirHome} from "../../database/projectJson";


import Share from 'react-native-share';
import {Platform} from 'react-native';
const RNFS = require('react-native-fs');

class BackGroundListScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            can_open_other_screen: false,
            loading: false,
            list_file: [],
            active: false,
            modal_visible: false,
            fileName: ""
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
        this.setState({can_open_other_screen: true, loading: true}, function () {
            getListFile()
                .then(files => {
                    this.setState({
                        loading: false,
                        list_file: files.filtered(`type_file = "${cs_string.background_type}"`)
                    });
                })
                .catch(error => {
                    console.error(error);
                    this.setState({loading: false});
                });
        });
    };

    _addFileFromZip = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.allzip]
            });

            try {
                await RNFS.mkdir(dirHome);
                await RNFS.copyFile(res.uri,
                    dirHome + '/' + res.name);
            } catch (e) {
            }
            const targetPath = dirHome + '/' + res.name;
            const charset = 'UTF-8';
            await unzip(targetPath, targetPath.replace('.zip', ''), charset)
                .then((path) => {
                    insertFile(res.name,res.name, cs_string.background_type);
                    this._componentFocused();
                })
                .catch((error) => {
                    alert(error);
                    console.log(error)
                })
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

    _shareFile = async (folder) => {
        zip(dirHome + '/' + folder, dirHome + '/' + folder + '.zip')
            .then((path) => {
                if (Platform.OS === 'ios') {
                    const options = {
                        title: 'Share via',
                        message: 'Share Project',
                        url: dirHome + '/' + folder + '.zip',
                        filename: folder + '.zip',
                    };
                    Share.open(options)
                        .then((res) => {
                            try {
                                RNFS.exists(dirHome + '/' + folder + '.zip')
                                    .then((res) => {
                                        if (res) {
                                            RNFS.unlink(dirHome + '/' + folder + '.zip')
                                                .then(() => console.log('FILE DELETED'))
                                        }
                                    })
                            } catch (e) {

                            }
                        })
                        .catch((err) => {
                            err && console.log(err);
                        });
                } else {
                    RNFS.readFile(dirHome + '/' + folder + '.zip', 'base64')
                        .then(base64Data => {
                            base64Data = `data:application/zip;base64,${base64Data}`;
                            Share.open({url: base64Data, filename: folder + '.zip'})
                                .then((res) => {
                                    try {
                                        RNFS.exists(dirHome + '/' + folder + '.zip')
                                            .then((res) => {
                                                if (res) {
                                                    RNFS.unlink(dirHome + '/' + folder + '.zip')
                                                        .then(() => alert('FILE DELETED'))
                                                }
                                            })
                                    } catch (e) {
                                    }
                                })
                                .catch((err) => {
                                    err && console.log(err);
                                });
                            ;
                        })
                }

            })
            .catch((error) => {
                console.log(error)
            })

    };

    _editFile = (folder, name_file) => {
        this.props.navigation.navigate("NewProjectScreen", {
            folder: folder, name_file: name_file
        })
    };

    _renderItem(item) {
        return <Card style={{marginLeft: 0, marginRight: 0}}>
            <CardItem >
                <Body style={{flex: 0.7}}>
                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.project + item.name_file}</Text>
                    <Text>{cs_string.creator + item.date_create}</Text>
                    <Text>{cs_string.note + item.folder}</Text>
                </Body>
                <Right style={{flex: 0.1}}>
                    <Menu>
                        <MenuTrigger>
                            <Icon name="add" style={{color: "blue"}}/>
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this._editFile(item.folder, item.name_file)}>
                                <Text>{cs_string.edit_project}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._shareFile(item.folder)}>
                                <Text>{cs_string.share_project}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._removeFile(item.folder)}>
                                <Text>{cs_string.delete_project}</Text>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </Right>
            </CardItem>
        </Card>;
    }

    render() {
        return (
            <View style={styles.container}>
                <Header
                    style={{backgroundColor: "blue", barStyle: "light-content", height: 80, paddingTop: 30}}
                    androidStatusBarColor={"blue"}
                >
                    <Left style={{flex: 0.1}}>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" style={{color: "white"}}/>
                        </Button>
                    </Left>

                    <Body
                        style={{
                            flex: 0.8,
                            alignContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Title style={{color: "white"}}>{cs_string.background_file}</Title>
                    </Body>
                    <Right style={{flex: 0.1}}>
                        <Menu>
                            <MenuTrigger>
                                <Icon name="add" style={{color: "white"}}/>
                            </MenuTrigger>
                            <MenuOptions>
                                <MenuOption onSelect={() => this._addFileFromZip()}>
                                    <Text>{cs_string.import_form_zip}</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </Right>
                </Header>
                <View style={{flex: 1}}>
                    <FlatList
                        data={this.state.list_file}
                        keyExtractor={({id}, index) => index}
                        renderItem={data => this._renderItem(data.item)}
                    />
                </View>

            </View>
        );
    }
}

export default withNavigationFocus(BackGroundListScreen);
