import { Key, Car } from 'phosphor-react-native';
import { Container, IconBox, Message, TextHighlight } from './styles';
import { useTheme } from 'styled-components';
import { TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  licensePlate?: string | null;
}

export function CarStatus({ licensePlate, ...rest }: Props) {
  const Icon = licensePlate ?  Car : Key
  const message = licensePlate ? `Veículo ${licensePlate} em uso. ` : 'Nenhum veículo em uso. '
  const status = licensePlate ? 'chegada' : 'saída';

  const theme = useTheme()

  return (
    <Container {...rest}>
      <IconBox>
        <Icon size={52} color={theme.COLORS.BRAND_LIGHT} />
      </IconBox>

      <Message>
        {message}

        <TextHighlight>
          Clique aqui para registrar a {status}.
        </TextHighlight>
      </Message>
    </Container>
  );
}