# ⚡ SprintCraft AI

**Spec-to-Ticket AI Sprint Architect.** Paste a PRD, let AI audit it for gaps, and get a sprint-ready backlog (epics, stories, Fibonacci estimates, Given-When-Then acceptance criteria) plus a dependency graph with the critical path highlighted.

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)
![LangChain4j](https://img.shields.io/badge/LangChain4j-1.0-7C3AED)
![LLaMA](https://img.shields.io/badge/LLaMA-3.1-indigo)

> 📸 Add a screenshot here: `docs/screenshot.png`

---

## ✨ Features

| Area | What it does |
|---|---|
| **Spec Audit** | AI detects ambiguities and gaps in the PRD (retries, security, compliance, NFRs) and proposes a one-line fix for each. |
| **Auto-Fix Spec** | Appends an `## AI Clarifications` section that resolves every flagged gap. |
| **Backlog Generation** | Produces epics and stories with priority, tag, Fibonacci points, dependencies, Given-When-Then criteria and technical sub-tasks. |
| **Dependency DAG** | Builds the graph deterministically and computes the **critical path** (heaviest dependency chain by story points). |
| **Kanban View** | Stories laid out in To Do / In Progress / Done columns. |
| **Export** | Download the sprint as JSON or CSV; Jira / GitHub push is on the roadmap. |

## 🧱 Tech Stack

- **Frontend:** React, Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion
- **Backend:** Java 21, Spring Boot 3, Bean Validation
- **AI:** LangChain4j with Ollama running LLaMA 3.1 (fully local, no API key needed)

## 🏗️ Architecture

```
┌────────────────────┐   REST/JSON   ┌───────────────────────────────┐
│  React Dashboard   │ ────────────▶ │  Spring Boot API              │
│  (Vite, shadcn/ui) │ ◀──────────── │  SprintController             │
└────────────────────┘               │   ├─ SprintService            │
                                     │   │   ├─ SprintArchitect ─────┼──▶ Ollama (LLaMA 3.1)
                                     │   │   └─ normalisation        │    structured JSON output
                                     │   └─ DagService               │
                                     │       └─ critical path (DFS)  │
                                     └───────────────────────────────┘
```

**Design choices**

- **Typed LLM output:** `SprintArchitect` is a LangChain4j `AiServices` interface; model output is parsed straight into Java records using JSON-schema mode.
- **LLM output is treated as untrusted:** story points are snapped to the nearest Fibonacci value, priorities are normalised, null lists are defaulted, and unknown dependency ids are ignored.
- **The DAG is computed in code, not by the LLM:** this guarantees a correct critical path. A circular dependency returns a readable `422` instead of crashing.

## 📁 Project Structure

```
sprintcraft-ai/
├── frontend/
│   └── src/SprintCraftDashboard.jsx     # Split-screen workspace UI
├── backend/
│   ├── pom.xml
│   └── src/main/
│       ├── resources/application.yml
│       └── java/com/sprintcraft/
│           ├── SprintCraftApplication.java
│           ├── SprintController.java    # REST endpoints
│           ├── SprintService.java       # Orchestration + normalisation
│           ├── SprintArchitect.java     # LLM prompts (LangChain4j)
│           ├── DagService.java          # Dependency graph + critical path
│           ├── AiConfig.java            # Ollama model + CORS
│           └── Dto.java                 # Request/response records
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Java 21+ and Maven 3.9+
- Node.js 18+
- [Ollama](https://ollama.com) installed locally

### 1. Start the LLM

```bash
ollama pull llama3.1
ollama serve
```

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

The API starts on `http://localhost:8080`.

### 3. Run the frontend

```bash
cd frontend
npm install
npm i framer-motion lucide-react
npx shadcn@latest add button badge tabs dropdown-menu avatar
npm run dev
```

The dashboard opens on `http://localhost:5173`.

## ⚙️ Configuration

| Variable | Default | Description |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `llama3.1` | Model used for audit and generation |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origin allowed by CORS |

## 📡 API Reference

Base URL: `http://localhost:8080/api`

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| `POST` | `/spec/audit` | `{ "spec": "..." }` | List of ambiguities with suggested fixes |
| `POST` | `/spec/autofix` | `{ "spec": "...", "ambiguities": [...] }` (ambiguities optional) | `{ "spec": "<improved markdown>" }` |
| `POST` | `/sprint/generate` | `{ "spec": "..." }` | Backlog (epics, stories) and DAG |

**Example**

```bash
curl -X POST http://localhost:8080/api/sprint/generate \
  -H "Content-Type: application/json" \
  -d '{"spec": "# Feature: One-Click Checkout with Stripe\n- Save a card via Stripe Elements..."}'
```

```jsonc
{
  "backlog": {
    "epics": [{
      "title": "One-Click Payment Flow Integration",
      "stories": [{
        "id": "S1",
        "title": "Setup Stripe Webhook Handler",
        "points": 3,
        "tag": "Backend",
        "priority": "High",
        "dependsOn": [],
        "acceptanceCriteria": ["Given a valid signature, When ..., Then ..."],
        "subtasks": ["Create /webhooks/stripe controller"]
      }]
    }]
  },
  "dag": {
    "nodes": [{ "id": "S1", "label": "Setup Stripe Webhook Handler", "points": 3, "critical": true }],
    "edges": [{ "from": "S1", "to": "S2", "critical": true }],
    "criticalPoints": 13
  }
}
```

## 🗺️ Roadmap

- [ ] Wire the dashboard to the live API (currently runs on mock data)
- [ ] Auto-layout for the DAG from backend nodes and edges
- [ ] `.pdf` and `.docx` spec parsing
- [ ] Drag-and-drop Kanban
- [ ] Push stories to Jira and GitHub Issues
- [ ] Persist sprints (MySQL) and spec version history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and open a pull request

## 📄 License

Released under the MIT License.

---

Built by **Rishabh and their team** ·
