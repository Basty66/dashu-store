# DASHU STORE

Tienda online para vender la crema alisadora de origen coreano **DASHU** en Chile, por unidad y en **packs de 5, 10, 20 y 40** con precio por volumen.

> Venta autorizada de productos DASHU. DASHU STORE no es el distribuidor oficial de la marca.

## Qué incluye

- **Tienda**: landing del producto, selector de packs con ahorro por volumen, galería con zoom, antes/después, calculadora de ganancia para revendedores, reseñas y preguntas frecuentes.
- **Carrito y checkout**: precios, stock, envío por región y cupones se calculan en el servidor. Boleta o factura (RUT validado). Pago con **Mercado Pago Checkout Pro**.
- **Stock**: se reserva al crear el pedido (60 min para pagar) y se libera solo si el pago no llega.
- **Seguimiento**: línea de tiempo *Recibimos tu pedido → Pago confirmado → Preparando → En camino con Starken → Entregado*, con link directo al courier. Correo al cliente en cada etapa (si configuras Resend).
- **Admin** (`/admin`): resumen de ventas, pedidos (despacho con courier + N° de seguimiento, notas internas, WhatsApp al cliente), productos (precio por pack, stock, imágenes), cupones, reseñas y mensajes.

## Estructura

```
api/            Funciones serverless de Vercel (9)
lib/            Lógica de servidor: pedidos, stock, Mercado Pago, correos, sesión admin
shared/         Código usado por servidor y navegador: precios, envíos, estados, RUT, comunas, validación
prisma/         Esquema de base de datos y seed del producto
src/
  components/   Atomic Design: atoms → molecules → organisms → templates
  pages/        Páginas de la tienda y del admin
  store/        Carrito (zustand) y notificaciones
tests/          Tests de la lógica compartida (node --test)
```

Configuración del negocio (nombre, packs, tiempo de reserva) en `shared/store.js`; tarifas de envío, envío gratis y couriers en `shared/shipping.js`.

## Desarrollo local

```bash
npm install
cp .env.example .env        # completa DATABASE_URL y ADMIN_PASSWORD
npm run db:push             # crea las tablas
npm run db:seed             # carga el producto con sus packs
npm run dev                 # tienda + API en http://localhost:5173
```

Con `PAYMENTS_MOCK="1"` en `.env` puedes probar el flujo de compra completo sin Mercado Pago (aparece una pantalla de pago simulado).

```bash
npm test      # tests
npm run lint  # ESLint
npm run build # build de producción
```

## Producción (Vercel)

Variables necesarias en Vercel → Settings → Environment Variables: `DATABASE_URL`, `ADMIN_PASSWORD`, `MERCADO_PAGO_ACCESS_TOKEN`. Recomendadas: `VITE_WHATSAPP_NUMBER`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `MP_WEBHOOK_SECRET`.

En Mercado Pago configura el webhook de pagos apuntando a `https://TU-DOMINIO/api/webhooks/mercadopago`. El checkout además confirma el pago directamente al volver del pago, así que funciona aunque el webhook se atrase.
