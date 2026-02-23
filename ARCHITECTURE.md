# Architecture Diagram — ram96.com Portfolio

## 1. System Overview

```mermaid
graph TB
    subgraph Browser["🌐 Browser (Client-Side Only — No Backend)"]
        direction TB
        subgraph React["React 19 + TypeScript + Vite 7"]
            App["App.tsx\n(Root)"]
            Theme["ThemeContext\n(dark / light)"]
            Router["Wouter Router\n(SPA routing)"]
            Home["Home.tsx\n(single page)"]
            Nav["Navigation\n(bottom bar)"]
            Chat["Chatbot.tsx\n(780 lines)"]
            Sections["Portfolio Sections\n(Hero → Contact)"]
        end
        LS["localStorage\n'theme' key"]
        WA["Web Audio API\n(silence detection)"]
        MR["MediaRecorder API\n(voice capture)"]
        Audio["Audio Element\n(TTS playback)"]
    end

    subgraph ExternalAPIs["☁️ External APIs (called directly from browser)"]
        Groq["⚡ Groq API\napi.groq.com/openai/v1\nLLM inference"]
        Deepgram["🎙️ Deepgram\napi.deepgram.com\nSpeech-to-Text"]
        VoiceRSS["🔊 VoiceRSS\napi.voicerss.org\nText-to-Speech"]
    end

    subgraph Hosting["🚀 Hosting"]
        GHP["GitHub Pages\nram96.com\n(via CNAME)"]
        GHA["GitHub Actions\nCI/CD Pipeline"]
    end

    App --> Theme
    App --> Router
    Router --> Home
    Home --> Nav
    Home --> Sections
    Home --> Chat
    Theme <--> LS

    Chat -->|"POST JSON\nBearer GROQ_KEY"| Groq
    Chat -->|"POST audio blob\nBearer DEEPGRAM_KEY"| Deepgram
    Chat -->|"GET mp3\n?key=VOICERSS_KEY"| VoiceRSS
    Chat --> WA
    Chat --> MR
    Chat --> Audio

    Deepgram -->|"transcript JSON"| Chat
    VoiceRSS -->|"ArrayBuffer mp3"| Chat
    Groq -->|"chat completion JSON"| Chat

    GHA -->|"npm build\ndist/public/"| GHP
```

---

## 2. React Component Tree

```mermaid
graph TD
    App["App.tsx"]
    EB["ErrorBoundary"]
    TP["ThemeProvider\n(context: theme, toggleTheme)"]
    TTP["TooltipProvider\n(Radix UI)"]
    Toaster["Toaster\n(sonner)"]
    RR["Wouter Router"]
    Home["Home.tsx"]

    TT["ThemeToggle\n(top-right ☀️/🌙)"]
    Hero["Hero\n(avatar + headline)"]
    Marquee1["Marquee ←\n(stats badges)"]
    Marquee2["Marquee →\n(skills badges)"]
    About["AboutSection\n(bento grid)"]
    Projects["Projects\n(slider carousel)"]
    Tech["TechStack\n(7 categories)"]
    Edu["Education\n(degree card)"]
    Ach["Achievements\n(awards + papers)"]
    Contact["Contact\n(cards + social links)"]
    Footer["Footer"]
    NavBar["Navigation\n(bottom fixed bar)"]
    Chatbot["Chatbot\n(fixed bottom-right)"]

    App --> EB
    EB --> TP
    TP --> TTP
    TTP --> Toaster
    TTP --> RR
    RR --> Home

    Home --> TT
    Home --> Hero
    Home --> About
    Home --> Projects
    Home --> Tech
    Home --> Edu
    Home --> Ach
    Home --> Contact
    Home --> Footer
    Home --> NavBar
    Home --> Chatbot

    Hero --> Marquee1
    Hero --> Marquee2

    NavBar -->|"controls isOpen"| Chatbot
```

---

## 3. AI Chatbot — Text Mode Flow

```mermaid
sequenceDiagram
    actor User
    participant Input as Input Field
    participant State as React State
    participant Groq as Groq API<br/>(api.groq.com)
    participant TTS as VoiceRSS TTS<br/>(api.voicerss.org)
    participant Audio as Audio Element

    User->>Input: Types message + hits Send
    Input->>State: setMessages([...userMsg])
    Input->>State: setLoading(true)
    State->>Groq: POST /openai/v1/chat/completions<br/>model: llama-3.3-70b-versatile<br/>max_tokens: 300
    alt Success
        Groq-->>State: { choices[0].message.content }
        State->>State: setMessages([...botMsg])
    else Rate limit (429) → try next model
        Groq-->>State: 429 error
        State->>Groq: Retry with llama-3.1-8b-instant
        Note over State,Groq: Fallback chain:<br/>70b → 8b → Qwen-32B → 70b-specdec → Kimi-K2
    end
    State->>State: setLoading(false)
    User->>Audio: Clicks 🔈 on bot message
    State->>TTS: GET ?key=KEY&hl=en-in&v=Ajit&src=text
    TTS-->>Audio: MP3 ArrayBuffer
    Audio->>User: Plays Indian English voice
```

---

## 4. AI Chatbot — Voice Mode Flow

```mermaid
sequenceDiagram
    actor User
    participant Mic as MediaRecorder<br/>+ Web Audio API
    participant DG as Deepgram STT<br/>(nova-2 model)
    participant Groq as Groq API<br/>(5-model fallback)
    participant TTS as VoiceRSS TTS<br/>(Ajit voice)
    participant Audio as Audio Element

    User->>Mic: Taps 🎙️ (toggleListening)
    loop Conversation Loop (until stopped or 2min silence)
        Note over Mic: voiceStatus = 'listening'
        Mic->>Mic: getUserMedia() → stream
        Mic->>Mic: RMS silence detection<br/>(threshold 0.015, 1.5s gap, 10s max)
        Mic->>DG: POST audio/webm blob<br/>Authorization: Token DEEPGRAM_KEY
        DG-->>Mic: { transcript }
        Note over Groq: voiceStatus = 'thinking'
        Mic->>Groq: sendMessage(transcript)<br/>with PROFILE_CONTEXT system prompt
        Groq-->>Audio: responseText
        Note over Audio: voiceStatus = 'speaking'
        Audio->>TTS: GET VoiceRSS mp3
        TTS-->>Audio: ArrayBuffer
        Audio->>User: Plays response aloud
        Note over Mic: Loop back → 'listening'
    end
    User->>Mic: Taps again → stopConversation()
```

---

## 5. Build & Deploy Pipeline

```mermaid
graph LR
    Dev["👨‍💻 Developer\ngit push master"]

    subgraph GHA["GitHub Actions (.github/workflows/deploy.yml)"]
        Trigger["Trigger:\npush to master"]
        Setup["Node.js 22.12.0\nnpm install"]
        Secrets["Inject Secrets\nVITE_GROQ_API_KEY\nVITE_VOICERSS_API_KEY\nVITE_DEEPGRAM_API_KEY"]
        Build["vite build\n→ dist/public/"]
        Upload["Upload artifact\ndist/public/"]
        Deploy["actions/deploy-pages@v4"]
    end

    subgraph Output["🌐 Live Site"]
        GHP["GitHub Pages"]
        Domain["ram96.com\n(CNAME → ramanathanmurugappan\n.github.io/portfolio)"]
    end

    Dev --> Trigger
    Trigger --> Setup
    Setup --> Secrets
    Secrets --> Build
    Build --> Upload
    Upload --> Deploy
    Deploy --> GHP
    GHP --> Domain
```

---

## 6. Data & State Flow

```mermaid
graph TD
    subgraph Env["🔐 Build-time Env Vars (.env.local → GitHub Secrets)"]
        E1["VITE_GROQ_API_KEY"]
        E2["VITE_DEEPGRAM_API_KEY"]
        E3["VITE_VOICERSS_API_KEY"]
    end

    subgraph Theme["🎨 Theme State"]
        TC["ThemeContext"]
        LS["localStorage\n'theme'"]
        DOM["<html class='dark'>"]
        CSS["CSS Variables\n--white / --black\n--badge-*-bg / text"]
    end

    subgraph Chat["💬 Chatbot State (React Refs + State)"]
        MS["messages[]\n(history)"]
        CH["chatRef\n(Groq session + history)"]
        AR["audioRef\n(current TTS audio)"]
        RR["recorderRef\n(MediaRecorder)"]
        CR["conversationActiveRef\n(loop flag)"]
    end

    subgraph APIs["☁️ External APIs"]
        G["Groq\n(LLM)"]
        D["Deepgram\n(STT)"]
        V["VoiceRSS\n(TTS)"]
    end

    E1 -->|"import.meta.env"| CH
    E2 -->|"import.meta.env"| RR
    E3 -->|"import.meta.env"| AR

    TC <--> LS
    TC --> DOM
    DOM --> CSS

    CH -->|"POST"| G
    G -->|"response text"| MS
    RR -->|"audio blob"| D
    D -->|"transcript"| CH
    MS -->|"text"| V
    V -->|"mp3"| AR
```

---

## 7. Tech Stack Summary

```mermaid
mindmap
  root((ram96.com))
    Frontend
      React 19
      TypeScript 5.6
      Vite 7
      Tailwind CSS v4
      Framer Motion
      Wouter Router
    UI Components
      Shadcn UI
      Radix UI Primitives
      Lucide Icons
    AI & Voice
      Groq API
        llama-3.3-70b
        llama-3.1-8b
        qwen-32b
        5-model fallback
      Deepgram STT
        nova-2 model
        MediaRecorder
        Web Audio API
      VoiceRSS TTS
        Indian English
        Ajit voice
        MP3 streaming
    Hosting & CI/CD
      GitHub Pages
      GitHub Actions
      Custom Domain
        ram96.com
    Design System
      Dark Mode
        CSS Variables
        localStorage
      Responsive
        768px breakpoint
      Animations
        Marquee
        Card hover
        Slide transitions
```

---

## Key Numbers

| Metric | Value |
|--------|-------|
| Total components | 13 major + 12 UI primitives |
| Lines of TSX/TS | ~3,005 |
| Lines of CSS | ~675 |
| External APIs | 3 (Groq, Deepgram, VoiceRSS) |
| LLM fallback models | 5 |
| Tech stack categories | 7 |
| Technologies listed | 70+ |
| Build output | `dist/public/` → GitHub Pages |
| Live URL | [ram96.com](https://ram96.com) |
| Backend | None — 100% client-side |
