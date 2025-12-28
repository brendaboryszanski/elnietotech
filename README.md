# El Nieto Tech 🤗💻

**Like calling your grandkid for tech help, even when they're not around**

A web application that helps elderly people solve technology problems using artificial intelligence.

## Description

El Nieto Tech is a web app designed specifically for elderly people who need help with simple technology problems. Instead of calling their children or grandchildren, they can take a photo of the problem and receive a step-by-step solution in very simple language, with the option to hear it read aloud.

## Features

- ✅ **Accessible UI**: Large buttons, clear text, high contrast
- 📸 **Image capture**: Use device camera or upload screenshots
- 🤖 **AI Analysis**: Powered by Google Gemini to detect and solve problems
- 🔊 **Text-to-Speech**: High-quality voice using Google Cloud TTS (with browser fallback)
- 💬 **Follow-up questions**: AI can request more information if needed
- 🎤 **Voice Input**: Speak instead of typing using speech recognition
- 📱 **Responsive**: Works on phones, tablets, and computers

## Application Flow (Conversational)

The app uses a **conversational approach** - like chatting with a tech-savvy grandkid:

1. **Grandparent describes the problem**: "Se me fue el WiFi" (My WiFi stopped working)
2. **AI asks questions**: "¿En qué dispositivo? ¿Celular, computadora o TV?"
3. **Conversation continues**: AI asks simple questions to understand the issue
4. **Photo (if needed)**: AI only requests a photo if necessary: "¿Puedes sacarle una foto a la pantalla?"
5. **Solution**: Once AI understands, provides step-by-step solution
6. **Text-to-Speech**: Can listen to the solution read aloud

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styles**: Tailwind CSS
- **AI**: Google Gemini 2.5 Flash (FREE tier available!)
- **Text-to-Speech**: Google Cloud TTS (with Web Speech API fallback)
- **Voice Input**: Web Speech Recognition API

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/elnietotech.git
cd elnietotech
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API keys:
```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:
```
# For AI chat (Google AI Studio)
GEMINI_API_KEY=your-gemini-api-key-here

# For Text-to-Speech (Google Cloud Console)
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Getting Your API Keys

### 1. Gemini API Key (for AI chat) - FREE

Google Gemini offers a **FREE tier** with generous limits:
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per minute

**To get your free API key:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy and save as `GEMINI_API_KEY`

**No credit card required!**

### 2. Google Cloud API Key (for Text-to-Speech) - FREE tier

Google Cloud TTS has a **FREE tier**:
- 1 million characters per month (WaveNet voices)
- 4 million characters per month (Standard voices)

**To get your API key:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use existing)
3. Enable the [Text-to-Speech API](https://console.cloud.google.com/apis/library/texttospeech.googleapis.com)
4. Go to [Credentials](https://console.cloud.google.com/apis/credentials)
5. Click "Create Credentials" → "API Key"
6. Copy and save as `GOOGLE_CLOUD_API_KEY`

**Tip:** Restrict the key to only "Cloud Text-to-Speech API" for security.

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and create an account
3. Import your repository
4. Add environment variables in settings:
   - `GEMINI_API_KEY` - for AI chat
   - `GOOGLE_CLOUD_API_KEY` - for Text-to-Speech
5. Deploy!

## Project Structure

```
├── app/
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Base layout
│   ├── globals.css           # Global styles
│   └── api/
│       ├── analyze/
│       │   └── route.ts      # API route for Gemini AI
│       └── tts/
│           └── route.ts      # API route for Google Cloud TTS
├── components/
│   └── ConversationView.tsx  # Main chat interface with messages, input, and camera
├── lib/
│   ├── ai.ts                 # Google Gemini AI client
│   ├── prompts.ts            # AI system prompt
│   ├── speech.ts             # Text-to-speech (Cloud + fallback)
│   └── iconBank.tsx          # Visual icons for instructions
└── types/
    └── index.ts              # TypeScript types
```

## Design for Elderly Users

The design follows accessibility principles:

- **Typography**: Base 20px, headings 32px+
- **Buttons**: Minimum 80px height, generous padding
- **Spacing**: Minimum 24px between elements
- **Colors**: High contrast (4.5:1 minimum)
- **Language**: Extremely simple instructions, no jargon (UI text in Spanish)
- **Visual**: Element descriptions ("the blue button", "the gear icon")

## AI Prompt

The Gemini prompt is optimized to generate instructions for elderly people:

- EXTREMELY simple language
- No technical terms
- Visual descriptions of elements
- Each step = ONE single action
- Use of colors and analogies
- Visual icons when helpful

See `lib/prompts.ts` for the complete prompt.

## Edge Cases Handled

- ✅ Camera permissions denied
- ✅ Gemini API rate limits (with retry countdown)
- ✅ Text-to-speech fallback to browser
- ✅ Image too large
- ✅ No internet connection
- ✅ Blurry photo (AI asks to retake)
- ✅ Insufficient information (follow-up questions)
- ✅ Non-JSON response (fallback parsing)

## Future Improvements

- [ ] User authentication with paid subscription
- [ ] Database for conversation history
- [ ] Share solutions with family
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA for device installation
- [ ] Analytics of common problems

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Contact

Made with ❤️ for grandparents around the world
