# ImageGen · PWA con Flux Schnell

PWA para generar imágenes a partir de texto usando [Replicate](https://replicate.com) y el modelo **Flux Schnell**.

## 🚀 Despliegue en Vercel (5 minutos)

### Opción A — Vercel CLI (recomendado)

```bash
# 1. Instala Vercel CLI si no lo tienes
npm i -g vercel

# 2. Entra en la carpeta
cd pwa-imagegen

# 3. Despliega (primera vez crea la cuenta/proyecto)
vercel

# 4. Para producción
vercel --prod
```

### Opción B — Interfaz web de Vercel

1. Sube esta carpeta a un repositorio de **GitHub**
2. Ve a [vercel.com/new](https://vercel.com/new) → importa el repo
3. Deja todo por defecto → **Deploy**

---

## 🔑 Configurar tu API Key de Replicate

1. Abre la app desplegada
2. Pulsa el icono ⚙️ (ajustes) en la esquina superior derecha
3. Introduce tu API key de [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
4. Pulsa **Guardar API Key**

> La key se guarda en `localStorage` de tu navegador. **Nunca se envía a ningún servidor propio** — solo va directamente a la API de Replicate a través de la serverless function.

---

## 📁 Estructura del proyecto

```
pwa-imagegen/
├── api/
│   └── generate.js      # Serverless function (proxy a Replicate)
├── public/
│   ├── index.html       # App PWA (HTML + CSS + JS)
│   ├── manifest.json    # Manifiesto PWA
│   └── sw.js            # Service Worker (offline)
├── vercel.json          # Config de Vercel
└── package.json
```

---

## 🛠 Desarrollo local

```bash
npm install
vercel dev
# → http://localhost:3000
```

---

## ⚙️ Personalización

- **Modelo**: Cambia la URL en `api/generate.js` por cualquier modelo de Replicate
- **Aspect ratio**: Modifica `aspect_ratio` en el body del fetch (`16:9`, `4:3`, etc.)
- **Historial**: Se guarda hasta 8 imágenes en `localStorage`
- **Atajos**: `Ctrl+Enter` / `Cmd+Enter` para generar rápido
