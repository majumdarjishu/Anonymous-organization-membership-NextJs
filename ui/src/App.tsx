import { useState, useEffect } from 'react';
import './index.css';

// Contract configuration
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'undeployed';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<any>;
      };
    };
  }
}

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('disconnected');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Form states
  const [commitmentInput, setCommitmentInput] = useState('');
  const [secretInput, setSecretInput] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);

  useEffect(() => {
    // Check if wallet is already connected
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (window.midnight?.mnLace) {
      try {
        // Attempt to connect silently if possible, or just check existence
        setStatus('ready to connect');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const connectWallet = async () => {
    try {
      setStatus('connecting');
      if (!window.midnight?.mnLace) {
        alert('Lace wallet with Midnight plugin not found. Please install the Lace Midnight extension.');
        setStatus('error');
        return;
      }
      const api = await window.midnight.mnLace.enable();
      
      // Stub: in a full app, we would initialize the Midnight providers here.
      // For this demo UI, we'll simulate the connection.
      const address = await api.state().then((s: any) => s?.address || 'mn1...mock');
      setWalletAddress(address);
      setStatus('connected');
      
      // Mock admin check
      setIsAdmin(true); 
      
    } catch (err) {
      console.error('Connection failed:', err);
      setStatus('error');
    }
  };

  const handleAddCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentInput) return;
    setIsSubmitting(true);
    
    try {
      console.log('Adding commitment:', commitmentInput);
      // Stub for contract call: await contract.callTx.addAllowedCommitment(commitmentBytes);
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Commitment ${commitmentInput.slice(0, 10)}... added to allowlist!`);
      setCommitmentInput('');
    } catch (err) {
      alert('Transaction failed. Are you the admin?');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput) return;
    setIsSubmitting(true);
    
    try {
      console.log('Joining with secret:', secretInput);
      // Stub for contract call: await contract.callTx.joinOrganization();
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Successfully joined the organization anonymously!');
      setMemberCount(prev => prev + 1);
      setSecretInput('');
    } catch (err) {
      alert('Transaction failed. Is your commitment in the allowlist?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Anonymous Org</h1>
      <p style={{ color: '#8b949e', marginBottom: '2rem' }}>
        Private Allowlist Access via Zero-Knowledge Proofs
      </p>

      <div className="card">
        <div className="flex-center" style={{ marginBottom: '1rem' }}>
          <span className={`status-badge ${status === 'connected' ? 'connected' : status === 'error' ? 'error' : ''}`}>
            {status === 'connected' ? `Connected: ${walletAddress?.slice(0, 8)}...` : 
             status === 'connecting' ? 'Connecting...' : 'Not Connected'}
          </span>
          <span className="status-badge">Network: {NETWORK}</span>
        </div>
        
        {!walletAddress ? (
          <button onClick={connectWallet}>Connect Lace Wallet</button>
        ) : (
          <button className="secondary" onClick={() => setWalletAddress(null)}>Disconnect</button>
        )}
      </div>

      {walletAddress && (
        <div className="grid">
          {isAdmin && (
            <div className="card">
              <h2>Admin Panel</h2>
              <p style={{ fontSize: '0.9em', color: '#8b949e' }}>
                Add members to the allowlist using their public commitment.
              </p>
              <form onSubmit={handleAddCommitment}>
                <input 
                  type="text" 
                  placeholder="32-byte Commitment (hex)" 
                  value={commitmentInput}
                  onChange={(e) => setCommitmentInput(e.target.value)}
                  disabled={isSubmitting}
                />
                <br />
                <button type="submit" disabled={isSubmitting || !commitmentInput}>
                  {isSubmitting ? 'Processing...' : 'Add to Allowlist'}
                </button>
              </form>
            </div>
          )}

          <div className="card">
            <h2>Join Organization</h2>
            <p style={{ fontSize: '0.9em', color: '#8b949e' }}>
              Prove membership anonymously. Your secret is never revealed.
            </p>
            <form onSubmit={handleJoin}>
              <input 
                type="password" 
                placeholder="Your secret pre-image" 
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                disabled={isSubmitting}
              />
              <br />
              <button type="submit" disabled={isSubmitting || !secretInput}>
                {isSubmitting ? 'Generating ZK Proof...' : 'Join Anonymously'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>Public Ledger State</h2>
        <div className="data-row">
          <span>Contract Address:</span>
          <span style={{ fontFamily: 'monospace', color: '#58a6ff' }}>
            {CONTRACT_ADDRESS || 'Not deployed yet'}
          </span>
        </div>
        <div className="data-row">
          <span>Total Anonymous Members:</span>
          <span style={{ fontWeight: 'bold' }}>{memberCount}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
