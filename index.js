import {AppRegistry} from 'react-native';
// import App from './src/realm/App';
import App from './src/App';
import {name as appName} from './app.json';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
ReactNativeForegroundService.register();
if (__DEV__) {
  import('./Reactotron').then(() => {
    console.log('Reactotron Configured');
  });
}
AppRegistry.registerComponent(appName, () => App);
