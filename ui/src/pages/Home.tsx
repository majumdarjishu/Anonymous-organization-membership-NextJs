import { useWallet } from '../context/WalletContext';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const NETWORK = import.meta.env.VITE_NETWORK || 'undeployed';

export function Home() {
  const { walletAddress, memberCount, connectWallet } = useWallet();

  return (
    <>
      <div className="header-section">
        <h1>Private Allowlist Access</h1>
        <p className="subtitle">Zero-Knowledge Proof organization membership on the Midnight Network.</p>
      </div>

      {!walletAddress ? (
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Welcome to Jishu Org</h2>
          <p className="desc" style={{ marginBottom: '2rem' }}>
            Please connect your Lace wallet with the Midnight plugin enabled to get started.
          </p>
          <button onClick={connectWallet} style={{ width: '100%' }}>Connect Lace Wallet</button>
        </div>
      ) : (
        <div className="grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2>Public Ledger Overview</h2>
            <div className="data-row">
              <span className="data-label">Contract Address</span>
              <span className="address-pill">
                {CONTRACT_ADDRESS || 'Not deployed yet'}
              </span>
            </div>
            <div className="data-row">
              <span className="data-label">Active Network</span>
              <span className="data-value" style={{ textTransform: 'capitalize' }}>{NETWORK}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Total Anonymous Members</span>
              <span className="data-value">{memberCount}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Your Wallet Address</span>
              <span className="address-pill">{walletAddress}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
