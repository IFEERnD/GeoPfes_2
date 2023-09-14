import React, {Component} from 'react'
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import {Body, Button, Header, Left, Title} from "native-base";
import cs_string from "../../untils/strings";
import colors from '../../untils/colors';

class ProfileScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
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
                            {cs_string.menu_profile}
                        </Title>
                    </Body>
                </Header>
                <ScrollView style={{flex: 1}}>
                    <Image style={{width: '100%', height: 240}}
                           source={require("../../images/ifee_uni.jpg")}></Image>
                    <View style={{padding: 10}}>
                        <View style={{alignItems: 'center'}}>
                            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.name_vien}</Text>
                            <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.name_dh}</Text>
                        </View>
                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.auth_group}</Text>
                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 16}}>{cs_string.author}</Text>

                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.don_vi}</Text>
                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 16}}>{cs_string.list_don_vi}</Text>

                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 18, fontWeight: 'bold'}}>{cs_string.contact}</Text>
                        <View style={{height: 10}}/>
                        <Text style={{fontSize: 16}}>
                            <Text style={{fontWeight: 'bold'}}>
                            {cs_string.adress}
                            </Text>
                            <Text >
                                {cs_string.adress_details}
                            </Text>
                        </Text>
                        <Text style={{fontSize: 16}}>
                            <Text style={{fontWeight: 'bold'}}>
                                {cs_string.phone}
                            </Text>
                            <Text >
                                {cs_string.phone_details}
                            </Text>
                        </Text>
                        <Text style={{fontSize: 16}}>
                            <Text style={{fontWeight: 'bold'}}>
                                {cs_string.email}
                            </Text>
                            <Text >
                                {cs_string.email_detail}
                            </Text>
                        </Text>
                        <View style={{height: 40}}/>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export default ProfileScreen;
