# BCA Internal Test Results DApp

This Hardhat 3 application records BCA students' internal test marks on a local blockchain. The account that deploys the contract is the lecturer account; only that account can submit results. Each submission is appended as a new record.

## Run locally

Use three terminals from the project folder.

1. Install packages if needed and start the local blockchain:

   ```powershell
   npm install
   npm run chain
   ```

   Keep this terminal running. The local chain uses RPC `http://127.0.0.1:8545` and chain ID `31337`. The node prints funded development accounts and their private keys.

2. In a second terminal, save the private key for Account #0 in Hardhat's local keystore and deploy:

   ```powershell
   npx hardhat keystore set LOCALHOST_PRIVATE_KEY
   npm run deploy:local
   ```

   Enter the Account #0 private key when prompted. Copy the deployed `BCAResults` address from the Ignition output. These are public development keys; never use them for real funds.

3. In a third terminal, start the UI:

   ```powershell
   npm run dapp
   ```

   Open <http://127.0.0.1:4173>, connect MetaMask, and import the same Account #0 key. Add or switch to `Hardhat Local` if prompted (RPC `http://127.0.0.1:8545`, chain ID `31337`, currency `ETH`). Paste the deployed contract address and select **Load**.

The form records student name, USN, subject, semester (1–6), test, and marks. The register shows 20 entries per page. A correction must be recorded as a new entry; previous submissions are not edited or deleted. Restarting the local node resets its chain state, so deploy the contract again after a restart.

## Tests

```powershell
npm test
```

## Privacy

Names, USNs, subjects, and marks are stored as readable on-chain data and cannot be removed. This project is configured for a local development chain. Do not deploy it with real student information to a public blockchain; production use requires an institution-approved access-control and privacy design.
