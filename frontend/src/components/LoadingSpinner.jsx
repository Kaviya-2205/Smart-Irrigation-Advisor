import { Spinner, Center } from '@chakra-ui/react'

const LoadingSpinner = () => {
  return (
    <Center py={10}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="green.500"
        size="xl"
      />
    </Center>
  )
}

export default LoadingSpinner