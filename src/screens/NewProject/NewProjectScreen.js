import React, {Component} from 'react'
import {View, TouchableOpacity, Image, ScrollView, TextInput, Alert} from 'react-native';
import {Header, Left, Body, Text, Button, Title, Toast, Picker} from 'native-base'
import cs_string from "../../untils/strings";
import {
    updateProjects,
    insertProjects,
    getListFile
} from "../../database/databaseServices";

import {withNavigationFocus} from "react-navigation";
import colors from "../../untils/colors";

const RNFS = require('react-native-fs');

class NewProjectScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            is_edit: false,
            id: '',
            name: '',
            description: '',
            note: '',
            creator: '',
            background_file: '',
            layout_file: '',
            list_background_file: [],
            list_layout_file: [],
            projection: 4326,
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


    _componentFocused = async () => {
        try {
            let files_all = [];
            await getListFile().then(files => {
                files_all = files;
            });

            if (this.props.navigation.state.params.id !== undefined) {
                this.setState({
                    is_edit: true,
                    id: this.props.navigation.state.params.id,
                    name: this.props.navigation.state.params.name,
                    description: this.props.navigation.state.params.description,
                    note: this.props.navigation.state.params.note,
                    creator: this.props.navigation.state.params.creator,
                    background_file: this.props.navigation.state.params.background_file,
                    layout_file: this.props.navigation.state.params.layout_file,
                    projection: this.props.navigation.state.params.projection,
                    list_background_file: files_all.filtered(`type_file = "${cs_string.background_type}"`),
                    list_layout_file: files_all.filtered(`type_file = "${cs_string.layout_type}"`),
                })
            } else {
                this.setState({
                    list_background_file: files_all.filtered(`type_file = "${cs_string.background_type}"`),
                    list_layout_file: files_all.filtered(`type_file = "${cs_string.layout_type}"`),
                })
            }
        } catch (e) {
            let files_all = [];
            await getListFile().then(files => {
                files_all = files;
            });

            this.setState({
                list_background_file: files_all.filtered(`type_file = "${cs_string.background_type}"`),
                list_layout_file: files_all.filtered(`type_file = "${cs_string.layout_type}"`),
            })
        }

    }

    _createOrUpdateProject = async () => {
        if (this.state.name.length < 1) {
            Alert.alert(cs_string.notification, cs_string.non_name)
        } else if (this.state.creator.length < 1) {
            Alert.alert(cs_string.notification, cs_string.none_create)
        } else {

            if (this.state.is_edit) {
                await updateProjects(this.state.id, this.state.name, this.state.creator,
                    this.state.description, this.state.note, this.state.background_file, this.state.layout_file,
                    this.state.projection);
                Toast.show({
                    text: cs_string.edit_susses,
                    type: "success"
                });

                this.props.navigation.goBack();
            } else {
                await insertProjects(this.state.name, this.state.creator, this.state.description,
                    this.state.note, this.state.background_file, this.state.layout_file, this.state.projection);
                Toast.show({
                    text: cs_string.create_susses,
                    buttonText: 'Xong',
                    type: "success"
                });

                this.props.navigation.goBack();
            }
        }
    };

    _addBackground_file = async () => {

    };

    render() {
        let view_layout = [];
        let pick_layout = [];
        for (let i = 0; i < this.state.list_layout_file.length; i++) {
            pick_layout.push(<Picker.Item label={this.state.list_layout_file[i].name_file}
                                          value={this.state.list_layout_file[i].folder}/>)
        }

        view_layout.push(<View style={{
            alignItems: 'center', alignContent:
                'center', justifyContent: 'space-between'
        }}>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("LayoutList")}>
                <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold'
                }}>{cs_string.layout_file}</Text>
            </TouchableOpacity>
            <Picker
                selectedValue={this.state.layout_file}
                style={{height: 50, width: 300}}
                itemStyle={{fontSize: 14}}
                onValueChange={(itemValue, itemIndex) =>
                    this.setState({
                            layout_file: itemValue,
                        }
                    )
                }>
                {pick_layout}
            </Picker>
        </View>);

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
                            {cs_string.info_project}
                        </Title>
                    </Body>
                </Header>
                <ScrollView
                    style={{flexGrow: 1, padding: 10}}
                    keyboardShouldPersistTaps="always"
                >
                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.name_project}</Text>
                        <Text style={{color: colors.red}}>*</Text>
                    </View>

                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({name: text})}
                            autoCompleteType='off'
                            textContentType='none'
                            value={this.state.name}
                        />
                    </View>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.desciption_project}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({description: text})}
                            autoCompleteType="off"
                            value={this.state.description}
                        />
                    </View>

                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.note_project}</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({note: text})}
                            autoCompleteType="off"
                            value={this.state.note}
                        />
                    </View>
                    <View style={{height: 20}}/>
                    <View style={{flexDirection: "row"}}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold'
                        }}>{cs_string.creator_project}</Text>
                        <Text style={{color: colors.red}}>*</Text>
                    </View>
                    <View style={{
                        height: 40, width: '100%', borderColor:
                            'gray', borderWidth: 1, borderRadius: 10, marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <TextInput
                            style={{width: '100%', height: 40, padding: 10}}
                            onChangeText={(text) => this.setState({creator: text})}
                            autoCompleteType="off"
                            value={this.state.creator}
                        />
                    </View>
                    {/*<View style={{height: 20}}/>*/}
                    {/*{view_layout}*/}
                    <View style={{height: 30}}/>

                    <Button
                        primary
                        block
                        onPress={this._createOrUpdateProject}
                    >
                        {!this.state.is_edit && <Text>
                            {cs_string.create_project}
                        </Text>}

                        {this.state.is_edit && <Text>
                            {cs_string.save_project}
                        </Text>}

                    </Button>
                </ScrollView>
            </View>
        );
    }
}

export default withNavigationFocus(NewProjectScreen);
