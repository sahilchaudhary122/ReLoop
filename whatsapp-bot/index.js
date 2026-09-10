require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const AI_PROVIDER = (process.env.AI_PROVIDER || 'gemini').toLowerCase();
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT || 'You are a helpful WhatsApp assistant.';
const HISTORY_LIMIT = parseInt(process.env.HISTORY_LIMIT || '10', 10);
const ALLOWED_NUMBERS = (process.env.ALLOWED_NUMBERS || '')
  .split(',')
  .map((n) => n.trim())
  .filter(Boolean);

// ---------- In-memory per-chat conversation history ----------
// chatId -> [{ role: 'user'|'assistant', content: string }]
const conversations = new Map();

function getHistory(chatId) {
  if (!conversations.has(chatId)) conversations.set(chatId, []);
  return conversations.get(chatId);
}

function pushHistory(chatId, role, content) {
  const hist = getHistory(chatId);
  hist.push({ role, content });
  while (hist.length > HISTORY_LIMIT) hist.shift();
}

// ---------- AI provider abstraction ----------
async function callGemini(history, userMessage) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({
    history: history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text().trim();
}

async function callClaude(history, userMessage) {
  const Anthropic = require('@anthropic-ai/sdk');
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-5',
    max_tokens: 500,
    system: SYSTEM_PROMPT,
    messages,
  });

  return response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}

async function getAIReply(chatId, userMessage) {
  const history = getHistory(chatId);
  const reply =
    AI_PROVIDER === 'claude'
      ? await callClaude(history, userMessage)
      : await callGemini(history, userMessage);

  pushHistory(chatId, 'user', userMessage);
  pushHistory(chatId, 'assistant', reply);
  return reply;
}

// ---------- WhatsApp client ----------
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('\nScan this QR code with WhatsApp (Linked Devices > Link a Device):\n');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('Authenticated. Session saved to .wwebjs_auth/ for future runs.');
});

client.on('ready', () => {
  console.log(`WhatsApp bot is ready. Using AI provider: ${AI_PROVIDER}`);
});

client.on('auth_failure', (msg) => {
  console.error('Authentication failure:', msg);
});

client.on('disconnected', (reason) => {
  console.log('Client disconnected:', reason);
});

client.on('message', async (msg) => {
  try {
    // Ignore group messages, status broadcasts, and messages sent by the bot itself
    if (msg.from === 'status@broadcast') return;
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    const fromNumber = msg.from.replace('@c.us', '');
    if (ALLOWED_NUMBERS.length > 0 && !ALLOWED_NUMBERS.includes(fromNumber)) {
      return;
    }

    if (!msg.body || msg.body.trim().length === 0) return;

    console.log(`[IN]  ${fromNumber}: ${msg.body}`);

    await chat.sendStateTyping();
    const reply = await getAIReply(msg.from, msg.body.trim());
    await chat.clearState();

    await client.sendMessage(msg.from, reply);
    console.log(`[OUT] ${fromNumber}: ${reply}`);
  } catch (err) {
    console.error('Error handling message:', err);
    try {
      await client.sendMessage(msg.from, "Sorry, I hit an error processing that. Please try again.");
    } catch (_) {
      // ignore secondary failure
    }
  }
});

client.initialize();
