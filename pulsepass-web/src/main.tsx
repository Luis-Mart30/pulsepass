import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router/dom'
import { router } from './app/router'
import { queryClient } from './lib/query-client'
import './index.css'

const root = document.getElementById('root')

if (root === null) {
  throw new Error('No se encontró el elemento raíz de PulsePass.')
}

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
