import { createServer } from 'http';
import { parse } from 'url';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import next from 'next';
import { WebSocketServer } from 'ws';
import { RoomManager, getRoomManager } from './server/room-manager';

const port = parseInt(process.env.PORT || '3000', 10);
const hasCompleteBuild = () =>
  existsSync(join(process.cwd(), '.next', 'BUILD_ID')) &&
  existsSync(join(process.cwd(), '.next', 'server', 'app-paths-manifest.json')) &&
  existsSync(join(process.cwd(), '.next', 'server', 'pages-manifest.json'));

const isBuilt = hasCompleteBuild();
const dev = !isBuilt;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const roomManager = getRoomManager();

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const pathname = parsedUrl.pathname || '';
    if (pathname === '/api/mp' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        if (body.length < 32768) body += chunk;
      });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          const clientId = typeof parsed.clientId === 'string' && parsed.clientId ? parsed.clientId : 'anon';
          const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
          const outMessages = roomManager.handleHttpPoll(clientId, messages);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ messages: outMessages }));
        } catch {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ messages: [] }));
        }
      });
      return;
    }
    if (pathname.startsWith('/fonts/')) {
      const filePath = join(process.cwd(), 'public', pathname);
      if (existsSync(filePath)) {
        res.setHeader('Content-Type', pathname.endsWith('.woff2') ? 'font/woff2' : 'font/ttf');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        createReadStream(filePath).pipe(res);
        return;
      }
    }
    const manifestsExist =
      existsSync(join(process.cwd(), '.next', 'server', 'app-paths-manifest.json')) &&
      existsSync(join(process.cwd(), '.next', 'server', 'pages-manifest.json'));
    if (!manifestsExist && !pathname.startsWith('/_next/static/')) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Retry-After', '1');
      res.end(
        '<!DOCTYPE html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="1"></head><body style="background:#11141a;color:#fcd34d;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">Đang khởi tạo bàn cờ...</body></html>'
      );
      return;
    }
    Promise.resolve(handle(req, res, parsedUrl)).catch(() => {
      if (!res.headersSent) {
        res.statusCode = 503;
        res.end();
      }
    });
  });

  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 16 * 1024 // 16KB hard buffer cap for WS frames
  });

  wss.on('connection', (ws) => {
    roomManager.handleConnection(ws);
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url || '');
    if (pathname === '/api/ws') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    } else if (!pathname?.startsWith('/_next')) {
      socket.destroy();
    }
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Xiangqi Full-Stack Ready on http://0.0.0.0:${port}`);
  });
});
