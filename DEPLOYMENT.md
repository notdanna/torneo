# Guía de Deployment para Firebase Hosting

## Prerrequisitos
1. Tener Node.js instalado (versión 18 o superior)
2. Tener Firebase CLI instalado: `npm install -g firebase-tools`
3. Estar autenticado en Firebase: `firebase login`

## Configuración del proyecto
El proyecto ya está configurado para Firebase Hosting con:
- **Directorio de salida**: `dist`
- **Configuración SPA**: Redirecciones configuradas para React Router
- **Optimizaciones**: Minificación con terser y code splitting

## Scripts disponibles

### Desarrollo
```bash
npm run dev              # Servidor de desarrollo (puerto 3000)
npm run firebase:emulators # Emuladores de Firebase
```

### Build y Deployment
```bash
npm run build           # Construir para producción
npm run preview         # Vista previa local del build
npm run serve           # Servir con Firebase localmente
npm run deploy          # Build + Deploy a Firebase Hosting
npm run firebase:deploy # Deploy completo (hosting + funciones)
```

## Pasos para hacer deploy

### 1. Instalar dependencias
```bash
npm install
```

### 2. Construir el proyecto
```bash
npm run build
```

### 3. Probar localmente (opcional)
```bash
npm run serve
```

### 4. Desplegar a Firebase
```bash
npm run deploy
```

## Configuración de Firebase

### Hosting
- **Directorio público**: `dist`
- **Archivo de index**: `index.html`
- **Rewrites**: Configurado para SPA (Single Page Application)
- **Headers**: Cache control para service workers

### Firestore
- **Base de datos**: `(default)`
- **Región**: `northamerica-south1`
- **Reglas**: Definidas en `firestore.rules`
- **Índices**: Definidos en `firestore.indexes.json`

## Optimizaciones incluidas

### Vite Build
- Minificación con terser
- Code splitting automático
- Chunks manuales para vendor y Firebase
- Sourcemaps deshabilitados en producción

### Firebase Hosting
- Cache control optimizado
- Compresión gzip automática
- CDN global
- SSL/HTTPS automático

## Estructura de archivos después del build
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── vendor-[hash].js
│   ├── firebase-[hash].js
│   └── index-[hash].css
└── vite.svg
```

## Variables de entorno (si las necesitas)
Crea un archivo `.env.local` en la raíz del proyecto:
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
```

## Comandos útiles de Firebase CLI
```bash
firebase projects:list          # Lista tus proyectos
firebase use tu-proyecto-id     # Cambiar proyecto activo
firebase hosting:sites:list     # Lista sitios de hosting
firebase deploy --only hosting  # Deploy solo hosting
firebase deploy --only firestore # Deploy solo Firestore
```

## Troubleshooting

### Error: "Firebase project not found"
```bash
firebase use --add
```

### Error: "Permission denied"
```bash
firebase login --reauth
```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deploy lento
El primer deploy puede ser lento. Los siguientes serán más rápidos gracias al cache.

## URLs importantes
- **Console de Firebase**: https://console.firebase.google.com
- **Sitio desplegado**: https://tu-proyecto-id.web.app
- **Documentación**: https://firebase.google.com/docs/hosting
