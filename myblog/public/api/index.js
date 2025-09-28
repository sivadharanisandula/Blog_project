const express = require('express');
const cors = require('cors');
// Import Firebase Admin SDK for backend database operations
const admin = require('firebase-admin');

// --- 0. FIREBASE SETUP (Persistent Database) ---
let db;
try {
    // Service account key is passed via Vercel Environment Variable (JSON string)
    // This allows the serverless function to securely connect to Firestore.
    if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    }
    db = admin.firestore();
    console.log("Firestore initialized successfully.");
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    // If initialization fails, log it but let the app continue to serve an error response
}

// --- 1. SETUP AND CONFIGURATION ---
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// --- 2. Data Persistence Warning ---
// NOTE: The previous in-memory store has been removed. All data operations now rely 
// on the external Firestore database to ensure persistence across serverless invocations.

// --- 3. API ENDPOINTS (CRUD) ---

// READ All Posts: GET /api/posts
app.get('/api/posts', async (req, res) => {
    try {
        const postsRef = db.collection('posts').orderBy('created_at', 'desc');
        const snapshot = await postsRef.get();
        
        const posts = snapshot.docs.map(doc => ({
            id: doc.id, // Use Firestore document ID
            ...doc.data()
        }));

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error getting posts:", error);
        res.status(500).json({ error: "Failed to retrieve posts from the database." });
    }
});

// READ Single Post: GET /api/posts/:id
app.get('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const postDoc = await db.collection('posts').doc(postId).get();

        if (postDoc.exists) {
            res.status(200).json({
                id: postDoc.id,
                ...postDoc.data()
            });
        } else {
            res.status(404).json({ error: "Post not found." });
        }
    } catch (error) {
        console.error("Error reading post:", error);
        res.status(500).json({ error: "Failed to retrieve post." });
    }
});

// CREATE Post: POST /api/posts
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author, imageUrl } = req.body; 

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required." });
        }

        const newPostData = {
            title,
            content,
            author: author || 'Anonymous',
            created_at: admin.firestore.Timestamp.now(), // Store as Firestore Timestamp
            imageUrl: imageUrl || null 
        };

        const docRef = await db.collection('posts').add(newPostData);
        
        // Return the full post object including the new Firestore ID
        res.status(201).json({ id: docRef.id, ...newPostData });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Failed to create new post." });
    }
});

// UPDATE Post: PUT /api/posts/:id
app.put('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const { title, content, author, imageUrl } = req.body; 

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content are required for update." });
        }

        const postRef = db.collection('posts').doc(postId);
        const updateData = {
            title,
            content,
            author: author || 'Anonymous',
            imageUrl: imageUrl !== undefined ? imageUrl : null 
        };

        await postRef.set(updateData, { merge: true });
        
        // Fetch and return the updated document
        const updatedDoc = await postRef.get();
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });

    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ error: "Failed to update post." });
    }
});

// DELETE Post: DELETE /api/posts/:id
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        await db.collection('posts').doc(postId).delete();
        // 204 No Content response
        res.status(204).send(); 
    } catch (error) {
        // Log the error but still respond 404/500 if a post wasn't found or there was a server error
        console.error("Error deleting post:", error);
        res.status(500).json({ error: "Failed to delete post." });
    }
});

// Vercel Serverless Export
// This tells Vercel how to handle the Express application as a serverless function.
module.exports = app; 
