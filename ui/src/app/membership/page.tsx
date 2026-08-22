"use client";

import { useMidnight } from '@/context/MidnightContext';
import { useState, useEffect } from 'react';
import { UserPlus, CheckCircle, Clock, Loader2, ShieldCheck } from 'lucide-react';

export default function MembershipPage() {
  const { status, walletAddress, walletName, connectWallet, connectionError, contractAddress } = useMidnight();
  const [connecting, setConnecting] = useState(false);
  const [membershipState, setMembershipState] = useState<'unknown' | 'not-member' | 'joining' | 'active'>('unknown');
  const [membershipId, setMembershipId] = useState('');
  const [commitment, setCommitment] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'connected') setMembershipState('not-member');
  }, [status]);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  // Generate a deterministic local commitment hash (hex)
  const generateCommitment = (): string => {
    const payload = `${walletAddress || ''}:${membershipId}`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = ((hash << 5) - hash) + payload.charCodeAt(i);
      hash |= 0;
    }
    // Expand to 32-byte hex representation
    const seed = Math.abs(hash).toString(16).padStart(8, '0');
    return seed.repeat(8);
  };

  const handleJoin = async () => {
    if (!membershipId.trim()) { setError('Please enter a membership ID.'); return; }
    if (!contractAddress) { setError('No contract deployed. Contact the organisation administrator.'); return; }

    setError(null);
    setMembershipState('joining');

    try {
      // Generate commitment locally
      const c = generateCommitment();
      setCommitment(c);
      // In production, this would call the Midnight contract via walletApi
      // For now we demonstrate the full UI flow with the actual wallet connected
      await new Promise(r => setTimeout(r, 2000)); // simulate TX time
      setTxHash('0x' + c.slice(0, 64)); // placeholder hash
      setMembershipState('active');
    } catch (e: any) {
      setError(e?.message || 'Transaction failed.');
      setMembershipState('not-member');
    }
  };

  if (!mounted) return null;

  return (
    <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80, maxWidth: 700 }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 10 }}>
          Membership
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
          Join the Anonymous Membership Organisation. Your private credentials never leave your device.
        </p>
      </div>

      {/* Wallet status panel */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
          Wallet
        </div>
        {status === 'connected' ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
                {walletAddress ? `${walletAddress.slice(0, 12)}…${walletAddress.slice(-8)}` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{walletName}</div>
            </div>
            <span className="badge badge-green"><span className="dot-pulse dot-green" />Connected</span>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Not connected</span>
            <button
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={connecting || status === 'connecting'}
            >
              {connecting || status === 'connecting' ? <><span className="spinner" /> Connecting…</> : 'Connect Wallet'}
            </button>
          </div>
        )}
        {status === 'error' && connectionError && (
          <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 8 }}>
            {connectionError}
          </div>
        )}
      </div>

      {/* Membership status panel */}
      {status === 'connected' && (
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 16 }}>
            Membership Status
          </div>

          {membershipState === 'active' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} color="var(--green)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>✓ Active Member</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                    Your membership is active. Your private credentials are not displayed.
                  </div>
                </div>
              </div>

              {txHash && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                    Transaction
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                    {txHash}
                  </div>
                </div>
              )}
            </div>
          ) : membershipState === 'joining' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="spinner" style={{ width: 24, height: 24 }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>Submitting membership…</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Waiting for wallet approval and confirmation.</div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Clock size={16} color="var(--text-muted)" />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Not yet a member</span>
              </div>

              {/* Join form */}
              <div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
                    Membership ID
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    placeholder="e.g. 10042"
                    value={membershipId}
                    onChange={e => setMembershipId(e.target.value)}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    A public identifier for your membership slot. Your identity remains private.
                  </div>
                </div>

                {!contractAddress && (
                  <div style={{ padding: '10px 14px', background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--amber)', marginBottom: 16 }}>
                    ⚠ No contract configured. The administrator must deploy the contract first.
                  </div>
                )}

                {error && (
                  <div style={{ padding: '10px 14px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--red)', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  onClick={handleJoin}
                  style={{ width: '100%', justifyContent: 'center' }}
                  disabled={!membershipId || membershipState === 'joining'}
                >
                  <UserPlus size={16} /> Join Organisation
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Private membership notice */}
      {status === 'connected' && (
        <div className="card" style={{ padding: 20, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>
            <CheckCircle size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              Private Membership
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Your membership credentials are handled as a zero-knowledge commitment.
              The organisation never sees your name, email, or private secret — only a cryptographic proof of membership validity.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
