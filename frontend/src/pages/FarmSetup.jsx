import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Card,
  CardBody,
  useToast,
  Text,
  VStack,
  Select
} from '@chakra-ui/react'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const FarmSetup = () => {
  const [formData, setFormData] = useState({
    farm_size: '',
    crop_type: '',
    irrigation_method: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const routerLocation = useLocation()   // 🔥 renamed to avoid conflict
  const toast = useToast()
  const { postData } = useApi()

  const { user_id } = routerLocation.state || {}

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user_id) {
      toast({
        title: 'Error',
        description: 'User information missing',
        status: 'error',
        duration: 3000,
      })
      navigate('/register')
      return
    }

    setIsLoading(true)

    try {
      const result = await postData('/api/farm-setup', {
        user_id: parseInt(user_id),
        ...formData
      })
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Farm setup complete',
        description: 'Your farm has been registered successfully',
        status: 'success',
        duration: 3000,
      })
      
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Setup failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user_id) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Text>Invalid access. Please register first.</Text>
      </Flex>
    )
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box maxW="md" w="full" p={6}>
        <VStack spacing={4} mb={6} textAlign="center">
          <Heading as="h1" size="xl" color="green.600">
            Farm Setup
          </Heading>
          <Text color="gray.600">Complete your farm information</Text>
        </VStack>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Farm Size (acres)</FormLabel>
                  <Input
                    type="number"
                    value={formData.farm_size}
                    onChange={(e) => setFormData({...formData, farm_size: e.target.value})}
                    placeholder="Enter farm size in acres"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Crop Type</FormLabel>
                  <Select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({...formData, crop_type: e.target.value})}
                    placeholder="Select crop type"
                  >
                    <option value="sugarcane">Sugarcane</option>
                    <option value="paddy">Paddy</option>
                    <option value="wheat">Wheat</option>
                    <option value="corn">Corn</option>
                    <option value="cotton">Cotton</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Irrigation Method</FormLabel>
                  <Select
                    value={formData.irrigation_method}
                    onChange={(e) => setFormData({...formData, irrigation_method: e.target.value})}
                    placeholder="Select irrigation method"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Sprinkler System</option>
                    <option value="flood">Flood Irrigation</option>
                    <option value="manual">Manual Watering</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Farm Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter farm location"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Setting up..."
                >
                  Complete Setup
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  )
}

export default FarmSetup
