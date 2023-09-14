import React, { Component } from 'react'
import { StyleSheet, Text, Image, Platform, View } from 'react-native';
import { Header, Content, Form, Item, Picker, Button, Left, Body, Title, Toast, Icon } from 'native-base';
import colors from '../../untils/colors';
const vnRegionMapData = require('../../untils/VnRegionMap.json');

class ChoseOpenRegion extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listTypeMap: [],
            listProvinces: [],
            listDistricts: [],
            listCommunes: [],

            centerPoint: undefined, // Toạ độ điểm tâm lúc mở bản đồ
            selectTypeMapCode: undefined, // Mã nhóm bản đồ: DVMTR, RVB....
            selectYear: undefined, //Năm dữ liệu bản đồ
            selectNameRegionCol: undefined, // Tên cột để lấy danh sách tỉnh huyện xã
            selectProvince: undefined,
            selectProvinceCode: undefined,
            selectDistrict: undefined,
            selectDistrictCode: undefined,
            selectCommune: undefined,
            selectCommuneCode: undefined
        };
    }

    async _getListProvinces() {
        let listProvincesFull = [];
        let listProvincesShort = [];
        try {
            for (var i = 0; i < vnRegionMapData.length; i++) {
                var province = {
                    provinName: vnRegionMapData[i].TINH,
                    provinCode: vnRegionMapData[i].MATINH,
                    provinX: vnRegionMapData[i].X_TINH,
                    provinY: vnRegionMapData[i].Y_TINH
                }
                //check if exsit?
                listProvincesFull.push(province);
            }
        } catch{

        }
        listProvincesShort = this.remove_duplicates(listProvincesFull);
        this.setState({ listProvinces: listProvincesShort });
    }

    _getListDistricts(itemValue) {
        let listDistrictFull = [];
        let listDistrictShort = [];
        try {
            for (var i = 0; i < vnRegionMapData.length; i++) {
                if ( vnRegionMapData[i].MATINH == itemValue) {
                    var district = {
                        districtName: vnRegionMapData[i].HUYEN,
                        districtCode: vnRegionMapData[i].MAHUYEN,
                        districtX: vnRegionMapData[i].X_HUYEN,
                        districtY: vnRegionMapData[i].Y_HUYEN
                    }
                    listDistrictFull.push(district);
                }
            }
        } catch{

        }
        listDistrictShort = this.remove_duplicates(listDistrictFull);
        this.setState({ listDistricts: listDistrictShort });
    }

    _getListCommunes(itemValue) {
        let listCommuneFull = [];
        let listCommuneShort = [];
        try {
            for (var i = 0; i < vnRegionMapData.length; i++) {
                if ( vnRegionMapData[i].MAHUYEN == itemValue) {
                    var commune = {
                        communeName: vnRegionMapData[i].XA,
                        communeCode: vnRegionMapData[i].MAXA,
                        communeX: vnRegionMapData[i].X_XA,
                        communeY: vnRegionMapData[i].Y_XA,
                    }
                    listCommuneFull.push(commune);
                }
            }
        } catch{

        }
        listCommuneShort = this.remove_duplicates(listCommuneFull);
        this.setState({ listCommunes: listCommuneShort });
    }

    _getCenterPoint(typePoint, objectCode) {
        switch (typePoint) {
            case 'province':
                let listProvinces = this.state.listProvinces;
                for (var i = 0; i < listProvinces.length; i++) {
                    if (listProvinces[i].provinCode == objectCode) {
                        let centerPoint = { long: parseFloat(listProvinces[i].provinX), lat: parseFloat(listProvinces[i].provinY) };
                        this.setState({ centerPoint: centerPoint })
                    }
                }
                break;
            case 'district':
                let listDistricts = this.state.listDistricts;
                for (var i = 0; i < listDistricts.length; i++) {
                    if (listDistricts[i].districtCode == objectCode) {
                        let centerPoint = { "long": parseFloat(listDistricts[i].districtX), "lat": parseFloat(listDistricts[i].districtY) };
                        this.setState({ centerPoint: centerPoint })
                    }
                }
                break;
            case 'commune':
                let listCommunes = this.state.listCommunes;
                for (var i = 0; i < listCommunes.length; i++) {
                    if (listCommunes[i].communeCode == objectCode) {
                        let centerPoint = { long: parseFloat(listCommunes[i].communeX), lat: parseFloat(listCommunes[i].communeY) };
                        this.setState({ centerPoint: centerPoint })
                    }
                }
                break;
        }
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

    _onButtonPress = () => {
        let selectProvinceCode = this.state.selectProvinceCode;

        if (selectProvinceCode !== undefined) {
            let centerPoint = this.state.centerPoint;
            this.props.navigation.navigate("MapProjectScreen", { centerPointOpen: centerPoint, moveChosePoint: true });
        } else {
            Toast.show({
                text: 'Thiếu thông vị trí',
                type: "warning"
            })
        }
    }

    render() {
        this._getListProvinces();
        let _getProvince = [];
        if (this.state.listProvinces.length > 0) {
            if (Platform.OS === 'android') {
                _getProvince.push(<Picker.Item label={'<Chọn tỉnh>'} value={undefined} />)
            }
            for (let index = 0; index < this.state.listProvinces.length; index++) {
                _getProvince.push(<Picker.Item label={this.state.listProvinces[index].provinName} value={this.state.listProvinces[index].provinCode} />)
            }
        }
        let _getDistricts = [];
        if (this.state.listDistricts.length > 0) {
            if (Platform.OS === 'android') {
                _getDistricts.push(<Picker.Item label={'<Chọn huyện>'} value={undefined} />)
            }
            for (let index = 0; index < this.state.listDistricts.length; index++) {
                _getDistricts.push(<Picker.Item label={this.state.listDistricts[index].districtName} value={this.state.listDistricts[index].districtCode} />)
            }
        }

        let _getCommunes = [];
        if (this.state.listCommunes.length > 0) {
            if (Platform.OS === 'android') {
                _getCommunes.push(<Picker.Item label={'<Chọn xã>'} value={undefined} />)
            }
            for (let index = 0; index < this.state.listCommunes.length; index++) {
                _getCommunes.push(<Picker.Item label={this.state.listCommunes[index].communeName} value={this.state.listCommunes[index].communeCode} />)
            }
        }

        return (

            <View style={{ flex: 1 }}>
                <Header
                    style={{ backgroundColor: colors.head_bg, barStyle: "light-content", height: 80, paddingTop: 30 }}
                    androidStatusBarColor={colors.head_bg}
                >
                    <Left style={{ flex: 0.1 }}>
                        <Button transparent onPress={() => this.props.navigation.goBack()}>
                            <Icon name="arrow-back" style={{ color: "white" }} />
                            <Text style={{ textColor: 'white' }}>Back</Text>
                        </Button>
                    </Left>
                    <Body
                        style={{
                            flex: 0.9,
                            alignContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <Title style={{ color: "white" }}>
                            Chọn vị trí
                        </Title>
                    </Body>
                </Header>

                <Content>
                    <Text style={styles.titleInput}>Chọn Tỉnh/Thành phố</Text>
                    <Form>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                style={{ width: undefined }}
                                placeholder="Tên Tỉnh/Thành phố"
                                placeholderStyle={{ color: "#bfc6ea" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectProvince}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({
                                        selectProvinceCode: itemValue,
                                        selectProvince: itemValue,
                                        listDistricts: [],
                                        listCommunes: [],
                                        centerPoint: undefined,
                                        selectDistrict: undefined,
                                        selectDistrictCode: undefined,
                                        selectCommune: undefined,
                                        selectCommuneCode: undefined,
                                    })
                                    if (itemValue !== undefined) {
                                        this._getCenterPoint('province', itemValue);
                                        this._getListDistricts(itemValue);
                                    };
                                }
                                }>
                                {_getProvince}
                            </Picker>
                        </Item>
                    </Form>

                    <Text style={styles.titleInput}>Chọn Quận/Huyện</Text>
                    <Form>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                style={{ width: undefined }}
                                placeholder="Tên Quận/Huyện"
                                placeholderStyle={{ color: "#bfc6ea" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectDistrict}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({
                                        selectDistrictCode: itemValue,
                                        selectDistrict: itemValue,
                                        listCommunes: [],
                                        selectCommune: undefined,
                                        selectCommuneCode: undefined,
                                    })
                                    if (itemValue !== undefined) {
                                        this._getCenterPoint('district', itemValue);
                                        this._getListCommunes(itemValue)
                                    }
                                }
                                }>
                                {_getDistricts}
                            </Picker>
                        </Item>
                    </Form>

                    <Text style={styles.titleInput}>Chọn Xã/Phường/Thị trấn</Text>
                    <Form>
                        <Item picker>
                            <Picker
                                mode="dropdown"
                                style={{ width: undefined }}
                                placeholder="Tên Xã/Phường/Thị trấn"
                                placeholderStyle={{ color: "#bfc6ea" }}
                                placeholderIconColor="#007aff"
                                selectedValue={this.state.selectCommune}
                                onValueChange={(itemValue, itemIndex) => {
                                    this.setState({
                                        selectCommuneCode: itemValue,
                                        selectCommune: itemValue,
                                    })
                                    if (itemValue !== undefined) {
                                        this._getCenterPoint('commune', itemValue);
                                    }
                                }
                                }>
                                {_getCommunes}
                            </Picker>
                        </Item>
                    </Form>

                    <Button
                        success
                        block
                        onPress={this._onButtonPress}
                        style={{
                            marginTop: 15,
                            width: '50%',
                            marginLeft: '25%',
                            flexDirection: "row",
                            justifyContent: "center"
                        }}
                    >
                        <Text style={{ textColor: 'white' }}>Chọn</Text>
                    </Button>
                </Content>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headingText: {
        textAlign: "center",
        fontSize: 12,
        fontWeight: "bold",
        color: "#0000CC",
        textDecorationLine: "underline"
    },
    titleInput: {
        marginLeft: 10,
        fontSize: 16,
        marginTop: 5,
        marginEnd: 5
    }
})

export default ChoseOpenRegion;