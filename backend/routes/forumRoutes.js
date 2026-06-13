const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { query } = require('../db');

// Middleware to authenticate
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 1. Get all posts
router.get('/posts', async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
      userId = decoded.id;
    } catch (err) {
      // Ignore invalid token for public listing
    }
  }

  try {
    let sql = `
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.category, 
        p.created_at, 
        p.user_id,
        u.name as author_name,
        u.role as author_role,
        (SELECT COUNT(*) FROM forum_comments c WHERE c.post_id = p.id) as comment_count,
        COALESCE((SELECT SUM(v.vote_value) FROM forum_votes v WHERE v.post_id = p.id), 0) as score
    `;
    const params = [];
    if (userId) {
      sql += `, COALESCE((SELECT v.vote_value FROM forum_votes v WHERE v.post_id = p.id AND v.user_id = ?), 0) as user_vote`;
      params.push(userId);
    } else {
      sql += `, 0 as user_vote`;
    }
    sql += `
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC
    `;

    const [rows] = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch forum posts.' });
  }
});

// 2. Create a new post
router.post('/posts', auth, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required.' });
  }
  try {
    const [result] = await query(
      'INSERT INTO forum_posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [req.user.id, title, content, category]
    );
    res.status(201).json({ success: true, post_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
});

// 3. Get single post with comments
router.get('/posts/:id', async (req, res) => {
  let userId = null;
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'uiu_healthcare_secret_key_2026');
      userId = decoded.id;
    } catch (err) {}
  }
  try {
    let postSql = `
      SELECT 
        p.id, 
        p.title, 
        p.content, 
        p.category, 
        p.created_at, 
        p.user_id,
        u.name as author_name,
        u.role as author_role,
        COALESCE((SELECT SUM(v.vote_value) FROM forum_votes v WHERE v.post_id = p.id), 0) as score
    `;
    const params = [req.params.id];
    if (userId) {
      postSql += `, COALESCE((SELECT v.vote_value FROM forum_votes v WHERE v.post_id = p.id AND v.user_id = ?), 0) as user_vote`;
      params.unshift(userId);
    } else {
      postSql += `, 0 as user_vote`;
    }
    postSql += `
      FROM forum_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    
    const [posts] = await query(postSql, params);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    
    // Get comments
    const [comments] = await query(`
      SELECT 
        c.id, 
        c.content, 
        c.created_at, 
        c.user_id,
        u.name as author_name,
        u.role as author_role
      FROM forum_comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.id ASC
    `, [req.params.id]);
    
    res.json({ post: posts[0], comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
});

// 4. Delete a post
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const [posts] = await query('SELECT user_id FROM forum_posts WHERE id = ?', [req.params.id]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (posts[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this post.' });
    }
    await query('DELETE FROM forum_posts WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// 5. Upvote/downvote a post
router.post('/posts/:id/vote', auth, async (req, res) => {
  const { vote_value } = req.body; // 1, -1, 0
  const postId = req.params.id;
  const userId = req.user.id;
  
  if (![1, -1, 0].includes(vote_value)) {
    return res.status(400).json({ error: 'Invalid vote value.' });
  }
  
  try {
    if (vote_value === 0) {
      await query('DELETE FROM forum_votes WHERE user_id = ? AND post_id = ?', [userId, postId]);
    } else {
      await query(`
        INSERT INTO forum_votes (user_id, post_id, vote_value)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE vote_value = ?
      `, [userId, postId, vote_value, vote_value]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cast vote.' });
  }
});

// 6. Create comment
router.post('/posts/:id/comments', auth, async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;
  if (!content) {
    return res.status(400).json({ error: 'Comment content is required.' });
  }
  try {
    const [result] = await query(
      'INSERT INTO forum_comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, req.user.id, content]
    );
    res.status(201).json({ success: true, comment_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});

// 7. Delete a comment
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const [comments] = await query('SELECT user_id FROM forum_comments WHERE id = ?', [req.params.id]);
    if (comments.length === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    if (comments[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment.' });
    }
    await query('DELETE FROM forum_comments WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

module.exports = router;
