import { JsonRpcProvider } from "ethers";
import { Web3 } from "web3";

const rpcUrl = process.env.GANACHE_RPC_URL ?? "http://127.0.0.1:7545";

async function readWithEthers() {
  const provider = new JsonRpcProvider(rpcUrl);
  const block = await provider.getBlock("latest");

  if (!block) {
    throw new Error("Ganache did not return the latest block to ethers.");
  }

  console.log("Latest block using ethers");
  console.log(`Number: ${block.number}`);
  console.log(`Hash: ${block.hash}`);
  console.log(`Timestamp: ${block.timestamp}`);
  console.log(`Transactions: ${block.transactions.length}`);
}

async function readWithWeb3() {
  const web3 = new Web3(rpcUrl);
  const block = await web3.eth.getBlock("latest");

  if (!block) {
    throw new Error("Ganache did not return the latest block to web3.js.");
  }

  console.log("\nLatest block using web3.js");
  console.log(`Number: ${block.number}`);
  console.log(`Hash: ${block.hash}`);
  console.log(`Timestamp: ${block.timestamp}`);
  console.log(`Transactions: ${block.transactions.length}`);
}

async function main() {
  console.log(`Connecting to Ganache at ${rpcUrl}\n`);
  await readWithEthers();
  await readWithWeb3();
}

main().catch((error) => {
  console.error("Could not read a block. Check that Ganache is running and the RPC URL is correct.");
  console.error(error.message);
  process.exitCode = 1;
});