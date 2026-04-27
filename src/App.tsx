import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { PlannerProvider } from '@/contexts/PlannerContext'
import { ThemeProvider } from '@/components/theme-provider'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlanPage } from '@/pages/PlanPage'
import { MyDayPage } from '@/pages/MyDayPage'
import { MyTasksPage } from '@/pages/MyTasksPage'
import { Spinner } from '@/components/ui/spinner'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="size-8" />
          <p className="text-sm text-muted-foreground">Loading AGB Tech Planner...</p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PlannerProvider>
              <AppLayout />
            </PlannerProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="my-day" element={<MyDayPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />
        <Route path="plan/:planId" element={<PlanPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="agb-planner-theme">
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </ThemeProvider>
  )
}

export default App
