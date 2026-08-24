import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, isAbsolute, relative, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT || 8080);

const MIME_TYPES = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

const BASE_HEADERS = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
};

const PRIVATE_FILES = new Set(['/Dockerfile', '/server.mjs', '/serve.json']);

function isPathInsideRoot(path) {
  const relativePath = relative(ROOT, path);
  return relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath);
}

function isForbiddenPath(pathname) {
  return PRIVATE_FILES.has(pathname) || pathname.split('/').some((segment) => segment.startsWith('.'));
}

function cacheControlFor(pathname) {
  if (pathname.startsWith('/src/assets/')) return 'public, max-age=31536000, immutable';
  if (pathname.startsWith('/src/pages/') || pathname.startsWith('/src/components/')) return 'public, max-age=86400';
  if (pathname.startsWith('/src/config/') || pathname.startsWith('/src/core/') || pathname.startsWith('/src/services/') || pathname.startsWith('/src/data/')) {
    return 'public, max-age=604800';
  }
  return 'no-cache';
}

function headersFor(pathname, filePath) {
  const headers = {
    ...BASE_HEADERS,
    'Cache-Control': cacheControlFor(pathname),
    'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream',
  };

  if (pathname.startsWith('/app/studio/') || ['/app/mcredential', '/mcredential'].includes(pathname)) {
    headers['X-Robots-Tag'] = 'noindex, nofollow';
  }

  return headers;
}

async function resolveRequest(pathname) {
  if (pathname === '/' || pathname === '/index.html') return resolve(ROOT, 'index.html');
  if (isForbiddenPath(pathname)) return null;

  const candidate = resolve(ROOT, `.${pathname}`);
  if (!isPathInsideRoot(candidate)) return null;

  try {
    const stat = await fs.stat(candidate);
    if (stat.isFile()) return candidate;
  } catch {
    // SPA routes are resolved below.
  }

  if (!extname(pathname)) return resolve(ROOT, 'index.html');
  return null;
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD', ...BASE_HEADERS });
    response.end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`).pathname);
  } catch {
    response.writeHead(400, BASE_HEADERS);
    response.end();
    return;
  }

  const filePath = await resolveRequest(pathname);
  if (!filePath) {
    response.writeHead(404, BASE_HEADERS);
    response.end();
    return;
  }

  const headers = headersFor(pathname, filePath);
  response.writeHead(200, headers);
  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(filePath)
    .on('error', () => {
      if (!response.headersSent) response.writeHead(500, BASE_HEADERS);
      response.end();
    })
    .pipe(response);
});

server.listen(PORT, () => {
  console.log(`MSoft static server listening on ${PORT}`);
});
