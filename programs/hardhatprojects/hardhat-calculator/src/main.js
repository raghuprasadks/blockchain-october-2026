const UINT256_MAX = (1n << 256n) - 1n;
const OPERATIONS = {
  add: { selector: "771602f7", label: "Addition" },
  subtract: { selector: "3ef5e445", label: "Subtraction" },
  multiply: { selector: "165c4a16", label: "Multiplication" },
  divide: { selector: "f88e9fbf", label: "Division" },
};

const connectButton = document.querySelector("#connect-wallet");
const contractAddressInput = document.querySelector("#contract-address");
const operandAInput = document.querySelector("#operand-a");
const operandBInput = document.querySelector("#operand-b");
const networkLabel = document.querySelector("#network-id");
const resultLabel = document.querySelector("#result-label");
const resultOutput = document.querySelector("#result");
const messageOutput = document.querySelector("#message");
const operationButtons = [...document.querySelectorAll("[data-operation]")];

let connectedAccount;

function showMessage(message, isError = false) {
  messageOutput.textContent = message;
  messageOutput.classList.toggle("is-error", isError);
}

function getProvider() {
  if (!window.ethereum) {
    throw new Error("No browser wallet found. Install MetaMask or another EVM wallet.");
  }
  return window.ethereum;
}

function getUint256(input, label) {
  const value = input.trim();
  if (!/^\d+$/.test(value)) {
    throw new Error(`${label} must be a non-negative whole number.`);
  }

  const parsed = BigInt(value);
  if (parsed > UINT256_MAX) {
    throw new Error(`${label} exceeds the maximum uint256 value.`);
  }
  return parsed;
}

function encodeArgument(value) {
  return value.toString(16).padStart(64, "0");
}

function formatWallet(account) {
  return `${account.slice(0, 6)}…${account.slice(-4)}`;
}

async function connectWallet() {
  const provider = getProvider();
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error("The wallet did not return an account.");
  }

  connectedAccount = accounts[0];
  const chainId = await provider.request({ method: "eth_chainId" });
  connectButton.textContent = formatWallet(connectedAccount);
  networkLabel.textContent = `Chain ${BigInt(chainId).toString(10)}`;
  showMessage("Wallet connected. Enter a deployed contract address and choose an operation.");
}

async function calculate(operationName) {
  const provider = getProvider();
  if (!connectedAccount) {
    throw new Error("Connect your wallet before calling the calculator.");
  }

  const address = contractAddressInput.value.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Enter a valid 0x-prefixed contract address.");
  }

  const a = getUint256(operandAInput.value, "First number");
  const b = getUint256(operandBInput.value, "Second number");
  if (operationName === "subtract" && a < b) {
    throw new Error("Subtraction requires the first number to be greater than or equal to the second.");
  }
  if (operationName === "divide" && b === 0n) {
    throw new Error("Cannot divide by zero.");
  }

  const code = await provider.request({
    method: "eth_getCode",
    params: [address, "latest"],
  });
  if (code === "0x" || code === "0x0") {
    throw new Error("No contract was found at that address on the connected network.");
  }

  const { selector, label } = OPERATIONS[operationName];
  const data = `0x${selector}${encodeArgument(a)}${encodeArgument(b)}`;
  const response = await provider.request({
    method: "eth_call",
    params: [{ to: address, data }, "latest"],
  });
  if (typeof response !== "string" || !/^0x[0-9a-fA-F]{64,}$/.test(response)) {
    throw new Error("The contract returned an invalid uint256 result.");
  }

  const result = BigInt(response);
  resultLabel.textContent = label.toUpperCase();
  resultOutput.textContent = result.toString(10);
  showMessage(`${operationName}(${a}, ${b}) was read from the connected network.`);
}

connectButton.addEventListener("click", async () => {
  connectButton.disabled = true;
  try {
    await connectWallet();
  } catch (error) {
    showMessage(error instanceof Error ? error.message : String(error), true);
  } finally {
    connectButton.disabled = false;
  }
});

for (const button of operationButtons) {
  button.addEventListener("click", async () => {
    const operationName = button.dataset.operation;
    if (!operationName || !Object.hasOwn(OPERATIONS, operationName)) {
      showMessage("Unknown calculator operation.", true);
      return;
    }

    operationButtons.forEach((operationButton) => {
      operationButton.disabled = true;
    });
    showMessage(`Calling ${operationName} on the connected network…`);
    try {
      await calculate(operationName);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : String(error), true);
    } finally {
      operationButtons.forEach((operationButton) => {
        operationButton.disabled = false;
      });
    }
  });
}

if (!window.ethereum) {
  connectButton.textContent = "Wallet not found";
  showMessage("Install a browser wallet, such as MetaMask, to use this dApp.", true);
} else {
  window.ethereum.on?.("accountsChanged", (accounts) => {
    connectedAccount = accounts[0];
    connectButton.textContent = connectedAccount
      ? formatWallet(connectedAccount)
      : "Connect wallet";
    showMessage(
      connectedAccount
        ? "Wallet account changed."
        : "Wallet disconnected. Connect your wallet to continue.",
    );
  });

  window.ethereum.on?.("chainChanged", (chainId) => {
    networkLabel.textContent = `Chain ${BigInt(chainId).toString(10)}`;
    resultOutput.textContent = "—";
    showMessage("Network changed. Make sure the contract address matches this network.");
  });
}
