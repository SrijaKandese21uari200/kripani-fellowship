const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Required for file handling

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/kripani_fellowship', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Mongoose Schema
const applicationSchema = new mongoose.Schema({
    full_name: String,
    email: String,
    mobile: String,
    degree: String,
    college: String,
    video_assessment: String,
    resume: String // Stores file path
});

const Application = mongoose.model('Application', applicationSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Saving file to uploads folder...");
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        console.log("Received file:", file.originalname);
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Allow only PDFs and Word files
        const fileTypes = /pdf|doc|docx/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);
        if (extName && mimeType) {
            return cb(null, true);
        } else {
            return cb(new Error("Only .pdf, .doc, and .docx files are allowed!"));
        }
    }
});

// API Route to Handle Applications
app.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Resume file is required!' });
        }

        console.log("File saved at:", req.file.path);

        const application = new Application({
            full_name: req.body.full_name,
            email: req.body.email,
            mobile: req.body.mobile,
            degree: req.body.degree,
            college: req.body.college,
            video_assessment: req.body.video_assessment,
            resume: req.file.path
        });

        await application.save();
        res.json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Error submitting application', error });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
