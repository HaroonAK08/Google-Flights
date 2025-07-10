import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigators/AuthNavigator';

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </Provider>
);

export default App;
