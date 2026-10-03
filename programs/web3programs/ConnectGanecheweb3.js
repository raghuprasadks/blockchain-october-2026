import { Web3 } from "web3";
const rpcUrl = "http://127.0.0.1:7545";

async function main() {
  console.log(`Connecting to Ganache at ${rpcUrl}\n`);
  const web3 = new Web3(rpcUrl);
  const block = await web3.eth.getBlock("latest");
    if (!block) {
    throw new Error("Ganache did not return the latest block to ethers.");
  }
  console.log("\nLatest block using web3.js");
  console.log(`Number: ${block.number}`);
  console.log(`Hash: ${block.hash}`);
  console.log(`Timestamp: ${block.timestamp}`);
  console.log(`Transactions: ${block.transactions.length}`);
}
main()