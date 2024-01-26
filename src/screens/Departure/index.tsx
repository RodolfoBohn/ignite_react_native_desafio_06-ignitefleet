import { useEffect, useRef, useState } from "react"
import { Button } from "../../components/Button"
import { Header } from "../../components/Header"
import { LicensePlateInput } from "../../components/LicensePlateInput"
import { TextAreaInput } from "../../components/TextAreaInput"
import { Container, Content, Message } from "./styles"
import { Alert, Platform, ScrollView, TextInput } from "react-native"
import { licensePlateValidate } from "../../utils/licensePlateValidate"

import { useRealm } from "../../libs/realm"
import { useUser } from "@realm/react"
import { useNavigation } from "@react-navigation/native"
import { Historic } from "../../libs/realm/schemas/historic"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import {
  useForegroundPermissions, 
  watchPositionAsync, 
  LocationAccuracy, 
  LocationSubscription,
  LocationObjectCoords, 
  requestBackgroundPermissionsAsync
} from 'expo-location'
import { getAddressLocation } from "../../utils/getAddressLocation"
import { Loading } from "../../components/Loading"
import { LocationInfo } from "../../components/LocationInfo"
import { Car } from "phosphor-react-native"
import { Map } from "../../components/Map"
import { startLocationTask } from "../../tasks/backgroundLocationTask"

const keyboardAvoidingViewBehavior = Platform.OS === 'android' ? 'height' : 'position'

export function Departure() {
  const [plate, setPlate] = useState("")
  const [description, setDesctiption] = useState("")
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentCoords, setCurrentCoords] = useState<LocationObjectCoords | null>(null)
  const descriptionRef = useRef<TextInput>(null)
  const plateRef = useRef<TextInput>(null)

  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions()

  const realm = useRealm()
  const user = useUser()
  const {goBack} = useNavigation()

  async function handleDepartureRegister() {
    try {
      setIsLoading(true)
      if(!licensePlateValidate(plate)) {
        plateRef.current?.focus()
        return Alert.alert("Placa inválida", "Informe a placa correta do veículo.")
      }
  
      if(description.trim().length === 0) {
        descriptionRef.current?.focus()
        return Alert.alert("Finalidade", "Por favor informe a finalidade da utilização do veículo.")
      }

      const backgroundPermissions = await requestBackgroundPermissionsAsync()
      if (!backgroundPermissions.granted) {
        return Alert.alert("Localização", "É necessário permitir o acesso a localização em segundo plano.")
      }

      await startLocationTask()

      realm.write(() => {
        realm.create('Historic', Historic.generate({
          user_id: user!.id,
          description, 
          license_plate: plate
        }))
      })
      Alert.alert("Saída", "Saída registrada com sucesso.")
      goBack()
    } catch(error) {
      console.log(error)
      return Alert.alert("Erro", "Ocorreu um erro ao registrar a saída. Por favor tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission()
  },[])

  useEffect(() => {
    if(!locationForegroundPermission?.granted){
      return
    }

    let subscription: LocationSubscription

    watchPositionAsync({
        accuracy: LocationAccuracy.High, 
        timeInterval: 1000
      }, 
      (location) => {
        setCurrentCoords(location.coords)
        getAddressLocation(location.coords)
          .then((address) => address && setCurrentLocation(address))
          .catch((error) => setIsLocationLoading(false))
          .finally(() => setIsLocationLoading(false))
    })
    .then((response) => subscription = response)

    return () => subscription?.remove()
  },[locationForegroundPermission])

  if(isLocationLoading) {
    return <Loading />
  }

  if(!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title="Saída" />
        <Message>
          Você precisa permitir que o aplicativo tenha acesso a 
          localização para acessar essa funcionalidade. Por favor, acesse as
          configurações do seu dispositivo para conceder a permissão ao aplicativo.
        </Message>
      </Container>
    )
  }

  return (
    <Container>
      <Header title="Saída" />

      {/* <KeyboardAvoidingView behavior={keyboardAvoidingViewBehavior} style={{flex: 1}}> */}
      <KeyboardAwareScrollView extraHeight={200}>
        <ScrollView>
          {currentCoords && <Map coordinates={[currentCoords]} />}
          
          <Content>
            {
              currentLocation &&
              <LocationInfo 
                icon={Car}
                label="Localização atual"
                description={currentLocation}
              />
            }
            <LicensePlateInput
              ref={plateRef}
              label="Placa do veículo"
              placeholder="BRA1234"
              onSubmitEditing={() => descriptionRef.current?.focus()}
              returnKeyType="next"
              value={plate}
              onChangeText={setPlate}
            />
            <TextAreaInput
              ref={descriptionRef}
              label="Finalidade"
              placeholder="Vou utilizar o veículo para..."
              onSubmitEditing={handleDepartureRegister}
              returnKeyType="done"
              blurOnSubmit
              value={description}
              onChangeText={setDesctiption}
            />

            <Button 
              title="Registrar saída"
              onPress={handleDepartureRegister}
              isLoading={isLoading}
            />
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
      {/* </KeyboardAvoidingView> */}
    </Container>
  )
}