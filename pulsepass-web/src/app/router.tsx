import { createBrowserRouter } from 'react-router'
import RutaPorRol from './guardas/RutaPorRol'
import RutaProtegida from './guardas/RutaProtegida'
import SoloAnonimo from './guardas/SoloAnonimo'
import RaizAplicacion from './RaizAplicacion'
import { RUTAS } from '../lib/rutas'
import Inicio from '../pages/Inicio'
import ErrorPagina from '../pages/ErrorPagina'

export const router = createBrowserRouter([
  {
    path: RUTAS.INICIO,
    Component: RaizAplicacion,
    errorElement: <ErrorPagina />,
    children: [
      {
        index: true,
        Component: Inicio,
      },
      {
        path: RUTAS.EVENTOS,
        lazy: async () => ({
          Component: (await import('../pages/CatalogoEventos')).default,
        }),
      },
      {
        path: RUTAS.DETALLE_EVENTO,
        lazy: async () => ({
          Component: (await import('../pages/DetalleEvento')).default,
        }),
      },
      {
        path: RUTAS.ARTISTAS,
        lazy: async () => ({
          Component: (await import('../pages/ListaArtistas')).default,
        }),
      },
      {
        path: RUTAS.DETALLE_ARTISTA,
        lazy: async () => ({
          Component: (await import('../pages/DetalleArtista')).default,
        }),
      },
      {
        path: RUTAS.SEDES,
        lazy: async () => ({
          Component: (await import('../pages/ListaSedes')).default,
        }),
      },
      {
        path: RUTAS.DETALLE_SEDE,
        lazy: async () => ({
          Component: (await import('../pages/DetalleSede')).default,
        }),
      },
      {
        Component: SoloAnonimo,
        children: [
          {
            path: RUTAS.LOGIN,
            lazy: async () => ({
              Component: (await import('../pages/Login')).default,
            }),
          },
          {
            path: RUTAS.REGISTRO,
            lazy: async () => ({
              Component: (await import('../pages/Registro')).default,
            }),
          },
        ],
      },
      {
        Component: RutaProtegida,
        children: [
          {
            path: RUTAS.CUENTA,
            lazy: async () => ({
              Component: (await import('../pages/Cuenta')).default,
            }),
          },
          {
            element: <RutaPorRol roles={['USER']} />,
            children: [
              {
                path: RUTAS.MIS_TICKETS,
                lazy: async () => ({
                  Component: (await import('../pages/MisTickets')).default,
                }),
              },
              {
                path: RUTAS.DETALLE_TICKET,
                lazy: async () => ({
                  Component: (await import('../pages/DetalleTicket')).default,
                }),
              },
              {
                path: RUTAS.CONFIRMACION_COMPRA,
                lazy: async () => ({
                  Component: (await import('../pages/ConfirmacionCompra'))
                    .default,
                }),
              },
            ],
          },
          {
            element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
            children: [
              {
                path: RUTAS.STAFF_VALIDACION,
                lazy: async () => ({
                  Component: (await import('../pages/ValidacionIngreso'))
                    .default,
                }),
              },
              {
                path: RUTAS.STAFF_TICKETS_EVENTO,
                lazy: async () => ({
                  Component: (await import('../pages/TicketsPagadosEvento'))
                    .default,
                }),
              },
            ],
          },
          {
            element: <RutaPorRol roles={['ADMIN']} />,
            children: [
              {
                path: RUTAS.ADMIN_EVENTOS,
                lazy: async () => ({
                  Component: (await import('../pages/AdminEventos')).default,
                }),
              },
              {
                path: RUTAS.ADMIN_CREAR_EVENTO,
                lazy: async () => ({
                  Component: (await import('../pages/AdminCrearEvento'))
                    .default,
                }),
              },
              {
                path: RUTAS.ADMIN_GESTION_EVENTO,
                lazy: async () => ({
                  Component: (await import('../pages/AdminGestionEvento'))
                    .default,
                }),
              },
            ],
          },
        ],
      },
      {
        path: RUTAS.SIN_PERMISOS,
        lazy: async () => ({
          Component: (await import('../pages/SinPermisos')).default,
        }),
      },
      {
        path: RUTAS.NO_ENCONTRADA,
        lazy: async () => ({
          Component: (await import('../pages/NoEncontrada')).default,
        }),
      },
    ],
  },
])
