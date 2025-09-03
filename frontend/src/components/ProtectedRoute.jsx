// src/components/ProtectedRoute.jsx
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Spinner, Center, Box, Text } from "@chakra-ui/react";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - currentUser:', currentUser, 'loading:', loading, 'location:', location.pathname);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
        <Text ml={4}>Loading...</Text>
      </Center>
    );
  }

  if (!currentUser) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;