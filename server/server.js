/* ============================================
   PORT SCANNER — LOCAL BACKEND
   Real TCP port scanning using Node's net module.
   Runs on your own machine — this backend is what
   makes a real scan possible (browsers cannot open
   raw sockets themselves).

   LEGAL / ETHICAL NOTE:
   Only scan hosts you own or have explicit written
   permission to test. Unauthorized scanning of
   third-party systems is illegal in most countries,
   including under Pakistan's PECA 2016 and similar
   cybercrime laws elsewhere. This tool does not
   verify authorization — that responsibility is
   the operator's.
   ============================================ */

const express = require('express');
const cors = require('cors');
const net = require('net');
const tls = require('tls');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const CONNECT_TIMEOUT_MS = 300;
const MAX_CONCURRENT = 100;

const COMMON_SERVICES = {
  20: 'FTP-Data', 21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
  67: 'DHCP', 69: 'TFTP', 80: 'HTTP', 110: 'POP3', 119: 'NNTP', 123: 'NTP',
  135: 'MSRPC', 137: 'NetBIOS', 139: 'NetBIOS', 143: 'IMAP', 161: 'SNMP',
  389: 'LDAP', 443: 'HTTPS', 445: 'SMB', 465: 'SMTPS', 587: 'SMTP-Sub',
  993: 'IMAPS', 995: 'POP3S', 1433: 'MSSQL', 1521: 'Oracle', 3306: 'MySQL',
  3389: 'RDP', 5432: 'PostgreSQL', 5900: 'VNC', 6379: 'Redis',
  8080: 'HTTP-Alt', 8443: 'HTTPS-Alt', 27017: 'MongoDB'
};

function scanPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = 'closed';

    socket.setTimeout(CONNECT_TIMEOUT_MS);

    socket.on('connect', () => {
      status = 'open';
      socket.destroy();
    });

    socket.on('timeout', () => {
      status = 'filtered';
      socket.destroy();
    });

    socket.on('error', () => {
      status = 'closed';
      socket.destroy();
    });

    socket.on('close', () => {
      resolve({ port, status, service: COMMON_SERVICES[port] || 'unknown' });
    });

    socket.connect(port, host);
  });
}

async function scanPortsBatched(host, ports, onProgress) {
  const results = [];
  for (let i = 0; i < ports.length; i += MAX_CONCURRENT) {
    const batch = ports.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(batch.map(p => scanPort(host, p)));
    results.push(...batchResults);
    if (onProgress) onProgress(results.length, ports.length);
  }
  return results;
}

app.post('/scan', async (req, res) => {
  const { host, startPort, endPort, acknowledgedLegal } = req.body;

  if (!host || !startPort || !endPort) {
    return res.status(400).json({ error: 'host, startPort, and endPort are required.' });
  }

  if (!acknowledgedLegal) {
    return res.status(403).json({ error: 'You must confirm you are authorized to scan this target before scanning.' });
  }

  const start = parseInt(startPort, 10);
  const end = parseInt(endPort, 10);

  if (isNaN(start) || isNaN(end) || start < 1 || end > 65535 || start > end) {
    return res.status(400).json({ error: 'Invalid port range. Must be between 1 and 65535.' });
  }

  const ports = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const results = await scanPortsBatched(host, ports);

  res.json({ host, totalPorts: ports.length, results });
});

/* ============================================
   TLS CERTIFICATE INFO
   Real certificate inspection via Node's tls module
   (a real TLS handshake) — not possible from browser JS.
   ============================================ */
app.get('/tls-info', (req, res) => {
  const host = (req.query.host || '').replace(/^https?:\/\//, '').split('/')[0];
  if (!host) return res.status(400).json({ error: 'host query param required' });

  const socket = tls.connect(
    { host, port: 443, servername: host, rejectUnauthorized: false, timeout: 5000 },
    () => {
      const cert = socket.getPeerCertificate();
      const protocol = socket.getProtocol();
      const authorized = socket.authorized;

      if (!cert || Object.keys(cert).length === 0) {
        socket.destroy();
        return res.status(502).json({ error: 'No certificate returned by host.' });
      }

      res.json({
        host,
        issuedTo: cert.subject?.CN || 'Unknown',
        issuer: cert.issuer?.O || cert.issuer?.CN || 'Unknown',
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        protocol,
        authorized,
        authorizationError: socket.authorizationError || null
      });
      socket.destroy();
    }
  );

  socket.on('error', (err) => {
    res.status(502).json({ error: 'Could not establish TLS connection: ' + err.message });
  });
  socket.on('timeout', () => {
    socket.destroy();
    res.status(504).json({ error: 'TLS connection timed out.' });
  });
});

/* ============================================
   SECURITY HEADERS + REDIRECT CHAIN + CORS HEADERS
   Server-side fetch bypasses CORS restrictions that
   block reading these headers from browser JS directly.

   Used by: Security Headers Scanner, Clickjacking Checker,
   and CORS Checker tools on the frontend.
   ============================================ */
app.get('/security-headers', async (req, res) => {
  let target = req.query.url || '';
  if (!target) return res.status(400).json({ error: 'url query param required' });
  if (!/^https?:\/\//i.test(target)) target = 'https://' + target;

  const redirectChain = [];
  let current = target;
  let finalResponse = null;

  try {
    for (let i = 0; i < 10; i++) {
      const response = await fetch(current, { redirect: 'manual' });
      redirectChain.push({ status: response.status, url: current });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) break;
        current = new URL(location, current).toString();
        continue;
      }

      finalResponse = response;
      break;
    }

    if (!finalResponse) {
      return res.status(502).json({ error: 'Too many redirects or no final response.' });
    }

    const headers = Object.fromEntries(finalResponse.headers.entries());

    const securityHeaders = {
      'strict-transport-security': headers['strict-transport-security'] || null,
      'content-security-policy': headers['content-security-policy'] || null,
      'x-frame-options': headers['x-frame-options'] || null,
      'x-content-type-options': headers['x-content-type-options'] || null,
      'referrer-policy': headers['referrer-policy'] || null,
      'permissions-policy': headers['permissions-policy'] || null
    };

    // Added for the CORS Checker tool
    const corsHeaders = {
      'access-control-allow-origin': headers['access-control-allow-origin'] || null,
      'access-control-allow-credentials': headers['access-control-allow-credentials'] || null,
      'access-control-allow-methods': headers['access-control-allow-methods'] || null,
      'access-control-allow-headers': headers['access-control-allow-headers'] || null,
      'access-control-expose-headers': headers['access-control-expose-headers'] || null
    };

    res.json({
      finalUrl: current,
      status: finalResponse.status,
      redirectChain,
      server: headers['server'] || null,
      contentType: headers['content-type'] || null,
      securityHeaders,
      corsHeaders
    });
  } catch (err) {
    res.status(502).json({ error: 'Request failed: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Port Scanner backend running at http://localhost:${PORT}`);
});