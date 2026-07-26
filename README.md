# Anonymous Organization Membership

A Privacy-Preserving dApp built on the Midnight Network.

This project implements **Level 3: Private Allowlist Access**. It allows an administrator to add public commitments to an allowlist, and users to privately prove their membership in the organization without revealing their specific identity or commitment.

## Core Privacy Features
- **Public Ledger (Admin):** The admin adds users by storing a hashed `commitment` to a public Map in the Midnight smart contract (`allowlist: Map<Bytes<32>, Boolean>`).
- **Private Witness (User):** The user provides their `secretWitness` (pre-image) and their `nullifierWitness` (a secondary hash preventing double-joining).
- **Zero-Knowledge Proof:** The smart contract circuit verifies that:
  1. The user knows the `secretWitness` that hashes to a commitment currently in the allowlist.
  2. The `nullifierWitness` is derived from the `secretWitness`.
  3. The `nullifierWitness` has not been used before.
- **Result:** The user successfully increments the `memberCount` and joins the organization, but observers on the blockchain only see a generic ZK proof and the public nullifier. Observers **do not learn** which allowlist entry the user consumed.

## Project Structure

```
anonymous-organization-membership/
├── contracts/
│   └── anonymous-organization-membership.compact  # ZK Smart Contract
├── scripts/
│   └── e2e-check.ts                               # Integration tests
├── src/
│   ├── deploy.ts                                  # Contract deployment script
│   ├── cli.ts                                     # Node.js Interactive CLI
│   └── ...
├── ui/
│   ├── src/App.tsx                                # React Frontend
│   └── .env.example                               # Frontend config
├── .github/
│   └── workflows/ci.yml                           # GitHub Actions CI
└── package.json
```

## Quick Start (Local Devnet)

Requirements: Node 22+, Docker Desktop (with WSL Integration enabled), and Midnight Compact Compiler (version matching `.compact-version`).

### 1. Compile and Deploy
```bash
# Start Docker daemon first!
npm install
npm run setup -- --network undeployed
```

### 2. Run the React Frontend
```bash
cd ui
npm install
npm run dev
```

### 3. Run the CLI (Alternative to Web UI)
```bash
npm run cli
```

## Deployment to Preprod

This dApp supports deploying to the Midnight `preview` and `preprod` testnets.

1. Ensure you have the Lace Wallet installed and funded from the testnet faucet.
2. Run deployment targeting `preprod`:
   ```bash
   npm run setup -- --network preprod
   ```
3. Update `ui/.env` with your newly deployed contract address (`VITE_CONTRACT_ADDRESS`) and start the UI.

## Testing & CI

This repository contains:
- `scripts/e2e-check.ts`: An end-to-end integration test that verifies contract deployment and public ledger state queries using `@midnight-ntwrk/midnight-js-contracts`. Run using `npm run test:e2e`.
- **GitHub Actions**: Automated CI pipeline (`.github/workflows/ci.yml`) that runs TypeScript type-checking, Compact compilation, and Vite builds on every push to `main`.

## UI Details

The frontend (`ui/`) is a React application built with Vite and Tailwind/Vanilla CSS. It features:
- **Lace Wallet Integration:** Users can connect their Lace wallet seamlessly.
- **Glassmorphic Premium Design:** A highly responsive, modern aesthetic.
- **Admin Panel:** Visible only to the deployer for managing the allowlist.
- **Membership Proof:** Allows users to submit their zero-knowledge proof of membership directly from the browser.

## Note on Windows/WSL
If you encounter `docker: command not found` while running `npm run setup`, ensure Docker Desktop is running and **WSL Integration is enabled** in Docker Desktop settings -> Resources -> WSL Integration for your Ubuntu distribution.
