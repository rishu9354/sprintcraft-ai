# SprintCraft AI — React dashboard

A responsive React + Vite implementation of the SprintCraft AI spec-to-ticket dashboard.

## Requirements
- Node.js 18+ (Node 20 LTS recommended)
- VS Code

## Run locally
1. Extract this ZIP.
2. Open the `sprintcraft-ai-react` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL Vite prints (usually `http://localhost:5173`).

## Included interactions
- Switch between Backlog, Dependency DAG and Kanban tabs
- Expand/collapse stories and inspect acceptance criteria/sub-tasks
- Search/filter stories, add/delete stories, regenerate story text
- Edit spec text, paste a PRD, upload Markdown/text files
- Add suggested reliability/security text with Auto-fix
- Export backlog as JSON or CSV
- Responsive dark UI with Lucide icons

## Notes
- This is a front-end prototype using sample data. AI generation, login, persistence, Jira and GitHub integrations are not connected to a backend yet.
- PDF/DOCX file text extraction is not implemented in this starter; paste extracted text or use a Markdown/text file.
- Shadcn-inspired UI styling is implemented locally to keep setup simple. You can add shadcn/ui later if you want its component generator.
