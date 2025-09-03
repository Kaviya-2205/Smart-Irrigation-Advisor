import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Text,
  Badge,
  HStack,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { Bell, Filter, RefreshCw, CheckCircle, Droplet, CloudRain, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { user } = useAuth()
  const toast = useToast()
  const { postData } = useApi()

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/notifications/${user.id}`)
      const data = await response.json()
      setNotifications(data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendAlert = async () => {
    try {
      await postData(`/api/send-alert/${user.id}`, {})
      toast({
        title: 'Alert Sent',
        description: 'SMS notification sent to your mobile',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error sending alert',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    toast({
      title: "Marked as read",
      description: "All notifications are marked as read",
      status: "info",
      duration: 2000,
    })
  }

  if (isLoading) return <LoadingSpinner />

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = filter === "all"
    ? notifications
    : notifications.filter(n => n.type === filter)

  // Helper for icons
  const getIconForType = (type) => {
    if (type === "rain_alert") return <Icon as={CloudRain} color="blue.400" boxSize={5} />
    if (type === "moisture_alert") return <Icon as={Droplet} color="teal.400" boxSize={5} />
    if (type === "emergency") return <Icon as={AlertTriangle} color="red.500" boxSize={5} />
    return <Icon as={Bell} color="gray.400" boxSize={5} />
  }

  return (
    <Box w="full" px={{ base: 3, md: 6 }} py={4}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Heading as="h1" size="xl" color="green.600">
            Notifications
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
        </VStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<CheckCircle />}
            colorScheme="green"
            variant="outline"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
          <Menu>
            <MenuButton as={Button} leftIcon={<Filter />} variant="outline" colorScheme="blue">
              Filter
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setFilter("all")}>All</MenuItem>
              <MenuItem onClick={() => setFilter("rain_alert")}>Rain Alerts</MenuItem>
              <MenuItem onClick={() => setFilter("moisture_alert")}>Moisture Alerts</MenuItem>
              <MenuItem onClick={() => setFilter("emergency")}>Emergency</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Quick Actions */}
      <Card mb={6} w="full" shadow="md" _hover={{ shadow: "lg" }}>
        <CardHeader borderBottomWidth="1px">
          <Heading size="md">Quick Actions</Heading>
        </CardHeader>
        <CardBody>
          <HStack justify="space-between" flexWrap="wrap" gap={4}>
            <VStack align="start">
              <Text fontSize="sm" color="gray.600">
                Send a test alert to your registered mobile number
              </Text>
              <Button
                colorScheme="blue"
                onClick={handleSendAlert}
                leftIcon={<RefreshCw />}
                w={{ base: "full", sm: "auto" }}
              >
                Send Test SMS Alert
              </Button>
            </VStack>
            <Tooltip label="Alerts help you stay updated about rainfall, moisture & emergencies" fontSize="sm">
              <Icon as={Bell} color="blue.400" boxSize={6} />
            </Tooltip>
          </HStack>
        </CardBody>
      </Card>

      {/* Recent Notifications */}
      <Card w="full" shadow="md" _hover={{ shadow: "lg" }}>
        <CardHeader borderBottomWidth="1px">
          <Heading size="md">Recent Notifications</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={5} align="stretch" w="full">
            {filteredNotifications.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No notifications found
              </Text>
            ) : (
              filteredNotifications.map((notification, idx) => (
                <Box key={notification.id}>
                  <Flex
                    align="flex-start"
                    gap={3}
                    p={4}
                    borderRadius="md"
                    shadow="sm"
                    bg={notification.read ? "gray.50" : "white"}
                    _hover={{ shadow: "md", bg: "gray.100" }}
                    transition="all 0.2s"
                  >
                    {getIconForType(notification.type)}
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack justify="space-between" w="full">
                        <Badge
                          colorScheme={
                            notification.type === 'rain_alert'
                              ? 'blue'
                              : notification.type === 'moisture_alert'
                              ? 'teal'
                              : notification.type === 'emergency'
                              ? 'red'
                              : 'gray'
                          }
                          px={2}
                          py={1}
                          borderRadius="md"
                        >
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        {!notification.read && (
                          <Badge colorScheme="green" variant="solid" borderRadius="md">
                            New
                          </Badge>
                        )}
                      </HStack>
                      <Text fontWeight="medium">
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </Text>
                    </VStack>
                  </Flex>
                  {idx < filteredNotifications.length - 1 && <Divider my={2} />}
                </Box>
              ))
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Sample Alerts */}
      <Box mt={8} w="full">
        <Heading size="md" mb={4}>Sample Alert Types</Heading>
        <VStack spacing={4} w="full">
          <Alert status="info" borderRadius="md" shadow="sm">
            <AlertIcon />
            <Box>
              <AlertTitle>Rain Alert</AlertTitle>
              <AlertDescription>
                🌧 Rain expected tomorrow at your farm location
              </AlertDescription>
            </Box>
          </Alert>

          <Alert status="warning" borderRadius="md" shadow="sm">
            <AlertIcon />
            <Box>
              <AlertTitle>Moisture Alert</AlertTitle>
              <AlertDescription>
                💧 Soil moisture critically low in your field
              </AlertDescription>
            </Box>
          </Alert>

          <Alert status="error" borderRadius="md" shadow="sm">
            <AlertIcon />
            <Box>
              <AlertTitle>Emergency Alert</AlertTitle>
              <AlertDescription>
                ⚠️ Immediate action required: Irrigation system failure
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Box>
    </Box>
  )
}

export default Notifications
