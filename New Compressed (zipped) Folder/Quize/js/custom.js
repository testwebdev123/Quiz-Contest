    // ======= Quiz Data (Bangladesh General Knowledge) =======
    // Each player will answer 5 questions.
    const BASE_QUESTIONS = [
      {
        q: "What is the capital of Bangladesh?",
        options: ["Chattogram", "Khulna", "Dhaka", "Sylhet"],
        answer: 2
      },
      {
        q: "Bangladesh's Independence Day is celebrated on which date?",
        options: ["16 December", "26 March", "21 February", "1 Baishakh"],
        answer: 1
      },
      {
        q: "What is the national flower (Shapla) of Bangladesh?",
        options: ["Water Lily", "Lotus", "Rose", "Marigold"],
        answer: 0
      },
      {
        q: "Cox's Bazar is famous for being the world's longest natural what?",
        options: ["River", "Sea beach", "Bridge", "Waterfall"],
        answer: 1
      },
      {
        q: "What is the currency of Bangladesh?",
        options: ["Rupee", "Rial", "Taka", "Dinar"],
        answer: 2
      }
    ];

    // ======= State =======
    const state = {
      players: [], // {name, score, timeSec}
      currentPlayer: 0,
      currentQ: 0,
      selections: Array(5).fill(null),
      questions: [...BASE_QUESTIONS],
      startTime: null,
      timerInterval: null
    };

    // ======= DOM =======
    const $ = (sel) => document.querySelector(sel);
    const setupScreen = $('#setupScreen');
    const quizScreen = $('#quizScreen');
    const playerResultScreen = $('#playerResultScreen');
    const leaderboardScreen = $('#leaderboardScreen');

    const p1 = $('#p1'), p2 = $('#p2'), p3 = $('#p3');
    const startBtn = $('#startBtn');
    const demoBtn = $('#demoBtn');
    const modeSel = $('#mode');

    const timerBadge = $('#timerBadge');
    const playerTag = $('#playerTag');
    const qProgress = $('#qProgress');
    const progressBar = $('#progressBar');
    const questionText = $('#questionText');
    const optionsWrap = $('#options');
    const prevBtn = $('#prevBtn');
    const nextBtn = $('#nextBtn');
    const submitBtn = $('#submitBtn');

    const roundTime = $('#roundTime');
    const roundSummary = $('#roundSummary');
    const nextPlayerBtn = $('#nextPlayerBtn');
    const leaderboard = $('#leaderboard');
    const playAgainBtn = $('#playAgainBtn');

    // ======= Utilities =======
    function formatTime(sec){
      const m = Math.floor(sec/60).toString().padStart(2,'0');
      const s = Math.floor(sec%60).toString().padStart(2,'0');
      return `${m}:${s}`;
    }
    function shuffle(arr){
      const a = [...arr];
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]] = [a[j],a[i]];
      }
      return a;
    }

    function startTimer(){
      state.startTime = performance.now();
      clearInterval(state.timerInterval);
      state.timerInterval = setInterval(()=>{
        const elapsed = (performance.now() - state.startTime)/1000;
        timerBadge.textContent = formatTime(elapsed);
      }, 200);
    }

    function stopTimer(){
      clearInterval(state.timerInterval);
      const elapsed = (performance.now() - state.startTime)/1000;
      return elapsed;
    }

    function guardNames(){
      const names = [p1.value, p2.value, p3.value].map(v=>v.trim());
      const unique = new Set(names.filter(Boolean));
      if(unique.size !== 3){
        alert('Please enter three UNIQUE player names (no blanks).');
        return null;
      }
      return names;
    }

    function resetForPlayer(){
      state.currentQ = 0;
      state.selections = Array(5).fill(null);
      state.questions = modeSel.value === 'shuffle' ? shuffle(BASE_QUESTIONS) : [...BASE_QUESTIONS];
      renderQuestion();
      startTimer();
    }

    function renderQuestion(){
      const total = state.questions.length;
      const q = state.questions[state.currentQ];
      playerTag.textContent = `Player: ${state.players[state.currentPlayer].name}`;
      qProgress.textContent = `Question ${state.currentQ+1}/${total}`;
      progressBar.style.width = `${((state.currentQ)/total)*100}%`;
      questionText.textContent = q.q;

      optionsWrap.innerHTML = '';
      q.options.forEach((opt, idx)=>{
        const id = `opt-${idx}`;
        const option = document.createElement('label');
        option.className = 'option';
        option.innerHTML = `
          <input type="radio" name="opt" value="${idx}"> <span>${opt}</span>
        `;
        const input = option.querySelector('input');
        const saved = state.selections[state.currentQ];
        input.checked = saved === idx;
        input.addEventListener('change', ()=>{
          state.selections[state.currentQ] = idx;
          updateNavButtons();
        });
        optionsWrap.appendChild(option);
      });
      updateNavButtons();
    }

    function updateNavButtons(){
      prevBtn.disabled = state.currentQ === 0;
      const onLast = state.currentQ === state.questions.length - 1;
      submitBtn.classList.toggle('hidden', !onLast);
      nextBtn.classList.toggle('hidden', onLast);
    }

    function scoreSelections(){
      let score = 0;
      state.selections.forEach((pick, i)=>{
        if(pick === state.questions[i].answer) score++;
      });
      return score;
    }

    // ======= Event Listeners =======
    demoBtn.addEventListener('click', ()=>{
      p1.value = 'Ayesha';
      p2.value = 'Rahim';
      p3.value = 'Nadia';
    });

    startBtn.addEventListener('click', ()=>{
      const names = guardNames();
      if(!names) return;
      state.players = names.map(n=>({name:n, score:0, timeSec:0}));
      state.currentPlayer = 0;
      setupScreen.classList.add('hidden');
      quizScreen.classList.remove('hidden');
      resetForPlayer();
    });

    prevBtn.addEventListener('click', ()=>{
      if(state.currentQ>0){
        state.currentQ--; renderQuestion();
      }
    });

    nextBtn.addEventListener('click', ()=>{
      if(state.currentQ < state.questions.length - 1){
        if(state.selections[state.currentQ] == null){
          alert('Please select an option before continuing.');
          return;
        }
        state.currentQ++; renderQuestion();
      }
    });

    submitBtn.addEventListener('click', ()=>{
      if(state.selections.includes(null)){
        if(!confirm('Some questions are unanswered. Submit anyway?')) return;
      }
      const time = stopTimer();
      const score = scoreSelections();
      state.players[state.currentPlayer].score = score;
      state.players[state.currentPlayer].timeSec = time;

      quizScreen.classList.add('hidden');
      playerResultScreen.classList.remove('hidden');
      roundTime.textContent = `Time: ${formatTime(time)}`;
      roundSummary.textContent = `${state.players[state.currentPlayer].name} scored ${score}/5`;
      progressBar.style.width = '100%';
    });

    nextPlayerBtn.addEventListener('click', ()=>{
      playerResultScreen.classList.add('hidden');
      state.currentPlayer++;
      if(state.currentPlayer < state.players.length){
        quizScreen.classList.remove('hidden');
        resetForPlayer();
      } else {
        // Show leaderboard
        buildLeaderboard();
        leaderboardScreen.classList.remove('hidden');
      }
    });

    playAgainBtn.addEventListener('click', ()=>{
      // Reset app
      setupScreen.classList.remove('hidden');
      leaderboardScreen.classList.add('hidden');
      p1.value = p2.value = p3.value = '';
      timerBadge.textContent = '00:00';
      state.players = [];
      state.currentPlayer = 0;
      state.currentQ = 0;
      state.selections = Array(5).fill(null);
    });

    function buildLeaderboard(){
      // Sort by score desc, then time asc
      const sorted = [...state.players].sort((a,b)=>{
        if(b.score !== a.score) return b.score - a.score;
        return a.timeSec - b.timeSec;
      });

      leaderboard.innerHTML = '';
      sorted.slice(0,3).forEach((p, idx)=>{
        const row = document.createElement('div');
        row.className = 'leader';
        const rank = document.createElement('div');
        rank.className = 'rank ' + (idx===0?'medal-1': idx===1?'medal-2':'medal-3');
        rank.textContent = idx+1;
        const name = document.createElement('div'); name.textContent = p.name;
        const score = document.createElement('div'); score.innerHTML = `<span class="pill">Score: ${p.score}/5</span>`;
        const time = document.createElement('div'); time.innerHTML = `<span class="pill">${formatTime(p.timeSec)}</span>`;
        row.append(rank, name, score, time);
        leaderboard.appendChild(row);
      });

      // If more than 3 players existed, we'd still show only top 3.
    }

    // Keyboard accessibility: Enter advances, arrows navigate
    document.addEventListener('keydown', (e)=>{
      if(quizScreen.classList.contains('hidden')) return;
      if(e.key === 'ArrowRight'){ nextBtn.click(); }
      if(e.key === 'ArrowLeft'){ prevBtn.click(); }
      if(e.key === 'Enter'){
        if(!submitBtn.classList.contains('hidden')) submitBtn.click();
        else nextBtn.click();
      }
    });