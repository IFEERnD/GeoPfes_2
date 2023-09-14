import React from "react";
import { Animated, Easing } from "react-native";
import {
  createDrawerNavigator,
  createAppContainer,
  createStackNavigator,
} from "react-navigation";
import HomeScreen from "./screens/Home/HomeScreen";
import ProfileScreen from "./screens/Profile/ProfileScreen";
import CustomDrawer from "./CustomDrawer";
import NewProjectScreen from "./screens/NewProject/NewProjectScreen";
import ConfigProjectionScreen from "./screens/ConfigProjection/ConfigProjectionScreen";
import ConfigMapScreen from "./screens/ConfigMap/ConfigMapScreen";
import MapProjectScreen from "./screens/MapProject/MapProjectScreen";
import ConfigBackgroundScreen from "./screens/ConfigBackground/ConfigBackgroundScreen";
import ConfigProjectMapScreen from "./screens/ConfigProjectMap/ConfigProjectMapScreen";
import PointDetailsScreen from "./screens/DetailsObject/PointDetailsScreen";
import BackGroundListScreen from "./screens/ManagerBackGroundFile/BackGroundListScreen";
import LayoutListScreen from "./screens/ManagerLayoutFile/LayoutListScreen";
import LayoutMbtiles from "./screens/ManagerLayoutFile/LayoutMbtiles";
import LineDetailsScreen from "./screens/DetailsObject/LineDetailsScreen";
import PolygonDetailsScreen from "./screens/DetailsObject/PolygonDetailsScreen";
import SelectWMSLayerScreen from "./screens/SelectWMSLayer/SelectWMSLayerScreen";
import ChoseOpenRegion from "./screens/ChoseOpenRegion/ChoseOpenRegion";
import AddMapManager from "./screens/AddMapManager/AddMapManager";
import TrackListScreen from "./screens/TrackManager/TrackListScreen";

const drawer = createDrawerNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: () => ({
        header: null,
        drawerLockMode: "unlocked",
      }),
    },
    Profile: {
      screen: ProfileScreen,
      navigationOptions: ({ navigation }) => ({
        drawerLockMode: "locked-closed",
      }),
    },
  },
  {
    initialRouteName: "Home",
    overlayColor: "rgba(0, 0, 0, 0.7)",
    contentComponent: (props) => <CustomDrawer {...props} />,
  }
);

const stackScreen = createStackNavigator(
  {
    HomeScreen: {
      screen: drawer,
      navigationOptions: () => ({
        header: null,
      }),
    },
    NewProjectScreen: NewProjectScreen,
    MapProjectScreen: MapProjectScreen,
    ConfigBackgroundScreen: ConfigBackgroundScreen,
    ConfigProjectMapScreen: ConfigProjectMapScreen,
    PointDetailsScreen: PointDetailsScreen,
    LineDetailsScreen: LineDetailsScreen,
    PolygonDetailsScreen: PolygonDetailsScreen,
    ConfigProjectionScreen: ConfigProjectionScreen,
    BackGroundList: BackGroundListScreen,
    LayoutList: LayoutListScreen,
    LayoutMbtiles: LayoutMbtiles,
    TrackListScreen: TrackListScreen,
    SelectWMSLayerScreen: SelectWMSLayerScreen,
    ChoseOpenRegion: ChoseOpenRegion,
    AddMapManager: AddMapManager,
  },
  {
    headerMode: "none",
    transitionConfig: () => ({
      transitionSpec: {
        duration: 200,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: (sceneProps) => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return { opacity, transform: [{ translateX: translateX }] };
      },
    }),
  }
);

const Navigation = createAppContainer(stackScreen);
export default Navigation;
