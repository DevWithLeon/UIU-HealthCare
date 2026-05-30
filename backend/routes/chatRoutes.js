const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { query } = require('../db');
const fs = require('fs');
const path = require('path');

// ──────────────────────────────────────────────────────────────────
// Load medical knowledge from the local medical_book.txt file
// ──────────────────────────────────────────────────────────────────
let medicalContext = '';
try {
  const bookPath = path.join(__dirname, '..', '..', 'medical_book.txt');
  if (fs.existsSync(bookPath)) {
    const raw = fs.readFileSync(bookPath, 'utf-8');
    // Use first 6000 chars as context to stay within token limits
    medicalContext = raw.slice(0, 6000);
    console.log('[AI] Medical book loaded for RAG context.');
  } else {
    console.log('[AI] medical_book.txt not found — using general medical knowledge.');
  }
} catch (e) {
  console.error('[AI] Failed to load medical book:', e.message);
}

// ──────────────────────────────────────────────────────────────────
// System prompt
// ──────────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const base = `You are "MedBot", an expert AI Medical Assistant for UIU HealthCare, a digital health platform serving patients in Bangladesh. You are powered by LLaMA 3 via Groq.

Your capabilities:
- Answer medical questions about symptoms, diseases, medications, and treatments
- Recommend what type of doctor/specialist to consult
- Explain medical tests, diagnoses, and procedures
- Provide general wellness and preventive care advice
- Give information relevant to the Bangladeshi healthcare context (local diseases like dengue, cholera, typhoid etc.)

CRITICAL RULES:
1. EXTREMELY IMPORTANT: You are STRICTLY a Medical AI. If a user asks ANY question that is not related to health, medicine, biology, wellness, or healthcare (e.g., politics, celebrities, programming, sports), you MUST politely refuse to answer. Do NOT provide the answer to the non-medical question. Instead, reply with: "I am a medical assistant and can only answer health and medical-related questions. How can I help you with your health today?"
2. ALWAYS remind users that your advice is educational, not a replacement for professional medical consultation.
3. If someone describes a LIFE-THREATENING emergency (chest pain, stroke, severe bleeding), IMMEDIATELY tell them to call 999 or go to the nearest emergency room.
4. Do NOT diagnose specific diseases definitively — use language like "this could suggest", "symptoms may indicate".
5. Do NOT recommend specific medication doses or prescriptions.
6. Be compassionate, clear, and use simple language. Support both English and Bangla.
7. Keep responses concise but thorough (3–5 paragraphs max).`;

  if (medicalContext) {
    return base + `\n\nADDITIONAL MEDICAL REFERENCE MATERIAL:\n${medicalContext}`;
  }
  return base;
}

// ──────────────────────────────────────────────────────────────────
// POST /api/chat — main chat endpoint
// ──────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server.' });
    }

    const groq = new Groq({ apiKey: groqApiKey });
    const { message, session_id, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Build conversation history for multi-turn context
    const messages = [{ role: 'system', content: buildSystemPrompt() }];

    // Attach last N messages from frontend history for context
    if (Array.isArray(history) && history.length > 0) {
      const recent = history.slice(-10); // last 10 turns
      for (const h of recent) {
        messages.push({
          role: h.sender === 'user' ? 'user' : 'assistant',
          content: h.text
        });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // Call Groq LLaMA 3
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';

    // Save to chat history if session_id provided
    if (session_id) {
      try {
        await query(
          'INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)',
          [session_id, 'user', message.trim()]
        );
        await query(
          'INSERT INTO chat_history (session_id, role, content) VALUES (?, ?, ?)',
          [session_id, 'assistant', aiResponse]
        );
      } catch (dbErr) {
        console.error('[AI] Failed to save chat history:', dbErr.message);
      }
    }

    res.json({
      response: aiResponse,
      model: 'llama-3.3-70b-versatile',
      tokens_used: completion.usage?.total_tokens || 0
    });

  } catch (err) {
    console.error('[AI] Groq API error:', err.message);
    if (err.status === 401) {
      return res.status(500).json({ error: 'Invalid Groq API key. Please check your server configuration.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ error: 'AI service error: ' + err.message });
  }
});

// GET /api/chat/history?session_id=xxx — retrieve past messages
router.get('/history', async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id is required' });
    const [rows] = await query(
      'SELECT role, content, created_at FROM chat_history WHERE session_id = ? ORDER BY id ASC LIMIT 100',
      [session_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
