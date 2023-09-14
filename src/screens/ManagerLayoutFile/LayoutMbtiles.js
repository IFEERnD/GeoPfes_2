import React from "react";
import {
    View,
    Image,
    FlatList,
    ActivityIndicator,
    Alert
} from "react-native";
import moment from 'moment';
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
import colors from '../../untils/colors';
import SQLite from 'react-native-sqlite-storage';
const RNFS = require('react-native-fs');
import { dirHome } from "../../database/projectJson";
let db;
let idpr;
class LayoutMbtiles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            list_file: [],
            project_id: null,
            show: false
        };
    }

    componentDidMount() {
        this._componentFocused();
    }

    _componentFocused() {
        var id = this.props.navigation.state.params.project_id;
        idpr = id;
        this.setState({
            project_id: id,
        }, function () {
            this.setState({ list_file: [], show: false });
            RNFS.readDir(dirHome)
                .then((result) => {
                    if (result.length > 0) {
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].name.endsWith('.mbtiles')) {
                                const obj = { 'name': result[i].name, 'time': moment(result[i].mtime).utcOffset('+7:00').format('D-M-Y H:m:ss') };
                                const list = this.state.list_file.slice();
                                list.push(obj);
                                this.setState({ list_file: list, show: true });
                            }
                        }
                    }
                    else {
                        this.setState({ show: false });
                    }
                })
                .catch((err) => {
                    console.log(err.message, err.code);
                });
        });
    };

    _addMbtiles = async () => {
        try {
            const res1 = await DocumentPicker.pick({
                type: [DocumentPicker.types.mbtiles]
            });
            const res = res1[0];
            if (res.name.endsWith('.mbtiles')) {
                var path = dirHome;
                if (!RNFS.exists(path)) {
                    await RNFS.mkdir(path);
                }
                await RNFS.copyFile(res.uri, path + '/' + res.name);
            }
            else {
                Toast.show({
                    text: 'File không đúng định dạng',
                    type: "danger"
                });
            }
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
            } else {
                throw err;
            }
        }
        this._componentFocused();
    };

    _createF(d) {
        RNFS.mkdir(d);
    }

    useProject = (name) => {
        this.setState({
            loading: true
        });
        var file_path = dirHome + '/' + this.state.project_id;
        RNFS.exists(file_path + '/title')
            .then((res) => {
                if (res) {
                    RNFS.unlink(file_path + '/title')
                        .then(RNFS.mkdir(file_path + '/title'))
                }
            });
        RNFS.mkdir(file_path + '/title');
        db = SQLite.openDatabase({ name: name, location: 'Documents' }, this.successcb, this.errorcb);
        this.setState({
            loading: false
        });
        Toast.show({
            text: 'Sử dụng thành công',
            type: "success"
        });
    }

    successcb() {
        db.transaction((tx) => {
            var path_pr = dirHome + '/' + idpr + '/title';
            tx.executeSql('SELECT DISTINCT zoom_level FROM tiles', [], (tx, zoom_level) => {
                var len_zoom = zoom_level.rows.length;
                for (let i = 0; i < len_zoom; i++) {
                    let row_zoom = zoom_level.rows.item(i);
                    RNFS.mkdir(path_pr + '/' + row_zoom.zoom_level);
                    tx.executeSql('SELECT DISTINCT tile_column FROM tiles WHERE zoom_level = ' + row_zoom.zoom_level, [], (tx, tile_column) => {
                        var len_column = tile_column.rows.length;
                        for (let j = 0; j < len_column; j++) {
                            let row_column = tile_column.rows.item(j);
                            RNFS.mkdir(path_pr + '/' + row_zoom.zoom_level + '/' + row_column.tile_column);
                            tx.executeSql('SELECT tile_row, tile_data FROM tiles WHERE zoom_level = ' + row_zoom.zoom_level + ' AND tile_column = ' + row_column.tile_column, [], (tx, data) => {
                                var len = data.rows.length;
                                for (let k = 0; k < len; k++) {
                                    var y = parseInt(Math.pow(2, parseInt(row_zoom.zoom_level)) - parseInt(data.rows.item(k).tile_row) - 1);
                                    path = path_pr + '/' + row_zoom.zoom_level + '/' + row_column.tile_column + '/' + y + '.png';
                                    RNFS.writeFile(path, data.rows.item(k).tile_data, 'base64')
                                        .then((success) => {
                                            console.log('success');
                                        })
                                        .catch((err) => {
                                            console.log(err.message);
                                        });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    errorcb(er) {
        console.log(er);
    }


    _removeFile = (name) => {
        var path = dirHome + '/' + name;
        if (RNFS.exists(path)) {
            RNFS.unlink(path)
                .then(() => this._componentFocused());
        }
    }

    _renderItem(item) {
        return <Card style={{ marginLeft: 0, marginRight: 0 }}>
            <CardItem>
                <Body style={{ flex: 0.9 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Tệp tin: {item.name}</Text>
                    <Text>Ngày tạo: {item.time}</Text>
                </Body>
                <Right style={{ flex: 0.1 }}>
                    {this.state.project_id !== null && <Menu>
                        <MenuTrigger>
                            <Image
                                style={{ width: 30, height: 30 }} source={require("../../images/more_vert_black.png")}>
                            </Image>
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption onSelect={() => this.useProject(item.name)}>
                                <Text>{cs_string.use_layout}</Text>
                            </MenuOption>
                            <MenuOption onSelect={() => this._removeFile(item.name)}>
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
                            <MenuOption onSelect={() => this._removeFile(item.name)}>
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
                        <Title style={{ color: "white" }}>Thêm Mbtiles</Title>
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
                                <MenuOption onSelect={() => this._addMbtiles()}>
                                    <Text>Thêm file mbtiles</Text>
                                </MenuOption>
                            </MenuOptions>
                        </Menu>
                    </Right>
                </Header>
                {!this.state.show ?
                    <View
                        style={{ flex: 1, alignItems: 'center', alignContent: 'center', paddingTop: 50 }}
                    >
                        <Text>{cs_string.non_layout}</Text>
                        <View style={{ height: 30 }} />
                        <Button onPress={() => this._addMbtiles()}>
                            <Text upercase={false}>Thêm Mbtiles</Text>
                        </Button>

                    </View>
                    :
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={this.state.list_file}
                            keyExtractor={({ id }, index) => index}
                            renderItem={data => this._renderItem(data.item)}
                        />
                    </View>
                }
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

export default withNavigationFocus(LayoutMbtiles);
