import React, {Component} from "react";
import {
    View,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView, Modal, FlatList, Alert
} from "react-native";
import {
    Header,
    Icon,
    Left,
    Right,
    Body,
    Textarea,
    Text,
    Button,
    Title,
    Picker, Card, CardItem
} from "native-base";
import styles from "../../untils/styles";
import cs_string from "../../untils/strings";
import ImagePicker from 'react-native-image-crop-picker';
import moment from "moment";
import {dirHome, getObjectDrawer, saveObjectDrawer} from "../../database/projectJson";
import {transformLatLng} from "../../untils/converProject";
import {convertTimeToStringFull} from "../../untils/convertTime";
import {Callout, Marker} from "react-native-maps";
import ImageViewer from "react-native-image-zoom-viewer";
import colors from '../../untils/colors';
import CaptureImage from "../../components/CaptureImage";


const RNFS = require('react-native-fs');

const moveAttachment = async (filePath, newFilepath) => {
    return new Promise((resolve, reject) => {
        RNFS.moveFile(filePath, newFilepath)
            .then(() => {
                console.log('FILE MOVED', filePath, newFilepath);
                resolve(true);
            })
            .catch(error => {
                console.log('moveFile error', error);
                reject(error);
            });
    });
};

const LATITUDE = 21.1147;
const LONGITUDE = 105.546;

const default_point = {
    coordinate: {latitude: LATITUDE, longitude: LONGITUDE},
    point: transformLatLng(LATITUDE, LONGITUDE, 0),
    key: convertTimeToStringFull(new Date()),
    id: convertTimeToStringFull(new Date())
};

class LineDetailsScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            points: [],
            polyline: [],
            polygon: [],
            point_id: null,
            point_details: null,
            image: null,
            project_id: null,
            list_image_old: [],
            images: [],
            modalVisible: false,
            index: 0,
            namePoint: '',
            typePoint: '',
            infoPoint: '',
            notePoint: '',
            distance: null,
            dateCreate: null,
            list_image_td: [],
            location_current: null,
            projection: 0,
            modal2Visible: false,

        };
    }

    componentDidMount() {
        this._getData();
    }

    _getData = async () => {
        let list_image_td = [];
        let list_image_convert = [];
        let path = dirHome + '/' + this.props.navigation.state.params.folder_name + '/image_list.txt';
        let projection = this.props.navigation.state.params.projection;
        let location = this.props.navigation.state.params.location;
        let point_id = this.props.navigation.state.params.polyline_id;

        try {
            await RNFS.readFile(path, "utf8")
                .then(res => {
                    list_image_td = JSON.parse(res);
                })
                .catch(err => {
                    console.log(err.message, err.code);
                });
        } catch (e) {
        }

        if(list_image_td.length >0) {
            for (let i = 0; i < list_image_td.length; i++) {
                let image_new = list_image_td[i];
                image_new.point = transformLatLng(
                    image_new.location.latitude, image_new.location.longitude, projection);
                image_new.dateCreate = moment(moment(image_new.uri.replace('.jpg',''), 'YYYYMMDDHHmmSS')).format('HH:mm MMM DD, YYYY');
                list_image_convert = [...list_image_convert, image_new];
            }
        }

        let object = await getObjectDrawer(this.props.navigation.state.params.folder_name);
        if (object) {
            this.setState({
                folder_name: this.props.navigation.state.params.folder_name,
                projection: projection,
                list_image_td: list_image_convert,
                location_current: location,
                points: object.points,
                polyline: object.polyline,
                polygon: object.polygon,
                lastPoint: object?.lastPoint || default_point,
                getData: true,
                point_id: point_id,
            }, function () {
                if (this.state.polyline.length > 0) {
                    for (let i = 0; i < this.state.polyline.length; i++) {
                        if (this.state.polyline[i].id === this.state.point_id) {
                            let momentObj = moment(this.state.polyline[i].id, 'YYYYMMDDHHmmSS');
                            let showDate = moment(momentObj).format('HH:mm MMM DD, YYYY');
                            let distanceLine = (this.state.polyline[i].distance*1000).toFixed(2);
                            this.setState({
                                point_details: this.state.polyline[i],
                                namePoint: this.state.polyline[i].key,
                                typePoint: this.state.polyline[i]?.type || '',
                                infoPoint: this.state.polyline[i]?.info || '',
                                notePoint: this.state.polyline[i]?.note || '',
                                distance: distanceLine,
                                dateCreate: showDate,
                                list_image_old: this.state.polyline[i]?.list_image || []
                            }, function () {
                                if (this.state.list_image_old.length > 0) {
                                    let images_ = [];
                                    for (let j = 0; j < this.state.list_image_old.length; j++) {
                                        images_ = [...images_, {
                                            dateCreate: moment(moment(this.state.list_image_old[j].uri.replace('.jpg',''), 'YYYYMMDDHHmmSS')).format('HH:mm MMM DD, YYYY'),
                                            url: `file://${dirHome}/${this.state.folder_name}/${this.state.list_image_old[j].uri}`,
                                            index: j,
                                            location: this.state.list_image_old[j]?.location || 'NaN',
                                            point: transformLatLng(this.state.list_image_old[j]?.location?.latitude,
                                                this.state.list_image_old[j]?.location?.longitude, this.state.projection)
                                        }]
                                    }
                                    this.setState({
                                        images: images_
                                    }, function () {
                                        console.log('hungdx', images_)
                                    })
                                }
                            })
                        }
                    }
                }
            });
        }

    };

    _savePoint = async () => {
        let points_new = [];
        if (this.state.polyline.length > 0) {
            for (let i = 0; i < this.state.polyline.length; i++) {
                if (this.state.polyline[i].id === this.state.point_id) {
                    points_new.push({
                        coordinates: this.state.polyline[i].coordinates,
                        id: this.state.polyline[i].id,
                        list_image: this.state.polyline[i].list_image,
                        distance: this.state.polyline[i].distance,
                        key: this.state.namePoint,
                        type: this.state.typePoint,
                        info: this.state.infoPoint,
                        note: this.state.notePoint,

                    })
                } else {
                    points_new.push(this.state.polyline[i])
                }
            }
        }

        let object = {
            points: this.state.points,
            polyline: points_new,
            polygon: this.state.polygon,
            lastPoint: this.state.lastPoint
        };
        let folder_name = this.state.folder_name;
        saveObjectDrawer(object, folder_name).then(r => {
        });
        this.props.navigation.goBack();
    };

    saveImage = async (filePath, folder_name, type) => {
        try {
            // set new image name and filepath
            const newImageName = `${moment().format('YYYYMMDDHHmmSSS')}.jpg`;
            const newFilepath = `${dirHome}/${folder_name}/${newImageName}`;
            await moveAttachment(filePath, newFilepath);

            let points_new = [];
            let list_image_new = [];
            let location = this.state.location_current;
            if (type === 0) {
                location = 'NaN'
            }
            if (this.state.polyline.length > 0) {
                for (let i = 0; i < this.state.polyline.length; i++) {
                    if (this.state.polyline[i].id === this.state.point_id) {
                        let list_oldimage = this.state.polyline[i]?.list_image || [];
                        list_image_new = [...list_oldimage,
                            {
                                uri: newImageName,
                                location: location
                            }
                        ];
                        points_new.push({
                            coordinates: this.state.polyline[i].coordinates,
                            distance: this.state.polyline[i].distance,
                            key: this.state.polyline[i].key,
                            id: this.state.polyline[i].id,
                            list_image: list_image_new
                        })
                    } else {
                        points_new.push(this.state.polyline[i])
                    }
                }
            }
            this.setState({
                polyline: points_new,
                list_image_old: list_image_new,
            }, function () {
                if (this.state.list_image_old.length > 0) {
                    let images_ = [];
                    for (let j = 0; j < this.state.list_image_old.length; j++) {
                        images_ = [...images_, {
                            dateCreate: moment(moment(this.state.list_image_old[j].uri.replace('.jpg',''), 'YYYYMMDDHHmmSS')).format('HH:mm MMM DD, YYYY'),
                            url: `file://${dirHome}/${this.state.folder_name}/${this.state.list_image_old[j].uri}`,
                            index: j,
                            location: this.state.list_image_old[j]?.location,
                            point: transformLatLng(this.state.list_image_old[j]?.location?.latitude, this.state.list_image_old[j]?.location?.longitude,
                                this.state.projection)
                        }]
                    }
                    this.setState({
                        images: images_
                    })
                }
            })

        } catch (error) {
            console.log(error);
        }
    };

    select_image = () => {
        Alert.alert(
            cs_string.notification,
            cs_string.chon_anh,
            [
                {
                    text: cs_string.library_image,
                    onPress: () => {
                        this.setState({
                            markers: [],
                            editing: null
                        }, function () {
                            this._onPressButton()
                        })
                    },
                    style: 'cancel',
                },
                {
                    text: cs_string.chup_thuc_dia,
                    onPress: () => {
                        this.setState({
                            markers: [],
                            editing: null
                        }, function () {
                            this.setState({
                                modal2Visible: true
                            })
                        })
                    },
                    style: 'cancel',
                },
                {text: cs_string.cancel, onPress: () => console.log('OK Pressed'), style: 'cancel'},
            ],
            {cancelable: false},
        )
    };

    _captureImage = () => {
        this._onCapture()
    };

    _onCapture = async () => {
        try {
            setTimeout(() => {
                ImagePicker.openCamera({
                    cropping: true,
                    width: 480,
                    height: 800,
                    includeExif: true
                }).then(image => {
                    this.captureRef.handleCapture(image.path, {
                        latitude: transformLatLng(this.state.location_current?.latitude,this.state.location_current?.longitude,this.state.projection).lat|| 'NaN',
                        longitude: transformLatLng(this.state.location_current?.latitude,this.state.location_current?.longitude,this.state.projection).long || 'NaN',
                    },
                    this.state.projection)
                }).catch(err => {

                });
            }, 100)
        } catch (err) {

        }
    }

    _onPressButton = async () => {
        try {
            setTimeout(() => {
                ImagePicker.openPicker({
                    cropping: true,
                    width: 480,
                    height: 800,
                    includeExif: true
                }).then(image => {
                    this.saveImage(image.path, this.state.folder_name, 0);
                }).catch(err => {
                    // console.error('capture picture error', err);
                });
            }, 100)

            // setTimeout(() => {
            //     ImagePicker.openCamera({
            //         cropping: false,
            //         width: 300,
            //         height: 300,
            //         includeExif: true
            //     }).then(image => {
            //         this.saveImage(image.path, '20191211210300');
            //     }).catch(err => {
            //         console.error('capture picture error', err);
            //     });
            // }, 100)
        } catch (err) {

        }

    };

    _deletePoint = () => {
        Alert.alert(
            cs_string.notification,
            cs_string.delete_object,
            [
                {
                    text: cs_string.continous,
                    onPress: () => {this.setState({
                        markers: [],
                        editing: null
                    }, function () {
                        this._deleteObject()
                    })},
                    style: 'cancel',
                },
                {text: cs_string.cancel, onPress: () => console.log('OK Pressed'), style: 'cancel'},
            ],
            {cancelable: false},
        )
    };

    _deleteObject = () => {
        let points_new = [];
        if (this.state.polyline.length > 0) {
            for (let i = 0; i < this.state.polyline.length; i++) {
                if (this.state.polyline[i].id === this.state.point_id) {

                } else {
                    points_new.push(this.state.polyline[i])
                }
            }
        }

        let object = {
            points: this.state.points,
            polyline: points_new,
            polygon: this.state.polygon,
            lastPoint: this.state.lastPoint
        };
        let folder_name = this.state.folder_name;
        saveObjectDrawer(object, folder_name).then(r => {
        });
        this.props.navigation.goBack();
    };

    _renderItem = (item) => {
        return <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={() => this.setState({
                modalVisible: true,
                index: item.index
            })}
        >
            <Card>
                <CardItem>
                    <View>
                        <Image
                            style={{width: 240, height: 400}}
                            source={{uri: item.url, scale: 1}}
                        />
                        <View style={{height: 10}} />
                        <Text>{cs_string.date_create}{item.dateCreate}</Text>
                        <Text>{cs_string.lat}: {item.point?.lat}</Text>
                        <Text>{cs_string.long}: {item.point?.long}</Text>
                    </View>
                </CardItem>
            </Card>
        </TouchableOpacity>
    };


    _chose_thuc_dia = async (uri, location) => {
        try {
            let points_new = [];
            let list_image_new = [];
            if (this.state.polyline.length > 0) {
                for (let i = 0; i < this.state.polyline.length; i++) {
                    if (this.state.polyline[i].id === this.state.point_id) {
                        let list_oldimage = this.state.polyline[i]?.list_image || [];
                        list_image_new = [...list_oldimage,
                            {
                                uri: uri,
                                location: location
                            }
                        ];
                        points_new.push({
                            coordinates: this.state.polyline[i].coordinates,
                            distance: this.state.polyline[i].distance,
                            key: this.state.polyline[i].key,
                            id: this.state.polyline[i].id,
                            list_image: list_image_new
                        })
                    } else {
                        points_new.push(this.state.polyline[i])
                    }
                }
            }
            this.setState({
                polyline: points_new,
                list_image_old: list_image_new,
            }, function () {
                if (this.state.list_image_old.length > 0) {
                    let images_ = [];
                    for (let j = 0; j < this.state.list_image_old.length; j++) {
                        images_ = [...images_, {
                            dateCreate: moment(moment(this.state.list_image_old[j].uri.replace('.jpg',''), 'YYYYMMDDHHmmSS')).format('HH:mm MMM DD, YYYY'),
                            url: `file://${dirHome}/${this.state.folder_name}/${this.state.list_image_old[j].uri}`,
                            index: j,
                            location: this.state.list_image_old[j]?.location,
                            point: transformLatLng(this.state.list_image_old[j]?.location?.latitude, this.state.list_image_old[j]?.location?.longitude,
                                this.state.projection)
                        }]
                    }
                    this.setState({
                        images: images_
                    })
                }
            })

        } catch (error) {
            console.log(error);
        }
    };

    _renderItem_list = (item) => {
        return <TouchableOpacity
            style={{alignItems: 'center'}}
            onPress={() => this.setState({
                modal2Visible: false,
            }, function () {
                this._chose_thuc_dia(item.uri, item.location);
            })}
        >
            <Card>
                <CardItem>
                    <View>
                        <Image
                            style={{width: 240, height: 400}}
                            source={{uri: `file://${dirHome}/${this.state.folder_name}/${item.uri}`, scale: 1}}
                        />
                        <View style={{height:10}}/>
                        <Text>{cs_string.date_chup}{item.dateCreate}</Text>
                        <Text>{cs_string.lat}: {item.point?.lat}</Text>
                        <Text>{cs_string.long}: {item.point?.long}</Text>
                    </View>
                </CardItem>
            </Card>
        </TouchableOpacity>
    };

    render() {

        const {images} =this.state;
        return (
            <View style={{flex: 1}}>
                <Header
                    style={{backgroundColor: colors.head_bg, barStyle: "light-content", height: 80, paddingTop: 30}}
                    androidStatusBarColor={colors.head_bg}
                >
                    <Left style={{flex: 0.1}}>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Image
                                style={{width: 30, height: 30}} source={require("../../images/arrow_back_white.png")}>
                            </Image>
                        </Button>
                    </Left>
                    <Body
                        style={{
                            flex: 0.9,
                            alignContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Title style={{color: "white"}}>
                            {cs_string.info_line}
                        </Title>
                    </Body>

                    <Right style={{flex: 0.1}}>
                        <Button transparent onPress={() => this._deletePoint()}>
                            <Image
                                style={{width: 30, height: 30}} source={require("../../images/delete_white.png")}>
                            </Image>
                        </Button>
                    </Right>
                </Header>
                <ScrollView
                    style={{flexGrow: 1, padding: 10, marginBottom: 80}}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.name_line}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({namePoint: text})}
                            autoCompleteType="off"
                            value={this.state.namePoint}
                        />
                    </View>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.type_line}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({typePoint: text})}
                            autoCompleteType="off"
                            value={this.state.typePoint}
                        />
                    </View>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.info_line}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({infoPoint: text})}
                            autoCompleteType="off"
                            value={this.state.infoPoint}
                        />
                    </View>


                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.note_point}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({notePoint: text})}
                            autoCompleteType="off"
                            value={this.state.notePoint}
                        />
                    </View>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.line_width}</Text>
                    </View>
                    <View style={{height: 5}}/>
                    <Text>{this.state.distance} m</Text>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.date_create_point}</Text>
                    </View>
                    <View style={{height: 5}}/>
                    <Text>{this.state.dateCreate}</Text>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.list_photo} ({images.length})</Text>
                    </View>
                    <View style={{height: 30}}/>
                    {this.state.images.length > 0 &&<FlatList
                        horizontal
                        showsHorizontalScrollIndicator={true}
                        data={images}
                        renderItem={images => this._renderItem(images.item)}
                        removeClippedSubviews={true}
                        initialNumToRender={10}
                        keyExtractor={({item}, index) => index}
                        style={{width: '100%', height: 600}}
                    />}

                    <View style={{height: 120}}/>
                </ScrollView>


                <View style={{
                    backgroundColor: '#92929292',
                    position: 'absolute',
                    width: '100%',
                    height: 70,
                    alignItems: 'center',
                    justifyContent: 'center',
                    // left: 15,
                    bottom: 0,
                }}>
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                flex: 0.2,
                                alignItems: 'center'
                            }}
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Image style={{width: 30, height: 30}}
                                   source={require("../../images/cancel_black.png")}>
                            </Image>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                flex: 0.2,
                                alignItems: 'center'
                            }}
                            onPress={() => {
                                this.select_image()
                            }}
                        >
                            <Image style={{width: 30, height: 30}}
                                   source={require("../../images/photo_black.png")}>
                            </Image>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                flex: 0.2,
                                alignItems: 'center'
                            }}
                            onPress={() => {
                                this._captureImage()
                            }}
                        >
                            <Image style={{width: 30, height: 30}}
                                   source={require("../../images/camera_black.png")}>
                            </Image>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                width: 40,
                                height: 40,
                                flex: 0.2,
                                alignItems: 'center'
                            }}
                            onPress={() => this._savePoint()}
                        >
                            <Image style={{width: 30, height: 30}}
                                   source={require("../../images/save_black.png")}>
                            </Image>
                        </TouchableOpacity>
                    </View>
                </View>

                {this.state.images.length > 0 && <Modal
                    visible={this.state.modalVisible}
                    transparent={true}
                    onRequestClose={() => this.setState({modalVisible: false})}
                >
                    <ImageViewer
                        imageUrls={this.state.images}
                        index={this.state.index}
                        onMove={data => console.log(data)}
                        enableSwipeDown={false}
                    />
                    <Button onPress={() => this.setState({modalVisible: false})}>
                        <Text style={{color: 'white', width: '100%', textAlign: 'center'}}>{cs_string.close}</Text>
                    </Button>
                </Modal>
                }

                {<Modal
                    visible={this.state.modal2Visible}
                    transparent={true}
                    onRequestClose={() => this.setState({modal2Visible: false})}
                >

                    <View style={{flex: 1, backgroundColor: 'white'}}>
                        <Header
                            style={{backgroundColor: "blue", barStyle: "light-content"}}
                            androidStatusBarColor={"blue"}
                        >
                            <Left style={{flex: 0.1}}>
                                <Button transparent onPress={() => this.setState({modal2Visible: false})}>
                                    <Image
                                        style={{width: 30, height: 30}}
                                        source={require("../../images/arrow_back_white.png")}>
                                    </Image>
                                </Button>
                            </Left>
                            <Body
                                style={{
                                    flex: 0.9,
                                    alignContent: "flex-start",
                                    alignItems: "flex-start"
                                }}
                            >
                                <Title style={{color: "white"}}>
                                    {cs_string.list_photo}
                                </Title>
                            </Body>
                        </Header>

                        <FlatList
                            data={this.state.list_image_td}
                            renderItem={list_image_td => this._renderItem_list(list_image_td.item)}
                            keyExtractor={({item}, index) => index}
                            removeClippedSubviews={true}
                            initialNumToRender={10}
                        />
                    </View>
                </Modal>
                }
                <CaptureImage handleCap={(path) => this.saveImage(path, this.state.folder_name)} ref={ref => this.captureRef = ref} height={480} width={480} />
            </View>
        );
    }
}

export default LineDetailsScreen;
