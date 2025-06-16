let tasks = [];
const taskTableBody = document.querySelector('#taskTable tbody');
const summaryBody = document.querySelector('#summaryTable tbody');
const addBtn = document.getElementById('addTaskBtn');
const modal = document.getElementById('taskModal');
const form = document.getElementById('taskForm');
const viewModal = document.getElementById('viewModal');
const monthlyModal = document.getElementById('monthlyModal');
const userRole = document.body.dataset.role || '';

console.log('User role:', userRole);

document.addEventListener('DOMContentLoaded', () => {
  modal.style.display = 'none';
  viewModal.style.display = 'none';
  monthlyModal.style.display = 'none';
});

function getUniqueWorkers() {
  return [...new Set(tasks.map(t => t.ouvrier))];
}

function evaluateStatus(est, real, termine) {
  if (termine) return '✅ Terminé';
  return parseFloat(real) > parseFloat(est) ? '⚠️ En retard' : '🔄 En cours';
}

function truncateComment(comment) {
  if (!comment) return '';
  const words = comment.trim().split(/\s+/);
  if (words.length <= 3) return comment;
  return words.slice(0, 3).join(' ') + '...';
}

function toggleTaskDone(id, checked) {
  fetch('./tasks.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: parseInt(id), termine: checked })
  })
    .then(response => response.json())
    .then(() => fetchTasks())
    .catch(error => console.error('Error updating status:', error));
}

function fetchTasks() {
  fetch('./tasks.php')
    .then(response => response.json())
    .then(data => {
      tasks = data;
      refreshTables();
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

function refreshTables() {
  const workerFilter = document.getElementById('workerFilter');
  const selectedWorker = workerFilter.value;
  const filteredTasks = selectedWorker === 'all' ? tasks : tasks.filter(t => t.ouvrier === selectedWorker);

  filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  taskTableBody.innerHTML = '';
  summaryBody.innerHTML = '';
  const summaryMap = new Map();

  filteredTasks.forEach(task => {
    task.statut = evaluateStatus(task.estimee, task.reelle, task.termine);
    const tr = document.createElement('tr');
    tr.setAttribute('data-status', task.statut);

    const actions = `
      <button class="view" data-id="${task.id}">👁️</button>
      <button class="edit" data-id="${task.id}">✏️</button>
      ${userRole === 'admin' ? `<button class="delete" data-id="${task.id}">🗑️</button>` : ''}
    `;

    tr.innerHTML = `
      <td><input type="checkbox" data-id="${task.id}" ${task.termine ? 'checked' : ''}></td>
      <td>${task.date}</td>
      <td>${task.ouvrier}</td>
      <td>${task.numero}</td>
      <td>${task.tache}</td>
      <td>${task.estimee}</td>
      <td>${task.reelle}</td>
      <td>${task.statut}</td>
      <td>${truncateComment(task.commentaire)}</td>
      <td>${actions}</td>
    `;
    taskTableBody.appendChild(tr);

    const key = `${task.date}-${task.ouvrier}`;
    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        date: task.date,
        ouvrier: task.ouvrier,
        total: 0,
        done: 0,
        heuresPrevues: 0,
        heuresReelles: 0
      });
    }
    const s = summaryMap.get(key);
    s.total++;
    if (task.termine) s.done++;
    s.heuresPrevues += parseFloat(task.estimee);
    s.heuresReelles += parseFloat(task.reelle);
  });

  const sortedSummary = Array.from(summaryMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedSummary.forEach(s => {
    const rendement = s.total ? ((s.done / s.total) * 100).toFixed(1) : '0';
    const efficacite = s.heuresReelles ? ((s.heuresPrevues / s.heuresReelles) * 100).toFixed(1) : '0';
    summaryBody.innerHTML += `
      <tr>
        <td>${s.date}</td>
        <td>${s.ouvrier}</td>
        <td>${s.total}</td>
        <td>${s.done}</td>
        <td>${s.heuresPrevues.toFixed(1)}</td>
        <td>${s.heuresReelles.toFixed(1)}</td>
        <td>${rendement}%</td>
        <td>${efficacite}%</td>
      </tr>
    `;
  });

  const uniqueWorkers = getUniqueWorkers();
  workerFilter.innerHTML = '<option value="all">Tous</option>' +
    uniqueWorkers.map(w => `<option value="${w}">${w}</option>`).join('');
  workerFilter.value = uniqueWorkers.includes(selectedWorker) ? selectedWorker : 'all';
}

addBtn.onclick = () => {
  form.reset();
  form.id.value = '';
  [...form.elements].forEach(el => el.readOnly = false);
  modal.style.display = 'flex';
};

form.onsubmit = e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const isEditing = data.id !== '';
  const task = {
    id: isEditing ? parseInt(data.id) : null,
    date: data.date,
    ouvrier: data.ouvrier,
    tache: data.tache,
    estimee: parseFloat(data.estimee),
    reelle: parseFloat(data.reelle),
    commentaire: data.commentaire || '',
    termine: isEditing ? tasks.find(t => t.id === parseInt(data.id))?.termine || 0 : 0
  };

  fetch('./tasks.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
    .then(response => response.json())
    .then(() => {
      modal.style.display = 'none';
      fetchTasks();
    })
    .catch(error => console.error('Error saving task:', error));
};

taskTableBody.onclick = e => {
  const id = e.target.dataset.id;
  const task = tasks.find(t => t.id === parseInt(id));

  if (e.target.matches('.view')) {
    const viewDetails = document.getElementById('viewDetails');
    viewDetails.innerHTML = `
      <p><strong>Date :</strong> ${task.date}</p>
      <p><strong>Ouvrier :</strong> ${task.ouvrier}</p>
      <p><strong>N° :</strong> ${task.numero}</p>
      <p><strong>Tâche :</strong> ${task.tache}</p>
      <p><strong>Durée estimée (h) :</strong> ${task.estimee}</p>
      <p><strong>Durée réelle (h) :</strong> ${task.reelle}</p>
      <p><strong>Statut :</strong> ${evaluateStatus(task.estimee, task.reelle, task.termine)}</p>
      <p><strong>Commentaire :</strong> ${task.commentaire || 'Aucun'}</p>
      <p><strong>Terminé :</strong> ${task.termine ? 'Oui' : 'Non'}</p>
    `;
    viewModal.style.display = 'flex';
  }

  if (e.target.matches('.edit')) {
    form.id.value = task.id;
    form.date.value = task.date;
    form.ouvrier.value = task.ouvrier;
    form.tache.value = task.tache;
    form.estimee.value = task.estimee;
    form.reelle.value = task.reelle;
    form.commentaire.value = task.commentaire;

    [...form.elements].forEach(el => el.readOnly = false);
    if (userRole === 'assistant') {
      form.querySelector('[name="date"]').readOnly = true;
      form.querySelector('[name="ouvrier"]').readOnly = true;
      form.querySelector('[name="tache"]').readOnly = true;
      form.querySelector('[name="estimee"]').readOnly = true;
    }

    modal.style.display = 'flex';
  }

  if (e.target.matches('.delete') && userRole === 'admin') {
    if (confirm('Supprimer cette tâche ?')) {
      fetch('./tasks.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id) })
      })
        .then(response => response.json())
        .then(() => fetchTasks())
        .catch(error => console.error('Error deleting task:', error));
    }
  }

  if (e.target.matches('input[type="checkbox"]')) {
    toggleTaskDone(id, e.target.checked);
  }
};

document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = () => btn.closest('.modal').style.display = 'none';
});

document.getElementById('calcMonthlyBtn').onclick = () => {
  document.getElementById('monthlyForm').reset();
  document.getElementById('result').innerHTML = '';
  monthlyModal.style.display = 'flex';
};

document.getElementById('monthlyClose').onclick = () => monthlyModal.style.display = 'none';

window.onclick = e => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === monthlyModal) monthlyModal.style.display = 'none';
  if (e.target === viewModal) viewModal.style.display = 'none';
};

document.getElementById('monthlyForm').onsubmit = e => {
  e.preventDefault();
  const form = e.target;
  const ouvrier = form.ouvrier.value.trim();
  const mois = form.mois.value;

  if (!ouvrier || !mois) return;

  const filtered = tasks.filter(t => t.ouvrier.toLowerCase() === ouvrier.toLowerCase() && t.date.startsWith(mois));
  const resultDiv = document.getElementById('result');

  if (filtered.length === 0) {
    resultDiv.innerHTML = `<p>Aucune tâche trouvée pour ${ouvrier} au mois ${mois}.</p>`;
    return;
  }

  const total = filtered.length;
  const done = filtered.filter(t => t.termine).length;
  const estimees = filtered.reduce((sum, t) => sum + parseFloat(t.estimee), 0);
  const reelles = filtered.reduce((sum, t) => sum + parseFloat(t.reelle), 0);

  const rendement = ((done / total) * 100).toFixed(2);
  const efficacite = reelles ? ((estimees / reelles) * 100).toFixed(2) : '0';

  resultDiv.innerHTML = `
    <p><strong>Ouvrier :</strong> ${ouvrier}</p>
    <p><strong>Mois :</strong> ${mois}</p>
    <p><strong>Total Tâches :</strong> ${total}</p>
    <p><strong>Tâches Terminées :</strong> ${done}</p>
    <p><strong>% Rendement tâches :</strong> ${rendement} %</p>
    <p><strong>% Efficacité temps :</strong> ${efficacite} %</p>
  `;
};

document.getElementById('workerFilter').onchange = () => refreshTables();

fetchTasks();
