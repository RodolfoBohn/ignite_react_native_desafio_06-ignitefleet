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
import Realm from "realm"
import { getLastAsyncTimestamp, saveLastSyncTimestamp } from "../../libs/asyncStorage/syncStorage";
import Toast from "react-native-toast-message";
import { TopMessage } from "../../components/TopMessage";
import { CloudArrowUp } from "phosphor-react-native";

export function Home() {
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([]);
  const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null)
  const [percetageToSync, setPercentageToSync] = useState<string | null>(null);
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

  async function fetchHistoric() {
    try {
      const lastSync = await getLastAsyncTimestamp();
      const response = historic.filtered("status='arrival' SORT(created_at DESC)");
      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id.toString(),
          licensePlate: item.license_plate,
          isSync: lastSync > item.updated_at.getTime(),
          created: dayjs(item.created_at).format('[Saída em] DD/MM/YYYY [às] HH:mm')

        })
      })
      setVehicleHistoric(formattedHistoric);
    } catch (error) {
      console.log(error);
      Alert.alert('Histórico', 'Não foi possível carregar o histórico.')
    }
  }

  async function progressNotification(transferred: number, transferable: number) {
    const percentage = (transferred/transferable) * 100;

    if(percentage === 100) {
      await saveLastSyncTimestamp()
      await fetchHistoric()
      Toast.show({
        type: "info", 
        text1: "Todos os dados estão sincronizados."
      })
      setPercentageToSync(null)
    } else {
      setPercentageToSync(`${percentage.toFixed(0)}% sincronizado.`)
    }
  }
  
  async function fetchRemoteData() {
    try {
      await realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm.objects('Historic').filtered(`user_id = '${user!.id}'`);
        mutableSubs.add(historicByUserQuery);
      })
    } catch(error) {
      console.log(error)
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

  useEffect(() => {
    fetchRemoteData()
  },[realm]);

  useEffect(() => {
    const syncSession = realm.syncSession;

    if(!syncSession) {
      return;
    }

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification
    )

    return () => {
      syncSession.removeProgressNotification(progressNotification);
    }
  },[]);

  return (
      <Container>
      {
        percetageToSync && <TopMessage title={percetageToSync} icon={CloudArrowUp} />
      }
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