import React, { useState, useEffect } from "react";
import colors from "../../untils/colors";
import { View, Image, FlatList, TouchableOpacity } from "react-native";
import {
  Header,
  Left,
  Body,
  Text,
  Button,
  Title,
  Card,
  CardItem,
  Right,
} from "native-base";
import { getListTrack, deleteTrack } from "../../database/databaseServices";
import { dirHome } from "../../database/projectJson";

const RNFS = require("react-native-fs");

const TrackListScreen = ({ navigation }) => {
  const [project_id, setProject_id] = useState(
    navigation.state.params.project_id
      ? navigation.state.params.project_id
      : null
  );
  const [listTrack, setListTrack] = useState([]);

  useEffect(() => {
    console.log("track");
    _getListTrack();
  }, []); // Only re-run the effect if data changes

  const _getListTrack = async () => {
    let list = await getListTrack(project_id);
    console.log("listget", list);
    setListTrack(list);
  };

  const _handleDeleteTrack = async (name, fileName) => {
    await deleteTrack(name, project_id);
    const directoryPath = dirHome + "/" + project_id + "/TrackFile/" + fileName;
    console.log(directoryPath);
    RNFS.unlink(directoryPath);
    _getListTrack();
  };

  const _BackMap = () => {
    navigation.goBack();
  };

  const RenderItem = ({ item, index }) => {
    return (
      <Card
        style={{
          marginLeft: 5,
          marginRight: 5,
          borderRadius: 8,
          borderwidth: 1,
        }}
      >
        <CardItem
          button
          onPress={() => {
            console.log("presss");
          }}
        >
          <Left style={{ flex: 1, marginRight: 6 }}>
            <Image
              source={require("../../images/Track.png")}
              style={{ width: 40, height: 40 }}
            />
          </Left>
          <Body style={{ flex: 6, borderradius: 3 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "rgb(0, 51, 102)",
              }}
            >
              {item.name}
            </Text>
            <Text style={{ fontSize: 15 }}>{"Bắt đầu: " + item.startTime}</Text>
            <Text style={{ fontSize: 15 }}>{"Kết thúc: " + item.stopTime}</Text>
            <Text style={{ fontSize: 15 }}>
              {"Chiều dài quãng đường: " + item.length}
            </Text>
          </Body>
          <Right style={{ flex: 1, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => {
                _handleDeleteTrack(item.name, item.fileName);
              }}
            >
              <Image
                source={require("../../images/delete.png")}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          </Right>
        </CardItem>
      </Card>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Header
        style={{
          backgroundColor: colors.head_bg,
          barStyle: "light-content",
          height: 80,
          paddingTop: 30,
        }}
        androidStatusBarColor={colors.head_bg}
      >
        <Left style={{ flex: 0.1 }}>
          <Button transparent onPress={() => _BackMap()}>
            <Image
              style={{ width: 30, height: 30 }}
              source={require("../../images/arrow_back_white.png")}
            ></Image>
          </Button>
        </Left>
        <Body
          style={{
            flex: 0.9,
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <Title style={{ color: "white" }}>Danh sách tuyến</Title>
        </Body>
      </Header>

      <View style={{ flex: 1 }}>
        <FlatList
          data={listTrack}
          renderItem={({ item, index }) => (
            <RenderItem item={item} index={index} />
          )}
          keyExtractor={(_, index) => index}
        />
      </View>
    </View>
  );
};

export default TrackListScreen;
