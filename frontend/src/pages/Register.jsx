import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  VStack
} from '@chakra-ui/react'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    password: '',
    confirm_password: '',
    location: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { postData } = useApi()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirm_password) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      })
      return
    }

    setIsLoading(true)

    try {
      const { confirm_password, ...submitData } = formData
      const result = await postData('/api/register', submitData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      navigate('/verify-otp', { state: { user_id: result.user_id, mobile: formData.mobile } })
      
      toast({
        title: 'OTP sent',
        description: 'Please verify your mobile number',
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        status: 'error',
        duration: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box maxW="md" w="full" p={6}>
        <VStack spacing={4} mb={6} textAlign="center">
          <Heading as="h1" size="xl" color="green.600">
            Create Account
          </Heading>
          <Text color="gray.600">Register for farm monitoring</Text>
        </VStack>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({...formData, mobile: e.target.value})}
                    placeholder="Enter your mobile number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Create a password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                    placeholder="Confirm your password"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter your farm location"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Registering..."
                >
                  Register
                </Button>
              </VStack>
            </form>

            <Text mt={4} textAlign="center">
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'green.600', fontWeight: 'bold' }}>
                Sign in here
              </Link>
            </Text>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  )
}

export default Register