import axios from 'axios';

const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

export const uploadJournalToIPFS = async (journalData, logStep) => {
  try {
    console.log("Uploading journal to Pinata...");
    logStep("Uploading journal to Pinata...");
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const body = {
      pinataContent: journalData,
      pinataMetadata: { name: "JournalEntry" },
    };
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    };

    console.log("Sending request to", url);
    logStep(`Sending request to ${url}...`);
    const response = await axios.post(url, body, { headers });
    console.log("Upload success, IPFS Hash:", response.data.IpfsHash);
    logStep(`Upload success, IPFS Hash: ${response.data.IpfsHash}`);
    return { success: true, cid: response.data.IpfsHash };
  } catch (error) {
    console.error("Error uploading journal:", error.response?.data?.error || error.message);
    logStep(`Error uploading journal: ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.message };
  }
};

export const uploadImageToIPFS = async (imageFile, logStep) => {
  try {
    console.log("Uploading image to Pinata:", imageFile.name);
    logStep(`Uploading image ${imageFile.name} to Pinata...`);
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append('file', imageFile);
    const metadata = JSON.stringify({ name: "JournalImage" });
    formData.append("pinataMetadata", metadata);

    const headers = {
      Authorization: `Bearer ${PINATA_JWT}`,
      "Content-Type": "multipart/form-data",
    };

    console.log("Sending image upload request to", url);
    logStep(`Sending image upload request to ${url}...`);
    const response = await axios.post(url, formData, { headers });
    console.log("Image upload success, IPFS Hash:", response.data.IpfsHash);
    logStep(`Image upload success, IPFS Hash: ${response.data.IpfsHash}`);
    return { success: true, cid: response.data.IpfsHash };
  } catch (error) {
    console.error("Error uploading image:", error.response?.data?.error || error.message);
    logStep(`Error uploading image: ${error.response?.data?.error || error.message}`);
    return { success: false, error: error.message };
  }
};

export const fetchJournalFromIPFS = async (cid, logStep) => {
  try {
    console.log("Fetching journal from IPFS with CID:", cid);
    logStep(`Fetching journal from IPFS with CID: ${cid}...`);
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log("Journal fetched successfully from IPFS.");
    logStep("Journal fetched successfully from IPFS.");
    return response.data;
  } catch (error) {
    console.error("Error fetching journal from IPFS:", error);
    logStep(`Error fetching journal from IPFS: ${error.message}`);
    return null;
  }
};