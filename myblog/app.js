const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 5000; // Using the working port

// Middleware to parse incoming JSON data
app.use(express.json()); 
app.use(cors());
// Serve static files from the 'public' directory (Handles the root path '/')
app.use(express.static('public')); 

// -------------------------------------------------------------------
// Database connection pool 
const pool = new Pool({
  user: 'postgres',        
  host: 'localhost',
  database: 'blog_platform',
  password: 'Dharani@123',    
  port: 5432,
});
// -------------------------------------------------------------------

// -------------------------------------------------------------------
// API Routes
// -------------------------------------------------------------------

// Test the database connection
app.get('/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.send(`Database connection successful. Current time from DB: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database connection error');
  }
});


// GET all posts
app.get('/posts', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM posts ORDER BY created_at DESC');
    client.release();
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve posts' });
  }
});

// GET a single post by ID
app.get('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM posts WHERE id = $1';
    const result = await client.query(query, [postId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching single post:', err);
    res.status(500).json({ error: 'Failed to retrieve post' });
  }
});

// POST a new post
// POST a new post
app.post('/posts', async (req, res) => {
  const { title, content, author } = req.body;

  // Simple validation to ensure required fields are present
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO posts (title, content, author)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [title, content, author || 'Anonymous']; 
    
    const result = await client.query(query, values);
    client.release();
    
    // Respond with the newly created post data
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});
// PUT (Update) a post by ID
app.put('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  const { title, content, author } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required for update' });
  }

  try {
    const client = await pool.connect();
    const query = `
      UPDATE posts
      SET title = $1, content = $2, author = $3
      WHERE id = $4
      RETURNING *;
    `;
    const values = [title, content, author || 'Anonymous', postId];

    const result = await client.query(query, values);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found for update' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// DELETE a post by ID
app.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;

  try {
    const client = await pool.connect();
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING id;';
    const result = await client.query(query, [postId]);
    client.release();

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found for deletion' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});