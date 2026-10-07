# MyToken (MTK)

MyToken is a fixed-supply ERC-20 token for the Sepolia test network, built with
Hardhat 3, viem, and OpenZeppelin Contracts. It creates 1,000,000 MTK with 18
decimals and assigns the entire supply to the account that deploys it. There is
no mint function.

The project also includes a browser DApp that connects to MetaMask, shows the
connected wallet's MTK balance, and lets the wallet send MTK.

## Prerequisites

- Node.js and npm
- MetaMask browser extension
- A Sepolia RPC endpoint from a provider such as Infura
- Sepolia ETH for gas, from a Sepolia faucet

Use Sepolia test ETH and a dedicated test account. Never use or export the
private key or recovery phrase for an account that holds valuable assets.

## Install

Open PowerShell in the project folder and install the dependencies:

```powershell
npm install
```

## Build and test locally

Compile the Solidity contracts:

```powershell
npm run build
```

Run all Solidity and TypeScript tests:

```powershell
npm test
```

Type-check the Hardhat TypeScript sources and tests:

```powershell
npx tsc --noEmit
```

The tests deploy a fresh local token and check its initial supply, transfers,
approvals, and delegated transfers. They do not send transactions to Sepolia.

## Configure Sepolia deployment

### 1. Get a Sepolia RPC URL

Create an Ethereum API key in your RPC provider dashboard, open its Sepolia
endpoint settings, and copy the complete HTTPS endpoint. An Infura endpoint
typically looks like this:

```text
https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

Replace `YOUR_INFURA_PROJECT_ID` with your own key. Do not use just
`sepolia.infura.io`; Hardhat needs the full URL. Treat the URL as private if it
contains an API key.

Set the URL for the current PowerShell session:

```powershell
$env:SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
```

### 2. Prepare the deploying account

In MetaMask, switch to Sepolia and use a dedicated test account. Fund it with
Sepolia ETH for gas. The token's entire initial supply will belong to this
account.

Hardhat needs this account's private key to sign the deployment transaction.
You can use Hardhat's encrypted keystore prompt:

```powershell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Enter the private key only in the local prompt. Alternatively, set it in the
current PowerShell session (do not save it in source code or a committed `.env`
file):

```powershell
$env:SEPOLIA_PRIVATE_KEY = "YOUR_DEDICATED_TEST_ACCOUNT_PRIVATE_KEY"
```

MetaMask's account menu provides **Account details** and **Show/Export private
key**. Exporting reveals a key that controls the account on every network. Never
share it, commit it, or enter it into a website. If you do not already have a
dedicated test account, create one before proceeding.

## Deploy the token to Sepolia

In the same PowerShell session where the RPC URL is set, compile and deploy:

```powershell
npm run build
npm run deploy:sepolia
```

Hardhat Ignition prints the deployed contract address. Save that address; it is
needed to view/import the token. The deployment module is
[`ignition/modules/MyToken.ts`](./ignition/modules/MyToken.ts), and the Sepolia
network is configured in [`hardhat.config.ts`](./hardhat.config.ts).

The deployment currently recorded in this repository is:

```text
0xb879B9678BfaD2F8226b5a0B4231944C935e3235
```

If you deploy another instance, use the new address printed by Ignition instead.

## View and test the deployed token

1. In MetaMask, select Sepolia and choose **Import tokens**.
2. Paste the deployed token contract address. MetaMask should detect the
   `MTK` token; confirm the import. The deploying account should show the
   initial 1,000,000 MTK.
3. To test a transfer, send a small amount (for example, 1 MTK) to another
   account you control. Confirm the transaction in MetaMask; Sepolia ETH pays
   the gas fee.
4. Look up the transaction hash, wallet address, or token contract address on
   [Sepolia Etherscan](https://sepolia.etherscan.io/). The token contract page's
   **Token Transfers** tab lists MTK transfers.
5. Import the same contract address into the receiving account's MetaMask to
   display its MTK balance.

## Run the DApp locally

Start the Vite development server:

```powershell
npm run dev:dapp
```

Open the local URL printed by Vite in a browser with MetaMask installed. Connect
your wallet and approve switching to Sepolia if prompted. The DApp displays
your MTK balance and provides a form to transfer MTK. MetaMask asks you to
approve each transfer; the connected account needs Sepolia ETH for gas.

The DApp uses the token address configured in
[`dapp/src/main.ts`](./dapp/src/main.ts). If you deploy a new token instance,
update `TOKEN_ADDRESS` there before using the DApp with that deployment.

Stop the development server with **Ctrl+C** in its terminal.

Type-check and create a production build of the DApp:

```powershell
npm run typecheck:dapp
npm run build:dapp
```

The generated static site is placed in `dapp/dist/`. These commands build the
frontend but do not deploy it to a hosting provider.

## Available npm scripts

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile Solidity contracts with Hardhat |
| `npm test` | Run Solidity and TypeScript tests |
| `npx tsc --noEmit` | Type-check Hardhat TypeScript files |
| `npm run deploy:sepolia` | Deploy the token with Ignition to Sepolia |
| `npm run dev:dapp` | Start the local DApp development server |
| `npm run typecheck:dapp` | Type-check the DApp |
| `npm run build:dapp` | Build the DApp for static hosting |

## Security and network notes

- A wallet private key or recovery phrase gives full control of the account.
  Never share it or commit it to the repository.
- Use Sepolia only for testing. Test tokens have no intended real-world value.
- The token has a fixed supply, but this alone does not make it audited or safe
  for production. Obtain an independent contract review before considering
  mainnet use.
