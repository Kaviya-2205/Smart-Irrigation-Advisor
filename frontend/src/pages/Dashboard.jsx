// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Button,
  useToast,
  Progress,
  Flex,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  IconButton,
  Tooltip,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import {
  WiRain,
  WiDaySunny,
  WiCloudy,
  WiDayCloudy,
  WiHumidity,
  WiThermometer,
} from 'react-icons/wi'
import { MdHistory, MdNotifications, MdSettings, MdDownload } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const MotionCard = motion(Card)

const COLORS = {
  primary: '#2F855A', // green
  accent: '#2B6CB0', // blue
  danger: '#C53030', // red
  neutral: '#718096', // gray
  soilGood: '#48BB78',
  soilBad: '#F56565',
}

// Small helper to format numbers safely
const fnum = (v, digits = 1) => (typeof v === 'number' ? v.toFixed(digits) : '--')

// Pie chart colors
const PIE_COLORS = ['#48BB78', '#F6E05E', '#F56565', '#4299E1']

export default function Dashboard() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user, farm } = useAuth()
  const { postData } = useApi() // existing hook - used for sending alerts
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [historicalData, setHistoricalData] = useState([])
  const [chartRange, setChartRange] = useState(7) // days for chart (7/10/30)
  const bg = useColorModeValue('white', 'gray.800')

  // Fetch dashboard (current) + historical
  useEffect(() => {
    let mounted = true
    async function fetchAll() {
      setIsLoading(true)
      try {
        // DASHBOARD
        const dashResp = await fetch(`http://localhost:8000/api/dashboard/${user?.id}`)
        const dashJson = dashResp.ok ? await dashResp.json() : null

        // HISTORICAL
        const histResp = await fetch(`http://localhost:8000/api/historical-data/${user?.id}`)
        const histJson = histResp.ok ? await histResp.json() : []

        if (!mounted) return

        // Keep safe fallbacks
        setDashboardData(
          dashJson ?? {
            farm: farm ?? {},
            sensor_data: { moisture: 0, temperature: 0, humidity: 0, last_updated: new Date().toISOString() },
            weather: { temperature: 0, humidity: 0, wind_speed: 0, condition: 'sunny', rain_prediction: [] },
            recommendation: { needs_irrigation: false, message: 'No data', suggestion: '' },
          }
        )

        // Ensure historical data is array and sorted by date if date exists
        const histArr = Array.isArray(histJson) ? histJson.slice().reverse() : []
        setHistoricalData(histArr)
      } catch (err) {
        console.error('Dashboard fetch error', err)
        toast({
          title: 'Error fetching data',
          description: err.message || 'Network error',
          status: 'error',
          duration: 4000,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) fetchAll()

    return () => {
      mounted = false
    }
  }, [user?.id, farm, toast])

  // Derived values with safe guards
  const sensor = dashboardData?.sensor_data ?? {}
  const weather = dashboardData?.weather ?? {}
  const recommendation = dashboardData?.recommendation ?? { needs_irrigation: false, message: '', suggestion: '' }
  const farmInfo = dashboardData?.farm ?? farm ?? {}

  // Chart data trimmed to selected range
  const chartData = useMemo(() => {
    const arr = historicalData.length ? historicalData.slice(-chartRange) : []
    // If entries have date field, format it nicely
    return arr.map((d, i) => ({
      date: d.date || `Day ${i + 1}`,
      moisture: Number(d.moisture ?? 0),
      temperature: Number(d.temperature ?? 0),
      rainfall: Number(d.rainfall ?? 0),
    }))
  }, [historicalData, chartRange])

  const avgMoisture = useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((s, c) => s + c.moisture, 0) / chartData.length
  }, [chartData])

  const avgTemp = useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((s, c) => s + c.temperature, 0) / chartData.length
  }, [chartData])

  const totalRain = useMemo(() => {
    if (!chartData.length) return 0
    return chartData.reduce((s, c) => s + c.rainfall, 0)
  }, [chartData])

  // Quick action handlers
  const handleSendAlert = async () => {
    try {
      await postData(`/send-alert/${user.id}`, {}) // use existing shape (useApi prefixes base)
      toast({
        title: 'Alert Sent',
        description: 'Test SMS request sent to backend (terminal output).',
        status: 'success',
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: 'Failed to send alert',
        description: err.message || 'Network error',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (isLoading) return <LoadingSpinner />

  // Protective render guard (avoid blank)
  if (!dashboardData) {
    return (
      <Box p={6}>
        <Heading>Dashboard</Heading>
        <Text mt={2}>No data available</Text>
      </Box>
    )
  }

  return (
    <Box p={{ base: 4, md: 8 }}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap">
        <VStack align="start" spacing={1}>
          <Heading as="h1" size="xl" color="green.600">
            Farm Dashboard
          </Heading>
          <Text color="gray.500">Welcome back{user?.full_name ? `, ${user.full_name}` : ''} — overview of your farm</Text>
        </VStack>

        <HStack spacing={3} mt={{ base: 4, md: 0 }}>
          <Tooltip label="Historical Data">
            <IconButton
              aria-label="historical"
              icon={<MdHistory />}
              onClick={() => navigate('/historical-data')}
              variant="ghost"
            />
          </Tooltip>

          <Tooltip label="Notifications">
            <IconButton
              aria-label="notifications"
              icon={<MdNotifications />}
              onClick={() => navigate('/notifications')}
              variant="ghost"
            />
          </Tooltip>

          <Tooltip label="Settings">
            <IconButton aria-label="settings" icon={<MdSettings />} onClick={() => navigate('/settings')} variant="ghost" />
          </Tooltip>

          <Button colorScheme="green" onClick={handleSendAlert}>
            Send Test Alert
          </Button>
        </HStack>
      </Flex>

      {/* Recommendation Banner */}
      <Box mb={6}>
        <Alert
          status={recommendation?.needs_irrigation ? 'warning' : 'success'}
          borderRadius="md"
          boxShadow="sm"
        >
          <AlertIcon />
          <Box>
            <AlertTitle>{recommendation?.needs_irrigation ? 'Irrigation Recommended' : 'All Good'}</AlertTitle>
            <AlertDescription display="block">
              {recommendation?.message} {recommendation?.suggestion ? ` — ${recommendation.suggestion}` : ''}
            </AlertDescription>
          </Box>
        </Alert>
      </Box>

      {/* Top Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card bg={bg} boxShadow="md">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="gray.500">Soil Moisture</Text>
                <Text fontSize="2xl" fontWeight="bold" color={sensor.moisture < farmInfo.moisture_threshold ? 'red.500' : 'green.600'}>
                  {fnum(sensor.moisture, 1)}%
                </Text>
                <Text fontSize="xs" color="gray.400">Threshold: {farmInfo.moisture_threshold ?? '--'}%</Text>
              </VStack>
              <Box>
                <WiHumidity size="36" color={sensor.moisture < farmInfo.moisture_threshold ? COLORS.danger : COLORS.primary} />
              </Box>
            </HStack>

            <Box mt={4}>
              <Progress
                value={Math.min(Number(sensor.moisture) || 0, 100)}
                size="sm"
                colorScheme={sensor.moisture < farmInfo.moisture_threshold ? 'red' : 'green'}
                borderRadius="md"
              />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bg} boxShadow="md">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="gray.500">Temperature</Text>
                <Text fontSize="2xl" fontWeight="bold">{fnum(sensor.temperature, 1)}°C</Text>
                <Text fontSize="xs" color="gray.400">Ambient</Text>
              </VStack>
              <Box>
                <WiThermometer size="36" color={COLORS.accent} />
              </Box>
            </HStack>

            <Box mt={4}>
              <Progress value={(sensor.temperature ?? 0) % 100} size="sm" colorScheme="orange" borderRadius="md" />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bg} boxShadow="md">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="gray.500">Humidity</Text>
                <Text fontSize="2xl" fontWeight="bold">{fnum(sensor.humidity, 1)}%</Text>
                <Text fontSize="xs" color="gray.400">Relative</Text>
              </VStack>
              <Box>
                <WiDayCloudy size="36" color={COLORS.neutral} />
              </Box>
            </HStack>

            <Box mt={4}>
              <Progress value={Math.min(Number(sensor.humidity) || 0, 100)} size="sm" colorScheme="blue" borderRadius="md" />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bg} boxShadow="md">
          <CardBody>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" color="gray.500">Wind / Rain</Text>
                <Text fontSize="2xl" fontWeight="bold">{fnum(weather.wind_speed ?? 0, 0)} km/h</Text>
                <Text fontSize="xs" color="gray.400">Rain chance: {weather.rain_chance ?? '--'}%</Text>
              </VStack>
              <Box>
                <WiRain size="36" color={COLORS.accent} />
              </Box>
            </HStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts + Details */}
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
        {/* Left: Trend charts */}
        <GridItem>
          <Card boxShadow="md" bg={bg}>
            <CardHeader>
              <Heading size="md">Moisture Trend ({chartRange} days)</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <HStack>
                    <Button size="sm" variant={chartRange === 7 ? 'solid' : 'ghost'} onClick={() => setChartRange(7)}>7d</Button>
                    <Button size="sm" variant={chartRange === 10 ? 'solid' : 'ghost'} onClick={() => setChartRange(10)}>10d</Button>
                    <Button size="sm" variant={chartRange === 30 ? 'solid' : 'ghost'} onClick={() => setChartRange(30)}>30d</Button>
                  </HStack>

                  <HStack spacing={4}>
                    <Text fontSize="sm" color="gray.500">Avg M: {fnum(avgMoisture,1)}%</Text>
                    <Text fontSize="sm" color="gray.500">Avg T: {fnum(avgTemp,1)}°C</Text>
                    <Text fontSize="sm" color="gray.500">Rain: {fnum(totalRain,1)} mm</Text>
                  </HStack>
                </HStack>

                <Box h={{ base: '260px', md: '320px' }}>
                  {chartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" orientation="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <ReTooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="moisture" stroke={COLORS.primary} name="Moisture (%)" strokeWidth={2} dot={{ r: 3 }} />
                        <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#E53E3E" name="Temp (°C)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" py={12}>
                      <Text color="gray.500">No historical data to display</Text>
                    </Box>
                  )}
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card mt={4} boxShadow="md" bg={bg}>
            <CardHeader>
              <Heading size="md">Rainfall (Bar)</Heading>
            </CardHeader>
            <CardBody>
              <Box h="260px">
                {chartData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="rainfall" name="Rainfall (mm)" fill={COLORS.accent} />
                      <Bar dataKey="temperature" name="Temp (°C)" fill="#F6AD55" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box textAlign="center" py={12}>
                    <Text color="gray.500">No rainfall data</Text>
                  </Box>
                )}
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        {/* Right: Snapshot + Donut + Quick actions */}
        <GridItem>
          <VStack spacing={4} align="stretch">
            <Card boxShadow="md" bg={bg}>
              <CardHeader>
                <Heading size="md">Farm Snapshot</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Text><strong>Crop:</strong> {farmInfo?.crop_type ?? '--'}</Text>
                  <Text><strong>Size:</strong> {farmInfo?.farm_size ?? '--'}</Text>
                  <Text><strong>Irrigation:</strong> {farmInfo?.irrigation_method ?? '--'}</Text>
                  <Text><strong>Location:</strong> {farmInfo?.location ?? '--'}</Text>
                  <HStack spacing={3} pt={2}>
                    <Button size="sm" onClick={() => navigate('/historical-data')} leftIcon={<MdHistory> </MdHistory>} variant="outline">Historical</Button>
                    <Button size="sm" colorScheme="green" onClick={() => navigate('/notifications')} leftIcon={<MdNotifications />}>Notifications</Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            <Card boxShadow="md" bg={bg}>
              <CardHeader>
                <Heading size="md">Soil Health</Heading>
              </CardHeader>
              <CardBody>
                {chartData.length ? (
                  <Box w="100%" h="220px">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Good', value: chartData.filter(d => d.moisture >= (farmInfo.moisture_threshold ?? 40)).length },
                            { name: 'Below Threshold', value: chartData.filter(d => d.moisture < (farmInfo.moisture_threshold ?? 40)).length },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          <Cell fill={COLORS.soilGood} />
                          <Cell fill={COLORS.soilBad} />
                        </Pie>
                        <ReTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <HStack justify="center" spacing={6} mt={2}>
                      <HStack><Box w="12px" h="12px" bg={COLORS.soilGood} borderRadius="2px" /> <Text fontSize="sm">Good</Text></HStack>
                      <HStack><Box w="12px" h="12px" bg={COLORS.soilBad} borderRadius="2px" /> <Text fontSize="sm">Below</Text></HStack>
                    </HStack>
                  </Box>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">No chart data</Text>
                  </Box>
                )}
              </CardBody>
            </Card>

            <Card boxShadow="md" bg={bg}>
              <CardHeader>
                <Heading size="md">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Button colorScheme="green" onClick={() => navigate('/historical-data')}>View Historical Data</Button>
                  <Button variant="outline" onClick={() => navigate('/settings')}>Open Settings</Button>
                  <Button variant="ghost" leftIcon={<MdDownload />} onClick={() => toast({ title: 'Export', description: 'CSV export coming soon', status: 'info', duration: 2000 })}>Export CSV</Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* Footer */}
      <Box mt={6} textAlign="center" color="gray.500">
        <Text fontSize="sm">Smart Irrigation • {new Date().getFullYear()}</Text>
      </Box>
    </Box>
  )
}
