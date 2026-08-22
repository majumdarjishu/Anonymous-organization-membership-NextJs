"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMidnight } from '@/context/MidnightContext';
import { useState } from 'react';
import { Shield, Menu, X, Loader2 } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/membership', label: 'Membership' },
  { href: '/verify', label: 'Verify' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const { walletAddress, walletName, status, connectionError, connectWallet, disconnectWallet } = useMidnight();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleConnectClick = async () => {
    setShowError(false);
    await connectWallet();
    if (status === 'error') setShowError(true);
  };

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
    : null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid var(--border)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
    }}>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 32 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c5cfc, #60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
            AnonOrg
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', gap: 4, flex: 1 }} className="desktop-nav">
          {NAV_LINKS.map(link => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.color = 'var(--text-secondary)'; }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Wallet Button */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {status === 'connected' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {walletName}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {shortAddr}
                </div>
              </div>
              <div className="badge badge-green">
                <span className="dot-pulse dot-green" />
                Connected
              </div>
              <button className="btn btn-ghost btn-sm" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleConnectClick}
                disabled={status === 'connecting'}
              >
                {status === 'connecting' ? (
                  <><span className="spinner" /> Connecting…</>
                ) : 'Connect Wallet'}
              </button>
              {status === 'error' && connectionError && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, padding: '12px 16px', minWidth: 280, zIndex: 200,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
                    ⚠ Connection Failed
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {connectionError}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-sm mobile-menu-btn"
          onClick={() => setMobileOpen(o => !o)}
          style={{ display: 'none' }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          borderTop: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.95)',
          padding: '16px 24px',
        }}>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block', padding: '10px 0', fontSize: 15,
                color: pathname === link.href ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none', fontWeight: 500,
                borderBottom: '1px solid var(--border)',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 16 }}>
            {status === 'connected' ? (
              <button className="btn btn-danger btn-sm" onClick={disconnectWallet}>
                Disconnect
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleConnectClick} disabled={status === 'connecting'} style={{ width: '100%' }}>
                {status === 'connecting' ? 'Connecting…' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
