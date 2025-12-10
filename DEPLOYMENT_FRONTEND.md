# Guía de Despliegue del Frontend en Render

## 📋 Configuración del Static Site

### 1. Crear Static Site en Render

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"Static Site"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `el-castillo-del-pan`

### 2. Configuración del Servicio

Usa estos valores en la configuración:

| Campo | Valor |
|-------|-------|
| **Name** | `castillo-del-pan-frontend` |
| **Region** | La misma que el backend |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install; npm run build` |
| **Publish Directory** | `dist/frontend/browser` |

### 3. Variables de Entorno (Opcional)

Si necesitas configurar diferentes entornos, puedes usar:

```bash
NODE_ENV=production
```

### 4. Archivos Importantes

#### `_redirects`
Este archivo ya está creado en `public/_redirects` y es crucial para que el routing de Angular funcione correctamente en Render.

```
/*    /index.html   200
```

Este archivo le dice a Render que todas las rutas deben servir `index.html`, permitiendo que Angular maneje el routing del lado del cliente.

## 🔄 Actualizar CORS en el Backend

Una vez que tu frontend esté desplegado, **DEBES** actualizar la variable `CORS_ORIGINS` en el backend:

1. Ve al servicio del backend en Render
2. Click en **"Environment"**
3. Actualiza `CORS_ORIGINS`:

```bash
CORS_ORIGINS=https://castillo-del-pan-frontend.onrender.com,https://tu-dominio-personalizado.com
```

4. Guarda los cambios (Render reiniciará automáticamente el backend)

## ✅ Verificación Post-Despliegue

### 1. Verificar que el sitio carga
```
https://castillo-del-pan-frontend.onrender.com
```

### 2. Verificar que el routing funciona
- Navega a diferentes páginas
- Recarga la página en una ruta específica (ej: `/clientes`)
- Debería funcionar sin errores 404

### 3. Verificar conexión con el backend
- Abre las DevTools del navegador (F12)
- Ve a la pestaña **Network**
- Verifica que las llamadas al backend (`https://backend-cdp-java.onrender.com/api/...`) funcionen
- Si ves errores de CORS, actualiza `CORS_ORIGINS` en el backend

## 🚀 Despliegues Futuros

Render automáticamente redespliegará tu frontend cuando:
- Hagas push a la rama `main` (o la rama configurada)
- Cambies la configuración en Render

### Despliegue Manual
Si necesitas redesplegar manualmente:
1. Ve a tu Static Site en Render
2. Click en **"Manual Deploy"** → **"Deploy latest commit"**

## 🔧 Troubleshooting

### Error 404 en rutas
- Verifica que el archivo `_redirects` existe en `public/`
- Confirma que el **Publish Directory** es `dist/frontend/browser`

### Errores de CORS
- Actualiza `CORS_ORIGINS` en el backend con la URL correcta
- Incluye el protocolo `https://`
- No incluyas trailing slash

### Build falla
- Verifica que `package.json` tenga todas las dependencias
- Revisa los logs de build en Render
- Asegúrate de que el build funciona localmente: `npm run build`

### Sitio carga pero está en blanco
- Verifica el **Publish Directory**: debe ser `dist/frontend/browser`
- Revisa la consola del navegador para errores
- Verifica que `environment.prod.ts` tenga la URL correcta del backend

## 📱 Dominio Personalizado (Opcional)

Para usar tu propio dominio:

1. En Render, ve a tu Static Site
2. Click en **"Settings"** → **"Custom Domain"**
3. Agrega tu dominio (ej: `www.castillodelpan.com`)
4. Configura los DNS según las instrucciones de Render
5. **IMPORTANTE**: Actualiza `CORS_ORIGINS` en el backend con el nuevo dominio

## 🔐 HTTPS

Render proporciona HTTPS automáticamente con certificados SSL gratuitos para:
- Subdominios de Render (`.onrender.com`)
- Dominios personalizados

No necesitas configuración adicional.

## 📊 Monitoreo

Render proporciona:
- Logs de build
- Logs de despliegue
- Estadísticas de uso
- Historial de despliegues

Accede a estos en el dashboard de tu Static Site.
