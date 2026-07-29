(function () {
  const searchInput = document.getElementById('portSearchInput');
  const grid = document.getElementById('portTableGrid');

  const PORTS = [
    [20, 'FTP-DATA', 'File Transfer Protocol (data)'],
    [21, 'FTP', 'File Transfer Protocol (control)'],
    [22, 'SSH', 'Secure Shell'],
    [23, 'Telnet', 'Unencrypted remote login'],
    [25, 'SMTP', 'Email sending'],
    [53, 'DNS', 'Domain Name System'],
    [67, 'DHCP', 'Dynamic Host Configuration (server)'],
    [68, 'DHCP', 'Dynamic Host Configuration (client)'],
    [69, 'TFTP', 'Trivial File Transfer Protocol'],
    [80, 'HTTP', 'Web traffic (unencrypted)'],
    [110, 'POP3', 'Email retrieval'],
    [119, 'NNTP', 'Usenet news'],
    [123, 'NTP', 'Network Time Protocol'],
    [135, 'MSRPC', 'Microsoft RPC'],
    [137, 'NetBIOS', 'Name Service'],
    [138, 'NetBIOS', 'Datagram Service'],
    [139, 'NetBIOS', 'Session Service'],
    [143, 'IMAP', 'Email retrieval (sync)'],
    [161, 'SNMP', 'Network device monitoring'],
    [162, 'SNMP', 'Trap notifications'],
    [179, 'BGP', 'Border Gateway Protocol (routing)'],
    [389, 'LDAP', 'Directory services'],
    [443, 'HTTPS', 'Web traffic (encrypted)'],
    [445, 'SMB', 'Windows file sharing'],
    [465, 'SMTPS', 'Encrypted email sending'],
    [514, 'Syslog', 'System logging'],
    [587, 'SMTP', 'Email submission (auth)'],
    [636, 'LDAPS', 'Encrypted directory services'],
    [853, 'DNS-over-TLS', 'Encrypted DNS'],
    [989, 'FTPS', 'FTP (data, encrypted)'],
    [990, 'FTPS', 'FTP (control, encrypted)'],
    [993, 'IMAPS', 'Encrypted email retrieval'],
    [995, 'POP3S', 'Encrypted email retrieval'],
    [1433, 'MSSQL', 'Microsoft SQL Server'],
    [1521, 'Oracle DB', 'Oracle Database'],
    [1723, 'PPTP', 'VPN (legacy, insecure)'],
    [2049, 'NFS', 'Network File System'],
    [2082, 'cPanel', 'Web hosting control panel'],
    [2083, 'cPanel', 'Web hosting control panel (SSL)'],
    [3000, 'Dev Server', 'Common Node.js/React dev port'],
    [3268, 'LDAP GC', 'Active Directory Global Catalog'],
    [3306, 'MySQL', 'MySQL Database'],
    [3389, 'RDP', 'Windows Remote Desktop'],
    [4000, 'Dev Server', 'Common custom backend dev port'],
    [5000, 'Dev Server', 'Common Flask/dev port'],
    [5432, 'PostgreSQL', 'PostgreSQL Database'],
    [5900, 'VNC', 'Remote desktop (VNC)'],
    [6379, 'Redis', 'Redis in-memory database'],
    [6660, 'IRC', 'Internet Relay Chat'],
    [8000, 'HTTP-Alt', 'Alternate web server port'],
    [8080, 'HTTP-Proxy', 'Alternate web / proxy port'],
    [8443, 'HTTPS-Alt', 'Alternate HTTPS port'],
    [9200, 'Elasticsearch', 'Elasticsearch REST API'],
    [11211, 'Memcached', 'Memcached caching server'],
    [27017, 'MongoDB', 'MongoDB Database']
  ];

  function render(filter = '') {
    const f = filter.toLowerCase().trim();
    const filtered = PORTS.filter(([port, name, desc]) =>
      String(port).includes(f) || name.toLowerCase().includes(f) || desc.toLowerCase().includes(f)
    );

    grid.innerHTML = filtered.map(([port, name, desc]) => `
      <div style="display:flex;gap:1rem;align-items:center;background:var(--bg-panel-raised);border-radius:6px;padding:0.6rem 1rem;">
        <span style="color:var(--cyan);font-weight:700;min-width:60px;">${port}</span>
        <span style="color:var(--warning);min-width:110px;">${name}</span>
        <span style="color:var(--text-dim);">${desc}</span>
      </div>
    `).join('') || '<p style="color:var(--text-dim);">No matches found.</p>';
  }

  searchInput.addEventListener('input', () => render(searchInput.value));
  render();
})();