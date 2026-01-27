import { createFileRoute, redirect } from '@tanstack/react-router'
import FileStorage from '../components/FileStorage'

export const Route = createFileRoute('/')({
  beforeLoad: ({ location }) => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: FileStorage,
})