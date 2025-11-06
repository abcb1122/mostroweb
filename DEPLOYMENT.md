# 🚀 Guía de Despliegue - MostroWeb

Esta guía explica cómo desplegar MostroWeb en producción para que usuarios reales puedan acceder a la aplicación.

---

## 📋 Índice

- [Opciones de Despliegue](#opciones-de-despliegue)
- [Despliegue en GitHub Pages](#despliegue-en-github-pages)
- [Despliegue en Netlify](#despliegue-en-netlify)
- [Despliegue en Vercel](#despliegue-en-vercel)
- [Despliegue en Servidor Propio](#despliegue-en-servidor-propio)
- [Configuración de DNS y HTTPS](#configuración-de-dns-y-https)
- [Variables de Entorno](#variables-de-entorno)
- [Seguridad](#seguridad)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Opciones de Despliegue

MostroWeb es una aplicación **completamente estática** (HTML + CSS + JavaScript), por lo que puede desplegarse en cualquier servicio de hosting estático:

1. **GitHub Pages** - Gratis, simple, recomendado para proyectos open source
2. **Netlify** - Gratis, deployment automático, CDN global
3. **Vercel** - Gratis, optimizado para frameworks modernos
4. **Servidor propio** - Control total, requiere configuración

---

## 📦 Despliegue en GitHub Pages

### Paso 1: Preparar el repositorio

```bash
# Asegurarse de estar en la rama principal
git checkout main

# Verificar que src/ tenga todos los archivos
ls -la src/
```

### Paso 2: Configurar GitHub Pages

1. Ve a **Settings** > **Pages** en tu repositorio GitHub
2. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/` (root) o `/docs` si mueves src/ a docs/
3. Click en **Save**

### Paso 3: Configurar GitHub Actions (Opcional)

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./src
          publish_branch: gh-pages
```

### Paso 4: Acceder

Tu sitio estará disponible en:
```
https://<usuario>.github.io/<repositorio>/
```

Ejemplo: `https://abcb1122.github.io/mostroweb/`

---

## 🌐 Despliegue en Netlify

### Método 1: Deploy manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
cd mostroweb
netlify deploy --prod --dir=src
```

### Método 2: Deploy automático desde GitHub

1. Ve a [netlify.com](https://netlify.com) y crea cuenta
2. Click en **New site from Git**
3. Conecta tu repositorio GitHub
4. Configuración:
   - **Build command**: (dejar vacío)
   - **Publish directory**: `src`
5. Click en **Deploy site**

### Configuración adicional

Crea `netlify.toml` en la raíz:

```toml
[build]
  publish = "src"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

Tu sitio estará en: `https://<nombre-random>.netlify.app`

Para dominio custom: **Site settings** > **Domain management** > **Add custom domain**

---

## ⚡ Despliegue en Vercel

### Método 1: Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd mostroweb
vercel --prod
```

### Método 2: Importar desde GitHub

1. Ve a [vercel.com](https://vercel.com)
2. Click en **New Project**
3. Importa tu repositorio GitHub
4. Configuración:
   - **Framework Preset**: Other
   - **Root Directory**: `src`
   - **Build Command**: (dejar vacío)
   - **Output Directory**: `.`
5. Click en **Deploy**

### Configuración

Crea `vercel.json` en la raíz:

```json
{
  "version": 2,
  "public": true,
  "github": {
    "enabled": true
  },
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/src/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 🖥️ Despliegue en Servidor Propio

### Requisitos

- Servidor Linux (Ubuntu/Debian recomendado)
- Nginx o Apache
- Certificado SSL (Let's Encrypt)
- Dominio configurado

### Instalación con Nginx

```bash
# 1. Instalar Nginx
sudo apt update
sudo apt install nginx

# 2. Clonar repositorio
cd /var/www
sudo git clone https://github.com/<usuario>/mostroweb.git
cd mostroweb

# 3. Configurar Nginx
sudo nano /etc/nginx/sites-available/mostroweb
```

Configuración de Nginx (`/etc/nginx/sites-available/mostroweb`):

```nginx
server {
    listen 80;
    server_name mostroweb.tudominio.com;

    root /var/www/mostroweb/src;
    index index.html;

    # Seguridad
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/mostroweb /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### Configurar HTTPS con Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d mostroweb.tudominio.com

# Renovación automática (ya configurada por defecto)
sudo certbot renew --dry-run
```

---

## 🌍 Configuración de DNS y HTTPS

### DNS

Configura en tu proveedor de DNS:

```
Tipo    Nombre              Valor
A       mostroweb          <IP-del-servidor>
CNAME   www.mostroweb      mostroweb.tudominio.com
```

Para GitHub Pages:
```
Tipo    Nombre              Valor
CNAME   mostroweb          <usuario>.github.io
```

### Verificar DNS

```bash
dig mostroweb.tudominio.com
nslookup mostroweb.tudominio.com
```

---

## 🔧 Variables de Entorno

MostroWeb **no requiere variables de entorno** en el servidor, pero puedes configurar:

### Relays Personalizados

Edita `src/js/utils/constants.js`:

```javascript
export const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr-pub.wellorder.net',
  'wss://nos.lol',
  // Agrega tus relays aquí
];
```

### Versión de la App

Actualiza en `src/index.html`:

```html
<span class="title-version">v1.0.0</span>
```

Y en `src/js/utils/constants.js`:

```javascript
export const APP_VERSION = '1.0.0';
```

---

## 🔒 Seguridad

### Headers de Seguridad

Asegúrate de que tu servidor envíe estos headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
```

### HTTPS Obligatorio

**Nunca** despliegues sin HTTPS. Las claves privadas podrían ser interceptadas.

### Backup

```bash
# Backup del código
git push origin main

# Backup del servidor (si aplica)
tar -czf mostroweb-backup-$(date +%Y%m%d).tar.gz /var/www/mostroweb
```

---

## 📊 Monitoreo

### Logs de Nginx

```bash
# Logs de acceso
sudo tail -f /var/log/nginx/access.log

# Logs de errores
sudo tail -f /var/log/nginx/error.log
```

### Métricas Básicas

```bash
# Uptime
uptime

# Espacio en disco
df -h

# Memoria
free -h

# Conexiones activas
ss -tuln | grep :80
ss -tuln | grep :443
```

### Monitoreo con Uptime Robot

1. Crea cuenta en [uptimerobot.com](https://uptimerobot.com)
2. Añade monitor:
   - Type: HTTP(s)
   - URL: `https://mostroweb.tudominio.com`
   - Monitoring Interval: 5 minutos
3. Configura alertas por email

---

## 🐛 Troubleshooting

### Problema: Página en blanco

**Causa**: Errores JavaScript no cargados

**Solución**:
```bash
# Verificar consola del navegador (F12)
# Asegurar que CDN esté accesible
curl -I https://cdn.jsdelivr.net/npm/uuid@10.0.0/dist/umd/uuid.min.js
```

### Problema: "Failed to load module"

**Causa**: Tipo MIME incorrecto

**Solución** (Nginx):
```nginx
types {
    application/javascript js mjs;
}
```

### Problema: Relays no conectan

**Causa**: WebSockets bloqueados por firewall

**Solución**:
```bash
# Verificar firewall
sudo ufw status

# Permitir puertos 80 y 443
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Problema: CSP bloquea recursos

**Causa**: Content Security Policy muy restrictiva

**Solución**: Ajustar CSP en headers:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://esm.sh 'unsafe-inline';" always;
```

---

## ✅ Checklist de Producción

Antes de lanzar oficialmente:

- [ ] HTTPS configurado y funcionando
- [ ] Headers de seguridad implementados
- [ ] Relays de producción configurados
- [ ] DNS apuntando correctamente
- [ ] Backup configurado
- [ ] Monitoreo activo (Uptime Robot u otro)
- [ ] Probado en múltiples navegadores (Chrome, Firefox, Safari)
- [ ] Probado en móvil y desktop
- [ ] README.md actualizado con URL de producción
- [ ] CHANGELOG.md actualizado a v1.0.0
- [ ] GitHub release creado con tag v1.0.0

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs del servidor
2. Verifica la consola del navegador (F12)
3. Abre un issue en GitHub: https://github.com/<usuario>/mostroweb/issues
4. Comunidades Nostr y Bitcoin LATAM

---

## 🎉 ¡Felicidades!

Si llegaste aquí, ¡MostroWeb está en producción! 🚀

Comparte el link con la comunidad:
- Twitter/X con hashtag #MostroWeb #Nostr #Bitcoin
- Comunidades de Telegram Bitcoin LATAM
- Grupos de Discord Nostr en español
- Reddit r/nostr y r/Bitcoin

**¡Gracias por usar MostroWeb!** ⚡
