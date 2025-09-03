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
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { postData } = useApi()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await postData('/api/login', formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      login(result.user, result.farm)
      
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
      })
      
      navigate('/')
    } catch (error) {
      toast({
        title: 'Login failed',
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
            🌾 Farm Monitoring System
          </Heading>
          <Text color="gray.600">Sign in to your account</Text>
        </VStack>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    type="tel"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    placeholder="Enter your mobile number"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter your password"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </form>

            <Text mt={4} textAlign="center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'green.600', fontWeight: 'bold' }}>
                Register here
              </Link>
            </Text>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  )
}

export default Login