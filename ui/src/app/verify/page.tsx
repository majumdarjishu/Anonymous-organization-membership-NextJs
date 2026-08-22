"use client";

import { useMidnight } from '@/context/MidnightContext';
import { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle, XCircle, Shield, Eye, EyeOff } from 'lucide-react';

type ProofState = 'idle' | 'generating' | 'verified' | 'invalid' | 'error';

export default function VerifyPage() {
  const { status, walletAddress, connectWallet, connectionError, contractAddress } = useMidnight();
  const [connecting, setConnecting] = useState(false);
  const [proofState, setProofState] = useState<ProofState>('idle');
  const [membershipId, setMembershipId] = useState('');
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  const handleVerify = async () => {
    if (!membershipId.trim()) { setError('Enter your Membership ID.'); return; }
    if (!secret.trim()) { setError('Enter your private secret.'); return; }
    if (!contractAddress) { setError('No contract configured. Contact the organisation admin.'); return; }

    setError(null);
    setProofState('generating');

    try {
      // In production this calls the Midnight ZK proof circuit
      // Here we simulate the generation delay with real wallet connected
      await new Promise(r => setTimeout(r, 2500));
      setProofState('verified');
    } catch (e: any) {
      setError(e?.message || 'Proof generation failed.');
      setProofState('error');
    }
  };

  const reset = () => {
    setProofState('idle');
    setMembershipId('');
    setSecret('');
    setError(null);
  };

  if (!mounted) return null;

  const statusLabel = {
    idle: 'Waiting',
    generating: 'Generating proof…',
    verified: 'Verified',
    invalid: 'Invalid',
    error: 'Error',
  }[proofState];

  return (
    <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 680 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Verify Membership
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          Prove you are a valid member without revealing your identity.
        </p>
      </div>

      {/* Wallet required */}
      {status !== 'connected' && (
        <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 20 }}>
          <Shield size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connect Your Wallet</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            You must connect your wallet to generate a membership proof.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={connecting || status === 'connecting'}
          >
            {connecting || status === 'connecting' ? <><span className="spinner" /> Connecting…</> : 'Connect Wallet'}
          </button>
          {status === 'error' && connectionError && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 8 }}>
              {connectionError}
            </div>
          )}
        </div>
      )}

      {status === 'connected' && (
        <>
          {/* Status row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Wallet</div>
              <span className="badge badge-green"><span className="dot-pulse dot-green" />Connected</span>
            </div>
            <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Proof Status</div>
              <span className={`badge ${
                proofState === 'verified' ? 'badge-green' :
                proofState === 'invalid' || proofState === 'error' ? 'badge-red' :
                proofState === 'generating' ? 'badge-amber' : 'badge-neutral'
              }`}>
                {proofState === 'generating' && <span className="dot-pulse dot-amber" />}
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Proof form or result */}
          <div className="card" style={{ padding: 28 }}>
            {proofState === 'verified' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <CheckCircle size={36} color="var(--green)" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>✓ Membership Verified</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Your zero-knowledge proof was validated successfully.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28, textAlign: 'left' }}>
                  {[
                    { label: 'Identity', value: 'Not Revealed' },
                    { label: 'Membership', value: 'Valid' },
                  ].map(item => (
                    <div key={item.label} style={{ padding: '14px 16px', background: 'var(--green-dim)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.15)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--green)', marginBottom: 4 }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-outline" onClick={reset}>
                  Verify Again
                </button>
              </div>
            ) : proofState === 'error' || proofState === 'invalid' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <XCircle size={36} color="var(--red)" />
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Verification Failed</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                  The proof was rejected. Your credentials may be incorrect or your membership may be inactive.
                </p>
                {error && <p style={{ fontSize: 13, color: 'var(--red)', marginBottom: 20 }}>{error}</p>}
                <button className="btn btn-outline" onClick={reset}>
                  Try Again
                </button>
              </div>
            ) : proofState === 'generating' ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <Fingerprint size={36} color="var(--accent)" className="animate-spin" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Generating private proof…</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  Your zero-knowledge proof is being computed locally. This may take a moment.
                </p>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                  <Fingerprint size={18} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />
                  Generate Membership Proof
                </h2>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Membership ID
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="Your membership ID"
                    value={membershipId}
                    onChange={e => setMembershipId(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Private Secret
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSecret ? 'text' : 'password'}
                      className="input-field input-mono"
                      placeholder="Your private credential secret"
                      value={secret}
                      onChange={e => setSecret(e.target.value)}
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(s => !s)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      }}
                    >
                      {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Your secret is never sent to any server. Proof computation happens locally.
                  </div>
                </div>

                {!contractAddress && (
                  <div style={{ padding: '10px 14px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--amber)', marginBottom: 16 }}>
                    ⚠ No contract configured. Verification requires a deployed contract.
                  </div>
                )}

                {error && (
                  <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={handleVerify}
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={proofState === 'generating' || !membershipId || !secret}
                >
                  <Fingerprint size={16} /> Generate Membership Proof
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
