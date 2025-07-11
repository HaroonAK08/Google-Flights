import React, { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './store/store';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigators/AuthNavigator';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/reactQueryConfig';
import { checkAuthOnStartup } from './store/authSlice';


const StartupAuthLoader = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(checkAuthOnStartup());
  }, [dispatch]);
  return <>{children}</>;
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <StartupAuthLoader>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </StartupAuthLoader>
    </QueryClientProvider>
  </Provider>
);

export default App;
