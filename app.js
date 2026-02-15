// =========================================================
// N8N Agent Blueprint Studio — Application Logic
// =========================================================

// --- API Configuration ---
// Automatically detect backend URL based on environment
const BACKEND_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://n8n-backend-v33h.onrender.com';

const API_URL = `${BACKEND_URL}/api`;

// Check if backend is available
let backendAvailable = false;

async function checkBackend() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    backendAvailable = response.ok;
    if (backendAvailable) {
      console.log('✅ Backend connected');
    }
  } catch (error) {
    console.warn('⚠️ Backend not available. Make sure to start the backend server.');
    showToast('Backend server not available. Please check deployment.', 'error');
    backendAvailable = false;
  }
}

// Check backend on load
checkBackend();

// --- Template Definitions ---
const TEMPLATES = [
  {
    id: 'telegram-bot',
    label: 'Telegram Bot',
    icon: '\u27A4',
    triggerType: 'n8n-nodes-base.telegramTrigger',
    allowedNodes: [
      'n8n-nodes-base.telegramTrigger',
      'n8n-nodes-base.telegram',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.switch',
      'n8n-nodes-base.code',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.noOp',
    ],
    promptSeed:
      'Build an n8n workflow triggered by an incoming Telegram message. The bot should process the message and send a reply.',
  },
  {
    id: 'gmail-auto-reply',
    label: 'Gmail Auto-Reply',
    icon: '\u2709',
    triggerType: 'n8n-nodes-base.gmailTrigger',
    allowedNodes: [
      'n8n-nodes-base.gmailTrigger',
      'n8n-nodes-base.gmail',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.switch',
      'n8n-nodes-base.code',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.noOp',
    ],
    promptSeed:
      'Build an n8n workflow triggered by a new Gmail email. It should analyze the email and send an automatic reply.',
  },
  {
    id: 'lead-qualifier',
    label: 'Lead Qualifier',
    icon: '\u2605',
    triggerType: 'n8n-nodes-base.webhook',
    allowedNodes: [
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.switch',
      'n8n-nodes-base.code',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.spreadsheetFile',
      'n8n-nodes-base.noOp',
      'n8n-nodes-base.respondToWebhook',
    ],
    promptSeed:
      'Build an n8n workflow triggered by a webhook that receives lead data. Qualify the lead based on criteria and route it accordingly.',
  },
  {
    id: 'scheduled-agent',
    label: 'Scheduled Agent',
    icon: '\u23F0',
    triggerType: 'n8n-nodes-base.scheduleTrigger',
    allowedNodes: [
      'n8n-nodes-base.scheduleTrigger',
      'n8n-nodes-base.set',
      'n8n-nodes-base.if',
      'n8n-nodes-base.switch',
      'n8n-nodes-base.code',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.noOp',
    ],
    promptSeed:
      'Build an n8n workflow that runs on a schedule (e.g. every hour or daily). It should perform a recurring task automatically.',
  },
  {
    id: 'blank',
    label: 'Blank (Expert Mode)',
    icon: '\u2726',
    triggerType: null,
    allowedNodes: [],
    promptSeed: '',
  },
];

// --- UUID v4 Generator ---
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// --- Prompt Construction ---
function buildSystemPrompt(version, template) {
  const parts = [];

  // Layer 1: Role and format
  parts.push(
    'You are an n8n workflow generator. You must respond with ONLY a valid JSON object.',
    'Do not include markdown fences, backticks, comments, or explanatory text.',
    'Do not wrap the output in ```json or ``` blocks.',
    'The JSON must be directly parseable by JSON.parse().',
    'Do not include any text before or after the JSON object.',
    ''
  );

  // Layer 2: Schema
  if (version === '1.x') {
    parts.push(
      'The JSON must conform to the n8n 1.x workflow export schema.',
      'Required top-level keys: "name", "nodes", "connections", "active", "settings", "versionId", "meta".',
      '"versionId" must be a valid UUID v4 string.',
      '"meta" must be an object, e.g. {}.',
      '"active" must be false.',
      '"settings" must be an object with at least "executionOrder": "v1".',
      ''
    );
  } else {
    parts.push(
      'The JSON must conform to the n8n 0.x workflow export schema.',
      'Required top-level keys: "name", "nodes", "connections", "active", "settings".',
      'Do NOT include "versionId" or "meta" fields.',
      '"active" must be false.',
      '"settings" must be an object.',
      ''
    );
  }

  parts.push(
    'Each node object must have these fields:',
    '  - "id": unique UUID string',
    '  - "name": unique human-readable name string',
    '  - "type": the full n8n node type string (e.g. "n8n-nodes-base.httpRequest")',
    '  - "typeVersion": number (use the latest known version for each node type)',
    '  - "position": [x, y] array of two numbers (space nodes ~250px apart horizontally)',
    '  - "parameters": object with node-specific parameters',
    '',
    'The "connections" object maps source node names to objects containing "main" arrays.',
    'Each "main" array contains arrays of connection objects with "node" (target name), "type" ("main"), and "index" (0).',
    'Example: { "Source Node": { "main": [[{ "node": "Target Node", "type": "main", "index": 0 }]] } }',
    '',
    'Every workflow MUST have exactly one trigger node as the first node. Trigger nodes must not have incoming connections.',
    ''
  );

  // Layer 3: Template
  if (template && template.id !== 'blank') {
    parts.push(
      `The workflow must start with a "${template.triggerType}" trigger node.`
    );
    if (template.allowedNodes.length > 0) {
      parts.push(
        `You may ONLY use the following node types: ${template.allowedNodes.join(', ')}.`,
        'Do NOT use any node types not in this list.'
      );
    }
    parts.push('');
  }

  return parts.join('\n');
}

function buildGenerationPrompt(userPrompt, version, template) {
  const system = buildSystemPrompt(version, template);
  return {
    system,
    user: `User request: ${userPrompt}`,
  };
}

function buildRepairPrompt(rawJSON, errors, userPrompt, version, template) {
  const system = buildSystemPrompt(version, template);
  const errorList = errors.map((e) => `- ${e}`).join('\n');

  return {
    system,
    user: [
      'The following JSON was intended to be a valid n8n workflow but has errors.',
      'Fix it and return ONLY the corrected JSON object, nothing else.',
      '',
      'Errors found:',
      errorList,
      '',
      'Original JSON:',
      rawJSON,
      '',
      `User's original intent: ${userPrompt}`,
    ].join('\n'),
  };
}

function buildExplanationPrompt(json) {
  return {
    system:
      'You are a technical writer. Given an n8n workflow JSON, explain what it does step by step in plain language. Use numbered steps. Describe each node, its role, the data flow between nodes, and what triggers the workflow. Do not output any JSON. Write clearly for someone who has not used n8n before.',
    user: `Explain this n8n workflow:\n\n${json}`,
  };
}

// --- Gemini API (via Backend) ---
const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest',
];

async function callGemini(systemPrompt, userPrompt) {
  if (!backendAvailable) {
    throw new Error('Backend server is not running. Please start the backend server first.');
  }

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    try {
      const result = await callGeminiModel(model, systemPrompt, userPrompt);
      return result;
    } catch (err) {
      lastError = err;
      if (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED')) {
        console.log(`Model ${model} quota exhausted, trying next...`);
        continue;
      }
      if (err.message.includes('404') || err.message.includes('NOT_FOUND')) {
        console.log(`Model ${model} not found, trying next...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Gemini models exhausted.');
}

async function callGeminiModel(model, systemPrompt, userPrompt) {
  const response = await fetch(`${API_URL}/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

// --- Perplexity API (via Backend) ---
const PERPLEXITY_MODELS = [
  'sonar-pro',
  'sonar-reasoning-pro',
  'sonar',
  'sonar-reasoning',
];

async function callPerplexity(systemPrompt, userPrompt) {
  if (!backendAvailable) {
    throw new Error('Backend server is not running. Please start the backend server first.');
  }

  let lastError = null;

  for (const model of PERPLEXITY_MODELS) {
    try {
      const result = await callPerplexityModel(model, systemPrompt, userPrompt);
      return result;
    } catch (err) {
      lastError = err;
      if (err.message.includes('429') || err.message.includes('500') || err.message.includes('503')) {
        console.log(`Perplexity model ${model} failed, trying next...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('All Perplexity models exhausted.');
}

async function callPerplexityModel(model, systemPrompt, userPrompt) {
  const response = await fetch(`${API_URL}/perplexity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemPrompt, userPrompt, model }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Backend error: ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

// --- JSON Extraction ---
function extractJSON(raw) {
  let text = raw.trim();

  // Strip markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Try to find JSON object boundaries
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(text);
}

// --- Validation Engine ---
function validateWorkflow(workflow, version, template) {
  const errors = [];

  // V1: Required top-level fields
  const requiredFields = ['name', 'nodes', 'connections', 'active', 'settings'];
  for (const field of requiredFields) {
    if (!(field in workflow)) {
      errors.push(`[V1] Missing required field: "${field}"`);
    }
  }

  // V2: versionId for 1.x
  if (version === '1.x') {
    if (!workflow.versionId || typeof workflow.versionId !== 'string') {
      errors.push('[V2] Missing or invalid "versionId" (required for n8n 1.x)');
    }
  }

  // V3: nodes is non-empty array
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push('[V3] "nodes" must be a non-empty array');
    return errors; // Cannot continue validation without nodes
  }

  // V4: Node required fields
  const nodeRequiredFields = ['id', 'name', 'type', 'typeVersion', 'position'];
  workflow.nodes.forEach((node, i) => {
    for (const field of nodeRequiredFields) {
      if (!(field in node)) {
        errors.push(
          `[V4] Node at index ${i} ("${node.name || 'unnamed'}") missing field: "${field}"`
        );
      }
    }
  });

  // V5: At least one trigger node
  const knownTriggerTypes = [
    'n8n-nodes-base.telegramTrigger',
    'n8n-nodes-base.gmailTrigger',
    'n8n-nodes-base.webhook',
    'n8n-nodes-base.scheduleTrigger',
    'n8n-nodes-base.httpRequestTrigger',
    'n8n-nodes-base.emailReadImap',
    'n8n-nodes-base.manualTrigger',
    'n8n-nodes-base.cron',
    'n8n-nodes-base.formTrigger',
  ];

  const triggerNodes = workflow.nodes.filter(
    (n) =>
      (n.type && n.type.toLowerCase().includes('trigger')) ||
      knownTriggerTypes.includes(n.type)
  );

  if (triggerNodes.length === 0) {
    errors.push(
      '[V5] No trigger node found. Workflows require at least one trigger node.'
    );
  }

  // V6: Trigger nodes have no incoming connections
  if (workflow.connections && typeof workflow.connections === 'object') {
    const triggerNames = new Set(triggerNodes.map((n) => n.name));
    for (const [sourceName, outputs] of Object.entries(workflow.connections)) {
      if (outputs && outputs.main) {
        for (const outputGroup of outputs.main) {
          if (Array.isArray(outputGroup)) {
            for (const conn of outputGroup) {
              if (conn.node && triggerNames.has(conn.node)) {
                errors.push(
                  `[V6] Trigger node "${conn.node}" must not have incoming connections (connected from "${sourceName}")`
                );
              }
            }
          }
        }
      }
    }
  }

  // V7: Unique node names
  const nodeNames = workflow.nodes.map((n) => n.name).filter(Boolean);
  const nameSet = new Set();
  for (const name of nodeNames) {
    if (nameSet.has(name)) {
      errors.push(`[V7] Duplicate node name: "${name}"`);
    }
    nameSet.add(name);
  }

  // V8: Unique node IDs
  const nodeIds = workflow.nodes.map((n) => n.id).filter(Boolean);
  const idSet = new Set();
  for (const id of nodeIds) {
    if (idSet.has(id)) {
      errors.push(`[V8] Duplicate node ID: "${id}"`);
    }
    idSet.add(id);
  }

  // V9: Connection references valid node names
  if (workflow.connections && typeof workflow.connections === 'object') {
    const validNames = new Set(nodeNames);
    for (const [sourceName, outputs] of Object.entries(workflow.connections)) {
      if (!validNames.has(sourceName)) {
        errors.push(
          `[V9] Connection source references non-existent node: "${sourceName}"`
        );
      }
      if (outputs && outputs.main) {
        for (const outputGroup of outputs.main) {
          if (Array.isArray(outputGroup)) {
            for (const conn of outputGroup) {
              if (conn.node && !validNames.has(conn.node)) {
                errors.push(
                  `[V9] Connection target references non-existent node: "${conn.node}"`
                );
              }
            }
          }
        }
      }
    }
  }

  // V10: Template-allowed nodes
  if (template && template.id !== 'blank' && template.allowedNodes.length > 0) {
    const allowed = new Set(template.allowedNodes);
    for (const node of workflow.nodes) {
      if (node.type && !allowed.has(node.type)) {
        errors.push(
          `[V10] Node type "${node.type}" is not allowed for template "${template.label}"`
        );
      }
    }
  }

  return errors;
}

// --- Application State ---
const state = {
  selectedTemplate: null,
  version: '1.x',
  provider: 'gemini', // 'gemini' or 'perplexity'
  apiKey: '',
  generating: false,
  validatedJSON: null,
  rawOutput: '',
  validationErrors: [],
  validationStatus: 'idle', // idle, validating, passed, failed, repairing, repair-failed
  retryCount: 0,
  explanationLoaded: false,
  explanationText: '',
  explanationLoading: false,
  history: [], // Workflow generation history
  favorites: [], // Saved favorite workflows
  darkMode: true, // Theme toggle
};

// --- DOM Helpers ---
function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

function showToast(message, type = 'success') {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast ${type} visible`;
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// --- UI Rendering ---
function renderTemplatePills() {
  const container = $('#template-pills');
  container.innerHTML = '';

  for (const tpl of TEMPLATES) {
    const pill = document.createElement('button');
    pill.className = 'template-pill';
    pill.dataset.templateId = tpl.id;
    pill.innerHTML = `<span class="template-pill-icon">${tpl.icon}</span>${tpl.label}`;

    pill.addEventListener('click', () => {
      selectTemplate(tpl);
    });

    container.appendChild(pill);
  }
}

function selectTemplate(template) {
  state.selectedTemplate = template;

  $$('.template-pill').forEach((el) => {
    el.classList.toggle('active', el.dataset.templateId === template.id);
  });

  const textarea = $('#prompt-textarea');
  if (template.promptSeed) {
    textarea.value = template.promptSeed + '\n\n';
    textarea.focus();
    textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  } else if (template.id === 'blank') {
    textarea.value = '';
    textarea.focus();
  }

  updateCharCount();
  updateGenerateButton();
}

function updateCharCount() {
  const textarea = $('#prompt-textarea');
  const count = $('#char-count');
  if (!textarea || !count) return;
  count.textContent = `${textarea.value.length} chars`;
}

function updateGenerateButton() {
  const btn = $('#generate-btn');
  const textarea = $('#prompt-textarea');

  if (state.generating) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating...';
  } else {
    btn.disabled = textarea.value.trim().length < 10;
    btn.innerHTML = state.validationStatus === 'failed' || state.validationStatus === 'repair-failed'
      ? 'Retry Generation'
      : 'Generate Workflow';
  }
}

function setValidationStatus(status, message, errors) {
  state.validationStatus = status;
  const bar = $('#validation-bar');
  const text = $('#validation-text');
  const errorList = $('#error-list');

  bar.className = `validation-bar ${status}`;
  text.textContent = message;

  if (errors && errors.length > 0) {
    errorList.innerHTML = errors
      .map((e) => {
        const match = e.match(/^\[([^\]]+)\]\s*(.*)/);
        if (match) {
          return `<div class="error-item"><span class="error-rule">${match[1]}</span><span>${match[2]}</span></div>`;
        }
        return `<div class="error-item"><span>${e}</span></div>`;
      })
      .join('');
    errorList.classList.remove('hidden');
  } else {
    errorList.innerHTML = '';
    errorList.classList.add('hidden');
  }
}

function renderJSON(json) {
  const codeContent = $('#code-content');
  const placeholder = $('#output-placeholder');
  const codeViewer = $('#code-viewer');
  const downloadSection = $('#download-section');

  if (json) {
    placeholder.style.display = 'none';
    codeViewer.style.display = 'block';
    codeContent.textContent = JSON.stringify(json, null, 2);
    downloadSection.style.display = 'flex';
  } else {
    placeholder.style.display = 'flex';
    codeViewer.style.display = 'none';
    downloadSection.style.display = 'none';
  }
}

// --- Mermaid Visualization ---
async function renderMermaid() {
  if (!state.validatedJSON) return;

  const container = $('#mermaid-container');
  // Clear previous content but keep structure for accessibility/loading
  container.innerHTML = '<div class="spinner"></div> Generating diagram...';

  const workflow = state.validatedJSON;
  let graph = 'graph TD\n';

  // 1. Nodes
  workflow.nodes.forEach(node => {
    // Sanitize ID for Mermaid (remove spaces/special chars)
    const safeId = node.name.replace(/[^a-zA-Z0-9]/g, '_');
    let label = node.name;
    if (node.type.includes('Trigger')) {
      label += ' (Trigger)';
    }

    // Node styling based on type
    let shapeOpen = '[';
    let shapeClose = ']';
    if (node.type.includes('Trigger')) { shapeOpen = '(('; shapeClose = '))'; }
    else if (node.type.includes('if') || node.type.includes('switch')) { shapeOpen = '{'; shapeClose = '}'; }

    graph += `  ${safeId}${shapeOpen}"${label}"${shapeClose}\n`;

    // Add click event (optional, for future)
    // graph += `  click ${safeId} callback "${node.id}"\n`;
  });

  // 2. Connections
  if (workflow.connections) {
    Object.keys(workflow.connections).forEach(sourceName => {
      const safeSource = sourceName.replace(/[^a-zA-Z0-9]/g, '_');
      const outputs = workflow.connections[sourceName];

      if (outputs.main) {
        outputs.main.forEach((outputGroup, index) => {
          outputGroup.forEach(conn => {
            const safeTarget = conn.node.replace(/[^a-zA-Z0-9]/g, '_');
            graph += `  ${safeSource} --> ${safeTarget}\n`;
          });
        });
      }
    });
  }

  // Render
  try {
    const { svg } = await window.mermaid.render('mermaid-graph', graph);
    container.innerHTML = svg;
  } catch (error) {
    console.error('Mermaid render error:', error);
    container.innerHTML = `<div class="error-item">Failed to render diagram: ${error.message}</div>`;
  }
}

function switchTab(tabId) {
  $$('.output-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });

  $$('.tab-content').forEach((content) => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });

  if (tabId === 'explain' && state.validatedJSON && !state.explanationLoaded) {
    loadExplanation();
  }

  if (tabId === 'visual' && state.validatedJSON) {
    renderMermaid();
  }
  
  if (tabId === 'stats' && state.validatedJSON) {
    displayWorkflowStats();
  }
  
  if (tabId === 'optimize' && state.validatedJSON) {
    optimizeWorkflow();
  }
}

// --- Core Logic ---
// --- Core Logic ---
async function generateWorkflow() {
  const userPrompt = $('#prompt-textarea').value.trim();
  const version = $('#version-select').value;

  // Robust provider selection
  const providerSelect = $('#provider-select');

  if (!providerSelect) {
    console.error('CRITICAL: provider-select not found');
    alert('Error: AI Provider selector not found!');
  }

  // Force default to perplexity for debugging if selector fails or returns empty
  const provider = providerSelect ? providerSelect.value : 'perplexity';

  console.log(`Generating workflow. Provider: ${provider}`);
  // alert(`Provider: ${provider}`);

  if (userPrompt.length < 10) {
    showToast('Please enter a more detailed prompt (min 10 characters).', 'error');
    return;
  }

  state.generating = true;
  state.version = version;
  state.provider = provider;
  state.retryCount = 0;
  state.validatedJSON = null;
  state.explanationLoaded = false;
  state.explanationText = '';

  updateGenerateButton();
  setValidationStatus('validating', `Generating workflow using ${provider === 'gemini' ? 'Gemini' : 'Perplexity'}...`, null);
  renderJSON(null);

  // Reset to JSON tab
  switchTab('json');

  try {
    await attemptGeneration(userPrompt, version, state.selectedTemplate);
  } catch (err) {
    console.error('Generation Error:', err);
    setValidationStatus(
      'failed',
      `Generation failed: ${err.message}`,
      [err.message]
    );
    showToast('Generation failed. Check your connection and backend server.', 'error');
  } finally {
    state.generating = false;
    updateGenerateButton();
  }
}

async function attemptGeneration(userPrompt, version, template) {
  const prompt = buildGenerationPrompt(userPrompt, version, template);
  const provider = state.provider || 'perplexity'; // Get provider from state

  setValidationStatus('validating', `Calling ${provider === 'gemini' ? 'Gemini' : 'Perplexity'} API...`, null);

  let rawText;
  try {
    if (provider === 'perplexity') {
      console.log('Calling Perplexity API via backend...');
      rawText = await callPerplexity(prompt.system, prompt.user);
    } else {
      console.log('Calling Gemini API via backend...');
      rawText = await callGemini(prompt.system, prompt.user);
    }
  } catch (err) {
    throw new Error(`${provider === 'gemini' ? 'Gemini' : 'Perplexity'} API call failed: ${err.message}`);
  }

  state.rawOutput = rawText;
  await processResponse(rawText, userPrompt, version, template);
}

// --- Cleanup / Normalization ---
function cleanWorkflow(workflow) {
  if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
    return workflow;
  }

  workflow.nodes.forEach(node => {
    // Fix: n8n often expects 'assignments' to be an object with an 'assignments' array inside it
    // Perplexity often outputs: parameters: { assignments: [ ... ] } or parameters: { assignments: { name: ... } }
    // Correct n8n set node structure for v1: parameters: { assignments: { assignments: [ ... ] } }

    if (node.type === 'n8n-nodes-base.set') {
      if (node.parameters && node.parameters.assignments) {
        // Case 1: assignments is directly an array (Wrong for Set V3+, needs nesting)
        if (Array.isArray(node.parameters.assignments)) {
          node.parameters.assignments = { assignments: node.parameters.assignments };
        }
      }
    }

    // Fix: Switch rules should be an array inside 'rules'
    if (node.type === 'n8n-nodes-base.switch') {
      if (node.parameters && node.parameters.rules && Array.isArray(node.parameters.rules)) {
        // Sometimes AI outputs wrong structure, try to normalize if needed
        // But usually n8n switch uses: parameters: { rules: { rules: [ ... ] } }
        node.parameters.rules = { rules: node.parameters.rules };
      }
    }

    // General fix: If any property is named "assignments" or "options" or "ui" and is an array, 
    // but n8n expects it wrapped in an object with the same key (common pattern), check documentation/knowledge.
    // For now, the Set node is the most common culprit for "propertyValues[itemName] is not iterable".
  });

  return workflow;
}

async function processResponse(rawText, userPrompt, version, template) {
  // Step 1: Parse JSON
  let workflow;
  try {
    setValidationStatus('validating', 'Parsing JSON output...', null);
    workflow = extractJSON(rawText);

    // Step 1.5: Clean/Normalize JSON
    workflow = cleanWorkflow(workflow);

  } catch (parseError) {
    // JSON parsing failed — attempt repair
    if (state.retryCount < 2) {
      state.retryCount++;
      setValidationStatus(
        'repairing',
        `JSON parsing failed. Attempting repair (${state.retryCount}/2)...`,
        [`Parse error: ${parseError.message}`]
      );

      await attemptRepair(rawText, [`JSON parse error: ${parseError.message}`], userPrompt, version, template);
      return;
    } else {
      setValidationStatus(
        'failed',
        'Automatic repair failed after 2 attempts. Consider simplifying your prompt or selecting a template.',
        [`Parse error: ${parseError.message}`]
      );
      renderJSON(null);
      // Show raw output so user can debug
      const codeContent = $('#code-content');
      const codeViewer = $('#code-viewer');
      const placeholder = $('#output-placeholder');
      placeholder.style.display = 'none';
      codeViewer.style.display = 'block';
      codeContent.textContent = rawText;
      return;
    }
  }

  // Step 2: Validate
  setValidationStatus('validating', 'Validating workflow structure...', null);
  const errors = validateWorkflow(workflow, version, template);

  if (errors.length > 0) {
    if (state.retryCount < 2) {
      state.retryCount++;
      setValidationStatus(
        'repairing',
        `${errors.length} validation error(s) found. Attempting repair (${state.retryCount}/2)...`,
        errors
      );

      await attemptRepair(
        JSON.stringify(workflow, null, 2),
        errors,
        userPrompt,
        version,
        template
      );
      return;
    } else {
      setValidationStatus(
        'failed',
        `Validation failed with ${errors.length} error(s). Automatic repair exhausted (2/2).`,
        errors
      );
      renderJSON(workflow);
      return;
    }
  }

  // Step 3: Success
  state.validatedJSON = workflow;
  setValidationStatus(
    'passed',
    `Validation passed. ${workflow.nodes.length} nodes detected. Ready to download.`,
    null
  );
  renderJSON(workflow);
  showToast('Workflow generated and validated successfully.', 'success');
  
  // Save to history - get prompt from textarea
  const promptText = $('#prompt-textarea')?.value?.trim() || '';
  if (promptText) {
    saveToHistory(workflow, promptText);
  }
  
  // Display complexity analysis
  displayComplexityBadge();
  
  // Update favorite button
  updateFavoriteButton();
}

async function attemptRepair(rawJSON, errors, userPrompt, version, template) {
  const prompt = buildRepairPrompt(rawJSON, errors, userPrompt, version, template);
  const provider = state.provider || 'perplexity'; // Get provider from state

  let rawText;
  try {
    if (provider === 'perplexity') {
      console.log('Repairing with Perplexity...');
      rawText = await callPerplexity(prompt.system, prompt.user);
    } else {
      console.log('Repairing with Gemini...');
      rawText = await callGemini(prompt.system, prompt.user);
    }
  } catch (err) {
    console.error('Repair Error:', err);
    setValidationStatus(
      'failed',
      `Repair API call failed: ${err.message}`,
      [err.message]
    );
    return;
  }

  state.rawOutput = rawText;
  await processResponse(rawText, userPrompt, version, template);
}

async function loadExplanation() {
  if (!state.validatedJSON || state.explanationLoading) return;

  if (!backendAvailable) {
    $('#explanation-content').innerHTML =
      '<div class="explanation-placeholder">Backend server not available. Please start the backend server.</div>';
    return;
  }

  state.explanationLoading = true;
  $('#explanation-content').innerHTML =
    '<div class="explanation-loading"><span class="spinner"></span> Generating explanation...</div>';

  try {
    const prompt = buildExplanationPrompt(
      JSON.stringify(state.validatedJSON, null, 2)
    );

    // Choose API based on provider in state
    const provider = state.provider || 'gemini';

    let result;
    if (provider === 'gemini') {
      result = await callGemini(prompt.system, prompt.user);
    } else {
      result = await callPerplexity(prompt.system, prompt.user);
    }

    state.explanationText = result;
    state.explanationLoaded = true;

    // Basic markdown-like rendering
    const rendered = result
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h3>$1</h3>')
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');

    $('#explanation-content').innerHTML = `<div class="explanation-content">${rendered}</div>`;
  } catch (err) {
    $('#explanation-content').innerHTML = `<div class="explanation-placeholder">Failed to generate explanation: ${err.message}</div>`;
  } finally {
    state.explanationLoading = false;
  }
}

function downloadJSON() {
  if (!state.validatedJSON) return;

  const jsonStr = JSON.stringify(state.validatedJSON, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const name = (state.validatedJSON.name || 'workflow')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast('JSON file downloaded successfully.', 'success');

  // Show import instructions
  $('#import-instructions').classList.remove('hidden');
}

function copyJSON() {
  const text = $('#code-content').textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard.', 'success');
  }).catch(() => {
    showToast('Failed to copy.', 'error');
  });
}

// --- Initialization ---
function initApp() {
  renderTemplatePills();

  // Event listeners
  $('#prompt-textarea').addEventListener('input', () => {
    updateCharCount();
    updateGenerateButton();
  });

  $('#version-select').addEventListener('change', (e) => {
    state.version = e.target.value;
  });

  const providerSelect = $('#provider-select');
  if (providerSelect) {
    providerSelect.addEventListener('change', (e) => {
      state.provider = e.target.value;
    });
  }

  $('#generate-btn').addEventListener('click', generateWorkflow);

  // Tab switching
  $$('.output-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Download
  $('#download-btn').addEventListener('click', downloadJSON);

  // Copy
  $('#copy-btn').addEventListener('click', copyJSON);

  // Import instructions toggle
  const toggleBtn = $('#toggle-import-instructions');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      $('#import-instructions').classList.toggle('hidden');
    });
  }

  // History sidebar toggle
  const historyToggle = $('#history-toggle');
  const historySidebar = $('#history-sidebar');
  const closeHistory = $('#close-history');
  
  if (historyToggle && historySidebar) {
    historyToggle.addEventListener('click', () => {
      historySidebar.classList.toggle('open');
    });
  }
  
  if (closeHistory && historySidebar) {
    closeHistory.addEventListener('click', () => {
      historySidebar.classList.remove('open');
    });
  }

  // Export menu toggle
  const exportMenuBtn = $('#export-menu-btn');
  const exportMenu = $('#export-menu');
  
  if (exportMenuBtn && exportMenu) {
    exportMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('open');
    });
    
    document.addEventListener('click', () => {
      exportMenu.classList.remove('open');
    });
  }

  // Shortcuts modal
  const shortcutsBtn = $('#shortcuts-btn');
  const shortcutsModal = $('#shortcuts-modal');
  
  if (shortcutsBtn && shortcutsModal) {
    shortcutsBtn.addEventListener('click', () => {
      shortcutsModal.classList.toggle('hidden');
    });
    
    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) {
        shortcutsModal.classList.add('hidden');
      }
    });
  }

  // Theme toggle
  const themeToggle = $('#theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Sidebar tabs
  $$('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.sidebar-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const tabName = tab.dataset.sidebarTab;
      const historyList = $('#history-list');
      const templatesList = $('#custom-templates-list');
      
      if (tabName === 'history') {
        if (historyList) historyList.classList.remove('hidden');
        if (templatesList) templatesList.classList.add('hidden');
      } else if (tabName === 'templates') {
        if (historyList) historyList.classList.add('hidden');
        if (templatesList) templatesList.classList.remove('hidden');
        renderCustomTemplates();
      }
    });
  });

  // Initial state
  updateCharCount();
  updateGenerateButton();
  setValidationStatus('idle', 'No workflow generated yet.', null);
}

// --- NEW FEATURES ---

// 1. Workflow History Management
function saveToHistory(workflow, prompt) {
  const historyItem = {
    id: generateUUID(),
    workflow: workflow,
    prompt: prompt,
    timestamp: new Date().toISOString(),
    version: state.version,
    provider: state.provider,
  };
  
  state.history.unshift(historyItem);
  if (state.history.length > 10) state.history.pop(); // Keep last 10
  
  localStorage.setItem('n8n-workflow-history', JSON.stringify(state.history));
  renderHistory();
}

function loadHistory() {
  const saved = localStorage.getItem('n8n-workflow-history');
  if (saved) {
    try {
      state.history = JSON.parse(saved);
      renderHistory();
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  }
}

function renderHistory() {
  const container = $('#history-list');
  if (!container) return;
  
  if (state.history.length === 0) {
    container.innerHTML = '<div class="empty-state">No history yet. Generate your first workflow!</div>';
    return;
  }
  
  container.innerHTML = state.history.map(item => {
    const date = new Date(item.timestamp).toLocaleString();
    return `
      <div class="history-item" data-id="${item.id}">
        <div class="history-header">
          <span class="history-name">${item.workflow.name || 'Untitled'}</span>
          <span class="history-date">${date}</span>
        </div>
        <div class="history-prompt">${item.prompt.substring(0, 80)}...</div>
        <div class="history-actions">
          <button class="btn-small" onclick="loadFromHistory('${item.id}')">Load</button>
          <button class="btn-small btn-icon-only" onclick="deleteFromHistory('${item.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function loadFromHistory(id) {
  const item = state.history.find(h => h.id === id);
  if (!item) return;
  
  state.validatedJSON = item.workflow;
  state.version = item.version;
  $('#version-select').value = item.version;
  $('#prompt-textarea').value = item.prompt;
  
  setValidationStatus('passed', 'Loaded from history', null);
  renderJSON(item.workflow);
  switchTab('json');
  showToast('Workflow loaded from history', 'success');
}

function deleteFromHistory(id) {
  state.history = state.history.filter(h => h.id !== id);
  localStorage.setItem('n8n-workflow-history', JSON.stringify(state.history));
  renderHistory();
  showToast('Deleted from history', 'success');
}

// 2. Favorites System
function toggleFavorite() {
  if (!state.validatedJSON) return;
  
  const workflowId = state.validatedJSON.versionId || generateUUID();
  const existingIndex = state.favorites.findIndex(f => f.id === workflowId);
  
  if (existingIndex >= 0) {
    state.favorites.splice(existingIndex, 1);
    showToast('Removed from favorites', 'success');
  } else {
    state.favorites.push({
      id: workflowId,
      workflow: state.validatedJSON,
      timestamp: new Date().toISOString(),
    });
    showToast('Added to favorites', 'success');
  }
  
  localStorage.setItem('n8n-workflow-favorites', JSON.stringify(state.favorites));
  updateFavoriteButton();
}

function loadFavorites() {
  const saved = localStorage.getItem('n8n-workflow-favorites');
  if (saved) {
    try {
      state.favorites = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load favorites:', e);
    }
  }
}

function updateFavoriteButton() {
  const btn = $('#favorite-btn');
  if (!btn || !state.validatedJSON) return;
  
  const workflowId = state.validatedJSON.versionId || '';
  const isFavorite = state.favorites.some(f => f.id === workflowId);
  
  btn.innerHTML = isFavorite ? '⭐ Favorited' : '☆ Add to Favorites';
  btn.classList.toggle('favorited', isFavorite);
}

// 3. AI Prompt Suggestions
const PROMPT_SUGGESTIONS = [
  "Create a workflow that monitors a Gmail inbox and sends Slack notifications for important emails",
  "Build a lead scoring system that receives webhook data and updates a Google Sheet",
  "Set up an automated Twitter bot that posts daily motivational quotes",
  "Create a workflow that backs up database records to Google Drive every night",
  "Build a customer support automation that categorizes tickets and assigns them to teams",
];

function showPromptSuggestion() {
  const textarea = $('#prompt-textarea');
  if (!textarea || textarea.value.trim().length > 0) return;
  
  const suggestion = PROMPT_SUGGESTIONS[Math.floor(Math.random() * PROMPT_SUGGESTIONS.length)];
  const suggestionEl = document.createElement('div');
  suggestionEl.className = 'prompt-suggestion';
  suggestionEl.innerHTML = `
    <span class="suggestion-icon">💡</span>
    <span class="suggestion-text">${suggestion}</span>
    <button class="btn-small" onclick="usePromptSuggestion(\`${suggestion.replace(/`/g, '\\`')}\`)">Use This</button>
  `;
  
  const promptArea = $('.prompt-area');
  if (!promptArea) return;
  
  const existing = promptArea.querySelector('.prompt-suggestion');
  if (existing) existing.remove();
  
  promptArea.appendChild(suggestionEl);
}

function usePromptSuggestion(suggestion) {
  const textarea = $('#prompt-textarea');
  if (!textarea) return;
  textarea.value = suggestion;
  updateCharCount();
  updateGenerateButton();
  const existing = document.querySelector('.prompt-suggestion');
  if (existing) existing.remove();
}

// 4. Workflow Complexity Analyzer
function analyzeComplexity(workflow) {
  if (!workflow || !workflow.nodes) return null;
  
  const nodeCount = workflow.nodes.length;
  const connectionCount = Object.keys(workflow.connections || {}).reduce((sum, key) => {
    const outputs = workflow.connections[key];
    if (outputs.main) {
      return sum + outputs.main.flat().length;
    }
    return sum;
  }, 0);
  
  const hasConditionals = workflow.nodes.some(n => 
    n.type.includes('if') || n.type.includes('switch')
  );
  
  const hasLoops = workflow.nodes.some(n => 
    n.type.includes('loop') || n.type.includes('splitInBatches')
  );
  
  let complexity = 'Simple';
  let score = nodeCount + connectionCount;
  
  if (hasConditionals) score += 5;
  if (hasLoops) score += 10;
  
  if (score > 20) complexity = 'Complex';
  else if (score > 10) complexity = 'Moderate';
  
  return {
    complexity,
    nodeCount,
    connectionCount,
    hasConditionals,
    hasLoops,
    score,
  };
}

function displayComplexityBadge() {
  if (!state.validatedJSON) return;
  
  const analysis = analyzeComplexity(state.validatedJSON);
  if (!analysis) return;
  
  const badge = document.createElement('div');
  badge.className = `complexity-badge complexity-${analysis.complexity.toLowerCase()}`;
  badge.innerHTML = `
    <span class="badge-label">Complexity:</span>
    <span class="badge-value">${analysis.complexity}</span>
    <div class="badge-details">
      ${analysis.nodeCount} nodes • ${analysis.connectionCount} connections
      ${analysis.hasConditionals ? ' • Has conditionals' : ''}
      ${analysis.hasLoops ? ' • Has loops' : ''}
    </div>
  `;
  
  const header = $$('.panel-header')[1]; // Get the output panel header
  if (!header) return;
  
  const existing = header.querySelector('.complexity-badge');
  if (existing) existing.remove();
  
  header.appendChild(badge);
}

// 5. Export to Multiple Formats
function exportWorkflow(format) {
  if (!state.validatedJSON) return;
  
  let content, filename, mimeType;
  
  switch (format) {
    case 'json':
      content = JSON.stringify(state.validatedJSON, null, 2);
      filename = 'workflow.json';
      mimeType = 'application/json';
      break;
      
    case 'yaml':
      content = jsonToYaml(state.validatedJSON);
      filename = 'workflow.yaml';
      mimeType = 'text/yaml';
      break;
      
    case 'markdown':
      content = workflowToMarkdown(state.validatedJSON);
      filename = 'workflow.md';
      mimeType = 'text/markdown';
      break;
      
    default:
      return;
  }
  
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`Exported as ${format.toUpperCase()}`, 'success');
}

function jsonToYaml(obj, indent = 0) {
  let yaml = '';
  const spaces = '  '.repeat(indent);
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null) {
      yaml += `${spaces}${key}: null\n`;
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`;
      value.forEach(item => {
        if (typeof item === 'object') {
          yaml += `${spaces}- \n${jsonToYaml(item, indent + 1)}`;
        } else {
          yaml += `${spaces}- ${item}\n`;
        }
      });
    } else if (typeof value === 'object') {
      yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
    } else {
      yaml += `${spaces}${key}: ${value}\n`;
    }
  }
  
  return yaml;
}

function workflowToMarkdown(workflow) {
  let md = `# ${workflow.name}\n\n`;
  md += `**Version:** ${workflow.versionId || 'N/A'}\n\n`;
  md += `## Nodes (${workflow.nodes.length})\n\n`;
  
  workflow.nodes.forEach((node, i) => {
    md += `${i + 1}. **${node.name}** (${node.type})\n`;
    if (node.parameters && Object.keys(node.parameters).length > 0) {
      md += `   - Parameters: ${JSON.stringify(node.parameters, null, 2)}\n`;
    }
    md += '\n';
  });
  
  md += `## Connections\n\n`;
  if (workflow.connections) {
    Object.entries(workflow.connections).forEach(([source, targets]) => {
      if (targets.main) {
        targets.main.forEach(group => {
          group.forEach(conn => {
            md += `- ${source} → ${conn.node}\n`;
          });
        });
      }
    });
  }
  
  return md;
}

// 6. Keyboard Shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter: Generate workflow
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!state.generating) generateWorkflow();
    }
    
    // Ctrl/Cmd + S: Download JSON
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (state.validatedJSON) downloadJSON();
    }
    
    // Ctrl/Cmd + K: Copy JSON
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (state.validatedJSON) copyJSON();
    }
  });
}

// 7. AI-Powered Workflow Optimizer
function optimizeWorkflow() {
  if (!state.validatedJSON) return;
  
  const suggestions = [];
  const workflow = state.validatedJSON;
  
  // Check for missing error handling
  const hasErrorWorkflow = workflow.nodes.some(n => 
    n.name.toLowerCase().includes('error') || 
    n.type.includes('errorTrigger')
  );
  if (!hasErrorWorkflow && workflow.nodes.length > 3) {
    suggestions.push({
      type: 'warning',
      title: 'Missing Error Handling',
      description: 'Consider adding error handling nodes to catch and manage failures.',
      impact: 'high'
    });
  }
  
  // Check for inefficient node positioning
  const positions = workflow.nodes.map(n => n.position);
  const avgSpacing = positions.length > 1 ? 
    positions.slice(1).reduce((sum, pos, i) => 
      sum + Math.abs(pos[0] - positions[i][0]), 0) / (positions.length - 1) : 0;
  
  if (avgSpacing < 200) {
    suggestions.push({
      type: 'info',
      title: 'Tight Node Spacing',
      description: 'Nodes are closely spaced. Consider spreading them out for better readability.',
      impact: 'low'
    });
  }
  
  // Check for missing Set nodes (data transformation)
  const hasSetNode = workflow.nodes.some(n => n.type === 'n8n-nodes-base.set');
  if (!hasSetNode && workflow.nodes.length > 2) {
    suggestions.push({
      type: 'tip',
      title: 'Data Transformation',
      description: 'Consider using Set nodes to transform and clean data between operations.',
      impact: 'medium'
    });
  }
  
  // Check for single-path workflows (no branching)
  const connectionCount = Object.keys(workflow.connections || {}).length;
  const hasBranching = Object.values(workflow.connections || {}).some(conn => 
    conn.main && conn.main.some(group => group.length > 1)
  );
  
  if (!hasBranching && connectionCount > 2) {
    suggestions.push({
      type: 'tip',
      title: 'Linear Workflow',
      description: 'This workflow has no branching logic. Consider adding IF or Switch nodes for conditional flows.',
      impact: 'medium'
    });
  }
  
  // Check for missing documentation
  const hasDescriptions = workflow.nodes.some(n => n.notes || n.parameters?.description);
  if (!hasDescriptions) {
    suggestions.push({
      type: 'info',
      title: 'Missing Documentation',
      description: 'Add notes to nodes to document what each step does for future reference.',
      impact: 'low'
    });
  }
  
  displayOptimizationSuggestions(suggestions);
}

function displayOptimizationSuggestions(suggestions) {
  const container = $('#optimization-panel');
  if (!container) return;
  
  if (suggestions.length === 0) {
    container.innerHTML = `
      <div class="optimization-success">
        <span class="success-icon">✅</span>
        <div>
          <strong>Workflow looks great!</strong>
          <p>No optimization suggestions at this time.</p>
        </div>
      </div>
    `;
    container.classList.remove('hidden');
    return;
  }
  
  container.innerHTML = `
    <div class="optimization-header">
      <h4>💡 Optimization Suggestions (${suggestions.length})</h4>
      <button class="btn-icon" onclick="$('#optimization-panel').classList.add('hidden')">✕</button>
    </div>
    <div class="optimization-list">
      ${suggestions.map(s => `
        <div class="optimization-item ${s.type}">
          <div class="optimization-icon">${getOptimizationIcon(s.type)}</div>
          <div class="optimization-content">
            <strong>${s.title}</strong>
            <p>${s.description}</p>
            <span class="impact-badge impact-${s.impact}">Impact: ${s.impact}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  container.classList.remove('hidden');
}

function getOptimizationIcon(type) {
  const icons = {
    warning: '⚠️',
    info: 'ℹ️',
    tip: '💡',
    error: '❌'
  };
  return icons[type] || '💡';
}

// 8. Workflow Comparison Tool
function compareWorkflows(workflow1, workflow2) {
  const comparison = {
    nodeCountDiff: workflow2.nodes.length - workflow1.nodes.length,
    addedNodes: [],
    removedNodes: [],
    modifiedNodes: [],
    connectionChanges: 0
  };
  
  const w1NodeNames = new Set(workflow1.nodes.map(n => n.name));
  const w2NodeNames = new Set(workflow2.nodes.map(n => n.name));
  
  // Find added nodes
  workflow2.nodes.forEach(node => {
    if (!w1NodeNames.has(node.name)) {
      comparison.addedNodes.push(node.name);
    }
  });
  
  // Find removed nodes
  workflow1.nodes.forEach(node => {
    if (!w2NodeNames.has(node.name)) {
      comparison.removedNodes.push(node.name);
    }
  });
  
  return comparison;
}

// 9. Workflow Templates Creator
function saveAsTemplate() {
  if (!state.validatedJSON) return;
  
  const templateName = prompt('Enter a name for this template:');
  if (!templateName) return;
  
  const template = {
    id: generateUUID(),
    name: templateName,
    workflow: state.validatedJSON,
    createdAt: new Date().toISOString(),
    tags: []
  };
  
  const templates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
  templates.push(template);
  localStorage.setItem('custom-templates', JSON.stringify(templates));
  
  showToast(`Template "${templateName}" saved!`, 'success');
  renderCustomTemplates();
}

function renderCustomTemplates() {
  const templates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
  const container = $('#custom-templates-list');
  if (!container) return;
  
  if (templates.length === 0) {
    container.innerHTML = '<div class="empty-state">No custom templates yet.</div>';
    return;
  }
  
  container.innerHTML = templates.map(t => `
    <div class="template-card">
      <div class="template-card-header">
        <strong>${t.name}</strong>
        <button class="btn-icon-only" onclick="deleteTemplate('${t.id}')">🗑️</button>
      </div>
      <div class="template-card-meta">
        ${t.workflow.nodes.length} nodes • ${new Date(t.createdAt).toLocaleDateString()}
      </div>
      <button class="btn-small" onclick="loadTemplate('${t.id}')">Use Template</button>
    </div>
  `).join('');
}

function loadTemplate(id) {
  const templates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
  const template = templates.find(t => t.id === id);
  if (!template) return;
  
  state.validatedJSON = template.workflow;
  renderJSON(template.workflow);
  setValidationStatus('passed', 'Template loaded', null);
  showToast('Template loaded successfully', 'success');
}

function deleteTemplate(id) {
  const templates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem('custom-templates', JSON.stringify(filtered));
  renderCustomTemplates();
  showToast('Template deleted', 'success');
}

// 10. Real-time Collaboration Hints
function generateShareableLink() {
  if (!state.validatedJSON) return;
  
  const compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify(state.validatedJSON)
  );
  
  const url = `${window.location.origin}${window.location.pathname}?workflow=${compressed}`;
  
  navigator.clipboard.writeText(url).then(() => {
    showToast('Shareable link copied to clipboard!', 'success');
  });
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const workflowData = params.get('workflow');
  
  if (workflowData) {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(workflowData);
      const workflow = JSON.parse(decompressed);
      state.validatedJSON = workflow;
      renderJSON(workflow);
      setValidationStatus('passed', 'Workflow loaded from URL', null);
      showToast('Workflow loaded from shared link', 'success');
    } catch (e) {
      console.error('Failed to load workflow from URL:', e);
    }
  }
}

// 11. Workflow Statistics Dashboard
function generateWorkflowStats() {
  if (!state.validatedJSON) return null;
  
  const workflow = state.validatedJSON;
  const stats = {
    totalNodes: workflow.nodes.length,
    nodeTypes: {},
    totalConnections: 0,
    avgConnectionsPerNode: 0,
    triggerNodes: 0,
    actionNodes: 0,
    conditionalNodes: 0,
    estimatedExecutionTime: 0
  };
  
  // Count node types
  workflow.nodes.forEach(node => {
    const type = node.type.split('.').pop();
    stats.nodeTypes[type] = (stats.nodeTypes[type] || 0) + 1;
    
    if (node.type.includes('Trigger')) stats.triggerNodes++;
    else if (node.type.includes('if') || node.type.includes('switch')) stats.conditionalNodes++;
    else stats.actionNodes++;
  });
  
  // Count connections
  if (workflow.connections) {
    Object.values(workflow.connections).forEach(conn => {
      if (conn.main) {
        conn.main.forEach(group => {
          stats.totalConnections += group.length;
        });
      }
    });
  }
  
  stats.avgConnectionsPerNode = stats.totalNodes > 0 ? 
    (stats.totalConnections / stats.totalNodes).toFixed(2) : 0;
  
  // Estimate execution time (rough estimate)
  stats.estimatedExecutionTime = stats.totalNodes * 0.5; // 500ms per node average
  
  return stats;
}

function displayWorkflowStats() {
  const stats = generateWorkflowStats();
  if (!stats) return;
  
  const container = $('#stats-panel');
  if (!container) return;
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalNodes}</div>
        <div class="stat-label">Total Nodes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.totalConnections}</div>
        <div class="stat-label">Connections</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.triggerNodes}</div>
        <div class="stat-label">Triggers</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.conditionalNodes}</div>
        <div class="stat-label">Conditionals</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.avgConnectionsPerNode}</div>
        <div class="stat-label">Avg Connections</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">~${stats.estimatedExecutionTime}s</div>
        <div class="stat-label">Est. Runtime</div>
      </div>
    </div>
    <div class="node-types-chart">
      <h4>Node Type Distribution</h4>
      ${Object.entries(stats.nodeTypes).map(([type, count]) => `
        <div class="chart-bar">
          <span class="chart-label">${type}</span>
          <div class="chart-bar-fill" style="width: ${(count / stats.totalNodes) * 100}%">
            <span class="chart-value">${count}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.classList.remove('hidden');
}

// 12. Dark/Light Theme Toggle
function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('light-mode', !state.darkMode);
  localStorage.setItem('theme', state.darkMode ? 'dark' : 'light');
  
  const btn = $('#theme-toggle');
  if (btn) {
    btn.innerHTML = state.darkMode ? '🌙' : '☀️';
  }
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme');
  state.darkMode = savedTheme !== 'light';
  document.body.classList.toggle('light-mode', !state.darkMode);
}

// 13. Workflow Validation Score
function calculateValidationScore() {
  if (!state.validatedJSON) return 0;
  
  const workflow = state.validatedJSON;
  let score = 100;
  
  // Deduct points for issues
  if (workflow.nodes.length < 2) score -= 20;
  if (!workflow.nodes.some(n => n.type.includes('Trigger'))) score -= 30;
  if (Object.keys(workflow.connections || {}).length === 0) score -= 20;
  
  const hasErrorHandling = workflow.nodes.some(n => 
    n.name.toLowerCase().includes('error')
  );
  if (!hasErrorHandling && workflow.nodes.length > 3) score -= 10;
  
  const hasDocumentation = workflow.nodes.some(n => n.notes);
  if (!hasDocumentation) score -= 10;
  
  return Math.max(0, score);
}

// LZ-String compression library (inline minimal version)
const LZString = {
  compressToEncodedURIComponent: function(input) {
    if (input == null) return "";
    return btoa(encodeURIComponent(input));
  },
  decompressFromEncodedURIComponent: function(input) {
    if (input == null) return "";
    return decodeURIComponent(atob(input));
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  loadHistory();
  loadFavorites();
  loadTheme();
  loadFromURL();
  setupKeyboardShortcuts();
  setTimeout(showPromptSuggestion, 1000);
});


// Make functions globally accessible for onclick handlers
window.toggleFavorite = toggleFavorite;
window.exportWorkflow = exportWorkflow;
window.saveAsTemplate = saveAsTemplate;
window.generateShareableLink = generateShareableLink;
window.loadFromHistory = loadFromHistory;
window.deleteFromHistory = deleteFromHistory;
window.loadTemplate = loadTemplate;
window.deleteTemplate = deleteTemplate;
window.usePromptSuggestion = usePromptSuggestion;
