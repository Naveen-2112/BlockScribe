import React, { useState, useEffect } from "react";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  // Hooks
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [mood, setMood] = useState("Happy"); // Default mood
  const [customMood, setCustomMood] = useState(""); // For adding new moods
  const [moodsList, setMoodsList] = useState(["Happy", "Sad", "Excited", "Calm"]); // Initial moods

  // Handle input changes
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleNoteChange = (e) => setNote(e.target.value);

  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const readerPromises = fileArray.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readerPromises)
        .then((imagesBase64) => setImages(imagesBase64))
        .catch((error) => console.error("Error reading images:", error));
    }
  };

  const handleSaveNote = () => {
    if (title.trim() && note.trim()) {
      const newNote = {
        title,
        text: note,
        timestamp: new Date().toLocaleString(),
        images,
        mood, // Add selected mood to the entry
      };

      const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
      storedNotes.push(newNote);
      localStorage.setItem("notes", JSON.stringify(storedNotes));

      setNotesList(storedNotes);

      // Reset inputs for the next entry
      setTitle("");
      setNote("");
      setImages([]);
      setMood("Happy");
    } else {
      alert("Please enter both title and note before saving.");
    }
  };

  const handleCustomMood = () => {
    if (customMood.trim()) {
      setMoodsList([...moodsList, customMood]);
      setCustomMood("");
    }
  };

  const loadNotes = () => {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotesList(storedNotes);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name}!</h1>
      <h2>Dashboard (Journaling)</h2>

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
          {images.map((image, index) => (
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
          notesList.map((note, index) => (
            <div key={index} className="note-item">
              <h4>{note.title}</h4>
              <p>
                <strong>Timestamp:</strong> {note.timestamp}
              </p>
              <p>
                <strong>Mood:</strong> {note.mood}
              </p>
              <p>
                <strong>Entry:</strong> {note.text}
              </p>
              {note.images.length > 0 && (
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
