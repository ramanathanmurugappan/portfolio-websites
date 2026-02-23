# Architecture — ram96.com

![Architecture Diagram](./architecture.png)

---

## System Architecture

```mermaid
graph TB
    User(["👤 User\n(Browser)"])

    subgraph Client["CLIENT  ·  React 19 + TypeScript + Vite 7  ·  100% Client-Side, No Backend"]
        direction LR

        subgraph UI["UI Layer"]
            Hero["Hero"]
            About["About"]
            Projects["Projects"]
            TechStack["Tech Stack"]
            Education["Education"]
            Achievements["Achievements"]
            Contact["Contact"]
        end

        subgraph AppCore["App Core"]
            ThemeCtx["ThemeContext\n(dark / light)"]
            Router["Wouter Router"]
            NavBar["Navigation Bar"]
        end

        subgraph ChatEngine["AI Chatbot Engine"]
            TextMode["Text Mode\n(type & send)"]
            VoiceMode["Voice Mode\n(hands-free loop)"]
            TTSPlayer["TTS Player\n(Audio Element)"]
        end

        subgraph BrowserAPIs["Browser APIs"]
            MediaRec["MediaRecorder API\n(voice capture)"]
            WebAudio["Web Audio API\n(silence detection)"]
            LocalStore["localStorage\n(theme)"]
        end
    end

    subgraph ExternalAPIs["EXTERNAL APIs  ·  Called directly from browser over HTTPS"]
        direction TB
        Groq["⚡ Groq API\napi.groq.com/openai/v1\n─────────────────\nllama-3.3-70b-versatile\nllama-3.1-8b-instant\nqwen/qwen3-32b\nllama-3.3-70b-specdec\nkimi-k2-instruct\n(5-model fallback)"]
        Deepgram["🎙️ Deepgram\napi.deepgram.com\n─────────────────\nnova-2 model\nSpeech → Text"]
        VoiceRSS["🔊 VoiceRSS\napi.voicerss.org\n─────────────────\nen-in · Ajit voice\nText → MP3"]
    end

    subgraph CICD["CI / CD  ·  GitHub Actions → GitHub Pages"]
        direction LR
        Push["git push\nmaster"]
        GHA["GitHub Actions\ndeploy.yml\n─────────────\nNode 22.12.0\nnpm install\nvite build"]
        Secrets["GitHub Secrets\nVITE_GROQ_API_KEY\nVITE_DEEPGRAM_API_KEY\nVITE_VOICERSS_API_KEY"]
        Pages["GitHub Pages\ndist/public/"]
        Domain["🌐 ram96.com\n(CNAME)"]
    end

    User -->|"visits"| Client
    TextMode -->|"POST chat completion\nBearer GROQ_KEY\nmax_tokens: 300"| Groq
    VoiceMode -->|"POST audio/webm blob\nToken DEEPGRAM_KEY"| Deepgram
    TTSPlayer -->|"GET ?hl=en-in&v=Ajit\nVOICERSS_KEY"| VoiceRSS
    VoiceMode --> MediaRec
    VoiceMode --> WebAudio
    ThemeCtx <-->|"read / write"| LocalStore

    Groq -->|"chat completion JSON"| TextMode
    Deepgram -->|"transcript JSON"| VoiceMode
    VoiceRSS -->|"MP3 ArrayBuffer"| TTSPlayer

    Push --> GHA
    Secrets -->|"injected at build"| GHA
    GHA --> Pages
    Pages --> Domain
```

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
