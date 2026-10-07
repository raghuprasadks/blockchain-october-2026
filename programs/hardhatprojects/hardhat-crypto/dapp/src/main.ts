import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  getAddress,
  isAddress,
  parseAbi,
  parseUnits,
  type Address,
  type EIP1193Provider,
  type Hash,
} from "viem";
import { sepolia } from "viem/chains";
import "./style.css";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

const TOKEN_ADDRESS = getAddress("0xb879B9678BfaD2F8226b5a0B4231944C935e3235");
const TOKEN_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
]);

const balanceElement = getElement<HTMLParagraphElement>("balance");
const accountElement = getElement<HTMLParagraphElement>("account");
const connectButton = getElement<HTMLButtonElement>("connect-button");
const refreshButton = getElement<HTMLButtonElement>("refresh-button");
const transferForm = getElement<HTMLFormElement>("transfer-form");
const recipientInput = getElement<HTMLInputElement>("recipient");
const amountInput = getElement<HTMLInputElement>("amount");
const sendButton = getElement<HTMLButtonElement>("send-button");
const statusElement = getElement<HTMLDivElement>("status");
const tokenLink = getElement<HTMLAnchorElement>("token-link");

let account: Address | undefined;
let publicClient: ReturnType<typeof createPublicClient> | undefined;
let walletClient: ReturnType<typeof createWalletClient> | undefined;
let subscribedProvider: EIP1193Provider | undefined;
let tokenDecimals = 18;
let busy = false;

tokenLink.href = `https://sepolia.etherscan.io/address/${TOKEN_ADDRESS}`;

connectButton.addEventListener("click", () => void connectWallet());
refreshButton.addEventListener("click", () => void refreshBalance());
transferForm.addEventListener("submit", (event) => {
  event.preventDefault();
  void sendTokens();
});

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required page element #${id} was not found.`);
  }
  return element as T;
}

function setStatus(message: string, kind: "info" | "success" | "error" = "info") {
  statusElement.textContent = message;
  statusElement.dataset.kind = kind;
}

function setBusy(value: boolean) {
  busy = value;
  connectButton.disabled = value;
  refreshButton.disabled = value || !account;
  sendButton.disabled = value || !account;
  sendButton.textContent = value ? "Please wait..." : account ? "Send MTK" : "Connect wallet to send";
}

function setBalance(value: string) {
  const symbol = document.createElement("span");
  symbol.textContent = "MTK";
  balanceElement.replaceChildren(document.createTextNode(`${value} `), symbol);
}

function formatBalance(value: bigint): string {
  const [whole, fraction = ""] = formatUnits(value, tokenDecimals).split(".");
  const trimmedFraction = fraction.replace(/0+$/, "");
  return `${BigInt(whole).toLocaleString()}${trimmedFraction ? `.${trimmedFraction}` : ""}`;
}

function describeError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 4001
  ) {
    return "The wallet request was rejected.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected wallet error occurred.";
}

async function switchToSepolia(provider: EIP1193Provider) {
  const chainId = await provider.request({ method: "eth_chainId" });
  if (typeof chainId !== "string") {
    throw new Error("MetaMask returned an invalid network ID.");
  }
  if (Number(chainId) === sepolia.id) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${sepolia.id.toString(16)}` }],
    });
  } catch (error) {
    if (
      typeof error !== "object" ||
      error === null ||
      !("code" in error) ||
      error.code !== 4902
    ) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${sepolia.id.toString(16)}`,
          chainName: "Sepolia",
          nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://ethereum-sepolia-rpc.publicnode.com"],
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        },
      ],
    });
  }
}

async function initializeAccount(provider: EIP1193Provider, address: Address): Promise<boolean> {
  account = getAddress(address);
  refreshButton.disabled = true;
  sendButton.disabled = true;
  walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: custom(provider),
  });
  publicClient = createPublicClient({
    chain: sepolia,
    transport: custom(provider),
  });
  accountElement.textContent = `${account.slice(0, 6)}…${account.slice(-4)}`;
  refreshButton.disabled = false;
  sendButton.disabled = false;
  sendButton.textContent = "Send MTK";

  try {
    const [name, symbol, decimals] = await Promise.all([
      publicClient.readContract({ address: TOKEN_ADDRESS, abi: TOKEN_ABI, functionName: "name" }),
      publicClient.readContract({ address: TOKEN_ADDRESS, abi: TOKEN_ABI, functionName: "symbol" }),
      publicClient.readContract({ address: TOKEN_ADDRESS, abi: TOKEN_ABI, functionName: "decimals" }),
    ]);
    tokenDecimals = decimals;
    document.title = `${name} (${symbol}) | Sepolia`;
    const loaded = await refreshBalance();
    sendButton.disabled = false;
    return loaded;
  } catch (error) {
    account = undefined;
    walletClient = undefined;
    publicClient = undefined;
    accountElement.textContent = "Not connected";
    setBalance("--");
    refreshButton.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "Connect wallet to send";
    throw error;
  }
}

async function connectWallet() {
  const provider = window.ethereum;
  if (!provider) {
    setStatus("MetaMask was not detected. Install or enable the MetaMask browser extension.", "error");
    return;
  }

  setBusy(true);
  setStatus("Connecting to MetaMask…");
  try {
    const accounts = await provider.request({ method: "eth_requestAccounts" });
    if (!Array.isArray(accounts) || typeof accounts[0] !== "string" || !isAddress(accounts[0])) {
      throw new Error("MetaMask did not return a valid account.");
    }
    await switchToSepolia(provider);
    if (await initializeAccount(provider, getAddress(accounts[0]))) {
      setStatus("Wallet connected to Sepolia.", "success");
    }

    if (subscribedProvider !== provider) {
      subscribedProvider = provider;
      provider.on("accountsChanged", (nextAccounts) => {
        if (!nextAccounts.length) {
          account = undefined;
          walletClient = undefined;
          publicClient = undefined;
          accountElement.textContent = "Not connected";
          setBalance("--");
          refreshButton.disabled = true;
          sendButton.disabled = true;
          sendButton.textContent = "Connect wallet to send";
          setStatus("Wallet disconnected.");
          return;
        }
        void initializeAccount(provider, nextAccounts[0]).then((loaded) => {
          if (loaded) {
            setStatus("Wallet account updated.", "success");
          }
        }).catch((error: unknown) => {
          setStatus(describeError(error), "error");
        });
      });
      provider.on("chainChanged", (chainId) => {
        if (Number(chainId) !== sepolia.id) {
          publicClient = undefined;
          walletClient = undefined;
          refreshButton.disabled = true;
          sendButton.disabled = true;
          setStatus("Switch MetaMask back to Sepolia to use this app.", "error");
          return;
        }
        if (account) {
          void initializeAccount(provider, account).then((loaded) => {
            if (loaded) {
              setStatus("Connected to Sepolia.", "success");
            }
          }).catch((error: unknown) => {
            setStatus(describeError(error), "error");
          });
        }
      });
    }
  } catch (error) {
    setStatus(describeError(error), "error");
  } finally {
    setBusy(false);
  }
}

async function refreshBalance(): Promise<boolean> {
  if (!account || !publicClient) {
    return false;
  }
  refreshButton.disabled = true;
  try {
    const rawBalance = await publicClient.readContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: "balanceOf",
      args: [account],
    });
    setBalance(formatBalance(rawBalance));
    return true;
  } catch (error) {
    setStatus(describeError(error), "error");
    return false;
  } finally {
    refreshButton.disabled = !account || busy;
  }
}

async function sendTokens() {
  if (!account || !walletClient || !publicClient) {
    setStatus("Connect your MetaMask wallet first.", "error");
    return;
  }
  const recipient = recipientInput.value.trim();
  const amount = amountInput.value.trim();
  if (!isAddress(recipient)) {
    setStatus("Enter a valid recipient wallet address.", "error");
    recipientInput.focus();
    return;
  }
  if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    setStatus("Enter an amount greater than zero.", "error");
    amountInput.focus();
    return;
  }

  let value: bigint;
  try {
    value = parseUnits(amount, tokenDecimals);
  } catch {
    setStatus(`Amount must have no more than ${tokenDecimals} decimal places.`, "error");
    amountInput.focus();
    return;
  }
  if (value <= 0n) {
    setStatus("Enter an amount greater than zero.", "error");
    return;
  }

  setBusy(true);
  setStatus("Confirm the transfer in MetaMask…");
  try {
    const hash: Hash = await walletClient.writeContract({
      address: TOKEN_ADDRESS,
      abi: TOKEN_ABI,
      functionName: "transfer",
      args: [getAddress(recipient), value],
      account,
      chain: sepolia,
    });
    setStatus("Transaction submitted. Waiting for confirmation…");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error("The transfer transaction reverted.");
    }
    transferForm.reset();
    await refreshBalance();
    setStatus("Transfer confirmed on Sepolia.", "success");

    const transactionLink = document.createElement("a");
    transactionLink.href = `https://sepolia.etherscan.io/tx/${hash}`;
    transactionLink.target = "_blank";
    transactionLink.rel = "noreferrer";
    transactionLink.textContent = " View transaction on Etherscan ↗";
    statusElement.append(transactionLink);
  } catch (error) {
    setStatus(describeError(error), "error");
  } finally {
    setBusy(false);
  }
}
