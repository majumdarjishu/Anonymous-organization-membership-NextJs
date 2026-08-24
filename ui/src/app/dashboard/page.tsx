"use client";

import { useMidnight } from '@/context/MidnightContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Shield, Activity, Key, ArrowRight, Server, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { status, walletAddress, walletName, coinPublicKey, network, contractAddress, connectWallet, connectionError, deployContractAction, hasShieldedAccount } = useMidnight();
  const [connecting, setConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStatus, setDeployStatus] = useState<'idle' | 'waiting' | 'submitted' | 'done' | 'error'>('idle');
  const [deployedAddress, setDeployedAddress] = useState<string | null>(contractAddress);

  // Keep deployedAddress in sync with context (e.g. after localStorage hydration)
  useEffect(() => {
    if (contractAddress && !deployedAddress) setDeployedAddress(contractAddress);
  }, [contractAddress]); // eslint-disable-line react-hooks/exhaustive-deps
  const [deployError, setDeployError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const handleConnect = async () => {
    setConnecting(true);
    await connectWallet();
    setConnecting(false);
  };

  const handleDeploy = async () => {
    setDeployError(null);
    setDeployStatus('waiting');
    setDeploying(true);
    try {
      const addr = await deployContractAction();
      setDeployStatus('done');
      setDeployedAddress(addr);
    } catch (e: any) {
      console.error(e);
      setDeployError(e?.message || 'Deployment failed. Check wallet and balance.');
      setDeployStatus('error');
    } finally {
      setDeploying(false);
    }
  };

  if (!mounted) return null;

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 8)}…${walletAddress.slice(-6)}`
    : '—';

  if (status !== 'connected') {
    return (
      <div className="page-container" style={{ paddingTop: 80, paddingBottom: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, width: '100%' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--accent-dim)', border: '1px solid rgba(124,92,252,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
          }}>
            <Wallet size={28} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: 15 }}>
            Connect your wallet to access your membership control panel.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={connecting || status === 'connecting'}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {connecting || status === 'connecting' ? <><span className="spinner" /> Connecting…</> : 'Connect Wallet'}
          </button>
          {status === 'error' && connectionError && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--red)', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 8 }}>
              {connectionError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 6 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your membership control panel.</p>
        </div>
        <span className="badge badge-green" style={{ marginTop: 8 }}>
          <span className="dot-pulse dot-green" />Session Active
        </span>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 16, marginBottom: 32,
      }}>
        {/* Wallet card */}
        <div className="card" style={{ padding: 20, borderLeft: '3px solid var(--accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Wallet</div>
            <Wallet size={16} color="var(--accent)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', marginBottom: 4 }}>
            {shortAddr}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{walletName}</div>
        </div>

        {/* Network card */}
        <div className="card" style={{ padding: 20, borderLeft: '3px solid #60a5fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Network</div>
            <Activity size={16} color="#60a5fa" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{network.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Midnight blockchain</div>
        </div>

        {/* Membership card */}
        <div className="card" style={{ padding: 20, borderLeft: '3px solid #22c55e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Membership</div>
            <Shield size={16} color="#22c55e" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {deployedAddress ? 'Active' : 'Pending'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {deployedAddress ? 'Contract deployed' : 'Contract not deployed'}
          </div>
        </div>

        {/* Contract card */}
        <div className="card" style={{ padding: 20, borderLeft: '3px solid #a78bfa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Contract</div>
            <Key size={16} color="#a78bfa" />
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: deployedAddress ? 'var(--text-primary)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', marginBottom: 4 }}>
            {deployedAddress ? (
              <a 
                href={`https://explorer.preprod.midnight.network/address/${deployedAddress}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ 
                  color: '#fff', 
                  textDecoration: 'none', 
                  padding: '6px 10px', 
                  background: 'var(--accent)', 
                  borderRadius: 6, 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(124, 92, 252, 0.2)'
                }}
              >
                {deployedAddress.slice(0, 10)}…{deployedAddress.slice(-8)} ↗
              </a>
            ) : 'Not configured'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Organisation registry</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        <Link href="/membership" className="card card-interactive" style={{ padding: 24, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Manage Membership</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Join or update your membership status</div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" />
        </Link>
        <Link href="/verify" className="card card-interactive" style={{ padding: 24, textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>Verify Membership</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Generate a zero-knowledge membership proof</div>
          </div>
          <ArrowRight size={20} color="var(--text-muted)" />
        </Link>
      </div>

      {/* Deploy panel */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Server size={20} color="var(--accent)" />
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Contract Deployment</h2>
        </div>

        {/* Readiness checklist */}
        <div style={{ marginBottom: 24 }}>
          {[
            { label: 'Wallet', ok: status === 'connected', value: status === 'connected' ? `Connected (${walletName})` : 'Not connected' },
            { label: 'Network', ok: true, value: network.name },
            { label: 'Contract', ok: true, value: 'Anonymous Membership Organisation (compiled)' },
            { label: 'Contract Address', ok: !!deployedAddress, value: deployedAddress ? `${deployedAddress.slice(0, 24)}…` : 'Not deployed' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.ok ? 'var(--green)' : 'var(--amber)', flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: 'var(--text-muted)', width: 120, flexShrink: 0, fontWeight: 600 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: item.label === 'Contract Address' ? 'JetBrains Mono, monospace' : 'inherit' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Deploy button and status */}
        {deployStatus === 'idle' && (
          <button
            className="btn btn-primary"
            onClick={handleDeploy}
            disabled={status !== 'connected'}
          >
            <Server size={16} /> Deploy Contract
          </button>
        )}

        {deployStatus === 'waiting' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
            <span className="spinner" /> Waiting for wallet approval…
          </div>
        )}
        {deployStatus === 'submitted' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
            <span className="spinner" /> Transaction submitted. Waiting for confirmation…
          </div>
        )}
        {deployStatus === 'done' && (
          <div style={{ padding: '14px 18px', background: 'var(--green-dim)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, fontSize: 14 }}>
            <div style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>✓ Contract Deployed</div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Set <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>NEXT_PUBLIC_CONTRACT_ADDRESS</code> in your <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: 'var(--accent)' }}>.env.local</code> to the deployed address.
            </div>
          </div>
        )}
        {!hasShieldedAccount && status === 'connected' && (
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 10, fontSize: 13, color: '#f59e0b' }}>
            <strong>⚠ No shielded account detected.</strong> Your wallet is connected in unshielded mode.
            Open your Lace / 1AM extension → switch to <strong>Midnight Preprod</strong> → enable the <strong>Shielded account</strong>, then reconnect.
          </div>
        )}
        {deployStatus === 'error' && (
          <div style={{ padding: '14px 18px', background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, fontSize: 13, color: 'var(--red)', whiteSpace: 'pre-line' }}>
            {deployError}
          </div>
        )}
      </div>
    </div>
  );
}
