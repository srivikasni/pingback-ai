// ---------- OCR: extract text from uploaded screenshot ----------
const screenshotInput = document.getElementById('screenshotInput');
const ocrStatus = document.getElementById('ocrStatus');
const previewImg = document.getElementById('previewImg');
const extractedTextEl = document.getElementById('extractedText');
const titleEl = document.getElementById('title');

screenshotInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  previewImg.src = URL.createObjectURL(file);
  previewImg.style.display = 'block';
  ocrStatus.textContent = 'Reading text from image...';

  try {
    const result = await Tesseract.recognize(file, 'eng');
    const text = result.data.text.trim();
    extractedTextEl.value = text;
    if (!titleEl.value && text) {
      titleEl.value = text.split('\n')[0].slice(0, 80);
    }
    ocrStatus.textContent = 'Text extracted. Review and edit below before saving.';
  } catch (err) {
    ocrStatus.textContent = 'OCR failed: ' + err.message;
  }
});

// ---------- Form submit: create or update ----------
const form = document.getElementById('opportunityForm');
const opportunityIdEl = document.getElementById('opportunityId');
const cancelEditBtn = document.getElementById('cancelEditBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    title: titleEl.value,
    extractedText: extractedTextEl.value,
    category: document.getElementById('category').value,
    sourcePlatform: document.getElementById('sourcePlatform').value,
    applicationLink: document.getElementById('applicationLink').value,
    priority: document.getElementById('priority').value,
    deadline: document.getElementById('deadline').value || null,
    reminderDate: document.getElementById('reminderDate').value || null,
    nextAction: document.getElementById('nextAction').value,
    status: document.getElementById('status').value,
    notes: document.getElementById('notes').value
  };

  const id = opportunityIdEl.value;
  const url = id ? `${API_BASE_URL}/${id}` : API_BASE_URL;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Save failed');
    resetForm();
    loadOpportunities();
    loadStats();
  } catch (err) {
    alert(err.message);
  }
});

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  form.reset();
  opportunityIdEl.value = '';
  previewImg.style.display = 'none';
  ocrStatus.textContent = '';
  cancelEditBtn.style.display = 'none';
}

// ---------- Load and render list ----------
const cardsContainer = document.getElementById('cardsContainer');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterStatus = document.getElementById('filterStatus');

[searchInput, filterCategory, filterStatus].forEach(el =>
  el.addEventListener('input', () => loadOpportunities())
);

async function loadOpportunities() {
  const params = new URLSearchParams();
  if (searchInput.value) params.set('search', searchInput.value);
  if (filterCategory.value) params.set('category', filterCategory.value);
  if (filterStatus.value) params.set('status', filterStatus.value);

  try {
    const res = await fetch(`${API_BASE_URL}?${params.toString()}`);
    const data = await res.json();
    renderCards(data);
  } catch (err) {
    cardsContainer.innerHTML = `<p>Could not load data: ${err.message}</p>`;
  }
}

function deadlineBadge(deadline) {
  if (!deadline) return '';
  const d = new Date(deadline);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `<span class="badge overdue">Overdue</span>`;
  if (diffDays === 0) return `<span class="badge overdue">Due today</span>`;
  if (diffDays <= 3) return `<span class="badge due-soon">Due soon</span>`;
  return '';
}

function renderCards(items) {
  if (!items.length) {
    cardsContainer.innerHTML = '<p>No opportunities saved yet.</p>';
    return;
  }
  cardsContainer.innerHTML = items.map(o => `
    <div class="opp-card">
      <h3>${escapeHtml(o.title)}</h3>
      <p><span class="badge">${o.category}</span>${deadlineBadge(o.deadline)}</p>
      <p>Source: ${o.sourcePlatform} | Priority: ${o.priority}</p>
      <p>Status: ${o.status}</p>
      ${o.deadline ? `<p>Deadline: ${new Date(o.deadline).toLocaleDateString()}</p>` : ''}
      ${o.nextAction ? `<p>Next: ${escapeHtml(o.nextAction)}</p>` : ''}
      <div class="actions">
        <button onclick="editOpportunity('${o._id}')">Edit</button>
        <button class="deleteBtn" onclick="deleteOpportunity('${o._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ---------- Edit ----------
async function editOpportunity(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  const o = await res.json();

  opportunityIdEl.value = o._id;
  titleEl.value = o.title || '';
  extractedTextEl.value = o.extractedText || '';
  document.getElementById('category').value = o.category;
  document.getElementById('sourcePlatform').value = o.sourcePlatform;
  document.getElementById('applicationLink').value = o.applicationLink || '';
  document.getElementById('priority').value = o.priority;
  document.getElementById('deadline').value = o.deadline ? o.deadline.slice(0, 10) : '';
  document.getElementById('reminderDate').value = o.reminderDate ? o.reminderDate.slice(0, 10) : '';
  document.getElementById('nextAction').value = o.nextAction || '';
  document.getElementById('status').value = o.status;
  document.getElementById('notes').value = o.notes || '';

  cancelEditBtn.style.display = 'inline-block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------- Delete ----------
async function deleteOpportunity(id) {
  if (!confirm('Delete this opportunity?')) return;
  await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  loadOpportunities();
  loadStats();
}

// ---------- Stats + charts ----------
let categoryChart, statusChart;

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/meta/stats`);
    const stats = await res.json();

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statDue').textContent = stats.dueThisWeek;
    document.getElementById('statCompleted').textContent = stats.completed;
    document.getElementById('statPending').textContent = stats.pending;

    renderChart('categoryChart', stats.byCategory, 'Category');
    renderChart('statusChart', stats.byStatus, 'Status');
  } catch (err) {
    console.error('Could not load stats:', err.message);
  }
}

function renderChart(canvasId, dataObj, label) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const palette = ['#2f7fd6', '#1fae8f', '#e6b45a', '#c878eb', '#e05a5a', '#5aa0eb', '#46d2af'];
  const chartData = {
    labels: Object.keys(dataObj),
    datasets: [{
      label,
      data: Object.values(dataObj),
      backgroundColor: palette,
      borderColor: 'rgba(8,18,22,0.9)',
      borderWidth: 2
    }]
  };

  if (canvasId === 'categoryChart' && categoryChart) categoryChart.destroy();
  if (canvasId === 'statusChart' && statusChart) statusChart.destroy();

  const chart = new Chart(ctx, {
    type: 'doughnut',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#b9c9c6',
            font: { size: 11 },
            boxWidth: 12,
            padding: 10
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => `${item.label}: ${item.raw}`
          }
        }
      }
    }
  });

  if (canvasId === 'categoryChart') categoryChart = chart;
  else statusChart = chart;
}

// ---------- Initial load ----------
loadOpportunities();
loadStats();
