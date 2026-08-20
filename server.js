/**
 * Petit serveur — même principe que le logiciel de pointage :
 * pas de Firebase, pas de Google Sheet, pas de compte externe.
 * Sert les pages (index.html, admin.html) ET enregistre les RSVP
 * directement dans data.json.
 *
 * Lancement : node server.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Mot de passe pour ouvrir admin.html — changez-le avant de déployer.
const ADMIN_KEY = 'change-moi';

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

function readData() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return []; }
}
function writeData(rows) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2), 'utf8');
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

function serveStatic(req, res, pathname) {
  let rel = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(__dirname, rel);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end('Interdit');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Introuvable');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // ---- Un invité envoie sa réponse (public, aucune protection nécessaire) ----
  if (pathname === '/api/rsvps' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        const rows = readData();
        rows.unshift({
          horodatage: new Date().toISOString(),
          nom: (data.nom || '').toString().slice(0, 200),
          prenom: (data.prenom || '').toString().slice(0, 200),
          telephone: (data.telephone || '').toString().slice(0, 50),
          marie: data.marie === 'Oui' ? 'Oui' : 'Non',
          nom_epoux: (data.nom_epoux || '').toString().slice(0, 200),
          presence_dot: data.presence_dot === 'Oui' ? 'Oui' : 'Non',
          presence_mariage: data.presence_mariage === 'Oui' ? 'Oui' : 'Non',
          message: (data.message || '').toString().slice(0, 2000)
        });
        writeData(rows);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Données invalides' }));
      }
    });
    return;
  }

  // ---- L'admin lit les réponses (protégé par mot de passe) ----
  if (pathname === '/api/rsvps' && req.method === 'GET') {
    const key = parsed.query.key || '';
    if (key !== ADMIN_KEY) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: false, error: 'Mot de passe incorrect' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(readData()));
  }

  // ---- Pages et fichiers statiques ----
  if (req.method === 'GET') {
    return serveStatic(req, res, pathname);
  }

  res.writeHead(405);
  res.end('Méthode non autorisée');
});

server.listen(PORT, () => {
  console.log('Serveur démarré : http://localhost:' + PORT);
});
