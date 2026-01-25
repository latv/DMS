import { createFileRoute, useRouter, useSearch, redirect } from '@tanstack/react-router'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: (search.redirect as string) || undefined,
    }
  },
  beforeLoad: ({ location }) => {
    // If already authenticated, redirect to home or the redirect URL
    const token = localStorage.getItem('auth_token');
    if (token) {
      const redirectTo = new URLSearchParams(location.search).get('redirect') || '/';
      throw redirect({
        to: redirectTo as any,
      });
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const { redirect: redirectTo } = useSearch({ from: '/login' })
  const [error, setError] = useState<string | null>(null)

  const [form] = Form.useForm()

  const handleFinish = async (values: { email: string; password: string }) => {
    setError(null)
    try {
      await login.mutateAsync(values)
      // Redirect to the original page or home
      router.navigate({ to: redirectTo || '/' })
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        'Login failed. Please check your email and password.'
      setError(message)
    }
  }

  const isLoading = login.isPending

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md shadow-2xl">
        <Typography.Title level={2} className="!mb-6 !text-center">
          Sign in
        </Typography.Title>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            className="mb-4"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          disabled={isLoading}
          initialValues={{ email: '', password: '' }}
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input placeholder="you@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password placeholder="********" autoComplete="current-password" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

