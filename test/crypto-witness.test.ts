import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';

/**
 * Simulates persistentHash<Bytes<32>> from Compact standard library for local testing.
 */
function persistentHash(data: Buffer | string): Buffer {
  const input = typeof data === 'string' ? Buffer.from(data, 'hex') : data;
  return createHash('sha256').update(input).digest();
}

/**
 * Derives commitment from secretWitness: persistentHash(secretWitness)
 */
function deriveCommitment(secretWitness: Buffer): Buffer {
  return persistentHash(secretWitness);
}

/**
 * Derives nullifier from secretWitness: persistentHash(persistentHash(secretWitness))
 */
function deriveNullifier(secretWitness: Buffer): Buffer {
  return persistentHash(persistentHash(secretWitness));
}

describe('Zero-Knowledge Witness Cryptographic Primitives', () => {
  it('should deterministically derive commitment from secret witness', () => {
    const secret = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const commitment1 = deriveCommitment(secret);
    const commitment2 = deriveCommitment(secret);

    assert.equal(commitment1.length, 32, 'Commitment must be 32 bytes');
    assert.equal(commitment1.toString('hex'), commitment2.toString('hex'), 'Commitment must be deterministic');
  });

  it('should deterministically derive nullifier from secret witness', () => {
    const secret = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const nullifier1 = deriveNullifier(secret);
    const nullifier2 = deriveNullifier(secret);

    assert.equal(nullifier1.length, 32, 'Nullifier must be 32 bytes');
    assert.equal(nullifier1.toString('hex'), nullifier2.toString('hex'), 'Nullifier must be deterministic');
  });

  it('should ensure commitment and nullifier are distinct outputs for the same secret', () => {
    const secret = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const commitment = deriveCommitment(secret);
    const nullifier = deriveNullifier(secret);

    assert.notEqual(
      commitment.toString('hex'),
      nullifier.toString('hex'),
      'Commitment and Nullifier must be distinct hashes'
    );
  });

  it('should produce distinct commitments and nullifiers for different secrets', () => {
    const secretA = randomBytes(32);
    const secretB = randomBytes(32);

    const commitmentA = deriveCommitment(secretA);
    const commitmentB = deriveCommitment(secretB);
    const nullifierA = deriveNullifier(secretA);
    const nullifierB = deriveNullifier(secretB);

    assert.notEqual(commitmentA.toString('hex'), commitmentB.toString('hex'));
    assert.notEqual(nullifierA.toString('hex'), nullifierB.toString('hex'));
  });

  it('should correctly simulate allowlist inclusion checking', () => {
    const allowlist = new Map<string, boolean>();
    
    const validSecret = randomBytes(32);
    const invalidSecret = randomBytes(32);

    const validCommitment = deriveCommitment(validSecret).toString('hex');
    allowlist.set(validCommitment, true);

    const checkSecret = (sec: Buffer): boolean => {
      const comm = deriveCommitment(sec).toString('hex');
      return allowlist.get(comm) === true;
    };

    assert.equal(checkSecret(validSecret), true, 'Valid member commitment must be present in allowlist');
    assert.equal(checkSecret(invalidSecret), false, 'Unregistered member commitment must be rejected');
  });

  it('should prevent double verification using registered nullifiers map', () => {
    const registeredNullifiers = new Set<string>();
    const secret = randomBytes(32);
    const nullifier = deriveNullifier(secret).toString('hex');

    const verifyAndRegister = (nullifierHex: string): { success: boolean; reason?: string } => {
      if (registeredNullifiers.has(nullifierHex)) {
        return { success: false, reason: 'Already joined' };
      }
      registeredNullifiers.add(nullifierHex);
      return { success: true };
    };

    // First attempt should succeed
    const res1 = verifyAndRegister(nullifier);
    assert.equal(res1.success, true);

    // Second attempt with same secret should be blocked by nullifier
    const res2 = verifyAndRegister(nullifier);
    assert.equal(res2.success, false);
    assert.equal(res2.reason, 'Already joined');
  });
});
