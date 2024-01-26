import { useNavigation, useRoute } from "@react-navigation/native";
import { Container, Content, Description, Footer, Label, LicensePlate } from './styles';

import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ButtonIcon } from "../../components/ButtonIcon";
import { X } from "phosphor-react-native";
import { useObject, useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/historic";
import { BSON } from "realm";
import { Alert } from "react-native";
import { stopLocationTask } from "../../tasks/backgroundLocationTask";

interface RouteParamsProps {
  id: string
}

export function Arrival() {
  const route = useRoute()
  const {goBack} = useNavigation()
  const {id} = route.params as RouteParamsProps
  const historic = useObject(Historic, new BSON.UUID(id) as unknown as string)
  const realm = useRealm()

  const title = historic?.status === "departure" ? "Chegada" : "Detalhes"

  function handleRemoveVehicle() {
    Alert.alert(
      "Cancelar", 
      "Cancelar a utilização do veículo?",
      [{
        text: "Não", style: "cancel"
      },
      {
        text: "Sim", onPress: () => removeVehicle()
      }
      ]
    )
  }

  function removeVehicle() {
    realm.write(() => {
      realm.delete(historic)
    })
    goBack()
  }

  async function handleArrivalVehicle() {
    try {
      if(!historic) {
        return Alert.alert("Chegada", "Não foi possível buscar os dados para registrar a chegada do veículo.")
      }
      await stopLocationTask()

      realm.write(() => {
        historic.status = 'arrival' 
        historic.updated_at = new Date()
      })
    
      Alert.alert("Chegada", "Chegada registrada com sucesso")
      goBack()
    } catch (error) {
      console.log(error)
      Alert.alert("Chegada", "Não foi possível registrar a chegada do veículo.")
    }
  }

  return (
    <Container>
      <Header title={title} />
      <Content>
        <Label>
          Placa do veículo
        </Label>

        <LicensePlate>
          {historic?.license_plate}
        </LicensePlate>

        <Label>
          Finalidade
        </Label>

        <Description>
          {historic?.description}
        </Description>
      </Content>
      { 
       historic?.status === "departure" && 
        (
          <Footer>
            <ButtonIcon 
              icon={X}
              onPress={handleRemoveVehicle}
            />
            <Button 
              title='Registrar chegada'
              onPress={handleArrivalVehicle}
            />
          </Footer>
        )
      }
    </Container>
  )
}