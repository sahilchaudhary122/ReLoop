# WhatsApp AI Bot (whatsapp-web.js)

A real WhatsApp chatbot that links to **your own phone number** by scanning a QR
code (same flow as WhatsApp Web), then replies to incoming messages using an
AI model (Gemini or Claude).

⚠️ **Important caveat**: this uses `whatsapp-web.js`, which automates the
WhatsApp Web interface. It is **not** an official WhatsApp Business API
integration — it's fine for demos/hackathons/personal use, but technically
against WhatsApp's Terms of Service, and a number that sends high volumes of
messages (especially unsolicited ones) risks getting temporarily or
permanently banned. Don't use it for spam or with a number you can't afford
to lose. For production, use the official WhatsApp Cloud API or Twilio's
WhatsApp Business API instead.

## 1. Prerequisites

- Node.js 18+
- A WhatsApp account on your phone (this will be linked as a "linked device",
  it does **not** need to be a spare/burner number, though using a
  non-primary number is safer while testing)
- Chromium dependencies (whatsapp-web.js runs a headless browser via
  puppeteer) — on a fresh Linux box you may need:
  ```bash
  sudo apt-get install -y libgbm-dev libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 \
    libgbm1 libasound2 libpangocairo-1.0-0 libgtk-3-0
  ```

## 2. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- Set `AI_PROVIDER` to `gemini` or `claude`
- Get a free Gemini key at https://aistudio.google.com/apikey, or an
  Anthropic key at https://console.anthropic.com
- Optionally set `ALLOWED_NUMBERS` while testing so random people who find
  your number can't trigger the bot
- Adjust `SYSTEM_PROMPT` to describe how the bot should behave (e.g. mention
  your Reloop e-waste platform, tone, what it should/shouldn't answer)

## 3. Run it

```bash
npm start
```

A QR code will print in your terminal. On your phone:

**WhatsApp > Settings > Linked Devices > Link a Device**, then scan it.

Once scanned, you'll see `WhatsApp bot is ready.` in the terminal. Send a
message to that WhatsApp number from another phone — the bot will reply
using the AI provider you configured.

The session is cached in `.wwebjs_auth/` so you won't need to re-scan on
every restart (until the session expires or you log out from your phone).

## 4. How it works

- `client.on('qr', ...)` — prints the QR code whenever a new session needs
  linking.
- `client.on('message', ...)` — fires for every incoming message. It skips
  groups and status broadcasts, optionally filters by `ALLOWED_NUMBERS`,
  then calls the AI provider and sends the reply back with
  `client.sendMessage()`.
- Conversation history is kept in memory per chat (last `HISTORY_LIMIT`
  turns) so the AI has some short-term context. This resets if the process
  restarts — swap in a database (e.g. SQLite, Redis) if you need persistence.

## 5. Wiring this into your existing project

Since you already have a chatbot flow in your Reloop project, the pieces to
merge are:
1. Copy `index.js`'s AI-calling functions (`callGemini` / `callClaude`) into
   wherever your existing bot logic lives, replacing whatever stub/mock you
   had for "AI reply".
2. Keep the `whatsapp-web.js` client setup (QR handling, `message` event) as
   the transport layer — it's what turns real WhatsApp messages into calls to
   your AI logic.
3. If your project already has a Node/Express backend, you can run this as a
   long-lived process alongside it (e.g. a separate `bot` service) rather
   than inside a request handler, since `client.initialize()` needs to run
   once and stay alive listening for events.

## 6. Common issues

- **QR keeps regenerating / never says "ready"**: usually a headless Chromium
  launch failure — check you installed the system libs above, or try
  `headless: 'new'` in the puppeteer config.
- **"Cannot find module 'puppeteer'"**: `whatsapp-web.js` depends on
  puppeteer-core/puppeteer; run `npm install` again, or explicitly
  `npm install puppeteer`.
- **Session logs out randomly**: WhatsApp occasionally invalidates linked
  device sessions; just delete `.wwebjs_auth/` and re-scan.
- **Only want to test with one phone**: set `ALLOWED_NUMBERS=91XXXXXXXXXX` in
  `.env` (your own second number, country code, no `+`, no spaces).
