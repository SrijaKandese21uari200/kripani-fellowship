require('dotenv').config(); // Load environment variables
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan'); // For logging requests

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kripani_fellowship';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log requests
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Connect to MongoDB
mongoose.connect(MONGO_URI).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
      console.error('❌ MongoDB Connection Error:', err);
      process.exit(1);
  });

// Define Mongoose Schema
const applicationSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    degree: { type: String, required: true },
    college: { type: String, required: true },
    video_assessment: String,
    resume: { type: String, required: true } // Stores file path
});

const Application = mongoose.model('Application', applicationSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this folder exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// File Upload Middleware with Size & Type Restrictions
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx/;
        const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            return cb(new Error("❌ Only .pdf, .doc, and .docx files are allowed!"));
        }
    }
});

// API Route to Handle Applications
app.post('/apply', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '❌ Resume file is required!' });
        }

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
        res.json({ success: true, message: '✅ Application submitted successfully!' });

    } catch (error) {
        console.error("❌ Error submitting application:", error);
        res.status(500).json({ success: false, message: '❌ Error submitting application', error: error.message });
    }
});

// Test API
app.get('/', (req, res) => {
    res.json({ message: "🚀 Kripani Fellowship API is Running!" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
