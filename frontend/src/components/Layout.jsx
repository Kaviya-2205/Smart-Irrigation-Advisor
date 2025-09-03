import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  Avatar,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Badge,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { FiHome, FiBarChart2, FiBell, FiSettings, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

// Map menu items to icons
const iconsMap = {
  Dashboard: FiHome,
  'Historical Data': FiBarChart2,
  Notifications: FiBell,
  Settings: FiSettings,
}

// NavItem Component
const NavItem = ({ children, to, isActive, onClose, ...rest }) => {
  const navigate = useNavigate()
  const Icon = iconsMap[children]

  const activeBg = useColorModeValue('green.500', 'green.300')
  const activeColor = useColorModeValue('white', 'gray.900')
  const hoverBg = useColorModeValue('green.100', 'green.700')

  const handleClick = () => {
    navigate(to)
    if (onClose) onClose()
  }

  return (
    <Flex
      align="center"
      px={4}
      py={3}
      mb={1}
      borderRadius="lg"
      cursor="pointer"
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? activeColor : 'inherit'}
      _hover={{ bg: isActive ? activeBg : hoverBg }}
      fontWeight={isActive ? 'bold' : 'medium'}
      transition="all 0.2s"
      onClick={handleClick}
      {...rest}
    >
      {Icon && <Icon size={20} style={{ marginRight: 12 }} />}
      {children}
      {children === 'Notifications' && (
        <Badge ml="auto" colorScheme="red" borderRadius="full">
          3
        </Badge>
      )}
    </Flex>
  )
}

// Sidebar Component
const SidebarContent = ({ onClose, ...rest }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Historical Data', path: '/historical-data' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Settings', path: '/settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 64 }}
      pos="fixed"
      h="full"
      boxShadow="lg"
      {...rest}
    >
      {/* Sidebar Header */}
      <Flex
        h="24"
        alignItems="center"
        mx="6"
        justifyContent="space-between"
        borderBottom="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Text fontSize="2xl" fontFamily="heading" fontWeight="bold" color="green.600">
          🌾 Farm Monitor
        </Text>
      </Flex>

      {/* Menu Items */}
      <VStack spacing={2} align="stretch" mt={6} mx={2}>
        {menuItems.map((item) => (
          <NavItem
            key={item.name}
            to={item.path}
            isActive={location.pathname === item.path}
            onClose={onClose}
          >
            {item.name}
          </NavItem>
        ))}
      </VStack>

      {/* Logout Button */}
      <Box
        pos="absolute"
        bottom="0"
        w="full"
        p={4}
        borderTop="1px"
        borderTopColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Button
          w="full"
          colorScheme="red"
          variant="solid"
          leftIcon={<FiLogOut />}
          _hover={{ bg: 'red.600' }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

// Header Component
const Header = ({ onOpen }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const bg = useColorModeValue('white', 'gray.900')

  const handleProfileClick = () => {
    navigate('/settings') // Change to '/profile' if you have a profile page
  }

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      p={4}
      bg={bg}
      boxShadow="md"
      borderRadius="md"
      mb={4}
      position="sticky"
      top="0"
      zIndex="1000"
    >
      {/* Hamburger menu for mobile */}
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<HamburgerIcon />}
      />

      {/* App title for mobile */}
      <Text fontSize="xl" fontWeight="bold" display={{ base: 'flex', md: 'none' }}>
        🌾 Farm Monitor
      </Text>

      <Spacer />

      {/* Profile section */}
      <HStack
        spacing={3}
        cursor="pointer"
        onClick={handleProfileClick} // navigate to settings/profile
      >
        <Avatar size="sm" name={user?.full_name} />
        <Text fontWeight="medium">{user?.full_name}</Text>
      </HStack>
    </Flex>
  )
}

// Layout Component
const Layout = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.800')}>
      {/* Desktop Sidebar */}
      <SidebarContent display={{ base: 'none', md: 'block' }} onClose={onClose} />

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Farm Monitor</DrawerHeader>
          <DrawerBody>
            <SidebarContent onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box ml={{ base: 0, md: 64 }} p={4}>
        <Header onOpen={onOpen} />
        <Box>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default Layout