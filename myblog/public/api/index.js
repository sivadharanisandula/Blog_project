const express = require('express');
const cors = require('cors');

// --- 1. SETUP AND CONFIGURATION ---
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// --- 2. IN-MEMORY DATA STORE (Simulating a Database) ---
// NOTE: Vercel serverless functions are 'stateless'.
// This array will be re-initialized on every new function execution (i.e., every API call),
// which means data persistence will be lost quickly. For a real app, use a cloud database (like MongoDB or Postgres).
let posts = [
    {
        id: 1,
        title: "The Future of Web Development",
        author: "Tech Guru",
        content: "The next generation of web applications will heavily rely on edge computing and serverless architectures. This allows for lightning-fast deployment and scaling. This is a much longer body of text to simulate a full blog post, ensuring that the single post view has more content than the homepage preview. We can discuss more complex topics like WebAssembly, advanced state management in React, and the rise of tools like Next.js for server-side rendering. This extra content helps demonstrate why a 'Continue reading...' link is necessary.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        imageUrl: "https://placehold.co/800x450/4f46e5/ffffff?text=Future+Web" 
    },
    {
        id: 2,
        title: "A Deep Dive into Tailwind CSS",
        author: "Style Master",
        content: "Tailwind CSS is a utility-first CSS framework that has revolutionized how developers approach styling. Its class-based approach speeds up development immensely. For example, instead of writing custom CSS, you use utility classes like `p-4`, `bg-blue-500`, and `shadow-lg`. This greatly improves development speed and maintains consistency across large projects. We will explore how to configure themes and use custom plugins in future posts. This extended content serves as a good example for the full post view.",
        created_at: new Date().toISOString(),
        imageUrl: "https://placehold.co/800x450/10b981/ffffff?text=Tailwind+CSS" 
    }
];
let nextId = 3;

// --- 3. API ENDPOINTS (CRUD) ---

// READ All Posts: GET /api/posts
app.get('/api/posts', (req, res) => {
    const sortedPosts = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.status(200).json(sortedPosts);
});

// READ Single Post: GET /api/posts/:id
app.get('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const post = posts.find(p => p.id === id);

    if (post) {
        res.status(200).json(post);
    } else {
        res.status(404).json({ error: "Post not found." });
    }
});

// CREATE Post: POST /api/posts
app.post('/api/posts', (req, res) => {
    const { title, content, author, imageUrl } = req.body; 

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required." });
    }

    const newPost = {
        id: nextId++,
        title,
        content,
        author: author || 'Anonymous',
        created_at: new Date().toISOString(),
        imageUrl: imageUrl || null 
    };

    posts.push(newPost);
    res.status(201).json(newPost);
});

// UPDATE Post: PUT /api/posts/:id
app.put('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, content, author, imageUrl } = req.body; 
    const postIndex = posts.findIndex(p => p.id === id);

    if (postIndex === -1) {
        return res.status(404).json({ error: "Post not found." });
    }

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required for update." });
    }

    posts[postIndex] = {
        ...posts[postIndex],
        title,
        content,
        author: author || 'Anonymous',
        imageUrl: imageUrl !== undefined ? imageUrl : posts[postIndex].imageUrl 
    };

    res.status(200).json(posts[postIndex]);
});

// DELETE Post: DELETE /api/posts/:id
app.delete('/api/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = posts.length;

    posts = posts.filter(p => p.id !== id);

    if (posts.length < initialLength) {
        res.status(204).send();
    } else {
        res.status(404).json({ error: "Post not found." });
    }
});

// Vercel Serverless Export
// This tells Vercel how to handle the Express application as a serverless function.
module.exports = app; 
