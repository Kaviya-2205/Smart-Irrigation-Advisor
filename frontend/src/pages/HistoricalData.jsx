import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Text,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

const HistoricalData = () => {
  const [historicalData, setHistoricalData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('10')
  const { user } = useAuth()

  useEffect(() => {
    fetchHistoricalData()
  }, [timeRange])

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/historical-data/${user.id}`)
      const data = await response.json()
      // slice according to timeRange
      setHistoricalData(data.slice(-parseInt(timeRange)))
    } catch (error) {
      console.error('Error fetching historical data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  const averageMoisture = historicalData.reduce((sum, day) => sum + day.moisture, 0) / historicalData.length
  const averageTemp = historicalData.reduce((sum, day) => sum + day.temperature, 0) / historicalData.length
  const totalRainfall = historicalData.reduce((sum, day) => sum + day.rainfall, 0)

  return (
    <Box>
      <VStack spacing={4} align="start" mb={6}>
        <Heading as="h1" size="xl" color="green.600">
          Historical Data
        </Heading>
        <Text color="gray.600">Last {timeRange} days farm performance</Text>
        
        <HStack flexWrap="wrap" spacing={3}>
          <Text>Time Range:</Text>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} maxW="200px">
            <option value="7">Last 7 days</option>
            <option value="10">Last 10 days</option>
            <option value="30">Last 30 days</option>
          </Select>
        </HStack>
      </VStack>

      {/* Summary Statistics */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mb={8}>
        <Card shadow="md" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Avg. Moisture</StatLabel>
              <StatNumber>{averageMoisture.toFixed(1)}%</StatNumber>
              <StatHelpText>Last {timeRange} days</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="md" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Avg. Temperature</StatLabel>
              <StatNumber>{averageTemp.toFixed(1)}°C</StatNumber>
              <StatHelpText>Last {timeRange} days</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="md" borderWidth="1px">
          <CardBody>
            <Stat>
              <StatLabel>Total Rainfall</StatLabel>
              <StatNumber>{totalRainfall.toFixed(1)}mm</StatNumber>
              <StatHelpText>Last {timeRange} days</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Data Table */}
      <Card shadow="lg" borderWidth="1px">
        <CardHeader>
          <Heading size="md">Detailed Data</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Box overflowX="auto">
            <Table variant="striped" colorScheme="green" size="md" minW="600px">
              <Thead bg="green.50">
                <Tr>
                  <Th>Date</Th>
                  <Th isNumeric>Temperature (°C)</Th>
                  <Th isNumeric>Humidity (%)</Th>
                  <Th isNumeric>Rainfall (mm)</Th>
                  <Th isNumeric>Moisture (%)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {historicalData.map((day, index) => (
                  <Tr key={index}>
                    <Td>{day.date}</Td>
                    <Td isNumeric>{day.temperature.toFixed(1)}</Td>
                    <Td isNumeric>{day.humidity.toFixed(1)}</Td>
                    <Td isNumeric>{day.rainfall.toFixed(1)}</Td>
                    <Td isNumeric>{day.moisture.toFixed(1)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Graph Section */}
      <Card mt={6} shadow="lg" borderWidth="1px">
        <CardHeader>
          <Heading size="md">Trends Overview</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="moisture" stroke="#3182CE" name="Moisture (%)" />
              <Line type="monotone" dataKey="temperature" stroke="#E53E3E" name="Temp (°C)" />
              <Line type="monotone" dataKey="rainfall" stroke="#38A169" name="Rainfall (mm)" />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </Box>
  )
}

export default HistoricalData
