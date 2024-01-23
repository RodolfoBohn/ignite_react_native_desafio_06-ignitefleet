import { useRef, useState } from "react"
import { Button } from "../../components/Button"
import { Header } from "../../components/Header"
import { LicensePlateInput } from "../../components/LicensePlateInput"
import { TextAreaInput } from "../../components/TextAreaInput"
import { Container, Content } from "./styles"
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native"
import { licensePlateValidate } from "../../utils/licensePlateValidate"

import { useRealm } from "../../libs/realm"
import { useUser } from "@realm/react"
import { useNavigation } from "@react-navigation/native"
import { Historic } from "../../libs/realm/schemas/historic"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"

const keyboardAvoidingViewBehavior = Platform.OS === 'android' ? 'height' : 'position'

export function Departure() {
  const [plate, setPlate] = useState("")
  const [description, setDesctiption] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const descriptionRef = useRef<TextInput>(null)
  const plateRef = useRef<TextInput>(null)

  const realm = useRealm()
  const user = useUser()
  const {goBack} = useNavigation()

  function handleDepartureRegister() {
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

  return (
    <Container>
      <Header title="Saída" />

      {/* <KeyboardAvoidingView behavior={keyboardAvoidingViewBehavior} style={{flex: 1}}> */}
      <KeyboardAwareScrollView extraHeight={200}>
        <ScrollView>
          <Content>
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