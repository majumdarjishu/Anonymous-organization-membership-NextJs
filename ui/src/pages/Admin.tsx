import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function Admin() {
  const { walletAddress, isAdmin } = useWallet();
  const [commitmentInput, setCommitmentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p className="desc">You must be the admin to access this panel.</p>
      </div>
    );
  }

  const handleAddCommitment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitmentInput) return;
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Commitment ${commitmentInput.slice(0, 10)}... added to allowlist!`);
      setCommitmentInput('');
    } catch (err) {
      alert('Transaction failed. Are you the admin?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="header-section">
        <h1>Admin Management</h1>
        <p className="subtitle">Manage the private allowlist.</p>
      </div>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Add Commitment</h2>
        <p className="desc">
          Add member public commitments to the allowlist. This allows them to generate a ZK proof later to verify their membership anonymously.
        </p>
        <form onSubmit={handleAddCommitment}>
          <input 
            type="text" 
            placeholder="32-byte Commitment (hex)" 
            value={commitmentInput}
            onChange={(e) => setCommitmentInput(e.target.value)}
            disabled={isSubmitting}
            style={{ marginBottom: '1.5rem' }}
          />
          <button type="submit" disabled={isSubmitting || !commitmentInput} style={{ width: '100%' }}>
            {isSubmitting ? 'Processing Transaction on Midnight...' : 'Add to Allowlist'}
          </button>
        </form>
      </div>
    </>
  );
}
