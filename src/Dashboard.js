import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { uploadJournalToIPFS, uploadImageToIPFS } from "./pinataAPI";//Import Pinata API Functions
// import { createHelia } from 'helia';
// import {unixfs} from '@helia/unixfs';
// import {json} from '@helia/json';
import {fromString, toString} from 'uint8arrays';

// let ipfsClient;

// const setupIPFS=async()=> {
//   try{
//   ipfsClient=await createHelia();
//   console.log("Helia IPFS client initialised");
//   } 
//   catch(error)
//   {
//     console.error("Error initialising helia:",error);
//   }
// };

const Dashboard = ({ user }) => {
  // Hooks
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [mood, setMood] = useState("Happy"); // Default mood
  const [customMood, setCustomMood] = useState(""); // For adding new moods
  const [moodsList, setMoodsList] = useState(["Happy", "Sad", "Excited", "Calm"]); // Initial moods
  const [previewImages, setPreviewImages] =useState([]);
  // Handle input changes
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleNoteChange = (e) => setNote(e.target.value);

  //handling multiple image uploads
  const handleImageChange = (e) => {
    // const files = e.target.files;
    // if (files) {
    //   const fileArray = Array.from(files);
    //   const readerPromises = fileArray.map((file) => {
    //     return new Promise((resolve, reject) => {
    //       const reader = new FileReader();
    //       reader.onloadend = () => resolve(reader.result);
    //       reader.onerror = reject;
    //       reader.readAsDataURL(file);
    //     });
    //   });

    //   Promise.all(readerPromises)
    //     .then((imagesBase64) => setImages(imagesBase64))
    //     .catch((error) => console.error("Error reading images:", error));
    // }


    //after pinata
    const files =Array.from(e.target.files);
    setImages(files);

    const previewURLs=files.map(file => URL.createObjectURL(file));
    setPreviewImages(previewURLs);
  };

  const handleSaveNote = async() => {
    // if(!ipfsClient){
    //   alert("IPFS is not initialized yet.");
    //   return;
    // }
    if(!title.trim() && !note.trim()){
      alert("Please enter both title and note before saving");
      return;
    }
    try
    {
      //creating journal object
      const journalData={
        title,
        text: note,
        timestamp: new Date().toLocaleString(),
        mood,
      };

        //add the journal text as json to ipfs
        // const journalJson=JSON.stringify(journalData);

        const journalResponse = await uploadJournalToIPFS(journalData);
        console.log("Journal Upload Response: ", journalResponse);
        if(!journalResponse.success){
          throw new Error("Failed to upload journal JSON to IPFS.");
        }

        const journalCID=journalResponse.cid;
        // const jsonStore=json(ipfsClient);
        // const journalCID=await jsonStore.add(journalJson);

        // const journalCIDString=journalCID.toString();
        // console.log("Journal stored on IPFS with CID:", journalCIDString);

        // const fs=unixfs(ipfsClient);

        //upload images to IPFS
        let imageCIDs=[];
        for(const image of images)
        {
          // const imageData=fromString(image);
          // const imageCID=await fs.addBytes(imageData);
          // imageCIDs.push(imageCID.toString());
          const imageResponse=await uploadImageToIPFS(image);
          if(!imageResponse.success){
            throw new Error("Failed to upload image to IPFS.");
          }
          imageCIDs.push(imageResponse.cid);
        }

        console.log("Journal stored on IPFS:", journalCID);
        console.log("Images stored on IPFS:",imageCIDs);
        // // const addedText=await ipfsClient.add(JSON.stringify(journalData));
        // let imageHashes=[];
        // //add images to ipfs
        // if(images.length>0)
        // {
        //   const imagePromises=images.map(async (image)=>{
        //     const addedImage=await ipfsClient.add(image);
        //     imageHashes.push(addedImage.path);
        //   });
        //   await Promise.all(imagePromises);
        // }

        // const ipfsHashes = {
        //   journal:addedText.path,
        //   images:imageHashes,
        // };

        // const newNote = {
        //   title,
        //   text: note,
        //   timestamp: new Date().toLocaleString(),
        //   images,
        //   mood, // Add selected mood to the entry
        // };

        const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
        storedNotes.push({
          title,
          journalCID,
          imageCIDs,
          timestamp:journalData.timestamp,
          mood,
        });
        localStorage.setItem("notes", JSON.stringify(storedNotes));

        setNotesList(storedNotes);

        // Reset inputs for the next entry
        setTitle("");
        setNote("");
        setImages([]);
        setMood("Happy");
    }
    catch(error)
    {
      console.error('Error saving journal:',error);
      alert('There was an error saving your journal. Please try again.');
    }
    //  else {
    //   alert("Please enter both title and note before saving.");
    // }
  };

  const handleCustomMood = () => {
    if (customMood.trim()) {
      setMoodsList([...moodsList, customMood]);
      setCustomMood("");
    }
  };

//   const loadNotes = () => {
//     const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
//     setNotesList(storedNotes);
//   };


// //initialising ipfs
//   useEffect(() => {
//     setupIPFS();
//   }, []);

//   useEffect(() => {
//     loadNotes();
//   }, []);

useEffect(() => {
  const storedNotes =JSON.parse(localStorage.getItem("notes"))|| [];
  setNotesList(storedNotes);
}, []);;

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name}!</h1>
      <h2>Dashboard (Journaling with IPFS)</h2>

      <div className="note-form">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter Title"
          className="note-title"
        />

        {/* Note Textarea */}
        <textarea
          value={note}
          onChange={handleNoteChange}
          placeholder="Start your journal here..."
          rows="5"
          cols="50"
          className="note-content"
        ></textarea>

        {/* Mood Tracker */}
        <div className="mood-tracker">
          <h3>How are you feeling today?</h3>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="mood-dropdown"
          >
            {moodsList.map((moodOption, index) => (
              <option key={index} value={moodOption}>
                {moodOption}
              </option>
            ))}
          </select>

          <div className="add-mood">
            <input
              type="text"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              placeholder="Add custom mood"
              className="custom-mood-input"
            />
            <button onClick={handleCustomMood} className="add-mood-button">
              Add Mood
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="image-upload"
        />

        {/* Image Previews */}
        <div className="image-previews">
          {previewImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Uploaded preview ${index}`}
              style={{ maxWidth: "100px", marginTop: "10px", marginRight: "5px" }}
            />
          ))}
        </div>

        {/* Save Button */}
        <button onClick={handleSaveNote}>Save Journal</button>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        <h3>Saved Journals</h3>
        {notesList.length === 0 ? (
          <p>No journals available</p>
        ) : (
          notesList && notesList.length>0 && notesList.map((note, index) => (
            <div key={index} className="note-item">
              <h4>{note.title}</h4>
              <p>
                <strong>Timestamp:</strong> {note.timestamp}
              </p>
              <p>
                <strong>Mood:</strong> {note.mood}
              </p>
              <p>
                <strong>Journal IPFS:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${note.journalCID}`} target="_blank" rel="noopener noreferrer">{note.journalCID}</a>
              </p>
              {/* <p>
                <strong>Entry:</strong> {note.text}
              </p> */}
              <p><strong>Images:</strong></p>
              {/* {note.imageCIDs > 0 && not (
                <div className="note-images">
                  {note.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Note image ${idx}`}
                      style={{ maxWidth: "100px" }}
                    />
                  ))}
                </div>
              )} */}
              {note.imageCIDs && note.imageCIDs.length > 0 &&
                note.imageCIDs.map((cid, idx) => (
                  <a key={idx} href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">
                    <img src={`https://gateway.pinata.cloud/ipfs/${cid}`} alt="Journal" width="100" />
                  </a>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
