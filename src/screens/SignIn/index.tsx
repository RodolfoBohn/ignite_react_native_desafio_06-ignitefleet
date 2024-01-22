
import { GoogleSignin } from '@react-native-google-signin/google-signin'

import { Container, Title, Slogan } from './styles';
import backgroundImg from '../../assets/background.png'
import { Button } from '../../components/Button';
import { Alert } from 'react-native';
import { useState } from 'react';
import {Realm, useApp} from '@realm/react'

GoogleSignin.configure({
  scopes: ["email", "profile"],
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
})

export function SignIn() {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const app = useApp()

  async function handleSignIn() {
    try {
      setIsAuthenticating(true)
      const response = await GoogleSignin.signIn()

      if(response.idToken) {
        const credentials = Realm.Credentials.jwt(response.idToken)

        await app.logIn(credentials)
      } else {
        return Alert.alert("Entrar", "Não foi possível entrar na sua conta Google.")
      }
    } catch(error) {
      return Alert.alert("Entrar", "Não foi possível entrar na sua conta Google.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  return (
    <Container source={backgroundImg}>
      <Title>Ignite Fleet</Title>

      <Slogan>
        Gestão de uso de veículos
      </Slogan>

      <Button 
        title='Entrar com Google'
        isLoading={isAuthenticating}
        onPress={handleSignIn}
       />
    </Container>
  );
}

