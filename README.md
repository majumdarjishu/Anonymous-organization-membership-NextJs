# Anonymous Organization Membership

A privacy-preserving organization membership platform built on the Midnight Network for the **Rise In Midnight Builder Challenge Level 3**. This full-stack DApp allows a person to prove they are a valid member of an organization without publicly revealing their identity, name, email, or private credential.

## Problem Statement

Traditional membership systems require members to present personal identifiers (name, email, membership ID) to prove they belong to an organization. This creates massive identity leakage, as every verification is tracked and correlated across services.

## Solution

Using Midnight's Zero-Knowledge technology, members generate a public commitment from a private credential. When verifying, they generate a proof locally in their browser. The blockchain verifies the proof without ever seeing the credential.

## Features

1. **Private Membership Registration**: Organizations register a public commitment (a cryptographic hash) of a member's credential.
2. **Anonymous Verification**: Members prove their eligibility locally using Zero-Knowledge proofs.
3. **Multi-Wallet Support**: Seamlessly switch between **Lace Wallet** and **1AM Wallet**.
4. **Premium Enterprise UI**: Built with Next.js App Router, Tailwind CSS, and Framer Motion.

## Privacy Model

### What Observers CANNOT Learn (Private Witness)
- Member identity, name, email
- Membership ID number
- Private membership credential or secret
- Private wallet keys

### What Observers CAN Learn (Public Ledger)
- Verification occurred (a membership proof was verified)
- Public commitment hash of registered members
- Verification status and counter
- Safe organization metadata (e.g., name, status)

The Midnight contract enforces this by only using the `disclose()` operation for the public commitment, the nullifier (to prevent duplicate proofs), and global counters. The private membership secret NEVER leaves the user's browser.

## Wallet Compatibility

### Lace Wallet
- **Detection**: Automatically detected via `window.midnight.mnLace`
- **Supported Operations**: Connecting, state synchronization, fetching unshielded/shielded balances, and signing transactions.

### 1AM Wallet
- **Detection**: Automatically detected if it injects a provider implementing the Midnight standard into `window.midnight`.
- **Supported Operations**: Full compatibility with the Midnight JS SDK for transaction signing.

## Architecture & Technology Stack

- **Smart Contract**: Compact 0.23 (Zero-Knowledge Circuits)
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion
- **Blockchain Integration**: `@midnight-ntwrk` SDK (4.1.x)
- **Infrastructure**: Dockerized Midnight Proof Server (`8.1.0`) and Indexer (`4.3.3`)

## Folder Structure

```
anonymous-membership-organisation/
├── contracts/               # Compact smart contracts
│   └── anonymous-membership-organisation.compact
├── src/                     # CLI and deployment scripts
│   ├── cli.ts               # Interactive CLI for admin tasks
│   ├── deploy.ts            # Deployment script
│   └── setup.ts             # Account setup script
├── ui/                      # Next.js frontend application
│   ├── src/app/             # App Router pages and layouts
│   ├── src/components/      # Reusable UI components
│   └── src/context/         # Wallet and Midnight context
├── test/                    # Contract unit and integration tests
├── docker-compose.yml       # Local devnet infrastructure
└── README.md                # Project documentation
```

## Local Development

### Prerequisites
- Node.js 22+
- Docker and Docker Compose
- WSL/Linux (if on Windows)
- Midnight Compact Compiler (0.5.1)

### 1. Start the Devnet Infrastructure

Start the local Midnight node, indexer, and proof server:

```bash
npm run proof-server:start
# or `docker compose up -d`
```

Verify services are running:
```bash
docker compose ps
```

### 2. Compile the Contract

Compile the Compact smart contract to generate ZKIR and proving keys:

```bash
npm run compile
```

### 3. Deploy the Contract

Setup the wallet and deploy the contract to the local devnet:

```bash
npm run setup
npm run deploy
```

### 4. Run the Next.js Frontend

Start the development server:

```bash
cd ui
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Preprod Deployment

To deploy to the Midnight Preprod network instead of the local devnet:

1. Update your `.env` or set network explicitly:
   ```bash
   npm run setup -- --network preprod
   ```
2. The CLI will display your wallet address and prompt you to fund it using the official [Midnight Faucet](https://faucet.midnight.network/).
3. Once funded with `tNIGHT`, the script will automatically register your UTXOs for `DUST` generation.
4. Deploy the contract:
   ```bash
   npm run deploy -- --network preprod
   ```
5. Note the generated contract address and update it in your frontend configuration (`NEXT_PUBLIC_CONTRACT_ADDRESS`).

## Vercel Deployment

The Next.js frontend is optimized for deployment on Vercel:

1. Set the Root Directory to `ui`.
2. Framework Preset: `Next.js`.
3. Build Command: `npm run build`.
4. Environment Variables:
   - `NEXT_PUBLIC_MIDNIGHT_NETWORK=preprod`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS=<your_contract_address>`

## Troubleshooting

- **No Docker in WSL**: Ensure Docker Desktop has WSL integration enabled for your distro.
- **Port 6300 already in use**: Another Midnight project may have left a proof server running. Stop it with `docker stop <container_id>`.
- **Contract compilation fails**: Ensure you are using `compact 0.5.1` or later.
- **Insufficient Funds (DUST)**: Wait approximately 1-2 block times for the registered NIGHT to generate DUST tokens before deploying.

---
*Built for the Rise In Midnight Builder Challenge Level 3.*
