import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import axios from 'axios'

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
  })

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: { email: string; password: string; remember?: boolean }) => {
      // Get CSRF cookie first (required by Sanctum)
      // CSRF endpoint is on web.php, so use full URL or different base
      const baseURL = import.meta.env.VITE_API_URL.replace('/api', '')
      try {
        await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
          withCredentials: true,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
      } catch (error) {
        // CSRF cookie fetch failed - might be CORS or server issue
        console.warn('Failed to fetch CSRF cookie:', error)
        // Continue anyway - some setups don't require CSRF for API routes
      }
      const response = await api.post('/login', credentials)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      await api.post('/logout')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
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