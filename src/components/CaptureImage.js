import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  Alert,
  ViewComponent,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import {transformLatLng} from '../untils/converProject';

const CaptureImage = ({height = 480, width = 480, handleCap}, ref) => {
  // nav
  // ref
  // state
  // use Effect
  // function
  // part Component
  // main container

  const [url, setUrl] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [projection, setProjection] = useState(null);
  const capRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      handleCapture,
    }),
    [],
  );

  const handleCapture = (url, detailData, epsg_code) => {
    setUrl(url);
    setDetailData(detailData);
    setProjection(epsg_code);
  };

  const renderContentOverride = () => {
    return (
      <View style={styles.wrapContentOverride}>
        <View style={styles.tilecContainer}>
          <Text style={styles.tileText}>GEOPFES</Text>
          <Image
            style={styles.icon}
            source={require('../images/ifee_rmbg.png')}
          />
        </View>

        <Text style={styles.title}>CRS: EPSG:{projection}</Text>
        <Text style={styles.title}>Vĩ độ: {detailData?.latitude}</Text>
        <Text style={styles.title}>Kinh độ: {detailData?.longitude}</Text>
        <Text style={styles.title}>Giờ: {new Date().toLocaleTimeString()}</Text>
        <Text style={styles.title}>
          Ngày: {new Date().toLocaleDateString()}
        </Text>
      </View>
    );
  };

  return (
    <View
      pointerEvents={'none'}
      style={[StyleSheet.absoluteFill, {opacity: 0, height, width}]}>
      <ViewShot options={{format: 'jpg', quality: 1}} ref={capRef}>
        {url && (
          <>
            <Image
              onLoadEnd={() => {
                capRef.current.capture().then(uri => {
                  setUrl(null);
                  handleCap && handleCap(uri);
                });
              }}
              source={{uri: url}}
              style={{height, width}}
            />
            {renderContentOverride()}
          </>
        )}
      </ViewShot>
    </View>
  );
};

export default React.forwardRef(CaptureImage);

const styles = StyleSheet.create({
  tileText: {fontSize: 14, fontWeight: 'bold', color: '#6bd68f'},
  tilecContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  wrapContentOverride: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  title: {
    color: 'white',
    fontSize: 12,
  },
  icon: {
    width: 23,
    height: 23,
    padding: 5,
  },
});
