// ============================
// Fichiers QCM & QRC
// ============================
const QCM_FILES = [
  'data/gestion_entreprise_qcm.json',
  'data/securite_qcm.json',
  'data/t3p_prevention_discrimination_qcm.json',
  'data/francais_qcm.json',
  'data/anglais_qcm.json',
  'data/developpement_commercial_qcm.json',
  'data/reglementation_qcm.json'
];

const QRC_FILES = [
  'data/gestion_entreprise_qrc.json',
  'data/reglementation_qrc.json',
  'data/t3p_prevention_discrimination_qrc.json',
  'data/developpement_commercial_qrc.json'
];

// ============================
// État global & utilitaires
// ============================
const state = {
  bankQCM: [],
  bankQRC: [],
  currentCat: null,
  questions: [],
  answers: new Map(),
  idx: 0,
  type: 'QCM'
};
const byId = id => document.getElementById(id);
const letterOf = n => 'abcdefghijklmnopqrstuvwxyz'.charAt(n - 1) || '?';
const escapeHtml = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

// ============================
// Normalisation des données
// ============================
function isValidQCM(q) {
  if (!q || typeof q.question !== 'string' || !Array.isArray(q.options)) return false;
  const n = q.options.length;
  const ca = q.correctAnswer;
  if (Array.isArray(ca)) return ca.every(v => Number.isFinite(v) && v >= 1 && v <= n);
  return Number.isFinite(ca) && ca >= 1 && ca <= n;
}
function normalizeQCM(raw) {
  const questions = (raw.questions || [])
    .filter(isValidQCM)
    .map((q, i) => ({
      id: q.id || `Q${i + 1}`,
      text: q.question,
      options: q.options,
      correct: Array.isArray(q.correctAnswer) ? q.correctAnswer.map(Number) : [Number(q.correctAnswer)],
      explanation: q.explanation || '',
      image: q.image || ''
    }));
  return { key: raw.category || 'CAT', name: raw.name || 'Catégorie', questions };
}

function isValidQRC(q) {
  return q && typeof q.question === 'string' && typeof q.answer === 'string';
}
function normalizeQRC(raw) {
  const questions = (raw.questions || [])
    .filter(isValidQRC)
    .map((q, i) => ({
      id: q.id || `Q${i + 1}`,
      text: q.question,
      answer: q.answer,
      points: q.points || 1
    }));
  return { key: raw.category || 'CAT', name: raw.name || 'Catégorie', questions };
}

// ============================
// Chargement des banques
// ============================
async function loadAll() {
  const resQCM = await Promise.allSettled(QCM_FILES.map(f => fetch(f).then(r => r.json())));
  const resQRC = await Promise.allSettled(QRC_FILES.map(f => fetch(f).then(r => r.json())));

  state.bankQCM = resQCM.filter(r => r.status === 'fulfilled').map(r => normalizeQCM(r.value));
  state.bankQRC = resQRC.filter(r => r.status === 'fulfilled').map(r => normalizeQRC(r.value));

  if (state.bankQCM.length) {
    const all = state.bankQCM.flatMap(c => c.questions.map(q => ({ ...q, id: `${c.key}:${q.id}` })));
    state.bankQCM.unshift({ key: 'ALL_QCM', name: 'Tous les sujets QCM', questions: all });
  }
  if (state.bankQRC.length) {
    const all = state.bankQRC.flatMap(c => c.questions.map(q => ({ ...q, id: `${c.key}:${q.id}` })));
    state.bankQRC.unshift({ key: 'ALL_QRC', name: 'Tous les sujets QRC', questions: all });
  }

  renderCategories();
}

// ============================
// Rendu des catégories
// ============================
function renderCategories() {
  const rootQCM = byId('categoriesQCM'); rootQCM.innerHTML = '';
  state.bankQCM.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `<div>📘</div><div>${escapeHtml(cat.name)}</div><span class='badge'>${cat.questions.length}</span>`;
    card.onclick = () => startExam(cat, 'QCM');
    rootQCM.appendChild(card);
  });

  const rootQRC = byId('categoriesQRC'); rootQRC.innerHTML = '';
  state.bankQRC.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `<div>📝</div><div>${escapeHtml(cat.name)}</div><span class='badge'>${cat.questions.length}</span>`;
    card.onclick = () => startExam(cat, 'QRC');
    rootQRC.appendChild(card);
  });
}

// ============================
// Examen
// ============================
function startExam(cat, type) {
  state.type = type;
  state.currentCat = cat;
  state.questions = cat.questions;
  state.idx = 0;
  state.answers = new Map();

  byId('categoriesQCM').classList.add('hidden');
  byId('categoriesQRC').classList.add('hidden');
  byId('exam').classList.remove('hidden');
  byId('results').classList.add('hidden');

  renderQuestion();
}

function renderQuestion() {
  const i = state.idx;
  const q = state.questions[i];

  byId('qNumber').textContent = `Question ${i + 1}/${state.questions.length}`;
  byId('qText').textContent = q.text;

  // afficher image si disponible
  const imgContainer = document.getElementById('qImage');
  if (q.image && q.image.trim() !== '') {
    imgContainer.innerHTML = `<img src="${q.image}" alt="Illustration" style="max-width:100%;margin:10px 0;border-radius:8px;">`;
  } else {
    imgContainer.innerHTML = '';
  }

  const root = byId('qOptions');
  root.innerHTML = '';
  byId('qrcInput').classList.add('hidden');

  if (state.type === 'QCM') {
    q.options.forEach((opt, idx) => {
      const div = document.createElement('div');
      div.className = 'option';
      div.textContent = `${String.fromCharCode(97 + idx)}) ${opt}`;
      div.onclick = () => toggleOption(idx + 1);

      const ans = state.answers.get(i);
      if (ans?.choices?.includes(idx + 1)) div.classList.add('selected');

      root.appendChild(div);
    });
  } else {
    byId('qrcInput').classList.remove('hidden');
    const prev = state.answers.get(i);
    byId('qrcAnswer').value = prev?.text || '';
  }

  byId('prevBtn').disabled = (i === 0);
}


function toggleOption(choice) {
  const i = state.idx;
  let ans = state.answers.get(i) || { choices: [] };

  if (ans.choices.includes(choice)) {
    ans.choices = ans.choices.filter(c => c !== choice);
  } else {
    ans.choices.push(choice);
  }

  state.answers.set(i, ans);
  renderQuestion();
}

function checkAnswer() {
  const i = state.idx;
  const q = state.questions[i];

  if (state.type === 'QCM') {
    const ans = state.answers.get(i) || { choices: [] };
    const root = byId('qOptions');
    const correctSet = new Set(q.correct);

    [...root.children].forEach((n, idx) => {
      const optIdx = idx + 1;
      if (correctSet.has(optIdx)) n.classList.add('correct');
      if (ans.choices.includes(optIdx) && !correctSet.has(optIdx)) n.classList.add('incorrect');
    });

    ans.correct =
      ans.choices.length > 0 &&
      ans.choices.every(c => correctSet.has(c)) &&
      ans.choices.length === correctSet.size;

    state.answers.set(i, ans);
  } else {
    const text = byId('qrcAnswer').value.trim();
    state.answers.set(i, { text, correct: null }); // pas de correction auto pour QRC
    alert(`Réponse attendue : ${q.answer}`);
  }
}

function nextQ() {
  if (state.idx < state.questions.length - 1) {
    state.idx++;
    renderQuestion();
  }
}
function prevQ() {
  if (state.idx > 0) {
    state.idx--;
    renderQuestion();
  }
}

// ============================
// Résultats + Récapitulatif
// ============================
// function finishExam() {
//   let score = 0;
//   let total = 0;

//   // Agrégation score
//   state.questions.forEach((q, i) => {
//     if (state.type === 'QCM') {
//       total += 1;
//       if (state.answers.get(i)?.correct) score += 1;
//     } else {
//       total += q.points; // QRC: barème comptabilisé (consultatif)
//     }
//   });

//   // Affichage résultats
//   byId('exam').classList.add('hidden');
//   byId('results').classList.remove('hidden');

//   const pct = Math.round((score / Math.max(1,total)) * 100);
//   const circle = byId('scoreCircle');
//   circle.textContent = `${pct}%`;
//   circle.className = 'score-circle ' + (pct >= 80 ? 'score-excellent' : pct >= 50 ? 'score-good' : 'score-poor');

//   byId('score').textContent = `${score} / ${total}`;

//   // Rendu du récapitulatif détaillé
//   renderReview();
// }

function finishExam() {
  let score = 0;
  let total = 0;
  let answered = 0;

  state.questions.forEach((q, i) => {
    if (state.type === 'QCM') {
      total++;
      const ans = state.answers.get(i);

      if (ans) {
        answered++;
        // Vérifier la correction même si "Vérifier" n'a pas été cliqué
        const correctSet = new Set(q.correct);
        ans.correct =
          ans.choices.length > 0 &&
          ans.choices.every(c => correctSet.has(c)) &&
          ans.choices.length === correctSet.size;
        if (ans.correct) score++;
      }
    } else {
      total += q.points;
      const ans = state.answers.get(i);
      if (ans && ans.text?.trim()) answered++;
    }
  });

  const pct = Math.round((score / Math.max(1, total)) * 100);
  const progress = Math.round((answered / Math.max(1, total)) * 100);

  byId('exam').classList.add('hidden');
  byId('results').classList.remove('hidden');

  const circle = byId('scoreCircle');
  circle.textContent = `${pct}%`;
  circle.className =
    'score-circle ' +
    (pct >= 80 ? 'score-excellent' : pct >= 50 ? 'score-good' : 'score-poor');

  byId('score').textContent = `${score} / ${total} (Avancement : ${progress}%)`;

  renderReview();
}


function renderReview() {
  const review = byId('review');
  review.innerHTML = '';

  state.questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.className = 'review-item';

    let html = `<p><strong>${i + 1}. ${escapeHtml(q.text)}</strong></p>`;

    // ✅ afficher l'image si présente
    if (q.image && q.image.trim() !== '') {
      html += `<div class="review-image"><img src="${q.image}" alt="Illustration"></div>`;
    }

    if (state.type === 'QCM') {
      const ans = state.answers.get(i);
      let user, statusClass;

      if (!ans || ans.choices.length === 0) {
        user = '—';
        statusClass = 'unanswered';
      } else {
        user = ans.choices
          .sort((a, b) => a - b)
          .map(c => `${letterOf(c)}) ${q.options[c - 1]}`)
          .join(', ');
        statusClass = ans.correct ? 'correct' : 'incorrect';
      }

      const good = q.correct
        .slice()
        .sort((a, b) => a - b)
        .map(c => `${letterOf(c)}) ${q.options[c - 1]}`)
        .join(', ');

      html += `
        <p class="${statusClass}">Votre réponse : ${escapeHtml(user)}</p>
        <p>Bonne réponse : <span class="ok">${escapeHtml(good)}</span></p>
        ${q.explanation ? `<p style="color:#475569">💡 ${escapeHtml(q.explanation)}</p>` : ''}
      `;
    } else {
      const ans = state.answers.get(i);
      const given = ans?.text?.trim() || '—';
      const statusClass = given === '—' ? 'unanswered' : 'neutral';

      html += `
        <p class="${statusClass}">Votre réponse : ${escapeHtml(given)}</p>
        <p>Réponse attendue : <span class="ok">${escapeHtml(q.answer)}</span> ${q.points ? `(<strong>${q.points} pt${q.points>1?'s':''}</strong>)` : ''}</p>
      `;
    }

    div.innerHTML = html;
    review.appendChild(div);
  });
}


// ============================
// Boutons / évènements
// ============================
byId('checkBtn').onclick   = checkAnswer;
byId('nextBtn').onclick    = nextQ;
byId('prevBtn').onclick    = prevQ;
byId('finishBtn').onclick  = finishExam;
byId('replayBtn').onclick  = () => state.currentCat && startExam(state.currentCat, state.type);
byId('homeBtn').onclick    = goHome;
document.getElementById('homeFloating').onclick = goHome;

function goHome() {
  byId('exam').classList.add('hidden');
  byId('results').classList.add('hidden');
  byId('categoriesQCM').classList.remove('hidden');
  byId('categoriesQRC').classList.remove('hidden');
}

// Lancement
loadAll();
