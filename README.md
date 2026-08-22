# Anonymous Organization Membership

A privacy-preserving organization membership platform built on the Midnight Network for the Rise In Midnight Builder Challenge Level 3.

## Contract Address

**This section is mandatory.**

| Network | Contract Address |
|---------|------------------|
| Preprod | `<YOUR_DEPLOYED_CONTRACT_ADDRESS>` |

## Features

1. **Private Membership Registration**: Organizations register a public commitment of a member's credential.
2. **Anonymous Verification**: Members prove their eligibility locally using Zero-Knowledge proofs.
3. **Multi-Wallet Support**: Seamlessly switch between Lace Wallet and 1AM Wallet.
4. **Premium Enterprise UI**: Built with Next.js App Router, Tailwind CSS, and Framer Motion.

## What This Project Does

This full-stack DApp allows a person to prove they are a valid member of an organization without publicly revealing their identity, name, email, or private credential. Traditional membership systems require members to present personal identifiers to prove they belong, creating massive identity leakage. This project solves that using Midnight's Zero-Knowledge technology, where members generate a public commitment from a private credential, and when verifying, they generate a proof locally in their browser. The blockchain verifies the proof without ever seeing the credential.

## Privacy Model

### Public Information
- Verification occurred (a membership proof was verified)
- Public commitment hash of registered members
- Verification status and counter
- Safe organization metadata (e.g., name, status)

### Private Information
- Member identity, name, email
- Membership ID number
- Private membership credential or secret
- Private wallet keys

### What users prove without revealing
The Midnight contract enforces that members can prove they belong to the organization by generating a ZK proof against the registered public commitment. They prove they hold the private credential without ever revealing the credential itself. The contract only uses the `disclose()` operation for the public commitment, the nullifier (to prevent duplicate proofs), and global counters.

## Tech Stack

- **Smart Contract**: Compact (Midnight Zero-Knowledge Circuits)
- **Frontend**: Next.js (App Router), React, Tailwind CSS, Framer Motion
- **Blockchain Integration**: `@midnight-ntwrk` SDK 
- **Infrastructure**: Dockerized Midnight Proof Server and Indexer

## Folder Structure

```
anonymous-membership-organisation/
├── contract/               # Compact smart contracts
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

## Prerequisites

- Node.js v22
- Docker and Docker Compose
- Midnight Compact Compiler (`npm install -g @midnight-ntwrk/compact-compiler`)
- A connected Midnight-compatible browser wallet (Lace or 1AM)

## Installation

1. Clone the repository
2. Install root dependencies:
   ```bash
   npm install
   ```
3. Install contract dependencies:
   ```bash
   cd contract
   npm install
   cd ..
   ```
4. Install UI dependencies:
   ```bash
   cd ui
   npm install
   cd ..
   ```
5. Start the local proof server:
   ```bash
   docker run -p 6300:6300 midnightnetwork/proof-server
   ```

## Build

To build the project completely:

```bash
npm run build
cd ui
npm run build
```

## Compile

Compile the Compact smart contract to generate ZKIR and proving keys:

```bash
npm run compact
```

## Manual Deployment

Deployment is intentionally skipped. You must deploy the contract manually using your wallet seed or via the frontend deployment UI. 

Run the deployment script:
```bash
NODE_OPTIONS="--max-old-space-size=12288" npm run deploy -- --network preprod
```

*(Alternatively, run `npm run dev` in the `ui/` folder and navigate to `http://localhost:3000/admin/deploy` to deploy it easily through your browser wallet).*

## After Deployment

The only remaining manual steps are:
1. Deploy the Compact contract.
2. Copy the deployed contract address.
3. Replace every occurrence of:
```
<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```
No additional coding should be required.

## Environment Variables

Create a `.env.local` inside the `ui/` folder:

```env
NEXT_PUBLIC_MIDNIGHT_NETWORK=preprod
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT_ADDRESS>
```

## Screenshots

[Placeholder for application screenshots]

## Initial Idea

[Placeholder for original project idea]

## Troubleshooting

- **Contract compilation fails**: Ensure you are using the correct `compact` compiler version (`compact --version`).
- **Browser wallet won't connect**: Ensure you have Lace or 1AM installed and the network is set to Preprod.
- **500 Internal Server Error in UI**: Ensure you have successfully run `npm install` inside the `ui` folder to install all GraphQL sub-dependencies.
