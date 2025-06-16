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

// Masquer tous les modals au chargement
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

// Fonction pour tronquer le commentaire à 3 mots
function truncateComment(comment) {
  if (!comment) return '';
  const words = comment.trim().split(/\s+/);
  console.log('Commentaire:', comment, 'Mots:', words); // Débogage
  if (words.length <= 3) return comment;
  return words.slice(0, 3).join(' ') + '...';
}

function toggleTaskDone(id, checked) {
  console.log(`Toggling task ${id} to ${checked}`);
  fetch('./tasks.php', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: parseInt(id), termine: checked })
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    })
    .then(() => fetchTasks())
    .catch(error => console.error('Error updating status:', error));
}

function fetchTasks() {
  console.log('Fetching tasks...');
  fetch('./tasks.php')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    })
    .then(data => {
      tasks = data;
      refreshTables();
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

function refreshTables() {
  const workerFilter = document.getElementById('workerFilter');
  const selectedWorker = workerFilter.value;
  let filteredTasks = selectedWorker === 'all' ? tasks : tasks.filter(t => t.ouvrier === selectedWorker);

  filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

  taskTableBody.innerHTML = '';
  summaryBody.innerHTML = '';
  const summaryMap = new Map();

  filteredTasks.forEach(task => {
    task.statut = evaluateStatus(task.estimee, task.reelle, task.termine);
    const tr = document.createElement('tr');
    tr.setAttribute('data-status', task.statut.startsWith('✅') ? '✅' : task.statut.startsWith('⚠') ? '⚠' : task.statut);

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
    s.total += 1;
    if (task.termine) s.done += 1;
    s.heuresPrevues += parseFloat(task.estimee);
    s.heuresReelles += parseFloat(task.reelle);
  });

  const sortedSummary = Array.from(summaryMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  for (const s of sortedSummary) {
    const rendement = s.total ? ((s.done / s.total) * 100).toFixed(1) : '0';
    const efficacite = s.heuresPrevues ? ((s.heuresPrevues / s.heuresReelles) * 100).toFixed(1) : '0';
    const row = `
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
    summaryBody.innerHTML += row;
  }

  const uniqueWorkers = getUniqueWorkers();
  workerFilter.innerHTML = '<option value="all">Tous</option>' +
    uniqueWorkers.map(w => `<option value="${w}">${w}</option>`).join('');

  if (selectedWorker && uniqueWorkers.includes(selectedWorker)) {
    workerFilter.value = selectedWorker;
  } else {
    workerFilter.value = 'all';
  }
}

addBtn.onclick = () => {
  console.log('Opening add task modal');
  form.reset();
  form.id.value = '';
  form.querySelector('[name="date"]').readOnly = false;
  form.querySelector('[name="ouvrier"]').readOnly = false;
  form.querySelector('[name="tache"]').readOnly = false;
  form.querySelector('[name="estimee"]').readOnly = false;
  form.querySelector('[name="reelle"]').readOnly = false;
  form.querySelector('[name="commentaire"]').readOnly = false;
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
    termine: isEditing ? tasks.find(t => t.id === parseInt(data.id))?.termine || 1 : 0
  };
  console.log('Submitting task:', task);

  fetch('./tasks.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Task saved:', data);
      modal.style.display = 'none';
      fetchTasks();
    })
    .catch(error => console.error('Error saving task:', error));
};

taskTableBody.onclick = e => {
  const id = e.target.dataset.id;
  if (e.target.matches('.view')) {
    console.log(`Viewing task ${id}`);
    const t = tasks.find(t => t.id === parseInt(id));
    const viewDetails = document.getElementById('viewDetails');
    viewDetails.innerHTML = `
      <p><strong>Date :</strong> ${t.date}</p>
      <p><strong>Ouvrier :</strong> ${t.ouvrier}</p>
      <p><strong>N° :</strong> ${t.numero}</p>
      <p><strong>Tâche :</strong> ${t.tache}</p>
      <p><strong>Durée estimée (h) :</strong> ${t.estimee}</p>
      <p><strong>Durée réelle (h) :</strong> ${t.reelle}</p>
      <p><strong>Statut :</strong> ${evaluateStatus(t.estimee, t.reelle, t.termine)}</p>
      <p><strong>Commentaire :</strong> ${t.commentaire || 'Aucun'}</p>
      <p><strong>Terminé :</strong> ${t.termine ? 'Oui' : 'Non'}</p>
    `;
    viewModal.style.display = 'flex';
  }

  if (e.target.matches('.edit')) {
    console.log(`Editing task ${id}`);
    const t = tasks.find(t => t.id === parseInt(id));
    form.id.value = t.id;
    form.date.value = t.date;
    form.ouvrier.value = t.ouvrier;
    form.tache.value = t.tache;
    form.estimee.value = t.estimee;
    form.reelle.value = t.reelle;
    form.commentaire.value = t.commentaire;

    if (userRole === 'assistant') {
      console.log('Setting fields read-only for assistant');
      form.querySelector('[name="date"]').readOnly = true;
      form.querySelector('[name="ouvrier"]').readOnly = true;
      form.querySelector('[name="tache"]').readOnly = true;
      form.querySelector('[name="estimee"]').readOnly = true;
      form.querySelector('[name="reelle"]').readOnly = false;
      form.querySelector('[name="commentaire"]').readOnly = false;
    } else {
      console.log('All fields editable for admin');
      form.querySelector('[name="date"]').readOnly = false;
      form.querySelector('[name="ouvrier"]').readOnly = false;
      form.querySelector('[name="tache"]').readOnly = false;
      form.querySelector('[name="estimee"]').readOnly = false;
      form.querySelector('[name="reelle"]').readOnly = false;
      form.querySelector('[name="commentaire"]').readOnly = false;
    }

    modal.style.display = 'flex';
  }

  if (e.target.matches('.delete') && userRole === 'admin') {
    if (confirm('Supprimer cette tâche ?')) {
      console.log(`Deleting task ${id}`);
      fetch('./tasks.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id) })
      })
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          return response.json();
        })
        .then(() => fetchTasks())
        .catch(error => console.error('Error deleting task:', error));
    }
  }

  if (e.target.matches('input[type="checkbox"]')) {
    toggleTaskDone(id, e.target.checked);
  }
};

document.querySelectorAll('.close').forEach(btn => {
  btn.onclick = () => {
    btn.closest('.modal').style.display = 'none';
  };
});

const calcMonthlyBtn = document.getElementById('calcMonthlyBtn');
const monthlyClose = document.getElementById('monthlyClose');
const monthlyForm = document.getElementById('monthlyForm');
const resultDiv = document.getElementById('result');

calcMonthlyBtn.onclick = () => {
  console.log('Opening monthly report modal');
  monthlyForm.reset();
  resultDiv.innerHTML = '';
  monthlyModal.style.display = 'flex';
};

monthlyClose.onclick = () => monthlyModal.style.display = 'none';

window.onclick = e => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === monthlyModal) monthlyModal.style.display = 'none'; // Corrigé
  if (e.target === viewModal) viewModal.style.display = 'none';
};

monthlyForm.onsubmit = e => {
  e.preventDefault();
  const ouvrier = monthlyForm.elements['ouvrier'].value.trim();
  const mois = monthlyForm.elements['mois'].value;

  if (!ouvrier || !mois) return;

  const filteredTasks = tasks.filter(t => {
    return t.ouvrier.toLowerCase() === ouvrier.toLowerCase() && t.date.startsWith(mois);
  });

  if (filteredTasks.length === 0) {
    resultDiv.innerHTML = `<p>Aucune tâche trouvée pour ${ouvrier} au mois ${mois}.</p>`;
    return;
  }

  const totalTaches = filteredTasks.length;
  const termineTaches = filteredTasks.filter(t => t.termine).length;
  const heuresEstimees = filteredTasks.reduce((sum, t) => sum + parseFloat(t.estimee), 0);
  const heuresReelles = filteredTasks.reduce((sum, t) => sum + parseFloat(t.reelle), 0);

  const rendementTaches = totalTaches ? ((termineTaches / totalTaches) * 100).toFixed(2) : 0;
  const efficaciteTemps = heuresReelles ? ((heuresEstimees / heuresReelles) * 100).toFixed(2) : 0;

  resultDiv.innerHTML = `
    <p><strong>Ouvrier :</strong> ${ouvrier}</p>
    <p><strong>Mois :</strong> ${mois}</p>
    <p><strong>Total Tâches :</strong> ${totalTaches}</p>
    <p><strong>Tâches Terminées :</strong> ${termineTaches}</p>
    <p><strong>% Rendement tâches :</strong> ${rendementTaches} %</p>
    <p><strong>% Efficacité temps :</strong> ${efficaciteTemps} %</p>
  `;
};

document.getElementById('workerFilter').onchange = () => refreshTables();

fetchTasks();