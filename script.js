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

const EXAMS = [
  {
    code: "A",
    name: "Réglementation du T3P et prévention des discriminations",
    qcm: 10,
    qrc: 5,
    duration: 45, // minutes
    coef: 3,
    eliminatoire: 6,
    sourceQCM: "data/reglementation_qcm.json",
    // sourceQRC: "data/t3p_prevention_discrimination_qrc.json"
  },
  {
    code: "B",
    name: "Gestion",
    qcm: 16,
    qrc: 2,
    duration: 45,
    coef: 2,
    eliminatoire: 6,
    sourceQCM: "data/gestion_entreprise_qcm.json",
    // sourceQRC: "data/gestion_entreprise_qrc.json"
  },
  {
    code: "C",
    name: "Sécurité routière",
    qcm: 20,
    qrc: 0,
    duration: 30,
    coef: 3,
    eliminatoire: 6,
    sourceQCM: "data/securite_qcm.json"
  },
  {
    code: "D",
    name: "Français",
    qcm: 7,
    qrc: 3,
    duration: 30,
    coef: 2,
    eliminatoire: 6,
    sourceQCM: "data/francais_qcm.json",
    // sourceQRC: "data/francais_qrc.json"
  },
  {
    code: "E",
    name: "Anglais",
    qcm: 20,
    qrc: 0,
    duration: 30,
    coef: 1,
    eliminatoire: 4,
    sourceQCM: "data/anglais_qcm.json"
  }
  // tu pourras rajouter les épreuves spécifiques Taxis et VTC ici
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
  renderExams();
}

// ============================
// Rendu des catégories
// ============================
function renderCategories() {
  const rootQCM = byId('categoriesQCM'); 
  rootQCM.innerHTML = '';

  state.bankQCM.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `<div>📘</div><div>${escapeHtml(cat.name)}</div><span class='badge'>${cat.questions.length}</span>`;
    card.onclick = () => showSeries(cat);   // 👈 au lieu de startExam
    rootQCM.appendChild(card);
  });

  const rootQRC = byId('categoriesQRC'); 
  rootQRC.innerHTML = '';
  state.bankQRC.forEach(cat => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div>📝</div>
      <div>${escapeHtml(cat.name)}</div>
      <span class='badge'>${cat.questions.length}</span>`;
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

  // Masquer accueil complet
  byId('categoriesQCM').classList.add('hidden');
  byId('titleQCM').classList.add('hidden');
  byId('categoriesQRC').classList.add('hidden');
  byId('titleQRC').classList.add('hidden');
  byId('examens').classList.add('hidden');
  byId('titleExams').classList.add('hidden');

  // Afficher l’examen
  byId('exam').classList.remove('hidden');
  byId('results').classList.add('hidden');

  renderQuestion();

    // 👇 Auto-scroll vers la div #exam
  setTimeout(() => {
    document.getElementById('exam').scrollIntoView({ behavior: 'smooth' });
  }, 100);
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

function renderExams() {
  const root = byId('examens');
  root.innerHTML = '';

  EXAMS.forEach(ex => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div>📝</div>
      <div><strong>${escapeHtml(ex.code)}</strong> – ${escapeHtml(ex.name)}</div>
       #<span class="badge">${ex.qcm} QCM ${ex.qrc ? "+ " + ex.qrc + " QRC" : ""}</span>
      <span class="badge">${ex.qcm} QCM</span>
      <div>Durée : ${ex.duration} min</div>
      <div>Coef : ${ex.coef} | Éliminatoire : ${ex.eliminatoire}/20</div>
    `;
    card.onclick = () => startExamMode(ex);
    root.appendChild(card);
  });
}


async function startExamMode(ex) {
  // Masquer accueil complet
  byId('categoriesQCM').classList.add('hidden');
  byId('titleQCM').classList.add('hidden');
  byId('categoriesQRC').classList.add('hidden');
  byId('titleQRC').classList.add('hidden');
  byId('examens').classList.add('hidden');
  byId('titleExams').classList.add('hidden');

  // Cacher les sections accueil
  byId('categoriesQCM').classList.add('hidden');
  byId('categoriesQRC').classList.add('hidden');
  byId('examens').classList.add('hidden');

  // Charger les questions QCM demandées
  let qcmQuestions = [];
  if (ex.sourceQCM) {
    const dataQCM = await fetch(ex.sourceQCM).then(r => r.json());
    const norm = normalizeQCM(dataQCM);
    qcmQuestions = norm.questions.slice(0, ex.qcm); // pour l’instant : on prend les premiers
  }

  // // Charger les questions QRC demandées
  // let qrcQuestions = [];
  // if (ex.sourceQRC) {
  //   const dataQRC = await fetch(ex.sourceQRC).then(r => r.json());
  //   const norm = normalizeQRC(dataQRC);
  //   qrcQuestions = norm.questions.slice(0, ex.qrc);
  // }

  // Fusionner QCM et QRC pour constituer l’examen
  const questions = [...qcmQuestions,];

  // Lancer l’examen avec ces questions
  state.type = "QCM"; //MIXED
  state.currentCat = ex;
  state.questions = questions;
  state.idx = 0;
  state.answers = new Map();

  byId('exam').classList.remove('hidden');
  byId('results').classList.add('hidden');

  renderQuestion();

    // 👇 Auto-scroll vers la div #exam
  setTimeout(() => {
    document.getElementById('exam').scrollIntoView({ behavior: 'smooth' });
  }, 100);
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

function splitIntoSeries(cat, size = 15) {
  const series = [];
  for (let i = 0; i < cat.questions.length; i += size) {
    series.push({
      key: `${cat.key}_S${Math.floor(i / size) + 1}`,
      name: `Série ${Math.floor(i / size) + 1}`,
      questions: cat.questions.slice(i, i + size)
    });
  }
  return series;
}

function showSeries(cat) {
  // Masquer QCM/QRC/Examens + titres
  byId('categoriesQCM').classList.add('hidden');
  byId('titleQCM').classList.add('hidden');
  byId('categoriesQRC').classList.add('hidden');
  byId('titleQRC').classList.add('hidden');
  byId('examens').classList.add('hidden');
  byId('titleExams').classList.add('hidden');

  // Afficher les séries
  const root = byId('seriesQCM');
  root.innerHTML = '';
  const series = splitIntoSeries(cat, 15);

  series.forEach((serie, idx) => {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div>📑</div>
      <div>${escapeHtml(cat.name)} – ${serie.name}</div>
      <span class="badge">${serie.questions.length}</span>`;
    card.onclick = () => startExam(serie, 'QCM');
    root.appendChild(card);
  });
  root.classList.remove('hidden');
}


function goHome() {
  byId('exam').classList.add('hidden');
  byId('results').classList.add('hidden');
  byId('seriesQCM')?.classList.add('hidden');

  // Réafficher tout
  byId('categoriesQCM').classList.remove('hidden');
  byId('titleQCM').classList.remove('hidden');
  byId('categoriesQRC').classList.remove('hidden');
  byId('titleQRC').classList.remove('hidden');
  byId('examens').classList.remove('hidden');
  byId('titleExams').classList.remove('hidden');

  state.currentCat = null;
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


// Lancement
loadAll();
