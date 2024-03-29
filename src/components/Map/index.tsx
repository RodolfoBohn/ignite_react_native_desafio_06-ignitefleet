import MapView, {LatLng, MapViewProps, PROVIDER_GOOGLE, Marker, Polyline} from "react-native-maps";
import { IconBox } from "../IconBox";
import { Car, FlagCheckered } from "phosphor-react-native";
import { useRef } from "react";
import { useTheme } from "styled-components";

type Props = MapViewProps & {
  coordinates: LatLng[]
}

export function Map({coordinates, ...rest}: Props) {
  const {COLORS} = useTheme()
  const mapRef = useRef<MapView>(null)

  async function onMapLoaded() {
    if(coordinates.length > 1) {
      console.log("eu")
      mapRef.current?.fitToSuppliedMarkers(["departure", "arrival"], {
        edgePadding: {bottom: 50, left: 50, right: 50, top: 50}
      })
    }
  }

  const lastCoordinate = coordinates[coordinates.length -1]
  return (
    <MapView 
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={{width: "100%", height: 200}}
      region={{
        latitude: lastCoordinate.latitude, 
        longitude: lastCoordinate.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005
      }}
      onMapLoaded={onMapLoaded}
      {...rest}
    >
      <Marker identifier="departure" coordinate={coordinates[0]}>
        <IconBox size="SMALL" icon={FlagCheckered} />
      </Marker>

      {
        coordinates.length > 1 && (
        <>
          <Marker identifier="arrival" coordinate={lastCoordinate}>
            <IconBox size="SMALL" icon={Car} />
          </Marker>

          <Polyline 
            coordinates={[...coordinates]}
            strokeColor={COLORS.GRAY_700}
            strokeWidth={7}
          />

        </>
        )
      }
    </MapView>
  )
}