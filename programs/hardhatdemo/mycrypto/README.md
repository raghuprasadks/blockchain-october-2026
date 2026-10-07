# eKaushalya ERC-20 Token

This Hardhat 3 project implements **eKaushalya (EKA)**, a fixed-supply ERC-20
token on an existing EVM-compatible blockchain. It creates 10,000 tokens with
18 decimals and assigns the full supply to the deploying wallet. There is no
public mint function.

## Tests

Run the full test suite:

```shell
npx hardhat test
```

## Local deployment

Deploy to a locally simulated chain with Hardhat Ignition:

```shell
npx hardhat ignition deploy ignition/modules/EKaushalya.ts
```

## Sepolia testnet deployment

Use a wallet funded with Sepolia test ETH. Store the RPC URL and private key
using Hardhat's keystore:

```shell
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Then deploy:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/EKaushalya.ts
```

Test the deployment on Sepolia before considering a mainnet launch. Never put
wallet private keys in source files or commit them to version control.
