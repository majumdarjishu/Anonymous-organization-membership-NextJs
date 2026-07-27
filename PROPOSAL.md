# Proposal: Anonymous Organization Membership Protocol

## 1. Executive Summary & Problem Statement

### Background
In decentralized governance, corporate enterprises, whistleblowing channels, union representation, and privacy-sensitive communities, individuals often need to prove valid membership within an organization to claim benefits, participate in governance votes, access confidential resources, or request credentials.

However, traditional public blockchains operate on absolute transparency. Every transaction links a user's public wallet address to their action on-chain. When a member interacts with a public blockchain contract, their identity, wallet balance, and historical transaction graph become publicly traceable.

### Problem Definition
1. **Wallet & Identity Linkability**: Proving membership using traditional public key signatures binds a user's real-world identity or persistent public key to specific votes, credential claims, or access events.
2. **Doxxing & Retaliation Risk**: Members of sensitive organizations (e.g., whistleblowers, investigative journalists, union delegates, or corporate board voters) face severe risks of doxxing, harassment, or retaliation if their participation is linked to their identity.
3. **Centralized Trust Bottlenecks**: Centralized membership databases require trusting third-party system administrators with sensitive member lists and activity logs, making them vulnerable to data breaches, insider threats, and subpoena exploitation.

### Solution Overview
The **Anonymous Organization Membership Protocol** leverages the **Midnight Network** and **Compact** zero-knowledge smart contracts to enable verifiable, privacy-preserving organization membership. 

By executing Zero-Knowledge (ZK) witness logic locally on the member's device, users prove that their secret credential generates a cryptographic commitment hash present in an administrative allowlist—and register a unique deterministic nullifier on-chain to prevent double verification—without disclosing their secret key, real identity, or wallet link.

---

## 2. Midnight Zero-Knowledge Architecture & Privacy Model

### Dual-State Data Architecture
Midnight separates application state into **Private State** (witness execution domain inside the client browser) and **Public State** (on-chain immutable ledger state):

| State Domain | Location | Stored Data & Operations | Exposure Level |
| --- | --- | --- | --- |
| **Private State** | Local Client / Lace Wallet | Secret witness (`secretWitness`), nullifier secret derivation (`nullifierWitness`), raw member credentials | **Strictly Confidential** (Never leaves client) |
| **Public State** | Midnight Ledger State | Admin public key (`admin`), member allowlist map (`allowlist`), registered nullifiers map (`members`), aggregate count (`memberCount`) | **Publicly Verifiable** |

### Zero-Knowledge Proof Circuits
The Compact smart contract (`contracts/anonymous-organization-membership.compact`) enforces three primary ZK circuit constraints:

1. **Local Commitment Generation**: Computes `commitment = persistentHash<Bytes<32>>(secretWitness)` inside local ZK circuit constraints and asserts that `allowlist.member(commitment)` is true.
2. **Nullifier Determinism & Double-Verification Prevention**: Computes `nullifier = persistentHash<Bytes<32>>(persistentHash<Bytes<32>>(secretWitness))` and asserts `nullifierWitness == nullifier`. Verifies `!members.member(nullifier)`, then records the nullifier in the `members` map to prevent double-claiming while preserving total anonymity.
3. **Admin Allowlist Insertion**: Executes `addAllowedCommitment(commitment)` allowing authorized organization administrators (`admin == disclose(ownPublicKey()).bytes`) to register commitment hashes into the public allowlist without acquiring raw member secrets.

### Observer Visibility Breakdown

#### ❌ What an Observer CANNOT Learn:
- **Member Secret Witness**: The member's secret credential (`secretWitness`) is computed purely in local ZK witnesses and never transmitted over the network.
- **Wallet-to-Member Identity Mapping**: No association between the submitting wallet address and the underlying member credential.
- **Member Role & PII**: Specific organizational roles, email addresses, or personal identifiers remain completely hidden.

#### ✅ What an Observer CAN Learn:
- **Verified Member Count**: Aggregate counter (`memberCount`) tracking total successful member verifications.
- **Public Allowlist Commitments**: The set of valid 32-byte commitment hashes authorized by the organization admin.
- **Registered Nullifiers**: 32-byte nullifier hashes confirming that a unique authorized member verified membership without exposing which member performed the action.

---

## 3. Technical Implementation & Smart Contract Design

### Core Components & Tech Stack
- **Smart Contract Language**: Compact v0.23 (Midnight Zero-Knowledge DSL).
- **Blockchain Framework**: `@midnight-ntwrk/midnight-js-*` (v4.1.1 SDK).
- **Wallet Connection**: Midnight Lace Browser Extension (`window.midnight.mnLace`).
- **Proof Server**: `midnightntwrk/proof-server:8.1.0` (Dockerized local witness execution engine).
- **Frontend Application**: Vite + React 18 + TypeScript + TailwindCSS + Glassmorphism UI.
- **CI/CD & Quality Assurance**: GitHub Actions automated pipeline (`.github/workflows/ci.yml`) enforcing TypeScript type safety and production build validation.

### System Workflow Sequence

```
  ┌────────────────┐         ┌──────────────────────┐         ┌─────────────────────┐         ┌───────────────────┐
  │ Member Browser │         │  Midnight Lace Wallet│         │  Local Proof Server │         │  Midnight Preprod │
  └───────┬────────┘         └──────────┬───────────┘         └──────────┬──────────┘         └─────────┬─────────┘
          │                             │                                │                              │
          │  1. Input Secret Credential │                                │                              │
          ├────────────────────────────>│                                │                              │
          │                             │  2. Compute ZK Witness & Hash  │                              │
          │                             ├───────────────────────────────>│                              │
          │                             │                                │  3. Generate ZK Proof        │
          │                             │                                ├─────────────────────────────>│
          │                             │  4. Sign & Broadcast Tx        │                              │
          │                             ├──────────────────────────────────────────────────────────────>│
          │                             │                                │                              │  5. Assert Allowlist
          │  6. Verification Success    │                                │                              │     & Record Nullifier
          │<────────────────────────────┴────────────────────────────────┴──────────────────────────────┤
```

### Smart Contract Code & Ledger Schema

```compact
pragma language_version >= 0.23;

import CompactStandardLibrary;

export ledger admin: Bytes<32>;
export ledger allowlist: Map<Bytes<32>, Boolean>;
export ledger members: Map<Bytes<32>, Boolean>; // stores nullifiers
export ledger memberCount: Counter;

constructor(adminKey: Bytes<32>) {
    admin = disclose(adminKey);
}

witness secretWitness(): Bytes<32>;
witness nullifierWitness(): Bytes<32>;

export circuit addAllowedCommitment(commitment: Bytes<32>): [] {
    assert(admin == disclose(ownPublicKey()).bytes, "Only admin can add to allowlist");
    allowlist.insert(disclose(commitment), true);
}

export circuit joinOrganization(): [] {
    assert(nullifierWitness() == persistentHash<Bytes<32>>(persistentHash<Bytes<32>>(secretWitness())), "Invalid nullifier");
    assert(allowlist.member(disclose(persistentHash<Bytes<32>>(secretWitness()))), "Not in allowlist");
    assert(!members.member(disclose(nullifierWitness())), "Already joined");
    
    members.insert(disclose(nullifierWitness()), true);
    memberCount.increment(1);
}
```

### Deployed Contract & Explorer Verification
- **Network**: Midnight Preprod Testnet / Local Undeployed Environment
- **Contract Language**: Compact v0.23
- **Repository Source**: [GitHub Repository](https://github.com/majumdarjishu/Anonymous-organization)

---

## 4. Roadmap, Impact & Future Scope

### Implementation Roadmap

#### Phase 1: Core ZK Circuit & MVP Architecture (Completed)
- [x] Design and compile `anonymous-organization-membership.compact` smart contract with allowlist and nullifier maps.
- [x] Develop multi-page React + Vite frontend dashboard supporting 7 core routed views.
- [x] Integrate Midnight Lace Wallet extension (`window.midnight.mnLace`) for session management.
- [x] Build automated CI/CD GitHub Actions pipeline verifying TypeScript compilation and UI builds.

#### Phase 2: Multi-Organization Support & Tiered Allowlists (Q4 2026)
- Expand smart contract state to support multiple organization IDs with distinct allowlist domains.
- Implement tiered permission levels (e.g., Executive, General Member, Auditor) verified via zero-knowledge sub-circuits.

#### Phase 3: Verifiable Credentials & DID Attestation (Q1 2027)
- Integrate W3C Verifiable Credentials (VCs) and Decentralized Identifiers (DIDs) for automated membership issuing.
- Enable organizations to issue ZK-compatible identity credentials directly to user Lace Wallets.

#### Phase 4: Mainnet Deployment & DAO Governance (Q2 2027)
- Deploy protocol to Midnight Mainnet.
- Transition administrative allowlist management to a decentralized multi-signature DAO governance model.

### Social & Enterprise Impact
The **Anonymous Organization Membership Protocol** transforms how sensitive organizations handle membership verification. By decoupling identity from participation through Midnight's zero-knowledge cryptography, members can safely participate in governance, claim benefits, and communicate without fear of surveillance, discrimination, or exposure.
