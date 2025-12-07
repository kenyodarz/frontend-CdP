# Manual de Usuario - Módulo de Inventario

## Introducción

El módulo de Inventario le permite gestionar el stock de productos, realizar cierres mensuales y mantener un control preciso de las existencias.

---

## Acceso al Módulo

1. En el menú lateral, haga click en **"Inventario"**
2. Por defecto, verá la pestaña **"Existencias"**

---

## Secciones del Módulo

### 1. Existencias

**¿Qué es?**  
Muestra el stock actual de todos los productos.

**¿Cómo usar?**
1. Navegue a la pestaña "Existencias"
2. Vea la lista de productos con su stock actual
3. Use el buscador para encontrar productos específicos
4. Los productos con stock bajo aparecen resaltados

**Información mostrada:**
- Nombre del producto
- Stock actual
- Stock mínimo
- Estado (Activo/Inactivo)

---

### 2. Recepciones

**¿Qué es?**  
Registra la entrada de mercancía al inventario.

**¿Cómo registrar una entrada?**
1. Click en botón **"Nueva Entrada"** (verde)
2. Complete el formulario:
   - Seleccione productos
   - Ingrese cantidades
   - Asigne lotes si aplica
3. Click en "Guardar"
4. El sistema actualiza automáticamente el stock

---

### 3. Despachos

**¿Qué es?**  
Registra la salida de mercancía del inventario.

**¿Cómo crear un despacho?**
1. Navegue a la pestaña "Despachos"
2. Click en "Nuevo Despacho"
3. Seleccione productos y cantidades
4. El sistema asigna automáticamente lotes (FIFO)
5. Confirme el despacho

**Importante:**
- Los despachos reducen el stock automáticamente
- Se usa método FIFO (primero en entrar, primero en salir)
- No se pueden duplicar despachos

---

### 4. Lotes

**¿Qué es?**  
Gestiona los lotes de productos con fecha de vencimiento.

**¿Cómo crear un lote?**
1. Navegue a "Crear Lote"
2. Ingrese:
   - Código de lote
   - Fecha de elaboración
   - Fecha de vencimiento
   - Observaciones (opcional)
3. Click en "Crear Lote"

**Consultar lotes:**
- Pestaña "Lotes" muestra todos los lotes activos
- Vea lotes próximos a vencer
- Filtre por producto

---

### 5. Cierres de Inventario ⭐ NUEVO

**¿Qué es?**  
Crea un "snapshot" del inventario en un momento específico para optimizar cálculos futuros.

**¿Cuándo ejecutar un cierre?**
- Al final de cada mes
- Antes de reportes importantes
- Después de inventarios físicos

**¿Cómo ejecutar un cierre?**
1. Click en botón **"Ejecutar Cierre"** (amarillo) en el header
2. O navegue a pestaña "Cierres"
3. Seleccione el período (ej: Diciembre 2025)
4. Click en **"Ejecutar Cierre Mensual"**
5. Espere confirmación

**¿Qué hace el cierre?**
- Calcula el stock de todos los productos
- Guarda un registro histórico
- Optimiza cálculos futuros
- Previene duplicados automáticamente

**Ver historial de cierres:**
- La tabla muestra todos los cierres ejecutados
- Vea por período
- Información incluye:
  - Producto
  - Stock inicial
  - Entradas del período
  - Salidas del período
  - Stock final

---

### 6. Recalcular Stock ⭐ NUEVO

**¿Qué es?**  
Herramienta para verificar y corregir el stock calculándolo desde los movimientos.

**¿Cuándo usar?**
- Si sospecha que el stock está incorrecto
- Después de corregir movimientos
- Para verificación de integridad

**¿Cómo recalcular un producto?**
1. Navegue a pestaña **"Recalcular Stock"**
2. Busque el producto en el campo de búsqueda
3. Seleccione el producto de la lista
4. Click en **"Recalcular Stock"**
5. Vea el stock actualizado

**¿Cómo recalcular todo el inventario?**
1. En la misma pantalla, baje a la sección "Recalcular Todo"
2. Click en **"Recalcular Todo el Stock"**
3. Confirme la operación
4. Espere a que termine (puede tomar minutos)

⚠️ **Advertencia:** Recalcular todo el inventario puede tomar tiempo. Úselo solo cuando sea necesario.

---

## Flujos de Trabajo Comunes

### Recepción de Mercancía
1. Click en "Nueva Entrada"
2. Agregue productos y cantidades
3. Asigne lotes si aplica
4. Guarde
5. ✅ Stock actualizado automáticamente

### Despacho de Mercancía
1. Vaya a "Despachos"
2. Cree nuevo despacho
3. Seleccione productos
4. Sistema asigna lotes automáticamente (FIFO)
5. Confirme
6. ✅ Stock reducido automáticamente

### Cierre Mensual
1. Fin de mes: Click en "Ejecutar Cierre"
2. Verifique el período
3. Ejecute cierre
4. ✅ Snapshot creado
5. Revise historial si necesario

### Verificación de Stock
1. Vaya a "Recalcular Stock"
2. Busque producto sospechoso
3. Recalcule
4. ✅ Stock corregido si había error

---

## Preguntas Frecuentes

**¿Por qué no puedo ejecutar un cierre?**  
Probablemente ya existe un cierre para ese período. Verifique en el historial.

**¿Qué pasa si el stock está incorrecto?**  
Use la función "Recalcular Stock" para corregirlo.

**¿Puedo eliminar un cierre?**  
No, los cierres son permanentes para mantener el historial.

**¿Con qué frecuencia debo hacer cierres?**  
Recomendamos mensualmente, al inicio de cada mes.

**¿Qué es FIFO?**  
First In, First Out - El primer lote que entra es el primero que sale. Esto asegura rotación correcta de productos.

**¿Puedo ver el historial de movimientos?**  
Sí, en la pestaña "Movimientos" puede ver todas las entradas y salidas.

---

## Consejos y Mejores Prácticas

✅ **Ejecute cierres mensuales** - Mejora la performance del sistema  
✅ **Use lotes para productos perecederos** - Mejor control de vencimientos  
✅ **Revise stock bajo regularmente** - En la pestaña Existencias  
✅ **Verifique despachos antes de confirmar** - No se pueden deshacer  
✅ **Mantenga actualizado el stock mínimo** - Para alertas precisas  

---

## Solución de Problemas

### Stock incorrecto
1. Vaya a "Recalcular Stock"
2. Recalcule el producto afectado
3. Si persiste, contacte soporte

### No puedo crear entrada/salida
- Verifique que el producto exista
- Verifique que haya stock suficiente (salidas)
- Revise que los lotes sean válidos

### Error al ejecutar cierre
- Verifique que no exista cierre para ese período
- Intente con otro período
- Revise el historial de cierres

---

## Glosario

**Stock:** Cantidad de unidades disponibles de un producto  
**Lote:** Grupo de productos con misma fecha de elaboración/vencimiento  
**Cierre:** Snapshot del inventario en un momento específico  
**FIFO:** Método de salida - primero en entrar, primero en salir  
**Movimiento:** Registro de entrada o salida de inventario  
**Recalcular:** Calcular stock desde los movimientos registrados  

---

**Versión:** 2.0  
**Última actualización:** Diciembre 2025
