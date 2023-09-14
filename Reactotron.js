import Reactotron from 'reactotron-react-native';
import ReactotronFlipper from 'reactotron-react-native/dist/flipper';
import {NativeModules} from 'react-native';
let scriptHostname = 'localhost';

if (__DEV__) {
  const {scriptURL} = NativeModules.SourceCode;
  scriptHostname = scriptURL.split('://')[1].split(':')[0];
}

Reactotron.clear();
const reactotron = __DEV__
  ? Reactotron.configure({
        name: 'WalletMessengerMobile',
        host: scriptHostname,
        createSocket: path => new ReactotronFlipper(path),
      })
      .useReactNative({})
      .connect()
  : {};

console.tron = __DEV__ ? Reactotron : {log: () => {}};
export default reactotron;
