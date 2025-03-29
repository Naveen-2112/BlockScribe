import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { uploadJournalToIPFS, uploadImageToIPFS, fetchJournalFromIPFS } from "./pinataAPI";
import { addJournalToBlockchain, fetchUserJournals } from "./contractUtils";

const Dashboard = ({ user }) => {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [mood, setMood] = useState("Happy");
  const [customMood, setCustomMood] = useState("");
  const [moodsList, setMoodsList] = useState(["Happy", "Sad", "Excited", "Calm"]);
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsQueue, setStepsQueue] = useState([]);
  const [progress, setProgress] = useState(0);
  const [loadingComplete, setLoadingComplete] = useState(false);

  // Custom log function to queue steps
  const logStep = (message) => {
    console.log(message);
    setStepsQueue((prev) => [...prev, message]);
  };

  // Process steps and percentage
  useEffect(() => {
    if (!isLoading || stepsQueue.length === 0) return;

    const totalSteps = stepsQueue.length;
    const stepDuration = 2500; // 2.5s per step (2s typing + 0.5s tick)
    const totalDuration = totalSteps * stepDuration;

    // Update current step
    if (stepIndex < totalSteps) {
      setCurrentStep(stepsQueue[stepIndex]);
      const timer = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
      }, stepDuration);
      return () => clearTimeout(timer);
    } else if (stepIndex >= totalSteps) {
      setIsLoading(false);
      setLoadingComplete(true);
      setStepsQueue([]);
      setStepIndex(0);
    }
  }, [stepsQueue, stepIndex, isLoading]);

  // Smooth percentage increment
  useEffect(() => {
    if (!isLoading || stepsQueue.length === 0) return;

    const totalSteps = stepsQueue.length;
    const totalDuration = totalSteps * 2500; // Total time in ms
    const interval = 100; // Update every 100ms
    const increment = (100 / totalDuration) * interval; // Percentage per interval

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [isLoading, stepsQueue]);
// Modified useEffect for progress calculation
// useEffect(() => {
//   if (!isLoading || stepsQueue.length === 0) return;

//   const totalSteps = stepsQueue.length;
//   const stepDuration = 2500; // 2.5s per step (2s typing + 0.5s tick)
  
//   // Calculate progress based on completed steps rather than time
//   const progressPerStep = 100 / totalSteps;
//   const currentProgress = (stepIndex / totalSteps) * 100;
  
//   // Update progress based on current step
//   setProgress(currentProgress);
  
//   // Only mark loading as complete when all steps are finished
//   if (stepIndex >= totalSteps) {
//     const completionTimer = setTimeout(() => {
//       setIsLoading(false);
//       setLoadingComplete(true);
//       setStepsQueue([]);
//       setStepIndex(0);
//     }, 500); // Small delay after final step
    
//     return () => clearTimeout(completionTimer);
//   }
// }, [stepsQueue, stepIndex, isLoading]);

// Remove the previous smooth percentage increment useEffect
// (Delete the existing useEffect that sets up progressTimer interval)
  const startLoading = () => {
    setIsLoading(true);
    setCurrentStep("");
    setStepsQueue([]);
    setStepIndex(0);
    setProgress(0);
    setLoadingComplete(false);
  };

  const stopLoading = () => {
    // No extra delay—handled by useEffect
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleNoteChange = (e) => setNote(e.target.value);
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previewURLs = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previewURLs);
  };

  const handleSaveNote = async () => {
    if (!title.trim() && !note.trim()) {
      startLoading();
      logStep("Please enter both title and note before saving");
      alert("Please enter both title and note before saving");
      return;
    }
    startLoading();
    try {
      const journalData = {
        title,
        text: note,
        timestamp: new Date().toLocaleString(),
        mood,
      };

      const journalResponse = await uploadJournalToIPFS(journalData, logStep);
      if (!journalResponse.success) throw new Error("Failed to upload journal JSON to IPFS.");
      const journalCID = journalResponse.cid;

      let imageCIDs = [];
      if (images.length > 0) {
        for (const image of images) {
          const imageResponse = await uploadImageToIPFS(image, logStep);
          if (!imageResponse.success) throw new Error("Failed to upload image to IPFS.");
          imageCIDs.push(imageResponse.cid);
        }
      }

      const userId = user.email;
      const txHash = await addJournalToBlockchain(title, journalCID, imageCIDs, journalData.timestamp, mood, userId, logStep);
      if (!txHash) throw new Error("Blockchain transaction failed.");

      const newJournal={
        title,
        journalCID,
        imageCIDs,
        timestamp:journalData.timestamp,
        mood
      };

      const updatedNotesList=[...notesList, newJournal];
      setNotesList(updatedNotesList);
      localStorage.setItem("notes",JSON.stringify(updatedNotesList));
      logStep("Journal saved and added to displayed list");
      setTitle("");
      setNote("");
      setImages([]);
      setPreviewImages([]);
      setMood("Happy");
    } catch (error) {
      logStep(`Error saving journal: ${error.message}`);
    }
  };

  const handleJournalClick = async (journalCID, imageCIDs) => {
    startLoading();
    try {
      const journalData = await fetchJournalFromIPFS(journalCID, logStep);
      if (!journalData) {
        logStep("Failed to retrieve journal entry.");
        alert("Failed to retrieve journal entry.");
        return;
      }

      const imageURLs = await Promise.all(
        (imageCIDs || []).map(async (cid) => {
          try {
            const imageUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
            logStep(`Fetched image from IPFS: ${imageUrl}`);
            return imageUrl;
          } catch (error) {
            logStep(`Error fetching image ${cid}: ${error.message}`);
            return null;
          }
        })
      );
      const validImageURLs = imageURLs.filter((url) => url !== null);

      setSelectedNote({ ...journalData, journalCID, imageCIDs });
      setSelectedImages(validImageURLs);
      setShowModal(true);
    } catch (error) {
      logStep(`Error fetching journal entry: ${error.message}`);
      alert("An error occurred while fetching the journal entry.");
    }
  };

  const handleCustomMood = () => {
    if (customMood.trim()) {
      setMoodsList([...moodsList, customMood]);
      setCustomMood("");
      startLoading();
      logStep(`Added custom mood: ${customMood}`);
    }
  };

  useEffect(() => {
    if (user) {
      startLoading();
      fetchUserJournals(user.email, logStep)
        .then((entries) => {
          const formattedEntries = entries.map((entry) => ({
            title: entry.title,
            journalCID: entry.ipfsHash,
            imageCIDs: entry.imageHashes,
            timestamp: entry.timestamp,
            mood: entry.mood,
          }));
          localStorage.setItem("notes", JSON.stringify(formattedEntries));
          setNotesList(formattedEntries);
          logStep("Stored journals in localStorage.");
        })
        .catch((error) => {
          logStep(`Error fetching journals: ${error.message}`);
        });
    }
  }, [user]);

  if (!user) return <p>Loading...</p>;
  if (!loadingComplete && !isLoading) return null;

  return (
    <div className="dashboard-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="progress-text">Loading... {Math.round(progress)}%</div>
            <div className="loading-steps">
              {currentStep && (
                <div className="step-entry">
                  <span className="typing-text">{currentStep}</span>
                  <span className="tick-mark">✔</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {loadingComplete && (
        <>
          <h1>Welcome, {user.name}!</h1>
          <h2>Dashboard (Journaling with IPFS & Blockchain)</h2>
          <div className="note-form">
            <input type="text" value={title} onChange={handleTitleChange} placeholder="Enter Title" className="note-title" />
            <textarea value={note} onChange={handleNoteChange} placeholder="Start your journal here..." rows="5" className="note-content" />
            <div className="mood-tracker">
              <h3>How are you feeling today?</h3>
              <select value={mood} onChange={(e) => setMood(e.target.value)} className="mood-dropdown">
                {moodsList.map((moodOption, index) => (
                  <option key={index} value={moodOption}>{moodOption}</option>
                ))}
              </select>
              <div className="add-mood">
                <input type="text" value={customMood} onChange={(e) => setCustomMood(e.target.value)} placeholder="Add custom mood" className="custom-mood-input" />
                <button onClick={handleCustomMood} className="add-mood-button">Add Mood</button>
              </div>
            </div>
            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="image-upload" />
            <div className="image-previews">
              {previewImages.map((image, index) => (
                <img key={index} src={image} alt={`Uploaded preview ${index}`} style={{ maxWidth: "100px", marginTop: "10px", marginRight: "5px" }} />
              ))}
            </div>
            <button onClick={handleSaveNote}>Save Journal</button>
          </div>
          <div className="notes-list">
            <h3>Saved Journals</h3>
            {notesList.length === 0 ? (
              <p>No journals available</p>
            ) : (
              notesList.map((note, index) => (
                <div key={index} className="note-item" onClick={() => handleJournalClick(note.journalCID, note.imageCIDs || [])}>
                  <h4>{note.title}</h4>
                  <p><strong>Timestamp:</strong> {note.timestamp}</p>
                  <p><strong>Mood:</strong> {note.mood}</p>
                  <p><strong>Journal CID:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${note.journalCID}`} target="_blank" rel="noopener noreferrer">{note.journalCID}</a></p>
                  <p><strong>Image CIDs:</strong> {note.imageCIDs && note.imageCIDs.length > 0 ? note.imageCIDs.map((cid, idx) => (
                    <span key={idx} className="image-cid">
                      <a href={`https://gateway.pinata.cloud/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">{cid}</a>
                      {idx < note.imageCIDs.length - 1 && ", "}
                    </span>
                  )) : " None"}</p>
                </div>
              ))
            )}
          </div>
          {showModal && loadingComplete && (
            <div className="modal">
              <div className="modal-content">
                <span className="close" onClick={() => setShowModal(false)}>×</span>
                <h2>{selectedNote.title}</h2>
                <p><strong>Timestamp:</strong> {selectedNote.timestamp}</p>
                <p><strong>Mood:</strong> {selectedNote.mood}</p>
                <p>{selectedNote.text}</p>
                <div className="note-images">
                  {selectedImages.map((imageUrl, idx) => (
                    <img key={idx} src={imageUrl} alt={`Journal img ${idx}`} width="200" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;