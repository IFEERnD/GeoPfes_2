import React, { Component } from "react";
import cs_string from "../../untils/strings";
import colors from "../../untils/colors";
import { View, Image, FlatList, Alert, TextInput } from "react-native";
import {
  Header,
  Left,
  Body,
  Text,
  Button,
  Title,
  Card,
  CardItem,
} from "native-base";
import listVN2000Pro from "../../untils/Vn2000Projection.json";
import {
  getProjectByID,
  updateProjects,
} from "../../database/databaseServices";

class ConfigProjectionScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      select_item: "-",
      project: null,
      query: null,
      setQuery: null,
      fillList: [],
      modeSelectProjection: null,
    };
  }

  componentDidMount() {
    this._getProject();
    this.setState({ fillList: listVN2000Pro });
  }

  _getProject = async () => {
    let project = null;
    try {
      if (this.props.navigation.state.params.project_id) {
        project = await getProjectByID(
          this.props.navigation.state.params.project_id
        );
      }
    } catch (e) {}
    if (project != null) {
      this.setState({ project: project });
    }
  };

  _updateSelect = (item) => {
    if (this.state.project != null) {
      this.setState({ select_item: item.toString() }, function () {
        let project = this.state.project;
        if (project != null) {
          updateProjects(
            project.id,
            project.project_name,
            project.created_person,
            project.description,
            project.note,
            project.background_file,
            project.layout_file,
            item.epsg_code
          );
        }
      });
    }
    this.props.navigation.goBack();
    this.props.navigation.state.params.updateZone(item);
  };

  _renderItem(item) {
    return (
      <Card
        style={{
          marginLeft: 5,
          marginRight: 5,
          borderRadius: 8,
          borderwidth: 1,
        }}
      >
        <CardItem button onPress={() => this._updateSelect(item)}>
          <Body style={{ flex: 1, borderradius: 12 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
                color: "rgb(0, 51, 102)",
              }}
            >
              {item.zone}
            </Text>
            <Text style={{ fontSize: 13 }}>{"Khu vực: " + item.province}</Text>
            <Text style={{ fontSize: 13 }}>{"Mã EPSG: " + item.epsg_code}</Text>
          </Body>
        </CardItem>
      </Card>
    );
  }

  render() {
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
            <Button transparent onPress={() => this.props.navigation.goBack()}>
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
            <Title style={{ color: "white" }}>
              {cs_string.select_projection}
            </Title>
          </Body>
        </Header>

        <View style={{ flex: 1 }}>
          <TextInput
            style={{ padding: 15, fontSize: 14 }}
            onChangeText={(text) => {
              if (this.state.query !== null || this.state.query !== "") {
                var filteredData = listVN2000Pro.filter(
                  (item) =>
                    item.province.toLowerCase().includes(text.toLowerCase()) ||
                    item.epsg_code.toString().includes(text) ||
                    item.zone.toLowerCase().includes(text.toLowerCase())
                );
                this.setState({ query: text, fillList: filteredData });
              } else {
                this.setState({ query: text, fillList: listVN2000Pro });
              }
            }}
            value={this.state.query}
            placeholder="Tìm kiếm..."
          />
          <FlatList
            data={this.state.fillList}
            keyExtractor={({ id }, index) => index}
            renderItem={(data) => this._renderItem(data.item)}
            onEndReachedThreshold={0.4}
            maxToRenderPerBatch={10}
            initialNumToRender={5}
            removeClippedSubviews={true}
          />
        </View>
      </View>
    );
  }
}

export default ConfigProjectionScreen;
