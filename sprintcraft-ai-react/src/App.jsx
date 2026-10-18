import { useMemo, useRef, useState } from 'react'
import {
  Activity, AlertTriangle, ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight,
  Bell, Check, ChevronDown, ChevronRight, CircleHelp, CirclePlus, Clock3, Code2,
  Download, Ellipsis, FileCode2, FileText, GitBranch, GitPullRequest, Layers3,
  ListTodo, LockKeyhole, MoreHorizontal, PanelLeftClose, Play, Plus, RefreshCw,
  Search, Settings2, ShieldAlert, Sparkles, Trash2, Upload, WandSparkles, X,
  Zap, LayoutGrid, Kanban, Network, CheckCircle2, SlidersHorizontal, Copy
} from 'lucide-react'

const initialStories = [
  {
    id: 1, title: 'Setup Stripe Webhook Handler',
    description: 'Receive and validate Stripe webhook events to keep payment state synchronized across services.',
    points: 3, category: 'Backend', priority: 'High', dependency: 'None',
    criteria: ['Given a valid Stripe signature, when an event is received, then the event is accepted and queued.', 'Given an invalid signature, when a webhook arrives, then the request is rejected with 400.', 'Given a duplicate event, when it is replayed, then processing remains idempotent.'],
    tasks: ['Create POST /webhooks/stripe endpoint', 'Verify signatures using the Stripe SDK', 'Add idempotency handling and structured logs']
  },
  {
    id: 2, title: 'User Payment Token Vault & DB Migration',
    description: 'Persist provider token references and payment-method metadata without storing sensitive card data.',
    points: 5, category: 'Database', priority: 'High', dependency: 'Requires DB Schema Approval',
    criteria: ['Given an approved schema, when the migration runs, then the new tables and indexes are created.', 'Given a stored payment method, when it is retrieved, then only the provider token reference is returned.', 'Given a rollback, when the migration is reverted, then existing customer data remains intact.'],
    tasks: ['Review schema with security owner', 'Add migration and rollback script', 'Add repository methods and integration tests']
  },
  {
    id: 3, title: 'Build One-Click Checkout API',
    description: 'Create a checkout session using the customer’s saved Stripe payment method and return a safe status response.',
    points: 5, category: 'Backend', priority: 'Medium', dependency: 'Story #2 · Token vault',
    criteria: ['Given an authenticated customer, when checkout is requested, then a payment intent is created.', 'Given a declined payment, when Stripe responds, then a safe actionable error is returned.'],
    tasks: ['Implement checkout service', 'Add request validation', 'Cover success and failure paths']
  },
  {
    id: 4, title: 'Add Express Checkout Button',
    description: 'Expose a clear one-click checkout action with loading, success, and recoverable error states.',
    points: 3, category: 'Frontend', priority: 'Medium', dependency: 'Story #3 · Checkout API',
    criteria: ['Given a saved payment method, when the user confirms checkout, then the request is submitted once.', 'Given a pending request, when checkout is processing, then the button is disabled and progress is shown.'],
    tasks: ['Create checkout button component', 'Connect to checkout API', 'Add success and error feedback']
  },
]

const specLines = [
  ['1', '# Feature: One-Click Checkout with Stripe'],
  ['2', ''],
  ['3', '## Summary'],
  ['4', 'Allow returning customers to complete a purchase'],
  ['5', 'using their saved payment method in one click.'],
  ['6', ''],
  ['7', '## User Story'],
  ['8', 'As a returning customer, I want to pay with my'],
  ['9', 'saved payment method so checkout is faster.'],
  ['10', ''],
  ['11', '## Requirements'],
  ['12', '- Integrate Stripe Payment Intents API.'],
  ['13', '- Save provider token references for future use.'],
  ['14', '- Confirm payment and show a clear result state.'],
  ['15', '- Process Stripe webhooks idempotently.'],
  ['16', '- Log payment lifecycle events for support.'],
  ['17', ''],
  ['18', '## Acceptance Criteria'],
  ['19', '- Customer can complete checkout without re-entering'],
  ['20', '  card details when a saved method is available.'],
  ['21', '- Declined payments show a safe, useful error.'],
  ['22', '- Payment state is reconciled from webhook events.'],
  ['23', ''],
  ['24', '## Open Questions'],
  ['25', '- Retry and rate-limit behavior is not specified.'],
  ['26', '- Token storage security standard is not stated.'],
]

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function App() {
  const [tab, setTab] = useState('backlog')
  const [expanded, setExpanded] = useState([1, 2])
  const [stories, setStories] = useState(initialStories)
  const [spec, setSpec] = useState(specLines.map((line) => line[1]).join('\n'))
  const [showPaste, setShowPaste] = useState(false)
  const [pasteValue, setPasteValue] = useState('')
  const [notice, setNotice] = useState('')
  const [showExport, setShowExport] = useState(false)
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [query, setQuery] = useState('')
  const [showAllCriteria, setShowAllCriteria] = useState({})
  const fileRef = useRef(null)

  const filteredStories = useMemo(
    () => stories.filter((story) => `${story.title} ${story.category} ${story.description}`.toLowerCase().includes(query.toLowerCase())),
    [stories, query],
  )

  const toast = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2800)
  }

  const toggleStory = (id) => {
    setExpanded((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const updateStory = (id, patch) => setStories((current) => current.map((story) => story.id === id ? { ...story, ...patch } : story))

  const downloadFile = (type) => {
    const data = type === 'JSON'
      ? JSON.stringify({ project: 'One-Click Checkout', sprint: 14, stories }, null, 2)
      : ['ID,Title,Description,Points,Category,Priority,Dependency', ...stories.map((s) => [s.id, s.title, s.description, s.points, s.category, s.priority, s.dependency].map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n')
    const blob = new Blob([data], { type: type === 'JSON' ? 'application/json' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sprint-14-backlog.${type.toLowerCase()}`
    link.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
    toast(`${type} backlog exported`)
  }

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = () => { setSpec(String(reader.result || '')); toast(`${file.name} loaded into editor`) }
      reader.readAsText(file)
    } else {
      toast('For this demo, paste PDF/DOCX text into the editor.')
    }
    event.target.value = ''
  }

  const autoFix = () => {
    setSpec((current) => `${current}\n\n## Reliability & Security (AI suggested)\n- Apply bounded exponential backoff with jitter for retryable Stripe API failures; respect Retry-After and Stripe rate limits.\n- Never store raw PAN or CVC. Store Stripe payment method IDs only; encrypt secrets at rest and restrict access. Confirm PCI-DSS scope with Security.\n- Use idempotency keys for payment creation and define a maximum retry window.`)
    toast('AI suggestions added to the spec — review before approving')
  }

  const regenerate = (story) => {
    updateStory(story.id, { description: `${story.description} Includes explicit failure handling, observability, and automated test coverage.` })
    toast(`“${story.title}” refined`)
  }

  const deleteStory = (id) => {
    setStories((current) => current.filter((story) => story.id !== id))
    toast('Story removed from draft backlog')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-area">
          <div className="brand-mark"><Sparkles size={18} strokeWidth={2.3} /></div>
          <div className="brand-name">SprintCraft <span>AI</span></div>
          <div className="top-divider" />
          <div className="workspace-wrap">
            <button className="workspace-button" onClick={() => setShowWorkspace(!showWorkspace)}>
              <span className="workspace-icon"><Layers3 size={15} /></span>
              <span>Payments Service v2</span><ChevronDown size={14} />
            </button>
            {showWorkspace && <div className="popover-menu workspace-menu">
              <button onClick={() => { setShowWorkspace(false); toast('Payments Service v2 selected') }}>Payments Service v2 <Check size={14} /></button>
              <button onClick={() => { setShowWorkspace(false); toast('Customer Portal selected') }}>Customer Portal</button>
              <button onClick={() => { setShowWorkspace(false); toast('Platform API selected') }}>Platform API</button>
              <div className="menu-foot"><Plus size={13} /> Create workspace</div>
            </div>}
          </div>
          <div className="sprint-status"><span className="status-dot" /> Drafting Sprint #14</div>
        </div>
        <div className="top-actions">
          <div className="stat-pill"><GitPullRequest size={14} /><strong>{stories.length + 8}</strong><span>Stories generated</span></div>
          <div className="stat-pill alert-stat"><AlertTriangle size={14} /><strong>2</strong><span>Ambiguity alerts</span></div>
          <div className="export-wrap">
            <button className="btn btn-primary" onClick={() => setShowExport(!showExport)}><Download size={15} /> Export backlog <ChevronDown size={14} /></button>
            {showExport && <div className="popover-menu export-menu">
              <button onClick={() => downloadFile('JSON')}><FileCode2 size={15} /> Export JSON <span>.json</span></button>
              <button onClick={() => downloadFile('CSV')}><FileText size={15} /> Export CSV <span>.csv</span></button>
              <div className="menu-foot">Jira / GitHub integration <Badge tone="violet">Coming soon</Badge></div>
            </div>}
          </div>
          <div className="user-wrap">
            <button className="avatar" onClick={() => setShowUserMenu(!showUserMenu)}>IP</button>
            {showUserMenu && <div className="popover-menu user-menu">
              <div className="user-menu-header"><div className="avatar small">IP</div><div><strong>Ishita Patwa</strong><span>Product workspace</span></div></div>
              <button onClick={() => { setShowUserMenu(false); toast('Settings panel is coming soon') }}><Settings2 size={15} /> Settings</button>
              <button onClick={() => { setShowUserMenu(false); toast('Help center opened in demo mode') }}><CircleHelp size={15} /> Help center</button>
            </div>}
          </div>
        </div>
      </header>

      <main className="workspace">
        <section className="panel spec-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-icon"><FileText size={14} /></span> SPEC WORKSPACE</div>
              <h1>PRD / Feature Spec</h1>
              <p className="subheading">Define the scope. Let AI architect the sprint.</p>
            </div>
            <button className="icon-button" title="Panel settings" onClick={() => toast('Editor settings opened')}><SlidersHorizontal size={16} /></button>
          </div>
          <div className="editor-toolbar">
            <div className="editor-file"><span className="file-icon"><FileCode2 size={15} /></span><span>checkout-feature.md</span><span className="unsaved-dot" title="Draft" /></div>
            <div className="editor-actions">
              <input ref={fileRef} type="file" accept=".md,.txt,.pdf,.docx" hidden onChange={handleUpload} />
              <button className="btn btn-subtle btn-sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload</button>
              <button className="btn btn-subtle btn-sm" onClick={() => setShowPaste(true)}><Copy size={14} /> Paste text</button>
            </div>
          </div>
          <div className="editor-wrap">
            <div className="editor-language"><span className="language-dot" /> Markdown <ChevronDown size={12} /></div>
            <div className="code-editor">
              <div className="line-numbers" aria-hidden="true">{spec.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}</div>
              <textarea
                aria-label="Product feature specification editor"
                spellCheck="false"
                value={spec}
                onChange={(event) => setSpec(event.target.value)}
              />
            </div>
            <div className="editor-footer"><span><span className="live-dot" /> Autosaved locally</span><span>{spec.split('\n').length} lines <span className="footer-sep">·</span> Markdown</span></div>
          </div>
          <div className="audit-card">
            <div className="audit-heading">
              <div className="audit-icon"><ShieldAlert size={17} /></div>
              <div><h3>Spec gaps detected</h3><p>Resolve these before committing the sprint.</p></div>
              <Badge tone="amber">2 alerts</Badge>
            </div>
            <div className="audit-item">
              <span className="audit-number">01</span>
              <div><strong>Retry & rate-limit policy missing</strong><p>No specification for retrying failed Stripe API requests or handling rate limits.</p><div className="audit-meta"><Badge tone="amber">Reliability</Badge><span>Potential payment failures</span></div></div>
            </div>
            <div className="audit-item">
              <span className="audit-number">02</span>
              <div><strong>Token storage security is unstated</strong><p>Define secure token handling and confirm PCI-DSS scope with the security owner.</p><div className="audit-meta"><Badge tone="red">Security</Badge><span>Compliance review needed</span></div></div>
            </div>
            <div className="audit-actions">
              <button className="btn btn-primary fix-btn" onClick={autoFix}><WandSparkles size={15} /> Auto-fix spec with AI</button>
              <button className="btn btn-subtle" onClick={() => toast('Backlog generated from the current draft')}>Ignore & generate</button>
            </div>
          </div>
          <div className="panel-footnote"><LockKeyhole size={13} /> Your spec stays in this browser demo.</div>
        </section>

        <section className="panel output-panel">
          <div className="output-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-icon violet"><Sparkles size={14} /></span> AI SPRINT ARCHITECT</div>
              <h1>Generated backlog <span className="draft-label">DRAFT</span></h1>
              <p className="subheading">A structured, dependency-aware sprint plan from your spec.</p>
            </div>
            <button className="btn btn-subtle btn-sm" onClick={() => { setStories(initialStories); toast('Backlog regenerated from sample data') }}><RefreshCw size={14} /> Regenerate all</button>
          </div>
          <div className="backlog-summary">
            <div className="summary-item"><span className="summary-icon blue"><ListTodo size={16} /></span><div><strong>{stories.length + 8}</strong><span>Total stories</span></div></div>
            <div className="summary-item"><span className="summary-icon purple"><Activity size={16} /></span><div><strong>{stories.reduce((sum, story) => sum + story.points, 0) + 19}</strong><span>Story points</span></div></div>
            <div className="summary-item"><span className="summary-icon green"><CheckCircle2 size={16} /></span><div><strong>84%</strong><span>Spec coverage</span></div></div>
            <div className="summary-item sprint-capacity"><span className="capacity-label">SPRINT CAPACITY</span><div className="capacity-value"><strong>34</strong><span>/ 40 pts</span></div><div className="capacity-bar"><span /></div></div>
          </div>
          <div className="tabs-row">
            <div className="tab-list">
              <button className={`tab ${tab === 'backlog' ? 'active' : ''}`} onClick={() => setTab('backlog')}><ListTodo size={15} /> Sprint backlog <span className="tab-count">{stories.length}</span></button>
              <button className={`tab ${tab === 'graph' ? 'active' : ''}`} onClick={() => setTab('graph')}><Network size={15} /> Dependency DAG</button>
              <button className={`tab ${tab === 'kanban' ? 'active' : ''}`} onClick={() => setTab('kanban')}><Kanban size={15} /> Kanban</button>
            </div>
            <div className="search-box"><Search size={14} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter stories..." /></div>
          </div>

          {tab === 'backlog' && <div className="backlog-content">
            <div className="epic-header">
              <button className="collapse-epic" onClick={() => setExpanded((current) => current.length ? [] : stories.map((story) => story.id))}><ChevronDown size={15} /></button>
              <div className="epic-icon"><Zap size={16} fill="currentColor" /></div>
              <div className="epic-title"><div><span className="epic-kicker">EPIC 01</span><Badge tone="violet">In scope</Badge></div><h2>One-Click Payment Flow Integration</h2><p>End-to-end saved payment experience with secure token handling.</p></div>
              <div className="epic-total"><strong>{stories.reduce((sum, story) => sum + story.points, 0)} pts</strong><span>{stories.length} stories</span></div>
              <button className="icon-button" onClick={() => toast('Epic actions opened')}><MoreHorizontal size={18} /></button>
            </div>
            <div className="story-list">
              {filteredStories.map((story, index) => <article className="story-card" key={story.id}>
                <div className="story-main">
                  <button className={`story-chevron ${expanded.includes(story.id) ? 'open' : ''}`} onClick={() => toggleStory(story.id)}><ChevronRight size={16} /></button>
                  <div className={`story-type type-${story.category.toLowerCase()}`}><Code2 size={15} /></div>
                  <div className="story-copy">
                    <div className="story-title-line"><span className="story-id">SC-{String(140 + story.id).padStart(3, '0')}</span><h3>{story.title}</h3></div>
                    <p>{story.description}</p>
                    <div className="story-tags"><Badge tone={story.category === 'Database' ? 'blue' : story.category === 'Frontend' ? 'pink' : 'neutral'}>{story.category}</Badge><Badge tone={story.priority === 'High' ? 'red' : 'amber'}>{story.priority} priority</Badge><span className="dependency"><GitBranch size={12} /> {story.dependency}</span></div>
                  </div>
                  <div className={`points points-${story.points}`}><strong>{story.points}</strong><span>pts</span></div>
                  <button className="icon-button story-more" onClick={() => toast(`Actions for SC-${140 + story.id}`)}><MoreHorizontal size={17} /></button>
                </div>
                {expanded.includes(story.id) && <div className="story-details">
                  <div className="detail-section">
                    <div className="detail-heading"><CheckCircle2 size={14} /><strong>Acceptance criteria</strong><span>GIVEN · WHEN · THEN</span></div>
                    <ul>{story.criteria.map((item, i) => <li key={i}><span className="criteria-check"><Check size={11} /></span>{item}</li>)}</ul>
                  </div>
                  <div className="detail-section task-section">
                    <div className="detail-heading"><ListTodo size={14} /><strong>Technical sub-tasks</strong><Badge>{story.tasks.length} tasks</Badge></div>
                    <ul>{story.tasks.map((task, i) => <li key={i}><span className="task-checkbox" />{task}</li>)}</ul>
                  </div>
                  <div className="story-bottom-actions">
                    <button className="text-action" onClick={() => { updateStory(story.id, { title: story.title + (story.title.endsWith(' *') ? '' : ' *') }); toast('Story marked for AI editing') }}><WandSparkles size={13} /> Edit with AI</button>
                    <button className="text-action" onClick={() => regenerate(story)}><RefreshCw size={13} /> Regenerate</button>
                    <button className="text-action danger-action" onClick={() => deleteStory(story.id)}><Trash2 size={13} /> Delete</button>
                  </div>
                </div>}
              </article>)}
              {filteredStories.length === 0 && <div className="empty-state"><Search size={24} /><strong>No matching stories</strong><span>Try a different keyword.</span></div>}
            </div>
            <button className="add-story" onClick={() => { const id = Math.max(0, ...stories.map((s) => s.id)) + 1; setStories([...stories, { id, title: 'New backlog story', description: 'Describe the outcome this story should deliver.', points: 3, category: 'Backend', priority: 'Medium', dependency: 'None', criteria: ['Given a valid setup, when the task is complete, then the expected behavior is verified.'], tasks: ['Define implementation details', 'Add automated tests'] }]); setExpanded((current) => [...current, id]); toast('New story added to epic') }}><CirclePlus size={15} /> Add story to epic</button>
          </div>}

          {tab === 'graph' && <div className="graph-content">
            <div className="graph-toolbar"><div><strong>Dependency map</strong><span>4 nodes · 3 relationships</span></div><Badge tone="red"><span className="critical-dot" /> Critical path</Badge><button className="icon-button" onClick={() => toast('Graph layout reset')}><RefreshCw size={14} /></button></div>
            <div className="graph-canvas">
              <div className="graph-grid" />
              <div className="graph-node node-db"><div className="node-head"><span className="node-icon purple"><Layers3 size={14} /></span><Badge tone="blue">5 pts</Badge></div><strong>DB Migration</strong><span>Token vault schema</span><div className="node-foot"><span className="node-status" /> Needs approval</div></div>
              <div className="edge edge-one"><span className="edge-label">blocks</span><ArrowRight size={19} /></div>
              <div className="graph-node node-api"><div className="node-head"><span className="node-icon blue"><Code2 size={14} /></span><Badge tone="green">5 pts</Badge></div><strong>API Endpoint</strong><span>Checkout service</span><div className="node-foot"><span className="node-status ready" /> Ready to start</div></div>
              <div className="edge edge-two"><span className="edge-label">unblocks</span><ArrowRight size={19} /></div>
              <div className="graph-node node-ui"><div className="node-head"><span className="node-icon pink"><LayoutGrid size={14} /></span><Badge tone="violet">3 pts</Badge></div><strong>Frontend Integration</strong><span>Express checkout UI</span><div className="node-foot"><span className="node-status waiting" /> Waiting on API</div></div>
              <div className="critical-path"><span /> CRITICAL PATH</div>
              <div className="webhook-node"><Zap size={13} /> Stripe webhook handler <Badge tone="green">Parallel</Badge></div>
            </div>
            <div className="graph-legend"><span><i className="legend-line red-line" /> Critical path</span><span><i className="legend-line" /> Dependency</span><span><i className="legend-dot" /> Parallel work</span></div>
            <div className="graph-note"><AlertTriangle size={15} /><span><strong>Potential blocker:</strong> DB schema approval is on the critical path. Resolve the token storage security question before implementation.</span></div>
          </div>}

          {tab === 'kanban' && <div className="kanban-content">
            {[
              { title: 'Ready', color: 'green', items: stories.filter((s) => s.id === 1 || s.id === 3) },
              { title: 'In progress', color: 'blue', items: stories.filter((s) => s.id === 2) },
              { title: 'Review', color: 'purple', items: stories.filter((s) => s.id === 4) },
            ].map((column) => <div className="kanban-column" key={column.title}>
              <div className="kanban-col-head"><span className={`kanban-dot ${column.color}`} /><strong>{column.title}</strong><span>{column.items.length}</span><button className="icon-button" onClick={() => toast(`Add a story to ${column.title}`)}><Plus size={14} /></button></div>
              {column.items.map((story) => <div className="kanban-card" key={story.id}><div className="kanban-card-top"><span>SC-{140 + story.id}</span><button className="icon-button" onClick={() => toast('Card menu opened')}><MoreHorizontal size={14} /></button></div><strong>{story.title}</strong><p>{story.description}</p><div className="kanban-card-bottom"><Badge tone={story.category === 'Database' ? 'blue' : 'neutral'}>{story.category}</Badge><span className={`points points-${story.points}`}><strong>{story.points}</strong><span>pts</span></span></div></div>)}
              <button className="kanban-add" onClick={() => toast(`New story for ${column.title}`)}><Plus size={14} /> Add story</button>
            </div>)}
          </div>}
          <div className="output-footer"><span><span className="live-dot" /> AI draft generated from current spec</span><span><Clock3 size={12} /> Updated just now</span><button onClick={() => toast('Sprint draft saved locally')}><Check size={13} /> Save draft</button></div>
        </section>
      </main>

      {showPaste && <div className="modal-backdrop" onClick={() => setShowPaste(false)}><div className="paste-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><div><h2>Paste feature specification</h2><p>Paste your PRD or requirements to replace the current draft.</p></div><button className="icon-button" onClick={() => setShowPaste(false)}><X size={17} /></button></div>
        <textarea value={pasteValue} onChange={(e) => setPasteValue(e.target.value)} placeholder="Paste Markdown or plain text here..." />
        <div className="modal-actions"><button className="btn btn-subtle" onClick={() => setShowPaste(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { if (pasteValue.trim()) { setSpec(pasteValue); setPasteValue(''); setShowPaste(false); toast('Specification pasted into editor') } }}>Replace spec <ArrowRight size={14} /></button></div>
      </div></div>}
      {notice && <div className="toast"><CheckCircle2 size={16} /> {notice}</div>}
    </div>
  )
}

export default App
