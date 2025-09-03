import { useState } from 'react'
import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  VStack,
  Text,
  HStack,
  Button,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Divider,
  Grid
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Settings = () => {
  const [notifications, setNotifications] = useState({
    sms: true,
    email: false,
    push: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const { user, farm, logout } = useAuth()
  const toast = useToast()

  // ✅ State for editing profile
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    full_name: user.full_name,
    mobile: user.mobile,
    location: user.location
  })

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error saving settings',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Save profile after editing
  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditing(false)
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: 'Logged out successfully',
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <Box>
      <VStack spacing={4} align="start" mb={6}>
        <Heading as="h1" size="xl" color="green.600">
          Settings
        </Heading>
        <Text color="gray.600">Manage your account and preferences</Text>
      </VStack>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Profile Information</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={profile.full_name}
                  isReadOnly={!isEditing}
                  onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Mobile Number</FormLabel>
                <Input
                  value={profile.mobile}
                  isReadOnly={!isEditing}
                  onChange={e => setProfile({ ...profile, mobile: e.target.value })}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input
                  value={profile.location}
                  isReadOnly={!isEditing}
                  onChange={e => setProfile({ ...profile, location: e.target.value })}
                />
              </FormControl>

              {isEditing ? (
                <Button
                  colorScheme="green"
                  isLoading={isLoading}
                  onClick={handleSaveProfile}
                >
                  Save Profile
                </Button>
              ) : (
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Farm Information */}
        <Card>
          <CardHeader>
            <Heading size="md">Farm Details</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="start">
              <FormControl>
                <FormLabel>Crop Type</FormLabel>
                <Input value={farm.crop_type} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Farm Size</FormLabel>
                <Input value={`${farm.farm_size} acres`} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Irrigation Method</FormLabel>
                <Input value={farm.irrigation_method} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Moisture Threshold</FormLabel>
                <Input value={`${farm.moisture_threshold}%`} isReadOnly />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* The rest (notifications, account actions, system info) stays same */}
    </Box>
  )
}

export default Settings
