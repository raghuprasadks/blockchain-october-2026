# Sample Hardhat 3 Project (`node:test` and `viem`)

This project showcases a Hardhat 3 project using the native Node.js test runner (`node:test`) and the `viem` library for Ethereum interactions.

To learn more about Hardhat 3, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3](https://hardhat.org/hardhat3-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using [`node:test`](nodejs.org/api/test.html), the new Node.js native test runner, and [`viem`](https://viem.sh/).
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `node:test` tests:

```shell
npx hardhat test solidity
npx hardhat test nodejs
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```

## MathsCalculator dApp

The project also includes a plain HTML, CSS, and JavaScript frontend. It uses
the connected browser wallet to call the deployed `MathsCalculator` contract's
`add`, `subtract`, `multiply`, and `divide` methods. These are read-only calls;
the dApp does not send transactions.

### Run locally

1. Start a local Hardhat JSON-RPC node and leave it running:

   ```shell
   npx hardhat node
   ```

2. In a second terminal, deploy the calculator to the local node:

   ```shell
   npx hardhat ignition deploy ignition/modules/MathsCalculator.ts --network localhost
   ```

   Copy the deployed contract address shown in the output.

3. In MetaMask, add a network with RPC URL `http://127.0.0.1:8545` and chain ID
   `31337`, then select it.

4. Start the frontend:

   ```shell
   npm run dev
   ```

   Open the URL Vite prints (usually `http://127.0.0.1:5173`), connect your
   wallet, paste the deployed contract address, and click an operation.

The address must belong to the network selected in your wallet. The dApp can
also call a deployment on another EVM network when the wallet is switched to
that network.
