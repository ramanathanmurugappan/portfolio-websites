# Architecture — ram96.com

![Architecture Diagram](./architecture.png)

---

## Voice Conversation Flow

```mermaid
sequenceDiagram
    actor User
    participant Mic  as MediaRecorder + Web Audio API
    participant DG   as Deepgram STT
    participant Groq as Groq LLM (5-model fallback)
    participant TTS  as VoiceRSS TTS
    participant Spkr as Audio Element

    User  ->> Mic  : Tap 🎙️ — start conversation
    loop Hands-free loop (until stopped)
        Mic   ->> Mic  : Capture audio, detect silence (RMS < 0.015 for 1.5 s)
        Mic   ->> DG   : POST audio/webm  [nova-2]
        DG  -->> Mic   : { transcript }
        Mic   ->> Groq : chat.completions (system = PROFILE_CONTEXT)
        Groq-->> TTS   : responseText
        TTS   ->> Spkr : GET mp3  [en-in / Ajit]
        Spkr-->> User  : Plays response aloud
    end
    User  ->> Mic  : Tap again — stop
```

---

## Key Facts

| | |
|---|---|
| **Backend** | None — 100% client-side SPA |
| **LLM fallback chain** | 5 models (70b → 8b → Qwen-32B → 70b-specdec → Kimi-K2) |
| **Voice pipeline** | Deepgram STT → Groq LLM → VoiceRSS TTS |
| **Theme** | CSS variables + localStorage, zero flash on load |
| **Build** | Vite 7 → `dist/public/` → GitHub Pages |
| **Live URL** | [ram96.com](https://ram96.com) |
