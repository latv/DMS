import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export function useAuth() {
  const queryClient = useQueryClient()

  // Fetch current authenticated user
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const res = await api.get('/user')
        return res.data
      } catch (error: any) {
        // If 401, user is not authenticated - return null instead of throwing
        if (error?.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    enabled: !!localStorage.getItem('auth_token'), // Only fetch if token exists
  })

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string; remember?: boolean }) => {
      const response = await api.post('/login', credentials)
      const { access_token, user } = response.data
      
      // Store token in localStorage
      if (access_token) {
        localStorage.setItem('auth_token', access_token)
      }
      
      return { user, access_token }
    },
    onSuccess: (data) => {
      // Set user data immediately after login
      queryClient.setQueryData(['user'], data.user)
    },
  })

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      await api.post('/logout')
      // Remove token from localStorage
      localStorage.removeItem('auth_token')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.setQueryData(['user'], null)
    },
  })

  return {
    user,
    isLoading,
    isError,
    login,
    logout,
  }
}