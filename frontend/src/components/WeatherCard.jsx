import { Box, Text, HStack, VStack, Badge } from '@chakra-ui/react'
import { WiDaySunny, WiRain, WiCloudy, WiDayCloudy } from 'react-icons/wi'

const WeatherIcon = ({ condition }) => {
  const icons = {
    sunny: WiDaySunny,
    rainy: WiRain,
    cloudy: WiCloudy,
    partly_cloudy: WiDayCloudy
  }
  
  const IconComponent = icons[condition] || WiDaySunny
  return <IconComponent size="3em" />
}

const WeatherCard = ({ weather }) => {
  return (
    <Box p={4} bg="white" borderRadius="lg" boxShadow="md">
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Text fontSize="2xl" fontWeight="bold">{weather.temperature}°C</Text>
          <Text color="gray.600">{weather.condition.replace('_', ' ')}</Text>
          <Text>Humidity: {weather.humidity}%</Text>
        </VStack>
        <WeatherIcon condition={weather.condition} />
      </HStack>
      
      <Box mt={4}>
        <Text fontWeight="bold" mb={2}>Rain Prediction</Text>
        <VStack spacing={1} align="start">
          {weather.rain_prediction.map((pred, index) => (
            <HStack key={index} justify="space-between" w="full">
              <Text>{pred.time}</Text>
              <Badge colorScheme={pred.chance > 50 ? 'red' : 'green'}>
                {pred.chance}%
              </Badge>
            </HStack>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}

export default WeatherCard