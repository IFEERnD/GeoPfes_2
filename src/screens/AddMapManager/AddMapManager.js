import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import Slider from '@react-native-community/slider';
import {
  Header,
  Button,
  Text,
  Body,
  Title,
  Left,
  Toast,
  Right,
} from 'native-base';
import colors from '../../untils/colors';
import DocumentPicker from 'react-native-document-picker';
import AwesomeAlert from 'react-native-awesome-alerts';
import {
  deleteLayoutFile,
  getListLayoutFile,
  insertLayoutFile,
  updateIndexLayoutFile,
  updateShowHide,
  updateStyleObj,
} from '../../database/databaseServices';
import {dirHome} from '../../database/projectJson';
import SQLite from 'react-native-sqlite-storage';
import ColorPickerWheel from 'react-native-wheel-color-picker';
import {UserState} from 'realm';

const RNFS = require('react-native-fs');
const AddMapManager = ({navigation}) => {
  const [filePicker, setFilePicker] = useState([]); //array render files
  const [getIndex, setGetIndex] = useState(null); //get index of file when click to delete button
  const [toggleDelete, setToggleDelete] = useState(false); //popup alert confirm delete
  const [toggleFeature, setToggleFeature] = useState(false); //popup more button
  const [loading, setLoading] = useState(false);
  const [project_id, setProject_id] = useState(
    navigation.state.params.project_id
      ? navigation.state.params.project_id
      : null,
  );
  const [viewEditColor, setViewEditCoLor] = useState(false);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedColorLine, setSelectedColorLine] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [transFillterColor, setTransFillterColor] = useState(1);
  const [transBoderColor, setTransBoderColor] = useState(1);
  const [isPickFillColor, setisPickFillColor] = useState(true);
  const [lineWidth, setLineWidth] = useState(1);
  const [selectedFileName, setSelectedFileName] = useState('');

  useEffect(() => {
    getAllFile();
  }, []); // Only re-run the effect if data changes

  const checkFileExist = (name, filePicker) => {
    //check file exist or not
    for (let i = 0; i < filePicker.length; i++) {
      if (name === filePicker[i].name) {
        return false;
      }
    }
    return true;
  };

  const processFile = async (file_path, name) => {
    setLoading(true);

    try {
      var tot_len = 0;
      var dem = 0;

      SQLite.openDatabase(
        {
          name: name,
          location: 'Documents',
        },
        db => {
          db.transaction(tx => {
            tx.executeSql('SELECT * FROM tiles', [], (tx, tot_row) => {
              tot_len = tot_row.rows.length;
            });

            var path_pr = file_path + '/title';

            tx.executeSql(
              'SELECT DISTINCT zoom_level FROM tiles',
              [],
              (tx, zoom_level) => {
                var len_zoom = zoom_level.rows.length;
                console.log(len_zoom);
                for (let i = 0; i < len_zoom; i++) {
                  let row_zoom = zoom_level.rows.item(i);
                  RNFS.mkdir(path_pr + '/' + row_zoom.zoom_level);
                  tx.executeSql(
                    'SELECT DISTINCT tile_column FROM tiles WHERE zoom_level = ' +
                      row_zoom.zoom_level,
                    [],
                    (tx, tile_column) => {
                      var len_column = tile_column.rows.length;
                      for (let j = 0; j < len_column; j++) {
                        let row_column = tile_column.rows.item(j);
                        RNFS.mkdir(
                          path_pr +
                            '/' +
                            row_zoom.zoom_level +
                            '/' +
                            row_column.tile_column,
                        );
                        tx.executeSql(
                          'SELECT tile_row, tile_data FROM tiles WHERE zoom_level = ' +
                            row_zoom.zoom_level +
                            ' AND tile_column = ' +
                            row_column.tile_column,
                          [],
                          (tx, data) => {
                            var len = data.rows.length;
                            for (let k = 0; k < len; k++) {
                              var y = parseInt(
                                Math.pow(2, parseInt(row_zoom.zoom_level)) -
                                  parseInt(data.rows.item(k).tile_row) -
                                  1,
                              );

                              path =
                                path_pr +
                                '/' +
                                row_zoom.zoom_level +
                                '/' +
                                row_column.tile_column +
                                '/' +
                                y +
                                '.png';
                              RNFS.writeFile(
                                path,
                                data.rows.item(k).tile_data,
                                'base64',
                              )
                                .then(success => {
                                  dem++;
                                  console.log(dem);
                                  if (dem == tot_len) {
                                    this.setState({
                                      loading: false,
                                    });

                                    Toast.show({
                                      text: 'Sử dụng thành công',
                                      type: 'success',
                                    });
                                  }
                                })
                                .catch(err => {
                                  console.log(err.message);
                                });
                            }
                          },
                        );
                      }
                    },
                  );
                }
              },
            );
          });
        },
      );
    } catch (e) {
      console.log(e);
    }
  };
  const handlePickFile = async () => {
    //pick file from device
    try {
      const res = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });

      const name = res[0].name;
      const size = res[0].size;
      const type = res[0].name.split('.').pop();

      switch (type) {
        case 'mbtiles':
          // console.log('name', dirHome + '/' + res[0].name);
          // await RNFS.exists(
          //   dirHome + '/' + project_id + '/' + res[0].name,
          // ).then(res => {
          //   if (res) {
          //     RNFS.unlink(dirHome + '/' + res[0].name).then(() =>
          //       console.log('FILE DELETED'),
          //     );
          //   }
          // });
          RNFS.copyFile(res[0].uri, dirHome + '/' + res[0].name);
          try {
            const respon = await insertLayoutFile(
              name,
              '',
              '',
              type,
              size,
              project_id,
            );
            if (respon > 0) {
              var file_path =
                dirHome + '/' + project_id + '/LayoutFile/' + respon;
              RNFS.mkdir(file_path + '/title');

              processFile(file_path, name);
              getAllFile();
            } else {
              Toast.show({
                text: 'File đã tồn tại!',
              });
            }
          } catch (err) {
            console.log('errrrr ', err);
          }
          break;
        case 'kml':
        case 'geojson':
          console.log('check');
          if (checkFileExist(name, filePicker)) {
            try {
              const respon = await insertLayoutFile(
                name,
                '',
                '',
                type,
                size,
                project_id,
              );
              if (respon > 0) {
                var file_path =
                  dirHome + '/' + project_id + '/LayoutFile/' + respon;
                RNFS.mkdir(file_path);
                RNFS.copyFile(res[0].uri, file_path + '/' + name);
                getAllFile();
              } else {
                Toast.show({
                  text: 'File đã tồn tại!',
                });
              }
            } catch (err) {
              console.log(err);
            }
          }
          break;
        case 'shp':
        case 'dbf':
        case 'prj':
          let pathShp = null;
          let pathPrj = null;
          let pathDbf = null;
          let nameShp = null;
          let nameDbf = null;
          let namePrj = null;
          try {
            res?.map(value => {
              let newValue = value?.name?.split('.');
              if (newValue[newValue.length - 1]?.toLowerCase() == 'dbf') {
                pathDbf = value?.uri;
                nameDbf = value?.name?.replace('.dbf', '');
              }
              if (newValue[newValue.length - 1]?.toLowerCase() == 'shp') {
                pathShp = value?.uri;
                nameShp = value?.name?.replace('.shp', '');
              }
              if (newValue[newValue.length - 1]?.toLowerCase() == 'prj') {
                pathPrj = value?.uri;
                namePrj = value?.name?.replace('.prj', '');
              }
            });

            if (
              pathShp == null ||
              pathPrj == null ||
              pathDbf == null ||
              namePrj != nameShp ||
              namePrj != nameDbf ||
              nameShp != nameDbf
            ) {
              Alert.alert(
                'File lựa chọn không đủ',
                'Vui lòng chọn đủ 3 loại file .shp, .prj, .dbf và tên các file đồng nhất!',
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
              );
            } else {
              if (checkFileExist(nameShp, filePicker)) {
                try {
                  const respon = await insertLayoutFile(
                    nameShp + '.shp',
                    nameDbf + '.dbf',
                    namePrj + '.prj',
                    'shp',
                    size,
                    project_id,
                  );
                  if (respon > 0) {
                    var file_path =
                      dirHome + '/' + project_id + '/LayoutFile/' + respon;
                    RNFS.mkdir(file_path);
                    RNFS.copyFile(pathShp, file_path + '/' + nameShp + '.shp');
                    RNFS.copyFile(pathDbf, file_path + '/' + nameDbf + '.dbf');
                    RNFS.copyFile(pathPrj, file_path + '/' + namePrj + '.prj');
                    getAllFile();
                  } else {
                    Toast.show({
                      text: 'File đã tồn tại!',
                    });
                  }
                } catch (err) {
                  console.log(err);
                }
              }
            }
          } catch (err) {
            console.log(err);
          }

          break;
      }
    } catch (err) {}
    if (DocumentPicker.isCancel(err)) {
      Toast.show({
        text: 'Không có file nào được chọn!',
      });
    } else {
      // throw err;
    }
  };

  const handlePushUp = async index => {
    //move file up
    if (index === 0) {
      return;
    }

    let index1 = index + 1;
    let index2 = index;
    let objName1 = filePicker[index].fileName;
    let objName2 = filePicker[index - 1].fileName;

    try {
      const res = await updateIndexLayoutFile(
        objName1,
        index1,
        objName2,
        index2,
      );

      if (res === 'success') {
        setGetIndex(index - 1);
        return getAllFile();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePushDown = async index => {
    //move file down
    if (index === filePicker.length) {
      return;
    }

    let index1 = index + 1;
    let index2 = index1 + 1;
    let objName1 = filePicker[index].fileName;
    let objName2 = filePicker[index + 1].fileName;

    try {
      const res = await updateIndexLayoutFile(
        objName1,
        index1,
        objName2,
        index2,
      );

      if (res === 'success') {
        setGetIndex(index + 1);
        return getAllFile();
      }
    } catch (error) {}
  };

  const handleDelete = async index => {
    //delete file
    const fileNameDelete = filePicker[index].fileName;
    console.log('delete: ', filePicker[index]);
    const res = await deleteLayoutFile(fileNameDelete, project_id);
    var file_path =
      dirHome +
      '/' +
      project_id +
      '/LayoutFile/' +
      filePicker[index].folderName;
    RNFS.unlink(file_path);

    getAllFile(project_id);

    if (res === 'success') {
      Toast.show({
        text: 'Xóa file thành công',
      });
    } else {
      Toast.show({
        text: 'Có lỗi xảy ra',
      });
    }

    setGetIndex(null);
    setToggleFeature(!toggleFeature);
  };

  const handlePopupDelete = index => {
    //popup delete confirm
    setGetIndex(index);
  };

  const handleSelectStyle = () => {
    var colorFill = '';
    var colorBorder = '';
    if (isHexColor(selectedColor)) {
      colorFill = hexToRGBA(selectedColor, transFillterColor);
    } else {
      colorFill = selectedColor;
    }
    if (isHexColor(selectedColorLine)) {
      colorBorder = hexToRGBA(selectedColorLine, transBoderColor);
    } else {
      colorBorder = selectedColorLine;
    }

    try {
      const res = updateStyleObj(
        project_id,
        selectedFileName,
        colorFill,
        colorBorder,
        parseInt(lineWidth),
      );
      if (res._z === 1) {
        return getAllFile();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllFile = async () => {
    const res = await getListLayoutFile(project_id);
    setFilePicker(res);
  };

  const BackMap = () => {
    navigation.goBack();
    navigation.state.params.onRefresh();
  };

  const handleColorSelection = (inputColor, isPickFillColor) => {
    if (isPickFillColor) {
      setSelectedColor(inputColor);
    } else {
      setSelectedColorLine(inputColor);
    }
  };

  function isHexColor(colorCode) {
    // Regular expression to match hex color code
    var hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    return hexColorRegex.test(colorCode);
  }

  function convertBitsToUnits(bits) {
    const units = ['bits', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    let convertedValue = bits;

    while (convertedValue >= 1024 && unitIndex < units.length - 1) {
      convertedValue /= 1024;
      unitIndex++;
    }

    return `${convertedValue.toFixed(1)} ${units[unitIndex]}`;
  }

  function hexToRGBA(hex, opacity) {
    hex = hex.replace('#', '');
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
  }

  const RenderItem = ({item, index}) => {
    return (
      <View style={styles.listItemContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
          }}>
          <View style={styles.imgContainer}>
            {item.type == 'kml' && (
              <Image
                source={require('../../images/kml.png')}
                style={styles.img}
              />
            )}
            {item.type == 'mbtiles' && (
              <Image
                source={require('../../images/mbtiles.png')}
                style={styles.img}
              />
            )}
            {item.type == 'shp' && (
              <Image
                source={require('../../images/shp.png')}
                style={styles.img}
              />
            )}
            {item.type == 'geojson' && (
              <Image
                source={require('../../images/geojson.png')}
                style={styles.img}
              />
            )}
          </View>

          <View
            style={{
              flex: 4,
              overflow: 'hidden',
              justifyContent: 'center',
            }}>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.titleText}>Tên file: </Text>
              <Text style={styles.nameTile}>{item.fileName}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
              <Text style={styles.titleText}>Kích thước: </Text>
              <Text>{convertBitsToUnits(item.size)}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setGetIndex(index);
              setToggleFeature(!toggleFeature);
            }}>
            <Image
              source={require('../../images/dots.png')}
              style={styles.imgFeature}
            />
          </TouchableOpacity>
        </View>
        <View>
          <View
            style={{
              flexDirection: 'row',
              marginLeft: 5,
              width: '100%',
              justifyContent: 'space-around',
            }}>
            {getIndex === index && toggleFeature && (
              <>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    handlePushUp(index);
                  }}>
                  <Image
                    source={require('../../images/up.png')}
                    style={styles.imgFeature}
                  />
                  <Text>Hiện trước</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    handlePushDown(index);
                  }}>
                  <Image
                    source={require('../../images/down.png')}
                    style={styles.imgFeature}
                  />
                  <Text>Hiện sau </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.option}
                  onPress={async () => {
                    const status = item.visible;
                    await updateShowHide(item.fileID, !status);
                    getAllFile(project_id);
                  }}>
                  {item.visible ? (
                    <View style={{alignItems: 'center'}}>
                      <Image
                        source={require('../../images/hidden.png')}
                        style={styles.imgFeature}
                      />
                      <Text>Ẩn</Text>
                    </View>
                  ) : (
                    <View style={{alignItems: 'center'}}>
                      <Image
                        source={require('../../images/show.png')}
                        style={styles.imgFeature}
                      />
                      <Text>Hiện</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {item.type != 'mbtiles' ? (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      console.log('hi item: ', item);
                      setViewEditCoLor(true);
                      setSelectedFileName(item.fileName);
                      setSelectedColor(item.styleFillColor);
                      setSelectedColorLine(item.styleLineColor);
                      setLineWidth(item.lineWidth);
                    }}>
                    <Image
                      source={require('../../images/color-wheel.png')}
                      style={styles.imgFeature}
                    />
                    <Text>Màu</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    handlePopupDelete(index);
                    setToggleDelete(true);
                  }}>
                  <Image
                    source={require('../../images/delete.png')}
                    style={styles.imgFeature}
                  />
                  <Text>Xoá</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        {getIndex !== null && (
          <AwesomeAlert
            show={toggleDelete}
            title="Xác nhận xóa!"
            titleStyle={{fontSize: 25, color: 'red'}}
            message="Chắc chắn muốn xóa file này?"
            messageStyle={{color: 'black', fontSize: 20}}
            showCancelButton={true}
            cancelText="Hủy"
            cancelButtonStyle={{
              backgroundColor: 'green',
              width: 90,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            cancelButtonTextStyle={{fontSize: 18}}
            onCancelPressed={() => {
              setToggleDelete(false);
            }}
            showConfirmButton={true}
            confirmText="Xóa"
            confirmButtonStyle={{
              backgroundColor: 'red',
              width: 90,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            confirmButtonTextStyle={{fontSize: 18}}
            onConfirmPressed={() => {
              handleDelete(getIndex);
              setToggleDelete(false);
            }}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        style={{
          backgroundColor: colors.head_bg,
          barStyle: 'light-content',
          height: 80,
          paddingTop: 30,
        }}
        androidStatusBarColor={colors.head_bg}>
        <Left style={{flex: 0.1}}>
          <Button transparent onPress={() => BackMap()}>
            <Image
              style={{width: 30, height: 30}}
              source={require('../../images/arrow_back_white.png')}></Image>
          </Button>
        </Left>
        <Body
          style={{
            flex: 0.8,
            alignContent: 'center',
            alignItems: 'center',
          }}>
          <Title style={{color: 'white'}}>Quản lý lớp bản đồ</Title>
        </Body>
      </Header>
      <View>
        <FlatList
          data={filePicker}
          renderItem={({item, index}) => (
            <RenderItem item={item} index={index} />
          )}
          keyExtractor={(_, index) => index}
        />
      </View>

      <View style={{position: 'absolute', bottom: 20, right: 20}}>
        <TouchableOpacity onPress={handlePickFile}>
          <Image
            source={require('../../images/add.png')}
            style={{width: 50, height: 50}}
          />
        </TouchableOpacity>
      </View>
      <Modal
        style={{flex: 1, backgroundColor: 'rgba(223, 246, 216, 0.8)'}}
        animationType="fade"
        transparent={true}
        visible={viewEditColor}
        onRequestClose={() => {
          setViewEditCoLor(false);
        }}>
        <TouchableOpacity
          style={{flex: 1}}
          onPress={() => {
            setViewEditCoLor(false);
          }}
        />
        <View style={styles.modalView}>
          <ScrollView style={{width: '90%'}}>
            <Text style={styles.tileModal}>THIẾT LẬP HIỂN THỊ</Text>
            <View style={styles.contenModal}>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    fontSize: 19,
                    color: '#44d480',
                    paddingVertical: 10,
                  }}>
                  Màu cho đối tượng trong vùng
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 2}}>Chọn màu: </Text>
                  <TouchableOpacity
                    style={[styles.colorPick, {backgroundColor: selectedColor}]}
                    title="Open Color Picker"
                    onPress={() => {
                      setModalVisible(true);
                      setisPickFillColor(true);
                    }}></TouchableOpacity>
                  <Modal
                    style={styles.containerColorpicker}
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                      setModalVisible(false);
                    }}>
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />
                    <View style={styles.modalContainer}>
                      <ColorPickerWheel
                        color={selectedColor}
                        onColorChange={color =>
                          handleColorSelection(color, isPickFillColor)
                        }
                      />
                    </View>
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />
                  </Modal>
                </View>
                <View style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{flex: 2}}>Chọn độ trong suốt:</Text>
                  <Slider
                    minimumValue={0}
                    maximumValue={1}
                    step={0.1}
                    style={styles.slider}
                    value={transFillterColor}
                    onValueChange={value => setTransFillterColor(value)}
                    disabledHoverEffect={false}
                  />
                </View>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    fontSize: 19,
                    color: '#44d480',
                    paddingVertical: 10,
                  }}>
                  Màu viền
                </Text>
                <View style={{flexDirection: 'row'}}>
                  <Text style={{flex: 2}}>Chọn màu: </Text>
                  <TouchableOpacity
                    style={[
                      styles.colorPick,
                      {backgroundColor: selectedColorLine},
                    ]}
                    title="Open Color Picker"
                    onPress={() => {
                      setModalVisible(true);
                      setisPickFillColor(false);
                    }}></TouchableOpacity>
                  <Modal
                    style={styles.containerColorpicker}
                    animationType="fade"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                      setModalVisible(false);
                    }}>
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />
                    <View style={styles.modalContainer}>
                      <ColorPickerWheel
                        color={selectedColorLine}
                        onColorChange={color =>
                          handleColorSelection(color, isPickFillColor)
                        }
                      />
                    </View>
                    <TouchableOpacity
                      style={{flex: 1}}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />
                  </Modal>
                </View>
                <View style={{flexDirection: 'row', paddingVertical: 10}}>
                  <Text style={{flex: 2}}>Chọn độ trong suốt:</Text>
                  <Slider
                    minimumValue={0}
                    maximumValue={1}
                    step={0.1}
                    style={styles.slider}
                    value={transBoderColor}
                    onValueChange={value => setTransBoderColor(value)}
                    disabledHoverEffect={false}
                  />
                </View>
              </View>
              <View style={{flexDirection: 'column'}}>
                <Text
                  style={{
                    fontSize: 19,
                    color: '#44d480',
                    paddingVertical: 5,
                  }}>
                  Độ rộng viền
                </Text>
                <View style={{flexDirection: 'row', paddingVertical: 10}}>
                  <TextInput
                    style={styles.textWith}
                    keyboardType="number-pad"
                    onChangeText={value => {
                      console.log(value);
                      setLineWidth(value);
                    }}>
                    {lineWidth}
                  </TextInput>
                </View>
              </View>
              <TouchableOpacity
                style={styles.buttonSave}
                onPress={() => {
                  handleSelectStyle();
                  setViewEditCoLor(false);
                }}>
                <Text style={{color: 'white'}}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity
          style={{flex: 2}}
          onPress={() => {
            setViewEditCoLor(false);
          }}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },

  listItemContainer: {
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '97%',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'gray',
    padding: 6,
    margin: 6,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 1, height: 1},
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  imgContainer: {
    flex: 1,
    padding: 3,
    marginRight: 3,
  },
  nameTile: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
  },

  img: {
    width: 55,
    height: 55,
    tintColor: 'green',
  },

  imgFeature: {
    width: 32,
    height: 32,
    marginRight: 3,
    marginBottom: 2,
  },
  option: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  modalView: {
    flex: 4,
    backgroundColor: '#f5f7f6',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 8,
  },
  tileModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    padding: 6,
    alignSelf: 'center',
  },
  contenModal: {
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  colorPick: {
    flex: 3,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    width: '40%',
    height: 35,
  },
  containerColorpicker: {
    flex: 1,
    backgroundColor: '#e8e8e8',
    paddingBottom: 0,
    width: '100%',
    maxWidth: 500,
    margin: 'auto',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderColor: 'black',
    borderWidth: 1,
    width: '90%',
    alignSelf: 'center',
  },
  slider: {
    flex: 3,
    height: 10,
    marginTop: 5,
  },
  textWith: {
    flex: 2,
    borderColor: 'black',
    borderWidth: 1,
    backgroundColor: '#fafafa',
    height: 35,
    padding: 5,
    borderRadius: 8,
  },
  buttonSave: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
    height: 40,
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 9,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default AddMapManager;
