"use client";

import Link from 'next/link';
import { useMidnight } from '@/context/MidnightContext';
import { Lock, EyeOff, CheckCircle, ArrowRight, Zap, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { status, connectWallet, connectionError } = useMidnight();
  const [mounted, setMounted] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  return (
    <div className="page-container" style={{ paddingTop: 80, paddingBottom: 80 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 80px' }}>
        <div className="badge badge-purple" style={{ marginBottom: 24, display: 'inline-flex' }}>
          <Zap size={12} />
          Built on Midnight Network · Zero-Knowledge Privacy
        </div>
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          fontWeight: 900, lineHeight: 1.1,
          marginBottom: 24, letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
        }}>
          Private Membership.{' '}
          <span className="text-gradient">Public Trust.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40 }}>
          Join an organisation and prove your membership without revealing your identity.
          Powered by Midnight Network's zero-knowledge proof technology.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {mounted && status === 'connected' ? (
            <Link href="/dashboard" className="btn btn-primary btn-lg">
              Open Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <button
              className="btn btn-primary btn-lg"
              onClick={handleConnect}
              disabled={connecting || status === 'connecting'}
            >
              {(connecting || status === 'connecting') ? (
                <><span className="spinner" /> Connecting…</>
              ) : (
                <><Shield size={18} /> Connect Wallet</>
              )}
            </button>
          )}
          <Link href="/membership" className="btn btn-outline btn-lg">
            Explore Membership
          </Link>
        </div>

        {status === 'error' && connectionError && (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10, fontSize: 13, color: 'var(--red)', textAlign: 'left',
          }}>
            {connectionError}
          </div>
        )}
      </div>

      {/* Feature cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 20, marginBottom: 80,
      }}>
        {[
          {
            icon: <Lock size={22} />,
            color: '#7c5cfc',
            title: 'Private Identity',
            desc: 'Your sensitive membership information — name, ID, credentials — stays entirely private and never leaves your device.',
          },
          {
            icon: <EyeOff size={22} />,
            color: '#60a5fa',
            title: 'Zero-Knowledge Proof',
            desc: 'Cryptographically prove what matters without revealing unnecessary information. Privacy by design, not as an afterthought.',
          },
          {
            icon: <CheckCircle size={22} />,
            color: '#22c55e',
            title: 'Public Verification',
            desc: 'The organisation can verify valid membership on-chain without ever seeing your private details. Trust without exposure.',
          },
        ].map((f, i) => (
          <div key={i} className="card" style={{ padding: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${f.color}22`,
              border: `1px solid ${f.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: f.color, marginBottom: 20,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>How it works</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>
          Four simple steps from wallet to verified member.
        </p>
        <div className="step-flow" style={{ textAlign: 'left' }}>
          {[
            { n: 1, label: 'Connect Wallet', desc: 'Connect your Lace or 1AM wallet to identify yourself to the application.' },
            { n: 2, label: 'Become a Member', desc: 'Submit your membership commitment to the Midnight smart contract.' },
            { n: 3, label: 'Generate Proof', desc: 'Your device generates a zero-knowledge proof of valid membership.' },
            { n: 4, label: 'Verify Privately', desc: 'Present your proof on-chain. Verified without revealing your identity.' },
          ].map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-connector">
                <div className="step-dot" style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  color: '#a78bfa',
                }}>
                  {step.n}
                </div>
                {i < 3 && <div className="step-line" />}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: i < 3 ? 0 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: i < 3 ? 16 : 0 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 80, paddingTop: 32,
        borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Anonymous Membership Organisation · Built on Midnight Network
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13 }}>
          <a
            href="https://github.com/majumdarjishu/Anonymous-organization-membership-NextJs"
            target="_blank" rel="noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
          >
            GitHub
          </a>
          <span style={{ color: 'var(--text-muted)' }}>Midnight Preprod</span>
        </div>
      </div>
    </div>
  );
}
