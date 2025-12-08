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
      { path: '', redirectTo: 'existencias', pathMatch: 'full' },
      {
        path: 'lotes',
        loadComponent: () => import('./features/inventario/lotes/lotes').then(m => m.Lotes)
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/inventario/listar-documentos/listar-documentos').then(m => m.ListarDocumentos)
      },
      {
        path: 'existencias',
        loadComponent: () => import('./features/inventario/existencias/existencias').then(m => m.Existencias)
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
      },
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
      },
      {
        path: 'cierres',
        loadComponent: () => import('./features/inventario/cierres/cierres').then(m => m.CierresComponent)
      },
      {
        path: 'recalcular-stock',
        loadComponent: () => import('./features/inventario/recalcular-stock/recalcular-stock').then(m => m.RecalcularStockComponent)
      }
    ]
  },
  {
    path: 'reportes',
    loadComponent: () => import('./features/reportes/dashboard-proforma/dashboard-proforma').then(m => m.DashboardProforma)
  },
  {
    path: 'supervision',
    loadComponent: () => import('./features/supervision/supervision').then(m => m.Supervision),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/supervision/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'ordenes',
        loadComponent: () => import('./features/supervision/ordenes/ordenes').then(m => m.Ordenes)
      },
      {
        path: 'despachos',
        loadComponent: () => import('./features/supervision/despachos/despachos').then(m => m.Despachos)
      },
      {
        path: 'rutas',
        loadComponent: () => import('./features/supervision/rutas/rutas').then(m => m.Rutas)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./features/supervision/inventario/inventario').then(m => m.InventarioSupervision)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
