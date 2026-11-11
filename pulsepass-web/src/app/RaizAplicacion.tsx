import { AuthProvider } from '../funcionalidades/auth/AuthProvider'
import Layout from '../layouts/Layout'

export default function RaizAplicacion() {
  return (
    <AuthProvider>
      <Layout />
    </AuthProvider>
  )
}