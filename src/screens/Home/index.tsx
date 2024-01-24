import { Container, Content, Label, Title } from "./styles";
import { HomeHeader } from "../../components/HomeHeader";
import { CarStatus } from "../../components/CarStatus";
import { useNavigation } from "@react-navigation/native";
import { Historic } from "../../libs/realm/schemas/historic";
import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import { useRealm, useQuery } from "../../libs/realm";
import { HistoricCard, HistoricCardProps } from "../../components/HistoricCard";
import dayjs from "dayjs";
import { useUser } from "@realm/react";

export function Home() {
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([]);
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null)
  const navigation = useNavigation()
  const historic = useQuery(Historic)
  const realm = useRealm()
  const user = useUser()

  function handleRegisterMovement() {
    if(vehicleInUse?._id) {
      navigation.navigate("arrival", {id: vehicleInUse._id.toString()})
    } else {
      navigation.navigate("departure")
    }
  }

  function handleSelectHistory(id: string) {
    navigation.navigate('arrival', {id})
  }

  function fetchVeicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUse(vehicle)
    } catch (error) {
      Alert.alert("Não foi possível carregar o veículo em uso.")
      console.log(error)
    }
  }

  function fetchHistoric() {
    try {
      const response = historic.filtered("status='arrival' SORT(created_at DESC)");
      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id.toString(),
          licensePlate: item.license_plate,
          isSync: false,
          created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')

        })
      })
      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.')
    }
  }

  useEffect(() => {
    fetchVeicleInUse()
  },[])

  useEffect(() => {
    realm.addListener("change", () => fetchVeicleInUse())
    
    return () => {
      if(realm && !realm.isClosed) {
        realm.removeListener("change", fetchVeicleInUse)}
      }
  }, [])

  useEffect(() => {
    fetchHistoric()
  }, [historic])

  function fetchRemoteData() {
    try {
      realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm.objects('Historic').filtered(`user_id = '${user!.id}'`);
        mutableSubs.add(historicByUserQuery);
      })
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchRemoteData()
  },[realm]);

  return (
      <Container>
        <HomeHeader />
        <Content>
          <CarStatus 
            onPress={handleRegisterMovement}
            licensePlate={vehicleInUse?.license_plate}
          />

        <Title>
          Histórico
        </Title>
          
        <FlatList 
          data={vehicleHistoric}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <HistoricCard 
              data={item} 
              onPress={() => handleSelectHistory(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum registro de utilização.
            </Label>
          )}
        />
        </Content>
      </Container>
    )
}