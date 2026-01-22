import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export function useAuth() {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => api.get('/api/user').then(res => res.data),
    retry: false,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: any) => {
      await api.get('/sanctum/csrf-cookie'); // Get CSRF token first
      return api.post('/login', credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  return { user, isLoading, login };
}