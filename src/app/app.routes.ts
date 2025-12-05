import { Routes } from '@angular/router';

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
      { path: '', redirectTo: 'lotes', pathMatch: 'full' },
      {
        path: 'lotes',
        loadComponent: () => import('./features/inventario/lotes/lotes').then(m => m.Lotes)
      },
      {
        path: 'movimientos',
        loadComponent: () => import('./features/inventario/movimientos/movimientos').then(m => m.Movimientos)
      },
      {
        path: 'crear-lote',
        loadComponent: () => import('./features/inventario/crear-lote/crear-lote').then(m => m.CrearLote)
      },
      {
        path: 'registrar-entrada',
        loadComponent: () => import('./features/inventario/registrar-entrada/registrar-entrada').then(m => m.RegistrarEntrada)
      },
      {
        path: 'registrar-salida',
        loadComponent: () => import('./features/inventario/registrar-salida/registrar-salida').then(m => m.RegistrarSalida)
      }
    ]
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/reportes/reportes').then(m => m.Reportes),
    children: [
      {
        path: 'ventas',
        loadComponent: () => import('./features/reportes/ventas/ventas').then(m => m.Ventas)
      },
      {
        path: 'inventario-valorizado',
        loadComponent: () => import('./features/reportes/inventario-valorizado/inventario-valorizado').then(m => m.InventarioValorizado)
      },
      {
        path: 'productos-mas-vendidos',
        loadComponent: () => import('./features/reportes/productos-mas-vendidos/productos-mas-vendidos').then(m => m.ProductosMasVendidos)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];