import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [farm, setFarm] = useState(null)

  const login = (userData, farmData) => {
    setUser(userData)
    setFarm(farmData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('farm', JSON.stringify(farmData))
  }

  const logout = () => {
    setUser(null)
    setFarm(null)
    localStorage.removeItem('user')
    localStorage.removeItem('farm')
  }

  const value = {
    user,
    farm,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}