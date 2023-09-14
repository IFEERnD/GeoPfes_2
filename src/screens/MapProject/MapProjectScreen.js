import React from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PixelRatio,
  Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {Toast, Footer, FooterTab, Picker} from 'native-base';

import MapView, {
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
  ProviderPropType,
  WMSTile,
  Callout,
  Polyline,
  MapUrlTile,
  MapPolyline,
  MAP_TYPES,
  Geojson,
} from 'react-native-maps';
import {Body, Button, Header, Left, Right, Title} from 'native-base';
import cs_string from '../../untils/strings';
import {FloatingAction} from 'react-native-floating-action';
import {
  dirHome,
  getObjectDrawer,
  saveObjectDrawer,
} from '../../database/projectJson';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import {convertTimeToStringFull} from '../../untils/convertTime';
import {caculatorArea, caculatorDistance} from '../../untils/caculator';
import colors from '../../untils/colors';
import RNLocation from 'react-native-location';
import {withNavigationFocus} from 'react-navigation';
import {transformLatLng} from '../../untils/converProject';
import {
  getProjectByID,
  getListLayoutFile,
  insertTrack,
} from '../../database/databaseServices';
import styles from '../../untils/styles';
import moment from 'moment';
import ImagePicker from 'react-native-image-crop-picker';
import {request, PERMISSIONS} from 'react-native-permissions';
import {TextInput} from 'react-native-gesture-handler';
import dataProjection from '../../untils/Vn2000Projection.json';
import CaptureImage from '../../components/CaptureImage';
import LocationTracking from './LocationTracking';
import {DOMParser} from 'xmldom'; // for parsing your KLM string, converting it to an XML doc
import {kml} from '@tmcw/togeojson'; // for converting KLM docs to JSON
import shp from 'shpjs';
import {Buffer} from 'buffer';
import GlobalLoading from '../../components/GlobalLoading';

const RNFS = require('react-native-fs');
const listDisplayLabel = [
  'matinh',
  'mahuyen',
  'maxa',
  'huyen',
  'xa',
  'churung',
  'tk',
  'khoanh',
  'lo',
  'ldlr',
  'maldlr',
  'sldlr',
  'malr3',
];
const listDisplayLabelExplant = [
  'Mã tỉnh',
  'Mã huyện',
  'Mã xã',
  'Huyện',
  'Xã',
  'Chủ rừng',
  'Tiểu khu',
  'Khoảnh',
  'Lô',
  'Trạng thái',
  'Mã trạng thái',
  'Loài cây',
  'Quy hoạch',
];
var epsg = require('epsg-to-proj');
var proj = require('proj4');

const actions = [
  {
    text: 'Thêm điểm mới',
    icon: require('../../images/ic_point.png'),
    name: 'bt_addPoint',
    position: 1,
  },
  {
    text: 'Thêm đường mới',
    icon: require('../../images/ic_line.png'),
    name: 'bt_addLine',
    position: 2,
  },
  {
    text: 'Thêm vùng mới',
    icon: require('../../images/ic_polygon.png'),
    name: 'bt_addArea',
    position: 3,
  },
  {
    text: 'Thêm đường tự động GPS',
    icon: require('../../images/ic_line.png'),
    name: 'bt_addLineAuto',
    position: 4,
  },
  {
    text: 'Thêm vùng tự động GPS',
    icon: require('../../images/ic_polygon.png'),
    name: 'bt_addPolyAuto',
    position: 5,
  },
];

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 21.1147;
const LONGITUDE = 105.546;
const LATITUDE_DELTA = 1;
const LONGITUDE_DELTA = ASPECT_RATIO * LATITUDE_DELTA;
let id = 0;
let url = null;
// let view_AddLayer = [];

const moveAttachment = async (filePath, newFilepath) => {
  return new Promise((resolve, reject) => {
    RNFS.moveFile(filePath, newFilepath)
      .then(() => {
        resolve(true);
      })
      .catch(error => {
        reject(error);
      });
  });
};

class MapProjectScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      regionConvert: null,
      projection: 4326,
      projectZone: 'WGS84',
      can_open_other_screen: false,
      project_id: this.props.navigation.state.params.id,
      folder_name: '',
      show_info_window: true,
      show_point: true,
      show_line: true,
      show_polygon: true,
      show_wms: true,
      type_map: 3,
      points: [],
      polyline: [],
      polygon: [],
      //dung cho aciton them diem, duong, vung
      editing: null,
      current_action: 0,
      old_action: 0,
      //dung cho lop png
      is_view_mapUrl: false,
      is_view_mapLocal: true,
      marginBottom: 1,
      //dung cho khoi tao map
      lastPoint: null,
      lastPointOpent: null,
      centerPointOpen: null,
      moveChosePoint: false,
      // dung cho button back va next khi edit
      marker_back: [],
      coordinates_back: [],
      //dung cho GPS
      location: null,
      getData: false,
      //dung cho hien thi he toa do
      myLocation: null,
      mylocationWGS84: null,
      forceRefresh: -1,
      onlyView: false,
      //Hien thi phim edit doi tuong
      viewGroupButtonHandEdit: false,
      viewGroupButtonGPSEdit: false,
      //Danh sach cac link wms
      listWMS: [],
      centerPointWMS: null,
      transparencyWMS: 1,
      transparencyOfflineMap: 1,
      linkRootQueryInfo: null, // link goc de lay thong tin tu WMS
      regionFeatureInfo: undefined, // du lieu tra ve tu link API getfeatureInfo
      loadingWMSGetInfo: false,
      //Mapview width and height
      mapViewWidth: undefined,
      mapViewHeight: undefined,
      viewFullInfo: false,
      //Add text vao anh
      loading: true,
      //Tim diem bang toa do
      modalVisible: false,
      setModalVisible: false,
      selectedOptionCRS: 0,
      setSelectedOptionCRS: 0,
      latFindPoint: 0,
      longFindPoint: 0,
      listFindPoint: [],
      isFindPoint: false,
      selectLabel: '',
      //save tracking coordinates
      coordinatesTrack: [],
      isTrackingLocation: false,
      timeStartTrack: null,
      //Add map file manager
      listFileLoad: [],
      isLoading: false,
      data_mbtiles: [],
      data_kml: [],
      data_geojson: [],
      data_shp: [],
    };

    this.onMapPress = this.onMapPress.bind(this);
  }

  componentDidMount = () => {
    this._sub = this.props.navigation.addListener(
      'didFocus',
      this._componentFocused,
    );
  };

  loadMyLocation() {
    RNLocation.configure({
      distanceFilter: 0.5,
      desiredAccuracy: {
        ios: 'best',
        android: 'highAccuracy',
      },
      // Android only
      androidProvider: 'auto',
      interval: 1000,
      fastestInterval: 2000,
      maxWaitTime: 1000,
    });

    RNLocation.requestPermission({
      ios: 'always',
      android: {
        detail: 'fine',
        rationale: {
          title: 'Location permission',
          message: 'Chúng tôi cần sử dụng vị trí của bạn',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      },
    }).then(granted => {
      RNLocation.subscribeToLocationUpdates(locations => {
        this.setState({
          location: locations[0],
          myLocation: {
            point: {
              lat: locations[0].latitude,
              long: locations[0].longitude,
            },
            accuracy: Math.floor(locations[0]?.accuracy * 10) / 10,
          },
        });
      });
    });
  }

  _componentFocused = () => {
    this._getDataProject();
    this.loadMyLocation();
    this.loadAddFile();
  };

  onRefresh = () => {
    this._getDataProject();
    this.loadMyLocation();
    this.loadAddFile();
  };

  _showOptions() {
    this.ActionSheet.show();
  }

  useEffect = () => {
    if (Platform.OS === 'android') {
      request(PERMISSIONS.ANDROID.CAMERA);
    } else {
      request(PERMISSIONS.IOS.CAMERA);
    }
  };

  AccessMBtile = index => {
    const {navigation} = this.props;
    if (index == 1) {
      this._gotoSelectLayout(this.state.project_id);
    }
    if (index == 2) {
      this._gotoSelectMbtiles(this.state.project_id);
    }
  };

  _onMapReady = () => {
    if (this.state.moveToUserLocation && this.state.location != null) {
      this._gotoCurrentLocation();
      this.state.moveToUserLocation = false;
    } else if (this.state.lastPointOpent !== null) {
      this._gotoLocation(
        this.state.lastPointOpent.coordinate.latitude,
        this.state.lastPointOpent.coordinate.longitude,
        0.02,
        0.02,
      );
      this.setState((lastPointOpent = null));
    } else {
      const pointVST = {lat: 20.911352500000003, lng: 105.5730514};
      this._gotoLocation(pointVST.lat, pointVST.lng, 0.015, 0.015);
    }
  };

  _getDataProject = async () => {
    let project = await getProjectByID(this.props.navigation.state.params.id);
    let projectionZoneText = '';
    for (let i = 0; i < dataProjection.length; i++) {
      if (dataProjection[i].epsg_code == project.projection) {
        projectionZoneText = dataProjection[i].zone;
      }
    }

    await RNFS.exists(
      `${dirHome}/${this.props.navigation.state.params.folder_name}/title`,
    ).then(res => {
      if (res) {
        url = `${dirHome}/${this.props.navigation.state.params.folder_name}/title/{z}/{x}/{y}.png`;
      } else {
        url = null;
      }
    });
    try {
      let object = await getObjectDrawer(
        this.props.navigation.state.params.folder_name,
      );
      if (object) {
        let point_old = object?.points || [];
        let point_new_all = [];
        if (point_old.length > 0) {
          for (let i = 0; i < point_old.length; i++) {
            let point_new = point_old[i];
            point_new.point = transformLatLng(
              point_new.coordinate.latitude,
              point_new.coordinate.longitude,
              project.projection,
            );
            point_new_all = [...point_new_all, point_new];
          }
        }

        this.setState({
          folder_name: this.props.navigation.state.params.folder_name,
          project_id: this.props.navigation.state.params.id,
          offlineUrlTemplate: url,
          points: point_new_all,
          polyline: object.polyline,
          polygon: object.polygon,
          getData: true,
          lastPointOpent: object.lastPoint,
          region: {
            latitude: object.lastPoint.coordinate.latitude,
            longitude: object.lastPoint.coordinate.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          },
          projection: project.projection,
          forceRefresh: id++,
          projectZone: projectionZoneText,
        });
      }
    } catch (e) {
      this.setState({
        folder_name: this.props.navigation.state.params.folder_name,
        offlineUrlTemplate: url,
        project_id: this.props.navigation.state.params.id,
        getData: true,
        projection: project.projection,
        projectZone: projectionZoneText,
      });
    }
  };

  _saveData() {
    let latPoint = {
      coordinate: {latitude: LATITUDE, longitude: LONGITUDE},
      key: convertTimeToStringFull(new Date()),
      id: convertTimeToStringFull(new Date()),
    };
    try {
      if (this.state.lastPoint != null) {
        latPoint = this.state.lastPoint;
      }
    } catch (e) {}

    let object = {
      points: this.state.points,
      polyline: this.state.polyline,
      polygon: this.state.polygon,
      lastPoint: latPoint,
    };
    let folder_name = this.state.folder_name;
    saveObjectDrawer(object, folder_name).then(r => {});
  }

  _saveObjectDrawer = async () => {
    this.setState(
      {
        old_action: this.state.current_action,
        current_action: 0,
      },
      function () {
        if (this.state.old_action === 1) {
          this.setState(
            {
              points: [...this.state.points, ...this.state.markers],
            },
            function () {
              if (this.state.markers != null) {
                this.setState(
                  {
                    lastPoint:
                      this.state.markers[this.state.markers.length - 1],
                    markers: [],
                    editing: null,
                  },
                  function () {
                    this._saveData();
                  },
                );
              }
            },
          );
        } else if (this.state.old_action === 2 || this.state.old_action === 4) {
          if (this.state.markers.length > 1)
            this.setState(
              {
                polyline: [...this.state.polyline, this.state.editing],
              },
              function () {
                if (this.state.markers != null) {
                  this.setState(
                    {
                      lastPoint:
                        this.state.markers[this.state.markers.length - 1],
                      markers: [],
                      editing: null,
                    },
                    function () {
                      this._saveData();
                    },
                  );
                }
              },
            );
        } else if (this.state.old_action === 3 || this.state.old_action === 5) {
          if (this.state.markers.length > 2)
            this.setState(
              {
                polygon: [...this.state.polygon, this.state.editing],
              },
              function () {
                if (this.state.markers != null) {
                  this.setState(
                    {
                      lastPoint:
                        this.state.markers[this.state.markers.length - 1],
                      markers: [],
                      editing: null,
                    },
                    function () {
                      this._saveData();
                    },
                  );
                }
              },
            );
        }
      },
    );
  };

  _backPress = () => {
    const {editing, markers, marker_back, coordinates_back} = this.state;
    if (markers.length > 0) {
      let new_markers = [];
      let coordinates = [];
      for (let i = 0; i < markers.length - 1; i++) {
        new_markers.push(markers[i]);
        coordinates.push(editing.coordinates[i]);
      }

      let marker_back_new = [...marker_back, markers[markers.length - 1]];
      let coordinates_back_new = [
        ...coordinates_back,
        editing.coordinates[markers.length - 1],
      ];

      this.setState({
        marker_back: marker_back_new,
        coordinates_back: coordinates_back_new,
        markers: new_markers,
        editing: {
          // ...editing,
          id: this.state.editing?.id || convertTimeToStringFull(new Date()),
          key: this.state.editing?.key || convertTimeToStringFull(new Date()),
          coordinates: coordinates,
          area: caculatorArea(coordinates),
          distance: caculatorDistance(coordinates),
        },
      });
    }
  };

  _nextPress = () => {
    const {editing, markers, marker_back, coordinates_back} = this.state;
    if (marker_back.length > 0) {
      let new_markers = [...markers, marker_back[marker_back.length - 1]];
      let coordinates = [
        ...editing.coordinates,
        coordinates_back[marker_back.length - 1],
      ];

      let marker_back_2 = [];
      let coordinates_back_2 = [];

      for (let i = 0; i < marker_back.length - 1; i++) {
        marker_back_2.push(marker_back[i]);
        coordinates_back_2.push(coordinates_back[i]);
      }

      this.setState({
        markers: new_markers,
        editing: {
          // ...editing,
          id: this.state.editing?.id || convertTimeToStringFull(new Date()),
          key: this.state.editing?.key || convertTimeToStringFull(new Date()),
          coordinates: coordinates,
          area: caculatorArea(coordinates),
          distance: caculatorDistance(coordinates),
        },
        marker_back: marker_back_2,
        coordinates_back: coordinates_back_2,
      });
    }
  };

  onMapPress(e) {
    const {editing, current_action} = this.state;
    if (current_action == 1 || current_action == 2 || current_action == 3) {
      if (!editing) {
        this.setState({
          editing: {
            id: convertTimeToStringFull(new Date()),
            key: convertTimeToStringFull(new Date()),
            coordinates: [e.nativeEvent.coordinate],
            area: 0,
            distance: 0,
          },
          markers: [
            ...this.state.markers,
            {
              coordinate: e.nativeEvent.coordinate,
              point: transformLatLng(
                e.nativeEvent.coordinate.latitude,
                e.nativeEvent.coordinate.longitude,
                this.state.projection,
              ),
              key: convertTimeToStringFull(new Date()),
              id: convertTimeToStringFull(new Date()),
            },
          ],
        });
      } else {
        this.setState({
          editing: {
            // ...editing,
            id: this.state.editing?.id || convertTimeToStringFull(new Date()),
            key: this.state.editing?.key || convertTimeToStringFull(new Date()),
            coordinates: [...editing.coordinates, e.nativeEvent.coordinate],
            area: caculatorArea([
              ...editing.coordinates,
              e.nativeEvent.coordinate,
            ]),
            distance: caculatorDistance([
              ...editing.coordinates,
              e.nativeEvent.coordinate,
            ]),
          },
          markers: [
            ...this.state.markers,
            {
              coordinate: e.nativeEvent.coordinate,
              point: transformLatLng(
                e.nativeEvent.coordinate.latitude,
                e.nativeEvent.coordinate.longitude,
                this.state.projection,
              ),
              key: convertTimeToStringFull(new Date()),
              id: convertTimeToStringFull(new Date()),
            },
          ],
        });
      }
    }
  }

  //tao diem tu vij tri nguoi dung trong thao tac tao diem, duong, vung
  _onButtonCreateUserPoint = () => {
    const {editing, location} = this.state;
    if (location != null) {
      let e = {
        coordinate: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      };
      if (!editing) {
        this.setState({
          editing: {
            id: convertTimeToStringFull(new Date()),
            key: convertTimeToStringFull(new Date()),
            coordinates: [e.coordinate],
            area: 0,
            distance: 0,
          },
          markers: [
            ...this.state.markers,
            {
              coordinate: e.coordinate,
              point: transformLatLng(
                e.coordinate.latitude,
                e.coordinate.longitude,
                this.state.projection,
              ),
              key: convertTimeToStringFull(new Date()),
              id: convertTimeToStringFull(new Date()),
            },
          ],
        });
      } else {
        this.setState({
          editing: {
            // ...editing,
            id: this.state.editing?.id || convertTimeToStringFull(new Date()),
            key: this.state.editing?.key || convertTimeToStringFull(new Date()),
            coordinates: [...editing.coordinates, e.coordinate],
            area: caculatorArea([...editing.coordinates, e.coordinate]),
            distance: caculatorDistance([...editing.coordinates, e.coordinate]),
          },
          markers: [
            ...this.state.markers,
            {
              coordinate: e.coordinate,
              point: transformLatLng(
                e.coordinate.latitude,
                e.coordinate.longitude,
                this.state.projection,
              ),
              key: convertTimeToStringFull(new Date()),
              id: convertTimeToStringFull(new Date()),
            },
          ],
        });
      }
    } else {
      Alert.alert(
        'Lỗi GPS',
        'Vị trí hiện tại của người dùng hiện không khả dụng!',
      );
    }
  };
  // ham lay link api quyery data tu WMS
  _getWMSInfoAPILink = (x, y) => {
    let {region, linkRootQueryInfo, mapViewHeight, mapViewWidth} = this.state;
    //Tinh bbbox
    let minX = region.longitude - region.longitudeDelta / 2; // westLng - min lng
    let minY = region.latitude - region.latitudeDelta / 2; // southLat - min lat
    let maxX = region.longitude + region.longitudeDelta / 2; // eastLng - max lng
    let maxY = region.latitude + region.latitudeDelta / 2; // northLat - max lat
    let linkAPIGetInfoFull = `${linkRootQueryInfo}&bbox=${minX},${minY},${maxX},${maxY}&width=${Math.round(
      mapViewWidth,
    )}&height=${Math.round(mapViewHeight)}&x=${x}&y=${y}`;
    return linkAPIGetInfoFull;
  };

  async _getWMSFeatureInfo(linkAPIGetInfoFull) {
    try {
      this.setState({loadingWMSGetInfo: true, viewFullInfo: false});
      console.log(linkAPIGetInfoFull);
      const ApiCall = await fetch(linkAPIGetInfoFull);
      const regionFeatureInfo = await ApiCall.json();
      let disPlayData = '';
      for (let [key, value] of Object.entries(
        regionFeatureInfo.features[0].properties,
      )) {
        for (var i = 0; i < listDisplayLabel.length; i++) {
          if (key.toLowerCase() === listDisplayLabel[i].toLowerCase()) {
            disPlayData =
              disPlayData + listDisplayLabelExplant[i] + ': ' + value + '\n';
          }
        }
      }

      let disPlayDataFull = '';
      for (let [key, value] of Object.entries(
        regionFeatureInfo.features[0].properties,
      )) {
        disPlayDataFull = disPlayDataFull + key + ': ' + value + '\n';
      }
      this.setState(
        {
          regionFeatureInfo: regionFeatureInfo.features[0].properties,
          loadingWMSGetInfo: false,
        },
        function () {
          Alert.alert(
            'Thông tin đối tượng',
            disPlayData,
            [
              {
                text: 'Xem thông tin đầy đủ',
                onPress: () =>
                  Alert.alert(
                    'Thông tin đối tượng',
                    disPlayDataFull,
                    [
                      {
                        text: 'Ok',
                        onPress: () =>
                          this.setState({loadingWMSGetInfo: false}),
                      },
                    ],
                    {cancelable: false},
                  ),
              },
              {
                text: 'Ok',
                onPress: () => this.setState({loadingWMSGetInfo: false}),
              },
            ],
            {cancelable: false},
          );

          this.setState({
            viewGroupButtonHandEdit: false,
            viewGroupButtonGPSEdit: false,
            current_action: 0,
            editing: null,
          });
        },
      );
    } catch (err) {
      console.log(err);
      Alert.alert(
        'Thông tin đối tượng',
        'Không lấy được thông tin đối tượng',
        [
          {
            text: cs_string.cancel,
            onPress: () => this.setState({loadingWMSGetInfo: false}),
          },
        ],
        {cancelable: false},
      );
    }
  }

  _onlyShow_onMapPress(e) {
    let point = transformLatLng(
      e.nativeEvent.coordinate.latitude,
      e.nativeEvent.coordinate.longitude,
      this.state.projection,
    );
    let position = e.nativeEvent.position;
    if (Platform.OS === 'android') {
      position.x = position.x / PixelRatio.get();
      position.y = position.y / PixelRatio.get();
    }
    let linkAPIgetFeatureInfo = this._getWMSInfoAPILink(
      Math.round(position.x),
      Math.round(position.y),
    );
    this._getWMSFeatureInfo(linkAPIgetFeatureInfo);
  }

  _gotoDetailsPoint = async point_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('PointDetailsScreen', {
        folder_name: this.state.folder_name,
        point_id: point_id,
        projection: this.state.projection,
        location: this.state.location,
      });
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this._gotoDetailsPoint(point_id);
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _gotoDetailsPolyline = async polyline_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('LineDetailsScreen', {
        folder_name: this.state.folder_name,
        polyline_id: polyline_id,
        projection: this.state.projection,
        location: this.state.location,
      });
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _gotoDetailsPolygon = async polygon_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('PolygonDetailsScreen', {
        folder_name: this.state.folder_name,
        polygon_id: polygon_id,
        projection: this.state.projection,
        location: this.state.location,
      });
    } else {
      Alert.alert(cs_string.notification, cs_string.none_save);
    }
  };

  _configProjectBackground = async () => {
    this.props.navigation.navigate('ConfigBackgroundScreen');
  };
  //set su kien nut them doi tuong diem / duong/ vung
  handleFloatingButton(name) {
    if (this.state.current_action === 0 || this.state.editing === null) {
      if (name === 'bt_addPoint') {
        this.setState({
          old_action: this.state.current_action,
          current_action: 1,
          markers: [],
          editing: null,
          viewGroupButtonHandEdit: true,
          viewGroupButtonGPSEdit: false,
          loadingWMSGetInfo: false,
        });
      } else if (name === 'bt_addLine') {
        this.setState({
          old_action: this.state.current_action,
          current_action: 2,
          markers: [],
          editing: null,
          viewGroupButtonHandEdit: true,
          viewGroupButtonGPSEdit: false,
          loadingWMSGetInfo: false,
        });
      } else if (name === 'bt_addArea') {
        this.setState({
          old_action: this.state.current_action,
          current_action: 3,
          markers: [],
          editing: null,
          viewGroupButtonHandEdit: true,
          viewGroupButtonGPSEdit: false,
          loadingWMSGetInfo: false,
        });
      } else if (name === 'bt_addPolyAuto') {
        this.setState(
          {
            old_action: this.state.current_action,
            current_action: 5,
            markers: [],
            editing: null,
            viewGroupButtonHandEdit: false,
            viewGroupButtonGPSEdit: true,
            loadingWMSGetInfo: false,
          },
          function () {
            this._handerGPS();
          },
        );
      } else if (name === 'bt_addLineAuto') {
        this.setState(
          {
            old_action: this.state.current_action,
            current_action: 4,
            markers: [],
            editing: null,
            viewGroupButtonHandEdit: false,
            viewGroupButtonGPSEdit: true,
            loadingWMSGetInfo: false,
          },
          function () {
            this._handerGPS();
          },
        );
      }
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this.handleFloatingButton(name);
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  }

  _updateTypeMap = value => {
    this.setState({type_map: value});
  };

  _onPressDiable = e => {};

  componentWillMount() {
    RNLocation.configure({
      distanceFilter: 0.2,
      allowsBackgroundLocationUpdates: true,
      // interval: 5000,
      // fastestInterval: 10000,
    });
    RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'fine',
        rationale: {
          title: 'Location permission',
          message: 'We use your location to demo the library',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      },
    }).then(granted => {
      if (granted) {
        this._startUpdatingLocation();
      }
    });
  }

  _handerGPS = () => {
    RNLocation.requestPermission({
      ios: 'whenInUse',
      android: {
        detail: 'fine',
        rationale: {
          title: 'Location permission',
          message: 'Chúng tôi sử dụng vị trí của bạn để',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      },
    }).then(granted => {
      if (granted) {
        this._startUpdatingLocation();
      }
    });
  };

  _startUpdatingLocation = () => {
    try {
      const unsubscribe = RNLocation.subscribeToLocationUpdates(locations => {
        let point = transformLatLng(
          locations[0].latitude,
          locations[0].longitude,
          this.state.projection,
        );

        let poit_X = Math.floor(point.lat * 10000) / 10000;
        let poit_Y = Math.floor(point.long * 10000) / 10000;
        if (this.state.isTrackingLocation) {
          this.setState({
            coordinatesTrack: this.state.coordinatesTrack.push({
              latitude: locations[0].latitude,
              longitude: locations[0].longitude,
            }),
          });
        }
        this.setState(
          {
            location: locations[0],
            myLocation: {
              point: {
                lat: poit_X,
                long: poit_Y,
              },
              accuracy: Math.floor(locations[0]?.accuracy * 10) / 10,
            },
          },
          function () {
            this.onMapPressFake(
              this.state.location.longitude,
              this.state.location.latitude,
            );
          },
        );
      });
    } catch (err) {
      console.log(err);
    }
  };

  _gotoCurrentLocation() {
    if (this.state.location !== null) {
      this.map.animateToRegion({
        latitude: this.state.location.latitude,
        longitude: this.state.location.longitude,
        latitudeDelta: 0.017,
        longitudeDelta: 0.017,
      });
    } else {
      Toast.show({
        text: 'Chưa lấy được vị trí người dùng',
        buttonText: 'Tắt',
        type: 'warning',
      });
    }
  }

  async _trackLocation() {
    if (this.state.isTrackingLocation === false) {
      this.setState({
        isTrackingLocation: true,
        timeStartTrack: moment().format('hh:mm:ss DD/MM/YYYY'),
      });
      this.locationTrackingRef.handleStart();
      Toast.show({
        text: 'Bắt đầu lưu tuyến',
        buttonText: 'Tắt',
        type: 'success',
      });
    } else {
      //save lai neu co
      const coordinatesFix = this.state.coordinatesTrack;
      console.log('coordinatesTrack', this.state.coordinatesTrack);

      const stoptime = moment().format('hh:mm:ss DD/MM/YYYY');
      const lengthTrack = Math.round(caculatorDistance(coordinatesFix) * 1000);

      this.locationTrackingRef.handleStop();
      if (this.state.coordinatesTrack.length > 2 && lengthTrack > 0) {
        const fileNameSave = await insertTrack(
          this.state.timeStartTrack,
          stoptime,
          lengthTrack,
          this.state.project_id,
        );

        if (fileNameSave) {
          // Luu Track;
          Toast.show('Luu tuyen');
          const geojson = {
            type: 'Feature',
            properties: {
              ThoiGianBatDau: this.state.timeStartTrack,
              ThoiGianKetThuc: stoptime,
              ChieuDaiTrack_DonVi_Met: lengthTrack,
            },
            geometry: {
              type: 'LineString',
              coordinates: coordinatesFix,
            },
          };
          // Save the GeoJSON object as a file
          // Define the output directory and file name
          const directoryPath =
            dirHome + '/' + this.state.folder_name + '/TrackFile';
          const fileName = fileNameSave;

          // Construct the output file path
          const filePath = `${directoryPath}/${fileName}`;

          // Create the output directory if it doesn't exist
          RNFS.mkdir(directoryPath)
            .then(() => {
              // Save the GeoJSON object as a file
              return RNFS.writeFile(filePath, JSON.stringify(geojson), 'utf8');
            })
            .then(() => {
              Toast.show({
                text:
                  'Tuyến đã lưu, chiều dài là: ' +
                  caculatorDistance(coordinatesFix) * 1000 +
                  ' m',
                buttonText: 'Tắt',
                type: 'success',
              });
            })
            .catch(error => {
              console.log(error);
              Toast.show({
                text: 'Lưu thất bại',
                buttonText: 'Tắt',
                type: 'error',
              });
            });
          this.setState({
            coordinatesTrack: [],
            isTrackingLocation: false,
          });
        }
      } else {
        Toast.show({
          text: 'Tuyến chưa có dữ liệu',
          buttonText: 'Tắt',
          type: 'warning',
        });
        this.setState({isTrackingLocation: false});
      }
    }
  }

  _gotoLocation(lat, long, latDelta, longDelta) {
    this.map.animateToRegion({
      latitude: lat,
      longitude: long,
      latitudeDelta: latDelta,
      longitudeDelta: longDelta,
    });
  }

  onMapPressFake(long, lat) {
    const {
      editing,
      current_action,
      location,
      plauseRecord,
      moveToUserLocation,
    } = this.state;
    if (current_action === 5 || current_action === 4) {
      let e = {
        coordinate: {latitude: lat, longitude: long},
      };
      if (!plauseRecord) {
        if (this.state.moveToUserLocation) {
          this._gotoCurrentLocation();
        }
        if (!editing) {
          this.setState({
            editing: {
              id: convertTimeToStringFull(new Date()),
              key: convertTimeToStringFull(new Date()),
              coordinates: [e.coordinate],
              area: 0,
              distance: 0,
            },
            markers: [
              ...this.state.markers,
              {
                coordinate: e.coordinate,
                point: transformLatLng(
                  e.coordinate.latitude,
                  e.coordinate.longitude,
                  this.state.projection,
                ),
                key: convertTimeToStringFull(new Date()),
                id: convertTimeToStringFull(new Date()),
              },
            ],
          });
        } else {
          this.setState({
            editing: {
              // ...editing,
              id: this.state.editing?.id || convertTimeToStringFull(new Date()),
              key:
                this.state.editing?.key || convertTimeToStringFull(new Date()),
              coordinates: [...editing.coordinates, e.coordinate],
              area: caculatorArea([...editing.coordinates, e.coordinate]),
              distance: caculatorDistance([
                ...editing.coordinates,
                e.coordinate,
              ]),
            },
            markers: [
              ...this.state.markers,
              {
                coordinate: e.coordinate,
                point: transformLatLng(
                  e.coordinate.latitude,
                  e.coordinate.longitude,
                  this.state.projection,
                ),
                key: convertTimeToStringFull(new Date()),
                id: convertTimeToStringFull(new Date()),
              },
            ],
          });
        }
      }
    }
  }

  _gotoSelectProjection = project_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('ConfigProjectionScreen', {
        project_id: project_id,
        updateZone: this.updateZone,
      });
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this._gotoSelectProjection(project_id);
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _gotoSelectMbtiles = project_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('LayoutMbtiles', {
        project_id: project_id,
        onRefesh: () => this._componentFocused,
      });
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this._gotoSelectMbtiles(project_id);
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _gotoSelectLayout = project_id => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.navigate('LayoutList', {project_id: project_id});
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this._gotoSelectLayout(project_id);
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _onSelectWMS = data => {
    this.setState(
      {
        forceRefresh: id++,
      },
      function () {
        this.setState(data);
      },
    );
  };

  _gotoSelectWMSLayerScreen = () => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.setState(
        {
          listWMS: [],
        },
        function () {
          this.props.navigation.navigate('SelectWMSLayerScreen', {
            _onSelectWMS: this._onSelectWMS,
          });
        },
      );
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this._gotoSelectWMSLayerScreen();
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _onBackPress = () => {
    if (this.state.current_action === 0 || this.state.editing === null) {
      this.props.navigation.goBack();
    } else {
      Alert.alert(
        cs_string.notification,
        cs_string.none_save,
        [
          {
            text: cs_string.continous,
            onPress: () => {
              this.setState(
                {
                  markers: [],
                  editing: null,
                },
                function () {
                  this.props.navigation.goBack();
                },
              );
            },
            style: 'cancel',
          },
          {
            text: cs_string.cancel,
            onPress: () => console.log('OK Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    }
  };

  _saveImage = async (filePath, folder_name) => {
    try {
      // set new image name and filepath
      const newImageName = `${moment().format('YYYYMMDDHHmmSSS')}.jpg`;
      const newFilepath = `${dirHome}/${folder_name}/${newImageName}`;
      await moveAttachment(filePath, newFilepath);

      let path = dirHome + '/' + folder_name + '/image_list.txt';

      let list_image = [];
      try {
        await RNFS.readFile(path, 'utf8')
          .then(res => {
            list_image = JSON.parse(res);
          })
          .catch(err => {
            console.log(err.message, err.code);
          });
      } catch (e) {
        console.log('alo alo', e);
      }
      console.log('list_image', list_image.length);
      list_image = [
        ...list_image,
        {
          uri: newImageName,
          location: {
            latitude: this.state.myLocation?.point.long || 'NaN',
            longitude: this.state.myLocation?.point.lat || 'NaN',
          },
        },
      ];
      try {
        // TODO can check ki lai
        // RNFS.copyFileAssets();
        await RNFS.writeFile(path, JSON.stringify(list_image), 'utf8')
          .then(success => {
            console.log('FILE WRITTEN!');
          })
          .catch(err => {
            console.log(err.message);
          });
      } catch (e) {
        console.log('alo blo', e);
      }

      RNFS.exists(path)
        .then(exists => {
          if (exists) {
            console.log(`File at ${path} exists.`);
          } else {
            console.log(`File at ${path} does not exist.`);
          }
        })
        .catch(err => {
          console.error('Error checking file existence:', err);
        });
    } catch (error) {
      console.log('1111', error);
    }
  };

  _captureImage = () => {
    this._onCapture();
  };

  _onCapture = async () => {
    try {
      setTimeout(() => {
        ImagePicker.openCamera({
          cropping: true,
          width: 480,
          height: 800,
          includeExif: true,
        })
          .then(image => {
            this.captureRef.handleCapture(
              image.path,
              {
                latitude: this.state.myLocation.point.long || 'NaN',
                longitude: this.state.myLocation.point.lat || 'NaN',
              },
              this.state.projection,
            );
          })
          .catch(err => {
            console.log('errr', err);
          });
      }, 100);
    } catch (err) {
      console.log('okss', err);
    }
  };

  // Tim diem bang toa do=
  _findPoint() {
    const {latFindPoint, longFindPoint, selectedOptionCRS, listFindPoint} =
      this.state;
    var findPoint = [];
    var pointConvert = [];
    if (latFindPoint == '' || longFindPoint == '') {
      Alert.alert('Dữ liệu đầu vào trống!');
      return null;
    }

    if (isNaN(latFindPoint) || isNaN(longFindPoint)) {
      Alert.alert('Dữ liệu đầu vào không đúng định dạng số!');
      return null;
    }

    try {
      if (selectedOptionCRS === 4326) {
        pointConvert = [Number(longFindPoint), Number(latFindPoint)];
      } else {
        var pointConvert = proj(epsg[selectedOptionCRS], epsg[4326], [
          Number(latFindPoint),
          Number(longFindPoint),
        ]);
      }

      findPoint = {
        id: listFindPoint.length,
        coordinate: {latitude: pointConvert[1], longitude: pointConvert[0]},
        baseCoordinates: {latitude: latFindPoint, longitude: longFindPoint},
      };

      if (
        findPoint.coordinate.latitude >= -90 &&
        findPoint.coordinate.latitude <= 90 &&
        findPoint.coordinate.longitude >= -180 &&
        findPoint.coordinate.longitude <= 180
      ) {
        let newListPointFind = [];
        newListPointFind = [...listFindPoint, findPoint];
        this.setState({
          listFindPoint: newListPointFind,
          modalVisible: false,
          isFindPoint: false,
          latFindPoint: null,
          longFindPoint: null,
        });
        this._gotoLocation(pointConvert[1], pointConvert[0], 0.15, 0.15);
      } else {
        Alert.alert('Dữ liệu đầu vào không hợp lệ!');
      }
    } catch (err) {
      Alert.alert('Lỗi chuyển toạ độ, kiểm tra lại dữ liệu đầu vào!');
    }
  }

  async loadAddFile() {
    let listFileDB = await getListLayoutFile(this.state.project_id);
    let arr_data_mb = [];
    let arr_data_kml = [];
    let arr_data_geojson = [];
    let arr_data_shp = [];

    if (listFileDB.length > 0) {
      this.setState({
        listFileLoad: listFileDB,
        isLoading: true,
      });

      listFileDB.map(async item => {
        if (item.visible) {
          switch (item.type) {
            case 'mbtiles':
              var part1 =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/title';
              arr_data_mb.push(part1);
              break;
            case 'kml':
              var part1 =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/' +
                item.fileName;
              const read = await RNFS.readFile(part1);
              const theKml = new DOMParser().parseFromString(read);
              const converted = kml(theKml);
              arr_data_kml.push({
                data: converted,
                fillColor: item.styleFillColor,
                lineColor: item.styleLineColor,
                lineWidth: item.lineWidth,
              });
              break;
            case 'geojson':
              var part1 =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/' +
                item.fileName;
              const content = await RNFS.readFile(part1);
              const jsonData = JSON.parse(content);
              arr_data_geojson.push({
                data: jsonData,
                fillColor: item.styleFillColor,
                lineColor: item.styleLineColor,
                lineWidth: item.lineWidth,
              });
              try {
              } catch (err) {
                console.log(err);
              }

            // break;
            case 'shp':
              let shpPath =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/' +
                item.fileName;
              let dbfPath =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/' +
                item.fileName2;
              let prjPath =
                dirHome +
                '/' +
                this.state.project_id +
                '/LayoutFile/' +
                item.folderName +
                '/' +
                item.fileName3;

              const resShp = await RNFS.readFile(shpPath, 'base64');
              const bufferShp = await Buffer.from(resShp, 'base64');
              const resDbf = await RNFS.readFile(dbfPath, 'base64');
              const bufferDbf = await Buffer.from(resDbf, 'base64');

              const resPrj = await RNFS.readFile(prjPath, 'base64');
              const geoJsonShp = await shp.parseShp(bufferShp, resPrj);
              const geoJsonDbf = await shp.parseDbf(bufferDbf);
              const geojson = await shp.combine([geoJsonShp, geoJsonDbf]);
              arr_data_shp.push({
                data: geojson,
                fillColor: item.styleFillColor,
                lineColor: item.styleLineColor,
                lineWidth: item.lineWidth,
              });
              break;
          }
        }
      });

      this.setState({
        isLoading: false,
      });
    }

    this.setState({
      data_mbtiles: arr_data_mb,
      data_kml: arr_data_kml,
      data_geojson: arr_data_geojson,
      data_shp: arr_data_shp,
    });
  }

  remove_duplicates(arrFull) {
    var arrShort = [];
    arrShort.push(arrFull[0]);
    for (var i = 1; i < arrFull.length; i++) {
      if (JSON.stringify(arrFull[i]) !== JSON.stringify(arrFull[i - 1])) {
        arrShort.push(arrFull[i]);
      }
    }
    return arrShort;
  }
  //Ham lay width ei cua man hinh
  onLayout(event) {
    const {x, y, height, width} = event.nativeEvent.layout;
    this.setState({mapViewWidth: width, mapViewHeight: height});
  }

  updateZone = projection => {
    if (this.state.isFindPoint) {
      this.setState({
        modalVisible: true,
        selectedOptionCRS: projection.epsg_code,
      });
    } else {
      this.setState({
        projectZone: projection.zone,
      });
    }
  };

  compareArrays(arr1, arr2) {
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
      return false;
    }

    // Compare each item and its order in the arrays
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].fileName !== arr2[i].fileName) {
        return false; // Items are different or order is different
      }
    }

    return true; // All items and order match
  }

  render() {
    const {
      urlTemplate,
      offlineUrlTemplate,
      modalVisible,
      current_action,
      editing,
      latFindPoint,
      longFindPoint,
      region,
      is_view_mapLocal,
      is_view_mapUrl,
      points,
      polyline,
      polygon,
      show_wms,
      selectedOptionCRS,
      listFindPoint,
      projectZone,
      show_point,
      show_line,
      show_polygon,
      type_map,
      onlyView,
      transparencyWMS,
      isLoading,
      data_mbtiles,
      data_kml,
      data_geojson,
      data_shp,
    } = this.state;

    // UPdate thu vien RN Map moi
    let type_view = MAP_TYPES.STANDARD;
    if (type_map === 0) {
      type_view = MAP_TYPES.STANDARD;
    } else if (type_map === 1) {
      type_view = MAP_TYPES.SATELLITE;
    } else if (type_map === 2) {
      type_view = MAP_TYPES.TERRAIN;
    } else if (type_map === 3) {
      type_view = MAP_TYPES.HYBRID;
    }

    let mapOptions = {};
    let markerOptions = {};
    let polylineOption = {};
    let polygonOption = {};

    //Check diem mo da chon
    if (this.props.navigation.state.params.centerPointOpen !== undefined) {
      var longCenterPoint =
        this.props.navigation.state.params.centerPointOpen.long;
      var latCenterPoint =
        this.props.navigation.state.params.centerPointOpen.lat;
      this._gotoLocation(latCenterPoint, longCenterPoint, 0.15, 0.15);
      this.props.navigation.setParams({centerPointOpen: undefined});
    }

    if (onlyView) {
      mapOptions.onPress = e => this._onlyShow_onMapPress(e);
    } else {
      if (current_action !== 0) {
        mapOptions.onPress = e => this.onMapPress(e);
        markerOptions.onPress = e => {
          e.stopPropagation();
        };
        markerOptions.onCalloutPress = e => {
          e.stopPropagation();
          // this._gotoDetailsPoint()
        };
        polylineOption.tappable = false;
        polygonOption.tappable = false;
      } else {
        markerOptions.onPress = e => {
          e.stopPropagation();
        };
        markerOptions.onCalloutPress = e => {
          e.stopPropagation();
          // this._gotoDetailsPoint()
        };

        polylineOption.tappable = true;
        polylineOption.onPress = e => {
          e.stopPropagation();
        };

        polygonOption.tappable = true;
        polygonOption.onPress = e => {
          e.stopPropagation();
        };
      }
    }

    let view_newPoint = [];
    let view_poline = [];
    let view_polygon = [];
    let view_map_url = [];
    let view_map_local = [];
    let view_oldPoint = [];
    let view_oldPoline = [];
    let view_oldPolygon = [];
    let view_wms = [];
    let view_findPoint = [];

    let view_MB = [];
    let view_KML = [];
    let view_GeoJson = [];
    let view_SHP = [];

    if (data_mbtiles.length > 0) {
      view_MB.push(
        data_mbtiles.map(item => {
          var url = `${item}/{z}/{x}/{y}.png`;
          return (
            <MapUrlTile
              key={this.state.forceRefresh}
              urlTemplate={'file://' + url}
              tileSize={256}
              zIndex={-998}
              opacity={this.state.transparencyOfflineMap}
            />
          );
        }),
      );
    }

    if (data_kml.length > 0) {
      view_KML.push(
        data_kml.map(item => {
          return (
            <Geojson
              key={this.state.forceRefresh}
              geojson={item.data}
              strokeColor={item.lineColor}
              fillColor={item.fillColor}
              strokeWidth={item.lineWidth}
            />
          );
        }),
      );
    }

    if (data_geojson.length > 0) {
      view_GeoJson.push(
        data_geojson.map(item => {
          return (
            <Geojson
              key={this.state.forceRefresh}
              geojson={item.data}
              strokeColor={item.lineColor}
              fillColor={item.fillColor}
              strokeWidth={item.lineWidth}
            />
          );
        }),
      );
    }

    if (data_shp.length > 0) {
      view_SHP.push(
        data_shp.map(item => {
          return (
            <Geojson
              key={this.state.forceRefresh}
              geojson={item.data}
              strokeColor={item.lineColor}
              fillColor={item.fillColor}
              strokeWidth={item.lineWidth}
            />
          );
        }),
      );
    }

    if (show_point) {
      view_oldPoint.push(
        points.map(marker => {
          if (
            marker.type == null &&
            marker.info == null &&
            marker.note == null
          ) {
            return (
              <Marker
                title={marker.key}
                key={marker.id + this.state.forceRefresh}
                coordinate={marker.coordinate}
                zIndex={10}
                pinColor={'yellow'}
                {...markerOptions}>
                <Callout onPress={() => this._gotoDetailsPoint(marker.id)}>
                  <View>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                      {marker.key}
                    </Text>
                    <Text>{`X: ${marker.point.lat}`}</Text>
                    <Text>{`Y: ${marker.point.long}`}</Text>
                  </View>
                </Callout>
              </Marker>
            );
          } else {
            return (
              <Marker
                title={marker.key}
                key={marker.id + this.state.forceRefresh}
                coordinate={marker.coordinate}
                zIndex={10}
                pinColor={'green'}
                {...markerOptions}>
                <Callout onPress={() => this._gotoDetailsPoint(marker.id)}>
                  <View>
                    <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                      {marker.key}
                    </Text>
                    <Text>{`X: ${marker.point.lat}`}</Text>
                    <Text>{`Y: ${marker.point.long}`}</Text>
                  </View>
                </Callout>
              </Marker>
            );
          }
        }),
      );
    }

    if (show_line) {
      view_oldPoline.push(
        polyline.map(poline => {
          if (
            poline.type == null &&
            poline.info == null &&
            poline.note == null
          ) {
            return (
              <MapPolyline
                key={poline.id}
                coordinates={poline.coordinates}
                strokeColor={colors.strokeColor_color_unsave}
                strokeWidth={5}
                zIndex={10}
                {...polylineOption}
                onPress={() => this._gotoDetailsPolyline(poline.id)}
              />
            );
          } else {
            return (
              <MapPolyline
                key={poline.id}
                coordinates={poline.coordinates}
                strokeColor={colors.strokeColor_color_old}
                strokeWidth={5}
                zIndex={10}
                {...polylineOption}
                onPress={() => this._gotoDetailsPolyline(poline.id)}
              />
            );
          }
        }),
      );
    }

    if (show_polygon) {
      view_oldPolygon.push(
        polygon.map(poly => {
          if (poly.type == null && poly.info == null && poly.note == null) {
            return (
              <Polygon
                key={poly.id}
                coordinates={poly.coordinates}
                strokeColor={colors.strokeColor_color_unsave}
                fillColor={colors.map_color_unsave}
                strokeWidth={1}
                zIndex={1}
                {...polygonOption}
                onPress={() => this._gotoDetailsPolygon(poly.id)}
              />
            );
          } else {
            return (
              <Polygon
                key={poly.id}
                coordinates={poly.coordinates}
                strokeColor={colors.strokeColor_color_old}
                fillColor={colors.map_color_old}
                strokeWidth={1}
                zIndex={1}
                {...polygonOption}
                onPress={() => this._gotoDetailsPolygon(poly.id)}
              />
            );
          }
        }),
      );
    }

    if (current_action === 0) {
    } else {
      if (current_action !== 4 && current_action !== 5 && editing) {
        view_newPoint.push(
          this.state.markers.map(marker => (
            <Marker
              title={marker.key}
              key={marker.id}
              coordinate={marker.coordinate}
              tracksViewChanges={false}
              {...markerOptions}>
              <Callout>
                <View>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    {marker.key}
                  </Text>
                  <Text>{`X: ${marker.point.lat}`}</Text>
                  <Text>{`Y: ${marker.point.long}`}</Text>
                </View>
              </Callout>
            </Marker>
          )),
        );
      }

      if ((current_action === 2 || current_action === 4) && editing) {
        if (editing.coordinates.length > 1)
          view_poline.push(
            <MapPolyline
              key={this.state.editing.id}
              coordinates={this.state.editing.coordinates}
              strokeColor={colors.strokeColor_color_new}
              strokeWidth={5}
              {...polylineOption}
            />,
          );
      }

      if ((current_action === 3 || current_action === 5) && editing) {
        if (editing.coordinates.length > 2) {
          view_polygon.push(
            <Polygon
              key={this.state.editing.id}
              coordinates={this.state.editing.coordinates}
              strokeColor={colors.strokeColor_color_new}
              fillColor={colors.map_color_new}
              strokeWidth={5}
              {...polygonOption}
            />,
          );
        }
      }
    }

    if (is_view_mapLocal) {
      if (offlineUrlTemplate !== null) {
        view_map_local.push(
          <MapUrlTile
            key={this.state.forceRefresh}
            urlTemplate={'file://' + offlineUrlTemplate}
            tileSize={256}
            zIndex={-998}
            opacity={this.state.transparencyOfflineMap}
          />,
        );
      }
    }

    if (show_wms) {
      let centerPointWMS = this.state.centerPointWMS;
      var links = this.state.listWMS;

      if (links.length > 0) {
        view_wms.push(
          links.map(WMSLayerLink => {
            console.log('recive link: ', WMSLayerLink);
            return (
              <WMSTile
                key={this.state.forceRefresh}
                urlTemplate={WMSLayerLink}
                opacity={transparencyWMS}
                zIndex={1}
                tileSize={512}
              />
            );
          }),
        );
      }
      if (centerPointWMS !== null) {
        this._gotoLocation(centerPointWMS.lat, centerPointWMS.long, 0.15, 0.15);
        this.setState({centerPointWMS: null});
      }
    }

    if (is_view_mapUrl) {
      view_map_url.push(
        <MapUrlTile
          urlTemplate={urlTemplate}
          tileSize={256}
          zIndex={-998}
          opacity={this.state.transparencyOfflineMap}
        />,
      );
    }

    if (listFindPoint.length > 0) {
      view_findPoint.push(
        listFindPoint.map(marker => {
          return (
            <Marker
              title={'Điểm tìm kiếm'}
              coordinate={marker.coordinate}
              zIndex={10}
              pinColor={'pink'}
              style={{width: 130, height: 80}}>
              <Image
                source={require('../../images/pin.png')}
                style={{width: 35, height: 35}}
              />
              <Callout>
                <View>
                  <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                    {'Điểm tìm kiếm ' + (marker.id + 1)}
                  </Text>
                  <Text>{`X: ${marker.baseCoordinates.latitude}`}</Text>
                  <Text>{`Y: ${marker.baseCoordinates.longitude}`}</Text>
                </View>
              </Callout>
            </Marker>
          );
        }),
      );
    }

    return (
      <View style={{width: '100%', height: '100%'}}>
        <Header
          style={{
            backgroundColor: colors.head_bg,
            barStyle: 'light-content',
            height: 80,
            paddingTop: 30,
          }}
          androidStatusBarColor={colors.head_bg}>
          <Left style={{flex: 0.1}}>
            <Button transparent onPress={() => this._onBackPress()}>
              <Image
                style={{width: 30, height: 30}}
                source={require('../../images/arrow_back_white.png')}></Image>
            </Button>
          </Left>
          <Body
            style={{
              flex: 0.7,
              alignContent: 'center',
              alignItems: 'center',
            }}>
            <Title style={{color: 'white'}}>{cs_string.details_project}</Title>
          </Body>

          <Right style={{flex: 0.2, alignItems: 'center'}}>
            <View style={{width: 10}} />
            <Menu>
              <MenuTrigger>
                <Image
                  style={{width: 30, height: 30}}
                  source={require('../../images/more_horiz_white.png')}></Image>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption disabled={true}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() =>
                      this.setState({show_point: !this.state.show_point})
                    }>
                    <Text style={{flex: 0.9}}>{cs_string.show_point}</Text>
                    {this.state.show_point && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                    {!this.state.show_point && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 1,
                          borderColor: 'grey',
                          marginRight: -10,
                        }}></View>
                    )}
                  </TouchableOpacity>
                </MenuOption>

                <MenuOption disabled={true}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() =>
                      this.setState({show_line: !this.state.show_line})
                    }>
                    <Text style={{flex: 0.9}}>{cs_string.show_line}</Text>
                    {this.state.show_line && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                    {!this.state.show_line && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 1,
                          borderColor: 'grey',
                          marginRight: -10,
                        }}></View>
                    )}
                  </TouchableOpacity>
                </MenuOption>

                <MenuOption disabled={true}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() =>
                      this.setState({show_polygon: !this.state.show_polygon})
                    }>
                    <Text style={{flex: 0.9}}>{cs_string.show_polygon}</Text>
                    {this.state.show_polygon && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                    {!this.state.show_polygon && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 1,
                          borderColor: 'grey',
                          marginRight: -10,
                        }}></View>
                    )}
                  </TouchableOpacity>
                </MenuOption>

                <MenuOption disabled={true}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() =>
                      this.setState({show_wms: !this.state.show_wms})
                    }>
                    <Text style={{flex: 0.9}}>{cs_string.dbr_wms}</Text>

                    {this.state.show_wms && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                    {!this.state.show_wms && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 1,
                          borderColor: 'grey',
                          marginRight: -10,
                        }}></View>
                    )}
                  </TouchableOpacity>

                  <Slider
                    style={{
                      marginTop: 5,
                      height: 10,
                      width: 120,
                      step: 0.1,
                    }}
                    value={this.state.transparencyWMS}
                    onValueChange={value =>
                      this.setState({transparencyWMS: value})
                    }
                    disabledHoverEffect={false}
                  />
                </MenuOption>
              </MenuOptions>
            </Menu>
            <View style={{width: 10}} />
            <Menu>
              <MenuTrigger>
                <Image
                  style={{width: 30, height: 30}}
                  source={require('../../images/layer.png')}></Image>
              </MenuTrigger>
              <MenuOptions>
                <MenuOption onSelect={() => this._updateTypeMap(0)}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 0.9}}>{cs_string.google_map}</Text>
                    {type_map === 0 && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => this._updateTypeMap(1)}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 0.9}}>
                      {cs_string.google_satellite}
                    </Text>
                    {type_map === 1 && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => this._updateTypeMap(2)}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 0.9}}>{cs_string.google_terrain}</Text>
                    {type_map === 2 && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                  </View>
                </MenuOption>
                <MenuOption onSelect={() => this._updateTypeMap(3)}>
                  <View style={{flexDirection: 'row'}}>
                    <Text style={{flex: 0.9}}>{cs_string.google_hybrid}</Text>
                    {type_map === 3 && (
                      <Image
                        style={{width: 20, height: 20, marginRight: -10}}
                        source={require('../../images/checked_checkbox.png')}></Image>
                    )}
                  </View>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </Right>
        </Header>

        <View
          style={{
            position: 'absolute',
            top: height / 2 - 15,
            right: width / 2 - 15,
            zIndex: 1000,
          }}
          pointerEvents="none">
          <Image
            style={{width: 30, height: 30}}
            source={require('../../images/focus.png')}></Image>
        </View>

        <View style={{flex: 1}}>
          {this.state.getData && (
            <MapView
              onLayout={event => this.onLayout(event)}
              provider={PROVIDER_GOOGLE}
              mapType={type_view}
              style={{flex: 1}}
              onMapReady={this._onMapReady}
              initialRegion={this.state.region}
              showsUserLocation={true}
              showsCompass={true}
              ref={ref => {
                this.map = ref;
              }}
              onRegionChangeComplete={Region => {
                this.setState({region: Region});
              }}
              {...mapOptions}>
              {view_wms}
              {view_oldPoint}
              {view_oldPoline}
              {view_oldPolygon}
              {view_newPoint}
              {view_poline}
              {view_polygon}
              {view_findPoint}
              {view_MB}
              {view_KML}
              {view_GeoJson}
              {view_SHP}

              {/*{// show polygon check //}*/}
              {this.state.coordinatesTrack?.length > 0 && (
                <Polyline
                  coordinates={this.state.coordinatesTrack}
                  strokeWidth={5}
                  strokeColor="#00f"
                />
              )}
            </MapView>
          )}

          {this.state.projection != null && (
            <View
              style={{
                position: 'absolute',
                justifyContent: 'center',
                top: 10,
                left: 10,
                flexDirection: 'column',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: 'rgba(25,11,61,0.15)',
                }}>
                {this.state.show_info_window && (
                  <View>
                    <Text style={{color: 'white'}}>{projectZone}</Text>
                    {this.state.myLocation != null && (
                      <View pointerEvents="none">
                        <Text style={{color: 'white'}}>
                          X Người dùng: {this.state.myLocation.point.long}
                        </Text>
                        <Text style={{color: 'white'}}>
                          Y Người dùng: {this.state.myLocation.point.lat}
                        </Text>
                        <Text style={{color: 'white'}}>
                          X Tâm bản đồ:{' '}
                          {Math.round(
                            transformLatLng(
                              region.latitude,
                              region.longitude,
                              this.state.projection,
                            ).long * 10000,
                          ) / 10000}
                        </Text>
                        <Text style={{color: 'white'}}>
                          Y Tâm bản đồ:{' '}
                          {Math.round(
                            transformLatLng(
                              region.latitude,
                              region.longitude,
                              this.state.projection,
                            ).lat * 10000,
                          ) / 10000}
                        </Text>
                        <Text style={{color: 'white'}}>
                          Sai số vệ tinh: {this.state.myLocation.accuracy} m
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: 'rgba(25,11,61,0.2)',
                    width: 30,
                    borderRadius: 20,
                  }}
                  onPress={() => {
                    this.setState({
                      show_info_window: !this.state.show_info_window,
                    });
                  }}>
                  {this.state.show_info_window && (
                    <Image
                      style={{width: 25, height: 25, marginTop: '50%'}}
                      source={require('../../images/back_view.png')}></Image>
                  )}
                  {!this.state.show_info_window && (
                    <Image
                      style={{width: 30, height: 30}}
                      source={require('../../images/maximize.png')}></Image>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View
            style={{
              position: 'absolute',
              justifyContent: 'flex-end',
              top: 10,
              right: 10,
              flexDirection: 'column',
            }}>
            <Button
              // nut chon he chieu
              transparent
              onPress={() => {
                this._gotoSelectProjection(this.state.project_id);
              }}>
              <Image
                style={{width: 30, height: 30}}
                source={require('../../images/geolocation.png')}></Image>
            </Button>

            <Button
              // nut zooom vi tri nguoi dung
              transparent
              onPress={() => {
                this._gotoCurrentLocation();
              }}>
              <Image
                style={{width: 30, height: 30}}
                source={require('../../images/curentLocation.png')}></Image>
            </Button>
            {/*fake button track*/}
            <Button
              transparent
              onPress={() => {
                this._trackLocation();
              }}>
              {this.state.isTrackingLocation ? (
                <Image
                  style={{width: 37, height: 37}}
                  source={require('../../images/walk.png')}
                />
              ) : (
                <Image
                  style={{width: 37, height: 37}}
                  source={require('../../images/walkstop.png')}
                />
              )}
            </Button>
            <Button
              // Nut xem thong tin WMS Info
              transparent
              onPress={() => {
                if (this.state.listWMS.length > 0) {
                  if (
                    this.state.current_action === 0 ||
                    this.state.editing === null
                  ) {
                    this.setState({
                      onlyView: !this.state.onlyView,
                      viewGroupButtonHandEdit: false,
                      viewGroupButtonGPSEdit: false,
                    });
                    if (this.state.onlyView) {
                      Toast.show({
                        text: 'Chế độ xem thông tin',
                        buttonText: 'Tắt',
                        type: 'warning',
                      });
                    } else {
                      Toast.show({
                        text: 'Chế độ xem thông tin',
                        buttonText: 'Bật',
                        type: 'success',
                      });
                    }
                  } else {
                    Alert.alert(
                      cs_string.notification,
                      cs_string.none_save,
                      [
                        {
                          text: cs_string.continous,
                          onPress: () => {
                            this.setState(
                              {
                                markers: [],
                                editing: null,
                              },
                              function () {
                                this.setState({
                                  onlyView: !this.state.onlyView,
                                  viewGroupButtonHandEdit: false,
                                  viewGroupButtonGPSEdit: false,
                                });
                                if (this.state.onlyView) {
                                  Toast.show({
                                    text: 'Chế độ xem thông tin',
                                    buttonText: 'Tắt',
                                    type: 'warning',
                                  });
                                } else {
                                  Toast.show({
                                    text: 'Chế độ xem thông tin',
                                    buttonText: 'Bật',
                                    type: 'success',
                                  });
                                }
                              },
                            );
                          },
                          style: 'cancel',
                        },
                        {
                          text: cs_string.cancel,
                          onPress: () => this.setState({onlyView: false}),
                        },
                      ],
                      {cancelable: false},
                    );
                  }
                } else {
                  Toast.show({
                    text: 'Chưa có lớp bản đồ WMS',
                    buttonText: '',
                    type: 'danger',
                  });
                }
              }}>
              {this.state.onlyView && (
                <Image
                  style={{width: 30, height: 30}}
                  source={require('../../images/info_on.png')}></Image>
              )}
              {!this.state.onlyView && (
                <Image
                  style={{width: 30, height: 30}}
                  source={require('../../images/info.png')}></Image>
              )}
            </Button>

            <Button
              //Nut tim diem
              transparent
              onPress={() =>
                this.setState({modalVisible: true, isFindPoint: true})
              }>
              <Image
                style={{width: 30, height: 30}}
                source={require('../../images/address.png')}
              />
            </Button>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              this.setState({modalVisible: false});
            }}>
            {/* <Pressable style={[Platform.OS === "ios" ? styles.iOSBackdrop : styles.androidBackdrop, styles.backdrop]} onPress={() => this.setState({ setModalVisible: false })} /> */}
            <View
              style={{
                backgroundColor: 'white',
                width: '80%',
                height: 'auto',
                justifyContent: 'center',
                alignItems: 'baseline',
                marginHorizontal: '10%',
                marginTop: '50%',
                paddingHorizontal: 20,
                borderRadius: 8,
              }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'rgba(32, 73, 68, 1)',
                  padding: 8,
                  marginLeft: '15%',
                }}>
                Tìm điểm theo tọa độ
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(32, 73, 68, 1)',
                  padding: 4,
                }}>
                Nhập Vĩ độ
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: 'grey',
                  borderRadius: 8,
                  margin: 4,
                  padding: 4,
                  width: '100%',
                }}
                placeholder="Ví dụ: 12.432423 hoặc 435334"
                onChangeText={text => this.setState({latFindPoint: text})}
                autoCompleteType="off"
                textContentType="none"
                value={latFindPoint}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(32, 73, 68, 1)',
                  padding: 4,
                }}>
                Nhập Kinh độ
              </Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: 'grey',
                  borderRadius: 8,
                  margin: 4,
                  padding: 4,
                  width: '100%',
                }}
                placeholder="Ví dụ: 106.432423 hoặc 8974849"
                onChangeText={text => this.setState({longFindPoint: text})}
                autoCompleteType="off"
                textContentType="none"
                value={longFindPoint}
              />
              <Text
                style={{
                  fontSize: 14,
                  color: 'rgba(32, 73, 68, 1)',
                  padding: 4,
                }}>
                Nhập mã hệ toạ độ
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 2,
                }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: 'grey',
                    borderRadius: 8,
                    margin: 4,
                    padding: 4,
                    width: '88%',
                  }}
                  placeholder="   Ví dụ: 9211"
                  onChangeText={text =>
                    this.setState({selectedOptionCRS: text})
                  }
                  autoCompleteType="off"
                  textContentType="none"
                  value={
                    selectedOptionCRS != 0 ? selectedOptionCRS.toString() : ''
                  }
                />
                <Button
                  style={{
                    width: '12%',
                    height: 'auto',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    this.setState({modalVisible: false});
                    this._gotoSelectProjection(null);
                  }}>
                  <Image
                    style={{width: 24, height: 24, padding: 3}}
                    source={require('../../images/geolocation.png')}
                  />
                </Button>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 10,
                  marginTop: 13,
                  marginBottom: 13,
                }}>
                <Button
                  style={{
                    borderRadius: 8,
                    backgroundColor: 'green',
                    width: '40%',
                    marginHorizontal: '5%',
                    justifyContent: 'center',
                  }}
                  onPress={() => this._findPoint()}>
                  <Text style={{fontSize: 14, fontWeight: 'bold'}}>
                    Tìm điểm
                  </Text>
                </Button>
                <Button
                  style={{
                    borderRadius: 8,
                    backgroundColor: 'red',
                    width: '40%',
                    marginHorizontal: '5%',
                    justifyContent: 'center',
                  }}
                  onPress={() =>
                    this.setState({
                      modalVisible: false,
                      latFindPoint: null,
                      longFindPoint: null,
                      isFindPoint: false,
                      selectedOptionCRS: 0,
                    })
                  }>
                  <Text style={{fontSize: 14, fontWeight: 'bold'}}>Hủy</Text>
                </Button>
              </View>
            </View>
          </Modal>

          <View style={{flexDirection: 'column'}}>
            <View>
              {this.state.viewGroupButtonHandEdit ? (
                <View
                  style={{
                    // Phim edit voi cac doi tuong diem, duong, vung bang tay
                    backgroundColor: 'rgba(213,245,227,0.3)',
                    opacity: 1,
                    position: 'absolute',
                    width: '60%',
                    height: 42,
                    justifyContent: 'center',
                    bottom: '17%',
                    borderRadius: 30,
                    paddingLeft: 10,
                  }}>
                  <View style={{width: 40}} />

                  <View style={{flexDirection: 'row'}}>
                    {this.state.markers.length > 0 && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={this._backPress}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/undo_icon.png')}></Image>
                      </TouchableOpacity>
                    )}

                    {!(this.state.markers.length > 0) && (
                      <TouchableOpacity style={styles.bottomMap}>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            tintColor: 'gray',
                            marginTop: 4,
                          }}
                          source={require('../../images/undo_icon.png')}></Image>
                      </TouchableOpacity>
                    )}

                    {this.state.markers.length > 0 && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={this._saveObjectDrawer}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/ic_save.png')}></Image>
                        {/* <Text>{cs_string.save}</Text> */}
                      </TouchableOpacity>
                    )}
                    {!(this.state.markers.length > 0) && (
                      <TouchableOpacity style={styles.bottomMap}>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            tintColor: 'gray',
                            marginTop: 4,
                          }}
                          source={require('../../images/ic_save.png')}></Image>
                        {/* <Text style={{ color: '#8e8e93' }}>{cs_string.save}</Text> */}
                      </TouchableOpacity>
                    )}

                    {this.state.marker_back.length > 0 && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={this._nextPress}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/redo_icon.png')}></Image>
                      </TouchableOpacity>
                    )}
                    {!(this.state.marker_back.length > 0) && (
                      <TouchableOpacity style={styles.bottomMap}>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            tintColor: 'gray',
                            marginTop: 4,
                          }}
                          source={require('../../images/redo_icon.png')}></Image>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity // Nut them diem tu vi tri nguoi dung
                      style={styles.bottomMap}
                      onPress={this._onButtonCreateUserPoint}>
                      <Image
                        style={{width: 26, height: 26, marginTop: 4}}
                        source={require('../../images/get_user_position_icon.png')}></Image>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {this.state.viewGroupButtonGPSEdit ? (
                <View
                  style={{
                    // phim ho tro thao tac doi tuong duong, vung bang GPS
                    backgroundColor: 'rgba(213,245,227,0.3)',
                    opacity: 1,
                    position: 'absolute',
                    width: '42%',
                    height: 42,
                    justifyContent: 'center',
                    bottom: '17%',
                    borderRadius: 30,
                    paddingLeft: 10,
                  }}>
                  <View style={{width: 40}} />

                  <View style={{flexDirection: 'row'}}>
                    {this.state.markers.length > 0 && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={this._saveObjectDrawer}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/ic_save.png')}></Image>
                        {/* <Text>{cs_string.save}</Text> */}
                      </TouchableOpacity>
                    )}
                    {!(this.state.markers.length > 0) && (
                      <TouchableOpacity style={styles.bottomMap}>
                        <Image
                          style={{
                            width: 30,
                            height: 30,
                            tintColor: 'gray',
                            marginTop: 4,
                          }}
                          source={require('../../images/ic_save.png')}></Image>
                        {/* <Text style={{ color: '#8e8e93' }}>{cs_string.save}</Text> */}
                      </TouchableOpacity>
                    )}

                    {!this.state.plauseRecord > 0 && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={() => {
                          this.setState({
                            plauseRecord: !this.state.plauseRecord,
                          });
                          Toast.show({
                            text: 'Tạm dừng vẽ đối tượng!',
                            buttonText: 'GPS',
                            type: 'danger',
                          });
                        }}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/pause_ic.png')}></Image>
                      </TouchableOpacity>
                    )}
                    {this.state.plauseRecord && (
                      <TouchableOpacity
                        style={styles.bottomMap}
                        onPress={() => {
                          this.setState({
                            plauseRecord: !this.state.plauseRecord,
                          });
                          Toast.show({
                            text: 'Bắt đầu vẽ đối tượng!',
                            buttonText: 'GPS',
                            type: 'success',
                          });
                        }}>
                        <Image
                          style={{width: 30, height: 30, marginTop: 4}}
                          source={require('../../images/play_button_ic.png')}></Image>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity // Nut khoa man hinh tai vi tri nguoi dung
                      style={styles.bottomMap}
                      onPress={() => {
                        console.log('Pressss'),
                          this.setState({
                            moveToUserLocation: !this.state.moveToUserLocation,
                          });
                        if (this.state.moveToUserLocation) {
                          Toast.show({
                            text: 'Khoá vị trí',
                            buttonText: 'Tắt',
                            type: 'warning',
                          });
                        } else {
                          Toast.show({
                            text: 'Khoá vị trí',
                            buttonText: 'Bật',
                            type: 'success',
                          });
                        }
                      }}>
                      <Image
                        style={{width: 26, height: 26, marginTop: 4}}
                        source={require('../../images/get_user_position_icon.png')}></Image>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <FloatingAction
            actions={actions}
            position="right"
            distanceToEdge={{vertical: 100, horizontal: 10}}
            buttonSize={48}
            actionsPaddingTopBottom={3}
            onPressItem={name => {
              this.handleFloatingButton(name);
            }}
          />

          <Footer>
            <FooterTab style={{backgroundColor: '#FFFF'}}>
              <Button
                vertical
                onPress={() => {
                  this.props.navigation.navigate('TrackListScreen', {
                    project_id: this.state.project_id,
                  });
                }}>
                <View style={styles.bottomMapNoneColor}>
                  <Image
                    style={{width: 26, height: 26}}
                    source={require('../../images/walking-tour.png')}></Image>
                </View>
                <Text>Tuyến</Text>
              </Button>
              <Button
                vertical
                onPress={() => {
                  this.props.navigation.navigate('AddMapManager', {
                    project_id: this.state.project_id,
                    onRefresh: this.onRefresh,
                  });
                }}>
                <View style={styles.bottomMapNoneColor}>
                  <Image
                    style={{width: 26, height: 26}}
                    source={require('../../images/add-folder.png')}></Image>
                </View>
                <Text>Thêm tệp</Text>
              </Button>
              <Button
                vertical
                onPress={() => {
                  this._gotoSelectWMSLayerScreen(this.state.project_id);
                }}>
                <View style={styles.bottomMapNoneColor}>
                  <Image
                    style={{width: 26, height: 26}}
                    source={require('../../images/map_online.png')}></Image>
                </View>
                <Text>DV Bản đồ</Text>
              </Button>
              <Button
                onPress={() => {
                  this._captureImage();
                }}
                vertical>
                <View style={styles.bottomMapNoneColor}>
                  <Image
                    style={{width: 26, height: 26}}
                    source={require('../../images/camera.png')}></Image>
                </View>
                <Text>Camera</Text>
              </Button>
            </FooterTab>
          </Footer>
        </View>
        <CaptureImage
          handleCap={path => this._saveImage(path, this.state.folder_name)}
          ref={ref => (this.captureRef = ref)}
          height={480}
          width={480}
        />
        <LocationTracking
          ref={ref => (this.locationTrackingRef = ref)}
          setCoordinates={_coordinates => {
            this.setState({
              coordinatesTrack: _coordinates,
            });
          }}
        />
        {isLoading && <GlobalLoading />}
      </View>
    );
  }
}

MapProjectScreen.propTypes = {
  provider: ProviderPropType,
};

export default withNavigationFocus(MapProjectScreen);
