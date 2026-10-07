const SELECTORS = {
  add: "0x771602f7",
  multiply: "0x165c4a16",
  lastAddResult: "0x6b0675b4",
  lastMultiplyResult: "0x79461452",
};
const TRUSTED_DEPLOYMENTS = {
  "0x7a69": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};
const UINT256_MAX = (1n << 256n) - 1n;
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;
const provider = window.ethereum;

const elements = {
  accountAddress: document.querySelector("#account-address"),
  addButton: document.querySelector("#add-button"),
  addResult: document.querySelector("#add-result"),
  connectButton: document.querySelector("#connect-button"),
  contractAddress: document.querySelector("#contract-address"),
  firstNumber: document.querySelector("#first-number"),
  multiplyButton: document.querySelector("#multiply-button"),
  multiplyResult: document.querySelector("#multiply-result"),
  networkName: document.querySelector("#network-name"),
  refreshButton: document.querySelector("#refresh-button"),
  secondNumber: document.querySelector("#second-number"),
  status: document.querySelector("#status-message"),
};

let account;
let busy = false;
let chainId;

function contractAddress() {
  const expectedAddress = TRUSTED_DEPLOYMENTS[chainId?.toLowerCase()];
  if (!expectedAddress) {
    throw new Error("Unsupported network. Switch your wallet to the local Hardhat network (chain ID 31337).");
  }

  const address = elements.contractAddress.value.trim();
  if (!ADDRESS_PATTERN.test(address)) {
    throw new Error("Enter a valid 20-byte contract address.");
  }
  if (address.toLowerCase() !== expectedAddress.toLowerCase()) {
    throw new Error("This contract address is not a verified SimpleMathCalculator deployment.");
  }
  return address;
}

function updateControls() {
  const connected = Boolean(provider && account);
  const expectedAddress = TRUSTED_DEPLOYMENTS[chainId?.toLowerCase()];
  const validAddress = Boolean(
    expectedAddress
    && elements.contractAddress.value.trim().toLowerCase() === expectedAddress.toLowerCase(),
  );
  const canCalculate = connected && validAddress && !busy;
  elements.addButton.disabled = !canCalculate;
  elements.multiplyButton.disabled = !canCalculate;
  elements.refreshButton.disabled = !connected || !validAddress || busy;
  elements.contractAddress.disabled = true;
  elements.firstNumber.disabled = busy;
  elements.secondNumber.disabled = busy;
  elements.connectButton.disabled = busy;
  elements.connectButton.textContent = connected ? "Wallet connected" : "Connect wallet";
}

function showStatus(message, type = "") {
  elements.status.textContent = message;
  elements.status.className = `status-message${type ? ` ${type}` : ""}`;
}

function friendlyError(error) {
  if (error?.code === 4001) return "Transaction was rejected in your wallet.";
  if (error?.code === 4902) return "This network is not configured in your wallet.";
  return error instanceof Error ? error.message : "An unexpected wallet error occurred.";
}

async function request(method, params = []) {
  if (!provider) {
    throw new Error("No browser wallet found. Install or enable a wallet such as MetaMask.");
  }
  return provider.request({ method, params });
}

function encodeUint256(value) {
  return value.toString(16).padStart(64, "0");
}

async function readUint(address, selector) {
  const result = await request("eth_call", [{ to: address, data: selector }, "latest"]);
  if (typeof result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(result)) {
    throw new Error("The contract returned an invalid result. Check that this is a SimpleMathCalculator address.");
  }
  return BigInt(result);
}

async function readResults(address) {
  const code = await request("eth_getCode", [address, "latest"]);
  if (typeof code !== "string" || code === "0x" || /^0x0*$/.test(code)) {
    throw new Error(`No contract code at ${address} on the selected network. Check the wallet network and deployed address.`);
  }

  const [addition, multiplication] = await Promise.all([
    readUint(address, SELECTORS.lastAddResult),
    readUint(address, SELECTORS.lastMultiplyResult),
  ]);
  return { addition, multiplication };
}

async function refreshResults() {
  try {
    chainId = await request("eth_chainId");
    showNetwork(chainId);
    const address = contractAddress();
    const results = await readResults(address);
    if (elements.contractAddress.value.trim().toLowerCase() === address.toLowerCase()) {
      elements.addResult.textContent = results.addition.toLocaleString();
      elements.multiplyResult.textContent = results.multiplication.toLocaleString();
      showStatus("Saved results loaded from the blockchain.", "success");
    }
    updateControls();
    return results;
  } catch (error) {
    elements.addResult.textContent = "—";
    elements.multiplyResult.textContent = "—";
    showStatus(friendlyError(error), "error");
    updateControls();
    return null;
  }
}

function parseOperands() {
  const first = elements.firstNumber.value.trim();
  const second = elements.secondNumber.value.trim();
  if (!/^\d+$/.test(first) || !/^\d+$/.test(second)) {
    throw new Error("Enter whole numbers using digits 0–9.");
  }

  const a = BigInt(first);
  const b = BigInt(second);
  if (a > UINT256_MAX || b > UINT256_MAX) {
    throw new Error("Each number must fit in uint256.");
  }
  return [a, b];
}

function setBusy(value) {
  busy = value;
  updateControls();
}

async function waitForReceipt(hash) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const receipt = await request("eth_getTransactionReceipt", [hash]);
    if (receipt) {
      if (BigInt(receipt.status) !== 1n) {
        throw new Error("The transaction failed on-chain.");
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_200));
  }
  throw new Error("Transaction confirmation timed out. Check the transaction in your wallet or on the network.");
}

async function calculate(operation) {
  if (!account) {
    showStatus("Connect a wallet before calculating.", "error");
    return;
  }

  setBusy(true);
  try {
    const currentChainId = await request("eth_chainId");
    if (currentChainId.toLowerCase() !== chainId?.toLowerCase()) {
      chainId = currentChainId;
      showNetwork(chainId);
      updateControls();
    }
    const address = contractAddress();
    const [a, b] = parseOperands();
    const startingChain = currentChainId;
    const selector = SELECTORS[operation];
    const data = `${selector}${encodeUint256(a)}${encodeUint256(b)}`;
    showStatus(`Confirm the ${operation === "add" ? "addition" : "multiplication"} transaction in your wallet…`);

    const hash = await request("eth_sendTransaction", [{
      from: account,
      to: address,
      data,
    }]);
    if (typeof hash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(hash)) {
      throw new Error("The wallet returned an invalid transaction hash.");
    }

    showStatus(`Transaction sent (${hash.slice(0, 10)}…). Waiting for confirmation…`);
    await waitForReceipt(hash);

    if (await request("eth_chainId") !== startingChain) {
      throw new Error("Transaction confirmed, but the wallet network changed. Switch back to that network and refresh the results.");
    }

    const results = await readResults(address);
    elements.addResult.textContent = results.addition.toLocaleString();
    elements.multiplyResult.textContent = results.multiplication.toLocaleString();
    const result = operation === "add" ? results.addition : results.multiplication;
    showStatus(`Transaction confirmed. Result: ${result.toLocaleString()}`, "success");
  } catch (error) {
    showStatus(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

function showNetwork(chainId) {
  const chainNames = {
    "0x7a69": "Local Hardhat",
    "0x539": "Local Hardhat",
    "0xaa36a7": "Sepolia",
  };
  elements.networkName.textContent = chainNames[chainId] ?? `Chain ${BigInt(chainId).toString()}`;
}

async function connectWallet() {
  setBusy(true);
  try {
    const accounts = await request("eth_requestAccounts");
    if (!Array.isArray(accounts) || typeof accounts[0] !== "string") {
      throw new Error("The wallet did not return an account.");
    }
    account = accounts[0];
    elements.accountAddress.textContent = `${account.slice(0, 6)}…${account.slice(-4)}`;
    chainId = await request("eth_chainId");
    showNetwork(chainId);
    showStatus("Wallet connected. Loading saved results…");
    await refreshResults();
  } catch (error) {
    showStatus(friendlyError(error), "error");
  } finally {
    setBusy(false);
  }
}

elements.contractAddress.value = TRUSTED_DEPLOYMENTS["0x7a69"];
elements.connectButton.addEventListener("click", connectWallet);
elements.refreshButton.addEventListener("click", refreshResults);
elements.addButton.addEventListener("click", () => calculate("add"));
elements.multiplyButton.addEventListener("click", () => calculate("multiply"));

if (provider?.on) {
  provider.on("accountsChanged", (accounts) => {
    account = accounts[0];
    elements.accountAddress.textContent = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : "Not connected";
    updateControls();
    if (account) refreshResults();
  });

  provider.on("chainChanged", (newChainId) => {
    chainId = newChainId;
    showNetwork(newChainId);
    updateControls();
    if (account) refreshResults();
  });
}

updateControls();
