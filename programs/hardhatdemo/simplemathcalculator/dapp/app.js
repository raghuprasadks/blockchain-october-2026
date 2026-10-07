const LOCAL_CHAIN_ID = "0x7a69";
const PAGE_SIZE = 20;
const UINT256_MAX = (1n << 256n) - 1n;
const SELECTORS = {
  owner: "0x8da5cb5b",
  resultCount: "0xaa4fdefb",
  getResult: "0x995e4339",
  recordResult: "0x2017f580",
};

const provider = window.ethereum;
const connectButton = document.querySelector("#connect-button");
const connectLabel = document.querySelector("#connect-label");
const walletAddressLabel = document.querySelector("#wallet-address");
const lecturerLabel = document.querySelector("#lecturer-label");
const networkPill = document.querySelector("#network-pill");
const contractAddressInput = document.querySelector("#contract-address");
const loadButton = document.querySelector("#load-button");
const resultForm = document.querySelector("#result-form");
const submitButton = document.querySelector("#submit-button");
const submitLabel = document.querySelector("#submit-label");
const refreshButton = document.querySelector("#refresh-button");
const resultsBody = document.querySelector("#results-body");
const resultCountLabel = document.querySelector("#result-count");
const pageLabel = document.querySelector("#page-label");
const previousPageButton = document.querySelector("#previous-page");
const nextPageButton = document.querySelector("#next-page");
const statusMessage = document.querySelector("#transaction-status");

let account;
let chainId;
let lecturer;
let currentPage = 0;
let totalResults = 0;

contractAddressInput.value = localStorage.getItem("bcaResultsContractAddress") ?? "";

function showStatus(message, state = "") {
  statusMessage.textContent = message;
  if (state) {
    statusMessage.dataset.state = state;
  } else {
    delete statusMessage.dataset.state;
  }
}

function formatError(error) {
  if (error?.code === 4001) {
    return "The wallet request was rejected.";
  }
  const message = error?.shortMessage ?? error?.message ?? String(error);
  return message.split("\n")[0];
}

function formatAddress(address) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function updateWalletStatus() {
  const isLocalChain = chainId?.toLowerCase() === LOCAL_CHAIN_ID;
  networkPill.classList.toggle("is-connected", Boolean(isLocalChain && account));
  connectLabel.textContent = account ? "Lecturer wallet connected" : "Connect lecturer wallet";
  walletAddressLabel.textContent = account
    ? `${formatAddress(account)}${lecturer ? " · Authorized lecturer" : " · View-only account"}`
    : "Connect the account that deployed the register.";
  lecturerLabel.textContent = account ? formatAddress(account) : "Wallet not connected";
  if (!isLocalChain) {
    networkPill.classList.remove("is-connected");
  }
  updateSubmitAvailability();
}

function updateSubmitAvailability() {
  const address = contractAddressInput.value.trim();
  submitButton.disabled = !(
    provider &&
    account &&
    chainId?.toLowerCase() === LOCAL_CHAIN_ID &&
    lecturer &&
    address &&
    account.toLowerCase() === lecturer.toLowerCase()
  );
}

function word(value) {
  return BigInt(value).toString(16).padStart(64, "0");
}

function encodeString(value) {
  const bytes = new TextEncoder().encode(value);
  let encoded = "";
  for (const byte of bytes) {
    encoded += byte.toString(16).padStart(2, "0");
  }
  const paddedLength = Math.ceil(bytes.length / 32) * 64;
  return `${word(bytes.length)}${encoded.padEnd(paddedLength, "0")}`;
}

function encodeRecordCall({ studentName, usn, subject, semester, testName, marks }) {
  const values = [studentName, usn, subject, BigInt(semester), testName, marks];
  const headSize = values.length * 32;
  const head = [];
  const tail = [];
  let tailSize = 0;

  for (const value of values) {
    if (typeof value === "string") {
      const encoded = encodeString(value);
      head.push(word(headSize + tailSize));
      tail.push(encoded);
      tailSize += encoded.length / 2;
    } else {
      head.push(word(value));
    }
  }
  return `${SELECTORS.recordResult}${head.join("")}${tail.join("")}`;
}

function readWord(data, index) {
  const start = 2 + index * 64;
  const encoded = data.slice(start, start + 64);
  if (encoded.length !== 64) {
    throw new Error("The contract returned incomplete result data.");
  }
  return BigInt(`0x${encoded}`);
}

function decodeString(data, offset) {
  const length = Number(readWord(data, Number(offset) / 32));
  if (!Number.isSafeInteger(length)) {
    throw new Error("The contract returned an invalid text field.");
  }
  const start = 2 + Number(offset) * 2 + 64;
  const encoded = data.slice(start, start + length * 2);
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Number.parseInt(encoded.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

function decodeResult(data) {
  return {
    studentName: decodeString(data, readWord(data, 0)),
    usn: decodeString(data, readWord(data, 1)),
    subject: decodeString(data, readWord(data, 2)),
    semester: Number(readWord(data, 3)),
    testName: decodeString(data, readWord(data, 4)),
    marks: readWord(data, 5).toString(),
    recordedBy: `0x${data.slice(2 + 6 * 64 + 24, 2 + 7 * 64)}`,
  };
}

function getContractAddress() {
  const address = contractAddressInput.value.trim();
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error("Enter a valid 20-byte contract address.");
  }
  return address;
}

async function requireLocalChain() {
  if (!provider) {
    throw new Error("No browser wallet found. Install or enable MetaMask to continue.");
  }
  chainId = await provider.request({ method: "eth_chainId" });
  updateWalletStatus();
  if (chainId.toLowerCase() !== LOCAL_CHAIN_ID) {
    throw new Error("Connect MetaMask to the local Hardhat network (chain ID 31337).");
  }
}

async function callContract(address, data) {
  return provider.request({
    method: "eth_call",
    params: [{ to: address, data }, "latest"],
  });
}

async function assertContractExists(address) {
  const code = await provider.request({
    method: "eth_getCode",
    params: [address, "latest"],
  });
  if (!code || code === "0x" || code === "0x0") {
    throw new Error("No BCAResults contract found at that address on this network.");
  }
}

async function loadContractOwner() {
  await requireLocalChain();
  const address = getContractAddress();
  await assertContractExists(address);
  const encodedOwner = await callContract(address, SELECTORS.owner);
  lecturer = `0x${encodedOwner.slice(-40)}`;
  updateWalletStatus();
}

async function readRecord(address, index) {
  const encoded = await callContract(address, `${SELECTORS.getResult}${word(index)}`);
  return decodeResult(encoded);
}

function makeCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.append(cell);
}

async function refreshResults() {
  await requireLocalChain();
  const address = getContractAddress();
  await assertContractExists(address);
  const encodedCount = await callContract(address, SELECTORS.resultCount);
  const count = Number(BigInt(encodedCount));
  if (!Number.isSafeInteger(count)) {
    throw new Error("The contract result count is too large to display.");
  }
  totalResults = count;
  const pageCount = Math.max(1, Math.ceil(totalResults / PAGE_SIZE));
  currentPage = Math.min(currentPage, pageCount - 1);
  const firstIndex = Math.max(0, totalResults - (currentPage + 1) * PAGE_SIZE);
  const lastIndex = Math.max(-1, totalResults - currentPage * PAGE_SIZE - 1);
  const indices = [];
  for (let index = lastIndex; index >= firstIndex; index -= 1) {
    indices.push(index);
  }

  const records = await Promise.all(indices.map((index) => readRecord(address, index)));
  resultsBody.replaceChildren();
  if (records.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "empty-state";
    cell.colSpan = 7;
    cell.textContent = "No results recorded yet.";
    row.append(cell);
    resultsBody.append(row);
  } else {
    for (const result of records) {
      const row = document.createElement("tr");
      makeCell(row, result.studentName);
      makeCell(row, result.usn);
      makeCell(row, result.subject);
      makeCell(row, `Semester ${result.semester}`);
      makeCell(row, result.testName);
      makeCell(row, result.marks);
      makeCell(row, formatAddress(result.recordedBy));
      resultsBody.append(row);
    }
  }

  resultCountLabel.textContent = String(totalResults);
  pageLabel.textContent = totalResults === 0
    ? "No results"
    : `Showing ${firstIndex + 1}–${lastIndex + 1} of ${totalResults}`;
  previousPageButton.disabled = currentPage === 0;
  nextPageButton.disabled = currentPage >= pageCount - 1;
}

async function switchToLocalNetwork() {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: LOCAL_CHAIN_ID }],
    });
  } catch (error) {
    if (error?.code !== 4902) {
      throw error;
    }
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: LOCAL_CHAIN_ID,
        chainName: "Hardhat Local",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["http://127.0.0.1:8545"],
      }],
    });
  }
  chainId = await provider.request({ method: "eth_chainId" });
}

async function connectWallet() {
  if (!provider) {
    throw new Error("No browser wallet found. Install or enable MetaMask to continue.");
  }
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  account = accounts[0];
  if (!account) {
    throw new Error("The wallet did not return an account.");
  }
  chainId = await provider.request({ method: "eth_chainId" });
  if (chainId.toLowerCase() !== LOCAL_CHAIN_ID) {
    await switchToLocalNetwork();
  }
  updateWalletStatus();
  showStatus("Wallet connected to the local Hardhat chain.");
  if (/^0x[0-9a-fA-F]{40}$/.test(contractAddressInput.value.trim())) {
    await loadContractOwner();
    await refreshResults();
  }
}

async function submitResult(event) {
  event.preventDefault();
  await requireLocalChain();
  if (!account) {
    throw new Error("Connect the lecturer wallet before recording a result.");
  }
  const address = getContractAddress();
  await loadContractOwner();
  if (account.toLowerCase() !== lecturer.toLowerCase()) {
    throw new Error("This wallet is not authorized to record results for this register.");
  }

  const marksText = document.querySelector("#marks").value.trim();
  if (!/^\d+$/.test(marksText)) {
    throw new Error("Marks must be a non-negative whole number.");
  }
  const marks = BigInt(marksText);
  if (marks > UINT256_MAX) {
    throw new Error("Marks are outside the supported range.");
  }

  const result = {
    studentName: document.querySelector("#student-name").value.trim(),
    usn: document.querySelector("#usn").value.trim(),
    subject: document.querySelector("#subject").value.trim(),
    semester: Number(document.querySelector("#semester").value),
    testName: document.querySelector("#test-name").value.trim(),
    marks,
  };
  if (!result.studentName || !result.usn || !result.subject || !result.testName) {
    throw new Error("Complete all result fields before saving.");
  }
  if (!Number.isInteger(result.semester) || result.semester < 1 || result.semester > 6) {
    throw new Error("Choose a semester between 1 and 6.");
  }

  await assertContractExists(address);
  submitButton.disabled = true;
  submitLabel.textContent = "Confirm transaction in wallet…";
  showStatus("Confirm this result submission in MetaMask.");
  const transactionHash = await provider.request({
    method: "eth_sendTransaction",
    params: [{
      from: account,
      to: address,
      data: encodeRecordCall(result),
    }],
  });
  submitLabel.textContent = "Waiting for confirmation…";
  showStatus("Transaction sent. Waiting for it to be mined…");
  await waitForReceipt(transactionHash);
  currentPage = 0;
  await refreshResults();
  resultForm.reset();
  showStatus(`Result recorded on-chain · ${transactionHash.slice(0, 10)}…`, "success");
}

async function waitForReceipt(transactionHash) {
  const timeout = Date.now() + 90_000;
  while (Date.now() < timeout) {
    const receipt = await provider.request({
      method: "eth_getTransactionReceipt",
      params: [transactionHash],
    });
    if (receipt) {
      if (receipt.status !== "0x1") {
        throw new Error("The transaction reverted. Check the result details and try again.");
      }
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error("Timed out waiting for the transaction to be mined.");
}

connectButton.addEventListener("click", async () => {
  connectButton.disabled = true;
  try {
    await connectWallet();
  } catch (error) {
    showStatus(formatError(error), "error");
  } finally {
    connectButton.disabled = false;
    updateSubmitAvailability();
  }
});

loadButton.addEventListener("click", async () => {
  loadButton.disabled = true;
  try {
    localStorage.setItem("bcaResultsContractAddress", contractAddressInput.value.trim());
    await loadContractOwner();
    await refreshResults();
    showStatus("BCA result register loaded.");
  } catch (error) {
    lecturer = undefined;
    updateWalletStatus();
    showStatus(formatError(error), "error");
  } finally {
    loadButton.disabled = false;
  }
});

refreshButton.addEventListener("click", async () => {
  refreshButton.disabled = true;
  try {
    await refreshResults();
    showStatus("Showing the latest results on the local chain.");
  } catch (error) {
    showStatus(formatError(error), "error");
  } finally {
    refreshButton.disabled = false;
  }
});

resultForm.addEventListener("submit", async (event) => {
  try {
    await submitResult(event);
  } catch (error) {
    showStatus(formatError(error), "error");
  } finally {
    submitLabel.textContent = "Save result to blockchain";
    updateSubmitAvailability();
  }
});

contractAddressInput.addEventListener("input", () => {
  lecturer = undefined;
  updateWalletStatus();
});

previousPageButton.addEventListener("click", async () => {
  currentPage -= 1;
  try {
    await refreshResults();
  } catch (error) {
    showStatus(formatError(error), "error");
  }
});

nextPageButton.addEventListener("click", async () => {
  currentPage += 1;
  try {
    await refreshResults();
  } catch (error) {
    showStatus(formatError(error), "error");
  }
});

if (provider?.on) {
  provider.on("accountsChanged", async (accounts) => {
    account = accounts[0];
    lecturer = undefined;
    updateWalletStatus();
    if (account && /^0x[0-9a-fA-F]{40}$/.test(contractAddressInput.value.trim())) {
      try {
        await loadContractOwner();
      } catch (error) {
        showStatus(formatError(error), "error");
      }
    }
  });

  provider.on("chainChanged", (newChainId) => {
    chainId = newChainId;
    lecturer = undefined;
    updateWalletStatus();
    showStatus(
      chainId.toLowerCase() === LOCAL_CHAIN_ID
        ? "Connected to the local Hardhat network."
        : "Switch MetaMask to the local Hardhat network (chain ID 31337).",
      chainId.toLowerCase() === LOCAL_CHAIN_ID ? "" : "error",
    );
  });
}

updateWalletStatus();
