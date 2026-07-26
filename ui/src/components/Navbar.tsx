import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function Navbar() {
  const { walletAddress, status, connectWallet, disconnectWallet, isAdmin } = useWallet();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/join', label: 'Join Organization' },
  ];
  
  if (isAdmin) {
    navLinks.push({ path: '/admin', label: 'Admin Panel' });
  }

  return (
    <nav className="navbar">
      <div className="brand">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
        AnonOrg
      </div>
      
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, marginLeft: '3rem' }}>
        {navLinks.map(link => (
          <Link 
            key={link.path} 
            to={link.path}
            style={{
              textDecoration: 'none',
              fontWeight: 500,
              color: location.pathname === link.path ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: location.pathname === link.path ? '2px solid var(--primary)' : '2px solid transparent',
              padding: '0.5rem 0',
              transition: 'color 0.2s'
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span className={`status-badge ${status === 'connected' ? 'connected' : status === 'error' ? 'error' : ''}`}>
          {status === 'connected' ? `Connected` : status === 'connecting' ? 'Connecting...' : 'Not Connected'}
        </span>
        {!walletAddress ? (
          <button onClick={connectWallet}>Connect Lace</button>
        ) : (
          <button className="outline" onClick={disconnectWallet}>Disconnect</button>
        )}
      </div>
    </nav>
  );
}
