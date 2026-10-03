import { JsonRpcProvider } from "ethers";

const rpcUrl = process.env.GANACHE_RPC_URL ?? "http://127.0.0.1:7545";

async function getLatestBlock(provider) {
  console.log("Sending request to Ganache...");

  // await pauses this function until the RPC request resolves.
  const block = await provider.getBlock("latest");

  if (!block) {
    throw new Error("Ganache did not return the latest block.");
  }

  console.log("Ganache response received.");
  return block;
}

async function main() {
  const provider = new JsonRpcProvider(rpcUrl);

  console.log("Program started.");
  const block = await getLatestBlock(provider);
  console.log("The program continues after await.");

  console.log(`Latest block number: ${block.number}`);
  console.log(`Block hash: ${block.hash}`);
}

main().catch((error) => {
  console.error("Request failed. Check that Ganache is running and the RPC URL is correct.");
  console.error(error.message);
  process.exitCode = 1;
});