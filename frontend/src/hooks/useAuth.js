import { useSelector } from 'react-redux'

export const useAuth = () => {
  const user = useSelector((state) => state.auth?.user)
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated)
  const isLoading = useSelector((state) => state.auth?.isLoading)
  
  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user'
  }
}
