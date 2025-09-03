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
  HStack
} from '@chakra-ui/react'
import useApi from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { postData } = useApi()

  const { user_id, mobile } = location.state || {}

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
      const result = await postData('/api/verify-otp', {
        user_id: parseInt(user_id),
        otp
      })
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: 'Mobile verified',
        description: 'Your mobile number has been verified',
        status: 'success',
        duration: 3000,
      })
      
      navigate('/farm-setup', { state: { user_id: parseInt(user_id) } })
    } catch (error) {
      toast({
        title: 'Verification failed',
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
            Verify Mobile
          </Heading>
          <Text color="gray.600">
            Enter the OTP sent to {mobile}
          </Text>
        </VStack>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>OTP Code</FormLabel>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="green"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Verifying..."
                >
                  Verify OTP
                </Button>
              </VStack>
            </form>

            <HStack mt={4} justify="center">
              <Text>Didn't receive OTP?</Text>
              <Button variant="link" colorScheme="green">
                Resend OTP
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  )
}

export default VerifyOTP