import { Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, LogIn, LogOut, Menu, User, X } from 'lucide-react'
import { Button } from 'antd'
import { useAuth } from '../hooks/useAuth'
import Logo from '../assets/logo.svg';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout.mutateAsync()
      // Redirect to login after logout
      router.navigate({ to: '/login' })
    } catch {
      // ignore logout errors, but still redirect
      router.navigate({ to: '/login' })
    } finally {
      setIsOpen(false)
    }
  }

  return (
    <>
      <header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
        <div className="flex items-center">
          <h1 className="ml-4 text-xl font-semibold">
            <Link to="/">
            <img
                src={Logo}
                alt="Logo"
                className="inline-block h-12 w-12 mr-3 brightness-0 invert"
              />
            </Link>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <User size={18} />
                <span className="max-w-[160px] truncate">{(user.name ?? "") + " " + (user.surname ?? "")}</span>
              </div>
              <Button
                size="small"
                type="default"
                icon={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              size="small"
              type="primary"
              icon={<LogIn size={16} />}
            >
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </header>

    </>
  )
}
