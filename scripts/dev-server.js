import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Directorio src/ donde está el código fuente
const srcDir = path.join(__dirname, '..', 'src');

// Middleware CORS para módulos ES6
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Servir archivos estáticos desde src/ con headers correctos para módulos ES6
app.use(express.static(srcDir, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (path.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// Ruta principal sirve index.html desde src/
app.get('/', (req, res) => {
  res.sendFile(path.join(srcDir, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0'
  });
});

// 404 handler - redirige a index.html (SPA behavior)
app.use((req, res) => {
  res.status(404).sendFile(path.join(srcDir, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║   MOSTRO WEB SERVER                   ║
╠═══════════════════════════════════════╣
║   Status: RUNNING                     ║
║   Port: ${PORT}                          ║
║   URL: http://localhost:${PORT}          ║
║   Environment: ${process.env.NODE_ENV || 'development'}      ║
║   Source: src/                        ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
