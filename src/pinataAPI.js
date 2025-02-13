import axios from 'axios';
const PINATA_API_KEY= process.env.REACT_APP_PINATA_API_KEY;
const PINATA_SECRET_API_KEY=process.env.REACT_APP_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;

// console.log("API Key:", PINATA_API_KEY);
// console.log("Secret Key:", PINATA_SECRET_API_KEY);

//pinata base url
const PINATA_BASE_URL="https://api.pinata.cloud/pinning";


export const uploadJournalToIPFS = async (journalData) => {
    try {
      console.log("Uploading journal to Pinata...");
      
      const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
      const body = {
        pinataContent: journalData,
        pinataMetadata: { name: "JournalEntry" },
      };
  
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
        // pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
        // pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_KEY,
      };
  
      console.log("Request URL:", url);
      console.log("Request Headers:", headers);
      console.log("Request Body:", body);
  
      const response = await axios.post(url, body, { headers });
  
      console.log("Upload success, IPFS Hash:", response.data.IpfsHash);
      return { success: true, cid: response.data.IpfsHash };
    } catch (error) {
      console.error("Error uploading journal:", error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  };
  

export const uploadImageToIPFS=async (imageFile) => {
    try {
        console.log("Uploading image to pinata...");

        const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
        
        //Convert images to FormData (required for file uploads)
        const formData = new FormData();
        formData.append('file',imageFile);

        //metadata
        const metadata = JSON.stringify({ name: "JournalImage" });
        formData.append("pinataMetadata", metadata);

        // const response= await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, formData, {
        //     header: {
        //         'Content-Type':'multipart/form-data',
        //         pinata_api_key: PINATA_API_KEY,
        //         pinata_secret_api_key:PINATA_SECRET_API_KEY,
        //     },
        // });

        // Pinata requires specific headers for file uploads
        const headers = {
        Authorization: `Bearer ${PINATA_JWT}`, // 🔥 Using JWT instead of API key
        "Content-Type": "multipart/form-data",
        };

        console.log("Request URL:", url);
        console.log("Request Headers:", headers);
        console.log("Uploading image file:", imageFile.name);

        const response = await axios.post(url, formData, { headers });

        console.log("Image upload success, IPFS Hash:", response.data.IpfsHash);
        return { success: true, cid: response.data.IpfsHash };
    } catch(error){
        console.error('Error uploading image:',error);
        return { success: false, error: error.message };
    }
};


export const fetchJournalFromIPFS = async (cid) => {
  try {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`);
    return response.data; // JSON journal data
  } catch (error) {
    console.error("Error fetching journal from IPFS:", error);
    return null;
  }
};