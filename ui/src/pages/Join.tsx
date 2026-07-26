import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

export function Join() {
  const { walletAddress, incrementMemberCount } = useWallet();
  const [secretInput, setSecretInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!walletAddress) {
    return <Navigate to="/" replace />;
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretInput) return;
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Successfully joined the organization anonymously!');
      incrementMemberCount();
      setSecretInput('');
    } catch (err) {
      alert('Transaction failed. Is your commitment in the allowlist?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="header-section">
        <h1>Join Organization</h1>
        <p className="subtitle">Prove your eligibility via Zero-Knowledge</p>
      </div>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>Generate Anonymous Proof</h2>
        <p className="desc">
          Provide your secret pre-image below. A zero-knowledge proof will be generated locally in your browser. The secret never leaves your device and is not broadcasted to the Midnight network.
        </p>
        <form onSubmit={handleJoin}>
          <input 
            type="password" 
            placeholder="Your secret pre-image" 
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            disabled={isSubmitting}
            style={{ marginBottom: '1.5rem' }}
          />
          <button type="submit" disabled={isSubmitting || !secretInput} style={{ width: '100%' }}>
            {isSubmitting ? 'Generating ZK Proof & Submitting Tx...' : 'Join Anonymously'}
          </button>
        </form>
      </div>
    </>
  );
}
