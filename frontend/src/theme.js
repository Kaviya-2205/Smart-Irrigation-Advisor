// src/theme.js
import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  colors: {
    brand: {
      50: '#e9f8ee',
      100: '#c8edd6',
      200: '#a4e2bb',
      300: '#7fd69f',
      400: '#5acb84',
      500: '#40b16a',  // primary green
      600: '#2f8a52',
      700: '#21633b',
      800: '#123c24',
      900: '#05160e',
    },
  },
})
export default theme
