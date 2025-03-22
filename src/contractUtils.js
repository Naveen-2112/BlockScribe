import { ethers } from "ethers";
import JournalStorageABI from "./JournalStorageABI.json";

const CONTRACT_ADDRESS = "0x1079f495a59E98Fc4Ae50F3228351bF31B7D2CDe"; 
const SEPOLIA_RPC_URL = process.env.REACT_APP_SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;

export const getBlockchain = async (logStep) => {
  console.log("Initializing Blockchain Connection...");
  logStep("Initializing Blockchain Connection...");
  if (!SEPOLIA_RPC_URL || !PRIVATE_KEY) {
    console.error("Missing RPC URL or Private Key in environment variables");
    logStep("Missing RPC URL or Private Key in environment variables");
    return null;
  }
  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, JournalStorageABI, signer);
  console.log("Blockchain Connected Successfully.");
  logStep("Blockchain Connected Successfully.");
  return contract;
};

export const addJournalToBlockchain = async (title, journalCID, imageCIDs, timestamp, mood, userId, logStep) => {
  try {
    console.log("Fetching contract to store journal...");
    logStep("Fetching contract to store journal...");
    const contract = await getBlockchain(logStep);
    if (!contract) return null;

    console.log("Sending transaction to store journal on blockchain...");
    logStep("Sending transaction to store journal on blockchain...");
    const tx = await contract.addJournalEntry(title, journalCID, imageCIDs, timestamp, mood, userId);
    const receipt = await tx.wait();
    console.log("Journal stored successfully on blockchain: Transaction Hash:", receipt.hash);
    logStep(`Journal stored successfully on blockchain: Transaction Hash: ${receipt.hash}`);
    return receipt.hash;
  } catch (error) {
    console.error("Error storing journal on blockchain:", error);
    logStep(`Error storing journal on blockchain: ${error.message}`);
    return null;
  }
};

export const fetchUserJournals = async (userId, logStep) => {
  try {
    console.log("Fetching journal entries from blockchain for user:", userId);
    logStep(`Fetching journal entries from blockchain for user: ${userId}`);
    const contract = await getBlockchain(logStep);
    if (!contract) return [];

    const entries = await contract.getJournalEntries(userId);
    console.log("Fetched journal entries from blockchain:", entries);
    logStep("Fetched journal entries from blockchain successfully.");
    return entries;
  } catch (error) {
    console.error("Error fetching journals:", error);
    logStep(`Error fetching journals: ${error.message}`);
    return [];
  }
};