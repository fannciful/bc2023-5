
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const app = express();
const notesFilePath = 'notes.json';


const port = 8000;


app.use(express.static(path.join(__dirname, 'static')));


function readNotesFile() {
  try {
    const notesData = fs.existsSync(notesFilePath) ? JSON.parse(fs.readFileSync(notesFilePath, 'utf8')) : [];
    return notesData;
  } catch (error) {
    console.error('Error while reading or parsing notes.json:', error);
    return [];
  }
}


function writeNotesFile(data) {
  fs.writeFileSync(notesFilePath, JSON.stringify(data, null, 2));
}


app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.get('/UploadForm.html', (req, res) => {
  res.sendFile(__dirname + '/static/UploadForm.html');
});


app.get('/notes', (req, res) => {
  const notesData = readNotesFile();
  res.json(notesData);
});


app.post('/upload', upload.none(), (req, res) => {
  const { note_name: noteName, note: noteText } = req.body;

  const notesData = readNotesFile();
  const existingNote = notesData.find((note) => note.note_name === noteName);

  if (existingNote) {
    res.status(400).send("This name is already in use within this system!");
  } else {
    const newNote = { note_name: noteName, note_text: noteText };
    notesData.push(newNote);
    writeNotesFile(notesData);
    res.status(201).send('The note has been successfully created!');
  }
});


app.get('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;
  const notesData = readNotesFile();
  const foundNote = notesData.find((note) => note.note_name === noteName);

  if (foundNote) {
    res.status(200).send(foundNote.note_text.toString());
  } else {
    res.status(404).send("Note with this name doesn't exist.");
  }
});


app.put('/notes/:noteName', express.text(), (req, res) => {
  const noteName = req.params.noteName;
  const updatedNoteText = req.body;

  const notesData = readNotesFile();
  const noteToUpdate = notesData.find((note) => note.note_name === noteName);

  if (noteToUpdate) {
    noteToUpdate.note_text = updatedNoteText; 
    writeNotesFile(notesData);
    res.status(200).send('The note has been successfully updated!');
  } else {
    res.status(404).send('There is no note with this name!');
  }
});


app.delete('/notes/:noteName', (req, res) => {
  const noteName = req.params.noteName;

  let notesData = readNotesFile();
  const noteIndex = notesData.findIndex((note) => note.note_name === noteName);

  if (noteIndex !== -1) {
    notesData.splice(noteIndex, 1);
    writeNotesFile(notesData);
    res.status(200).send('The note has been successfully deleted!');
  } else {
    res.status(404).send('There is no note with this name!');
  }
});


app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
