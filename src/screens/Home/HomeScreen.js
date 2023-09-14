import React, { Component } from "react";
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
import cs_string from "../../untils/strings";
import { withNavigationFocus } from "react-navigation";
import {
    getListProjects,
    updateProjects,
    insertProjects,
    removeProjects,
    insertProjectsFromZip
} from "../../database/databaseServices";
import { zip, unzip } from 'react-native-zip-archive'

import { dirHome, getObjectDrawer, saveObjectShare, getObjectDrawerShare } from "../../database/projectJson";

const RNFS = require('react-native-fs');
import Share from 'react-native-share';
import { Platform } from 'react-native';
import colors from "../../untils/colors";
import moment from "moment";
import { transformLatLng } from "../../untils/converProject";

class HomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            can_open_other_screen: false,
            loading: false,
            list_project: [],
            active: false,
            modal_visible: false,
            fileName: "",
            emptyList: false
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
        this.setState({ can_open_other_screen: true, loading: true }, function () {
            getListProjects()
                .then(projects => {
                    if (projects.length > 0) {
                        this.setState({
                            loading: false,
                            list_project: projects,
                            emptyList: false
                        });
                    } else {
                        this.setState({
                            loading: false,
                            list_project: projects,
                            emptyList: true
                        });
                    }
                })
                .catch(error => {
                    console.error(error);
                    this.setState({
                        loading: false,
                        emptyList: true
                    });
                });
        });
    };

    _addProject = () => {
        this.props.navigation.navigate("NewProjectScreen");
    };

    _gotoMapScreen = (id, folder_name, projection) => {
        this.props.navigation.navigate('MapProjectScreen', { id: id, folder_name: folder_name, projection: projection });
    };

    _addProjectFromZip = async () => {
        try {
            const res = await DocumentPicker.pick({
                type: [DocumentPicker.types.zip]
            });

            try {
                await RNFS.mkdir(dirHome);
                await RNFS.copyFile(res.uri,
                    dirHome + '/' + res.name);
            } catch (e) {
            }
            const targetPath = dirHome + '/' + res.name;
            const folder_unzip = res.name.replace('.zip', '');
            const charset = 'UTF-8';
            await unzip(targetPath, targetPath.replace('.zip', ''), charset)
                .then((path) => {
                    // alert(targetPath)
                    RNFS.readFile(targetPath.replace('.zip', '') + '/project.txt', "utf8")
                        .then(res => {
                            let obj = JSON.parse(res);
                            if (obj.folder_name === folder_unzip) {
                                insertProjectsFromZip(JSON.parse(res));
                                try {
                                    RNFS.exists(targetPath)
                                        .then((res) => {
                                            if (res) {
                                                RNFS.unlink(targetPath)
                                                    .then(() => console.log('FILE DELETED'))
                                            }
                                        })
                                } catch (e) {

                                }
                            } else {
                                insertProjectsFromZip(JSON.parse(res));
                                unzip(targetPath, dirHome + '/' + obj.folder_name, charset);
                                try {
                                    RNFS.exists(targetPath)
                                        .then((res) => {
                                            if (res) {
                                                RNFS.unlink(targetPath)
                                                    .then(() => console.log('FILE DELETED'))
                                            }
                                        })
                                } catch (e) {

                                }
                                try {
                                    RNFS.exists(targetPath.replace('.zip', ''))
                                        .then((res) => {
                                            if (res) {
                                                RNFS.unlink(targetPath.replace('.zip', ''))
                                                    .then(() => console.log('FILE DELETED'))
                                            }
                                        })
                                } catch (e) {

                                }
                            }

                            this._componentFocused()
                        })
                        .catch(err => {
                            console.log(err.message, err.code);
                        });

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

    _removeProject = async (id) => {
        await removeProjects(id);
        this._componentFocused()
    };

    _shareProject = async (folder) => {

        let object = await getObjectDrawerShare(folder);

        let features_share = [];
        if (object) {
            let points = object.points;
            let polyline = object.polyline;
            let polygon = object.polygon;

            if (points.length > 0) {
                for (let i = 0; i < points.length; i++) {
                    features_share = [...features_share, {
                        type: "Feature",
                        properties: {
                            name: points[i].key,
                            type: points[i] ?.type || '',
                            info: points[i] ?.info || '',
                            note: points[i] ?.note || '',
                        },
                        geometry: {
                            type: "Point",
                            coordinates: [
                                points[i].coordinate.longitude,
                                points[i].coordinate.latitude
                            ]
                        }
                    }]
                }
            }

            if (polyline.length > 0) {
                for (let i = 0; i < polyline.length; i++) {
                    let coordinates_line = polyline[i].coordinates;
                    let coordinates_new = [];
                    for (let idx = 0; idx < coordinates_line.length; idx++) {
                        coordinates_new = [...coordinates_new, [
                            coordinates_line[idx].longitude,
                            coordinates_line[idx].latitude,
                        ]]
                    }
                    features_share = [...features_share, {
                        type: "Feature",
                        properties: {
                            name: polyline[i].key,
                            type: polyline[i] ?.type || '',
                            info: polyline[i] ?.info || '',
                            note: polyline[i] ?.note || '',
                            distance: polyline[i] ?.distance || '',
                        },
                        geometry: {
                            type: "LineString",
                            coordinates: coordinates_new
                        }
                    }]
                }
            }

            if (polygon.length > 0) {
                for (let i = 0; i < polygon.length; i++) {
                    let coordinates_poly = polygon[i].coordinates;
                    let coordinates_new = [];
                    for (let idx = 0; idx < coordinates_poly.length; idx++) {
                        coordinates_new = [...coordinates_new, [
                            coordinates_poly[idx].longitude,
                            coordinates_poly[idx].latitude,
                        ]]
                    }
                    features_share = [...features_share, {
                        type: "Feature",
                        properties: {
                            name: polygon[i].key,
                            type: polygon[i] ?.type || '',
                            info: polygon[i] ?.info || '',
                            note: polygon[i] ?.note || '',
                            area: polygon[i] ?.area || '',
                        },
                        geometry: {
                            type: "Polygon",
                            coordinates: [coordinates_new]
                        }
                    }]
                }
            }
        }


        let object_share = {
            type: "FeatureCollection",
            features: features_share,
        };

        let path = dirHome + '/' + folder + '/objectShare.json';
        RNFS.writeFile(path, JSON.stringify(object_share), 'utf8')
            .then((success) => {
                this._actionZipShare(folder)
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    _actionZipShare = async (folder) => {
        try {
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
                                Share.open({ url: base64Data, filename: folder + '.zip' })
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
                            })
                    }

                })
                .catch((error) => {
                    console.log(error)
                })
        } catch (err) {

        }

    };

    _editProject = (id, name, description, note, creator, background_file, layout_file, projection) => {
        this.props.navigation.navigate("NewProjectScreen", {
            id: id, name: name, description: description,
            note: note, creator: creator, background_file: background_file, layout_file: layout_file, projection: projection
        })
    };

    _renderItem(item) {
        return <Card style={{ marginLeft: 0, marginRight: 0 }}>
            <CardItem button onPress={() => this._gotoMapScreen(item.id, item.folder_name, item.projection)}>
                <Left style={{ flex: 0.2 }}>
                    <View style={{
                        width: 60,
                        height: 60,
                        borderRadius: 60 / 2,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.red
                    }}
                    >
                        <Text style={{ fontSize: 30, paddingRight: 7 }}>{item.project_name[0].toUpperCase()}</Text>
                    </View>
                </Left>
                <Body style={{ flex: 0.7 }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        paddingBottom: 5
                    }}>{cs_string.project + item.project_name}</Text>
                    <Text>{cs_string.creator + item.created_person}</Text>
                    <Text>{cs_string.date_create + item.created_date}</Text>
                    <Text>{cs_string.description + item.description}</Text>
                    <Text>{cs_string.note + item.note}</Text>
                </Body>
                <Right style={{ flex: 0.1 }}>
                    <Menu>
                        <MenuTrigger>
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/more_vert_black.png")}>
                            </Image>
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this._editProject(item.id, item.project_name,
                                item.description, item.note, item.created_person,
                                item.background_file, item.layout_file, item.projection)}>
                                <Text>{cs_string.edit_project}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._shareProject(item.id)}>
                                <Text>{cs_string.share_project}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._removeProject(item.id)}>
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
                    style={{ backgroundColor: colors.head_bg, barStyle: "light-content", height: 80, paddingTop: 30}}
                    androidStatusBarColor={colors.head_bg}
                >
                    <Left style={{ flex: 0.1 }}>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.openDrawer()}
                        >
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/menu_white.png")}>
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
                        <Title style={{ color: "white" }}>{cs_string.title_home}</Title>
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
                                <MenuOption onSelect={this._addProjectFromZip}>
                                    <Text>{cs_string.import_form_zip}</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </Right>
                </Header>
                {this.state.emptyList && <View
                    style={{ flex: 1, alignItems: 'center', alignContent: 'center', paddingTop: 0 }}
                >
                    <Image
                        style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'contain' }}
                        source={require("../../images/ifee_image_1.jpg")}
                    >
                    </Image>
                    <View style={{ flexDirection: 'row', alignContent: 'flex-end' }}>
                        <Text>Nhấn nút thêm </Text>
                        <Image
                            style={{width: 30, height: 30}}
                            source={require("../../images/add_project_image.png")}
                        />
                        <Text> để tạo dự án mới </Text>
                    </View>

                        <View style={{ height: 30 }} />

                    </View>}
                <View style={{ flex: 1 }}>
                        <FlatList
                            data={this.state.list_project}
                            keyExtractor={({ id }, index) => index}
                            renderItem={data => this._renderItem(data.item)}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={this._addProject}
                        style={{
                            position: 'absolute',
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            right: 15,
                            bottom: 30,
                        }}
                    >
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Image
                                style={{ width: 40, height: 40 }}
                                source={require("../../images/plus_round.png")}
                            />
                        </View>

                    </TouchableOpacity>
                {/* <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                        this.props.navigation.navigate("HomeFakeScreen");
                    }}
                    style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center',
                        right: 100,
                        bottom: 30,
                    }}
                >
                    <View style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'blue',
                        borderRadius: 50,
                        height: 50,
                        width: 50
                    }}>
                        <Text style={{color: '#ffffff', flex: 1, margin: 5, textAlign: 'center'}}>Pick File</Text>
                    </View>

                </TouchableOpacity> */}
                </View>
        );
            }
        }

        export default withNavigationFocus(HomeScreen);
