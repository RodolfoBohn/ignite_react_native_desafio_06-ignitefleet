import 'react-native-get-random-values';
import './src/libs/dayjs';

import { SignIn } from './src/screens/SignIn';
import {ThemeProvider} from 'styled-components'
import theme from './src/theme';
import {useFonts, Roboto_400Regular, Roboto_700Bold} from '@expo-google-fonts/roboto'
import { Loading } from './src/components/Loading';
import { StatusBar} from 'react-native';
import {AppProvider, UserProvider} from '@realm/react'
import { Routes } from './src/routes';
import {SafeAreaProvider} from 'react-native-safe-area-context'
import { RealmProvider, syncConfig } from './src/libs/realm';
import { Historic } from './src/libs/realm/schemas/historic';

export default function App() {
  const [fontsLoaded] = useFonts({Roboto_400Regular, Roboto_700Bold})
  if(!fontsLoaded) {
    return (
      <Loading />
    )
  }

  return (
    <SafeAreaProvider style={{backgroundColor: theme.COLORS.GRAY_800}}>
      <AppProvider id={process.env.EXPO_PUBLIC_REALM_APP_ID!}>
        <ThemeProvider theme={theme}>
          <StatusBar 
            barStyle="light-content" 
            backgroundColor="transparent" 
            translucent 
          />
          <UserProvider fallback={SignIn} >
            <RealmProvider sync={syncConfig} fallback={Loading}>
              <Routes />
            </RealmProvider>
          </UserProvider>
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
    );
}
