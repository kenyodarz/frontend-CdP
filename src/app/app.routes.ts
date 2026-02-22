import {Routes} from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'productos',
    loadComponent: () => import('./features/productos/productos').then(m => m.Productos),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () => import('./features/productos/lista-productos/lista-productos').then(m => m.ListaProductos)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./features/productos/form-producto/form-producto').then(m => m.FormProducto)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/productos/detalle-producto/detalle-producto').then(m => m.DetalleProducto)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./features/productos/form-producto/form-producto').then(m => m.FormProducto)
      }
    ]
  },
  {
    path: 'clientes',
    loadComponent: () => import('./features/clientes/clientes').then(m => m.Clientes),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () => import('./features/clientes/lista-clientes/lista-clientes').then(m => m.ListaClientes)
      },
      {
        path: 'nuevo',
        loadComponent: () => import('./features/clientes/form-cliente/form-cliente').then(m => m.FormCliente)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/clientes/detalle-cliente/detalle-cliente').then(m => m.DetalleCliente)
      },
      {
        path: ':id/editar',
        loadComponent: () => import('./features/clientes/form-cliente/form-cliente').then(m => m.FormCliente)
      }
    ]
  },
  {
    path: 'ordenes',
    loadComponent: () => import('./features/ordenes/ordenes').then(m => m.Ordenes),
    children: [
      { path: '', redirectTo: 'lista', pathMatch: 'full' },
      {
        path: 'lista',
        loadComponent: () => import('./features/ordenes/lista-ordenes/lista-ordenes').then(m => m.ListaOrdenes)
      },
      {
        path: 'nueva',
        loadComponent: () => import('./features/ordenes/crear-orden/crear-orden').then(m => m.CrearOrden)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/ordenes/detalle-orden/detalle-orden').then(m => m.DetalleOrden)
      }
    ]
  },
  {
    path: 'inventario',
    loadComponent: () => import('./features/inventario/inventario').then(m => m.Inventario),
    children: [
      {path: '', redirectTo: 'documentos-salida', pathMatch: 'full'},
      {
        path: 'documentos-salida',
        loadComponent: () => import('./features/inventario/documentos-salida/documentos-salida').then(m => m.DocumentosSalidaComponent)
      },
      {
        path: 'documentos-salida/crear',
        loadComponent: () => import('./features/inventario/documentos-salida/crear-documento/crear-documento').then(m => m.CrearDocumentoComponent)
      },
      {
        path: 'documentos-salida/:id',
        loadComponent: () => import('./features/inventario/documentos-salida/ver-documento/ver-documento').then(m => m.VerDocumentoComponent)
      }
    ]
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/reportes/dashboard-proforma/dashboard-proforma').then(m => m.DashboardProforma)
  },
  {
    path: 'pagos',
    loadComponent: () => import('./features/pagos/pagos').then(m => m.PagosComponent)
  },
  { path: '**', redirectTo: '/dashboard' }
];
