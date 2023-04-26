/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notify from './src/services/notify';

notify.background();
AppRegistry.registerComponent(appName, () => App);
