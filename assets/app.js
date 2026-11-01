/* =========================================================
   STATE
   ========================================================= */
const state = {
  view: 'loading',
  quizzes: [],
  quiz: null,
  current: 0,
  answers: [],
  error: null
};

const app = document.getElementById('app');
const esc = s => String(s).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));

/* =========================================================
   BOOT — tải manifest + tất cả quiz
   ========================================================= */
boot();

async function boot() {
  renderLoading();
  try {
    const files = await fetch('data/manifest.json', { cache: 'no-store' })
      .then(r => {
        if (!r.ok) throw new Error(`manifest.json: HTTP ${r.status}`);
        return r.json();
      });

    if (!Array.isArray(files)) {
      throw new Error('manifest.json phải là mảng tên file (VD: ["bai-1.json"])');
    }

    state.quizzes = await Promise.all(files.map(async (name) => {
      const slug = name.replace(/\.json$/i, '');
      const quiz = await fetch(`data/quizzes/${name}`, { cache: 'no-store' })
        .then(r => {
          if (!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
          return r.json();
        });
      validateQuiz(quiz, name);
      return { ...quiz, slug };
    }));

    route();
  } catch (e) {
    console.error(e);
    state.view = 'error';
    state.error = e.message || String(e);
    renderError();
  }
}

/* =========================================================
   VALIDATE — báo lỗi rõ file / câu nào
   ========================================================= */
function validateQuiz(quiz, filename) {
  if (!quiz || typeof quiz !== 'object')
    throw new Error(`${filename}: nội dung không phải object JSON`);
  if (!quiz.title)
    throw new Error(`${filename}: thiếu "title"`);
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0)
    throw new Error(`${filename}: "questions" rỗng hoặc không phải mảng`);

  quiz.questions.forEach((q, i) => {
    const pos = `${filename} — câu ${i + 1}`;
    if (!q.q) throw new Error(`${pos}: thiếu "q"`);
    if (!Array.isArray(q.options) || q.options.length < 2)
      throw new Error(`${pos}: cần ít nhất 2 "options"`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length)
      throw new Error(`${pos}: "answer" phải là 0..${q.options.length - 1}`);
  });
}

/* =========================================================
   ROUTER — dùng hash để chia sẻ link được
   #/              → trang chủ
   #/quiz/<slug>   → làm bài
   ========================================================= */
window.addEventListener('hashchange', route);

function route() {
  if (state.view === 'error') return;

  const hash = location.hash.replace(/^#\/?/, '');

  if (hash.startsWith('quiz/')) {
    const slug = decodeURIComponent(hash.slice(5));
    const quiz = state.quizzes.find(q => q.slug === slug);
    if (quiz) { startQuiz(quiz); return; }
  }

  // mặc định: trang chủ
  state.view = 'home';
  state.quiz = null;
  state.answers = [];
  state.current = 0;
  renderHome();
}

/* =========================================================
   VIEWS
   ========================================================= */
function renderLoading() {
  app.innerHTML = `<div class="center-state">Đang tải…</div>`;
}

function renderError() {
  app.innerHTML = `
    <div class="center-state">
      <div class="error-title">Không tải được dữ liệu</div>
      <div class="error-msg">${esc(state.error)}</div>
      <button class="btn-secondary" type="button" onclick="location.reload()">Thử lại</button>
    </div>
  `;
}

function renderHome() {
  if (!state.quizzes.length) {
    app.innerHTML = `
      <div class="center-state">
        Chưa có bài nào.<br>
        Thêm tên file vào <code>data/manifest.json</code> để bắt đầu.
      </div>`;
    return;
  }

  app.innerHTML = `
    <h1 class="title">Trắc nghiệm</h1>
    <p class="subtitle">Chọn một bài để bắt đầu</p>
    <div class="quiz-list">
      ${state.quizzes.map(q => `
        <a class="quiz-card" href="#/quiz/${esc(q.slug)}">
          <div class="quiz-card-body">
            <div class="quiz-card-title">${esc(q.title)}</div>
            <div class="quiz-card-desc">${esc(q.description || '')}</div>
          </div>
          <div class="quiz-card-meta">${q.questions.length} câu</div>
        </a>
      `).join('')}
    </div>
  `;
}

/* ---------- Làm bài ---------- */
function startQuiz(quiz) {
  state.view = 'quiz';
  state.quiz = quiz;
  state.current = 0;
  state.answers = new Array(quiz.questions.length).fill(null);
  renderQuiz();
  window.scrollTo({ top: 0 });
}

function renderQuiz() {
  const q = state.quiz.questions[state.current];
  const total = state.quiz.questions.length;
  const answered = state.answers[state.current];
  const progress = ((state.current + (answered !== null ? 1 : 0)) / total) * 100;

  app.innerHTML = `
    <div class="quiz-header">
      <button class="btn-back" id="back-btn" type="button">← Thoát</button>
      <div class="progress-text">Câu ${state.current + 1} / ${total}</div>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
    <div class="question">${esc(q.q)}</div>
    <div class="options" id="options">
      ${q.options.map((opt, i) => optionHTML(opt, i, q.answer, answered)).join('')}
    </div>
    <div id="feedback">
      ${answered !== null && q.explain ? `<div class="explain">💡 ${esc(q.explain)}</div>` : ''}
    </div>
    <div id="nav">
      ${answered !== null ? `<button class="btn-primary" id="next-btn" type="button">${
        state.current < total - 1 ? 'Câu tiếp →' : 'Xem kết quả'
      }</button>` : ''}
    </div>
  `;

  app.querySelectorAll('.option:not([disabled])').forEach(btn =>
    btn.addEventListener('click', () => selectAnswer(+btn.dataset.i)));

  document.getElementById('back-btn').addEventListener('click', handleExit);

  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) nextBtn.addEventListener('click', nextQuestion);
}

function optionHTML(opt, i, correctIdx, answeredIdx) {
  let cls = 'option';
  if (answeredIdx !== null) {
    if (i === correctIdx) cls += ' correct';
    else if (i === answeredIdx) cls += ' wrong';
    else cls += ' disabled';
  }
  return `<button class="${cls}" data-i="${i}" type="button" ${answeredIdx !== null ? 'disabled' : ''}>
    <span class="opt-label">${String.fromCharCode(65 + i)}</span>
    <span class="opt-text">${esc(opt)}</span>
  </button>`;
}

function selectAnswer(i) {
  if (state.answers[state.current] !== null) return;
  state.answers[state.current] = i;

  const q = state.quiz.questions[state.current];
  const total = state.quiz.questions.length;

  // Cập nhật DOM tại chỗ, không re-render → không nháy
  document.querySelectorAll('.option').forEach((btn, idx) => {
    btn.disabled = true;
    btn.classList.remove('correct', 'wrong', 'disabled');
    if (idx === q.answer) btn.classList.add('correct');
    else if (idx === i) btn.classList.add('wrong');
    else btn.classList.add('disabled');
  });

  document.querySelector('.progress-fill').style.width =
    ((state.current + 1) / total) * 100 + '%';

  if (q.explain) {
    document.getElementById('feedback').innerHTML =
      `<div class="explain">💡 ${esc(q.explain)}</div>`;
  }

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn-primary';
  nextBtn.id = 'next-btn';
  nextBtn.type = 'button';
  nextBtn.textContent = state.current < total - 1 ? 'Câu tiếp →' : 'Xem kết quả';
  nextBtn.addEventListener('click', nextQuestion);
  document.getElementById('nav').appendChild(nextBtn);
}

function nextQuestion() {
  if (state.current < state.quiz.questions.length - 1) {
    state.current++;
    renderQuiz();
    window.scrollTo({ top: 0 });
  } else {
    state.view = 'result';
    renderResult();
    window.scrollTo({ top: 0 });
  }
}

function handleExit() {
  if (state.answers.some(a => a !== null) &&
      !confirm('Thoát bài? Kết quả sẽ không được lưu.')) return;
  location.hash = '';
}

/* ---------- Kết quả ---------- */
function renderResult() {
  const total = state.quiz.questions.length;
  let correct = 0;
  state.quiz.questions.forEach((q, i) => {
    if (state.answers[i] === q.answer) correct++;
  });
  const pct = Math.round((correct / total) * 100);

  app.innerHTML = `
    <div class="result">
      <div class="result-score">${correct}/${total}</div>
      <div class="result-pct">${pct}% chính xác</div>
      <div class="result-bar"><div class="result-fill" style="width:${pct}%"></div></div>
    </div>
    <h2 class="section-title">Xem lại</h2>
    <div class="review-list">
      ${state.quiz.questions.map((q, i) => {
        const ok = state.answers[i] === q.answer;
        const picked = state.answers[i];
        return `<div class="review-item ${ok ? 'ok' : 'bad'}">
          <div class="review-q">
            <span class="review-badge">${ok ? '✓' : '✗'}</span>
            <span>Câu ${i + 1}: ${esc(q.q)}</span>
          </div>
          <div class="review-ans">
            Đáp án đúng: <strong>${esc(q.options[q.answer])}</strong>
            ${!ok && picked !== null ? `<br>Bạn chọn: ${esc(q.options[picked])}` : ''}
            ${!ok && picked === null ? '<br>Chưa trả lời' : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="actions">
      <button class="btn-primary" id="retry-btn" type="button">Làm lại</button>
      <button class="btn-secondary" id="home-btn" type="button">Về trang chủ</button>
    </div>
  `;

  document.getElementById('retry-btn').addEventListener('click', () => {
    state.current = 0;
    state.answers = new Array(state.quiz.questions.length).fill(null);
    state.view = 'quiz';
    renderQuiz();
    window.scrollTo({ top: 0 });
  });

  document.getElementById('home-btn').addEventListener('click', () => {
    location.hash = '';
  });
}