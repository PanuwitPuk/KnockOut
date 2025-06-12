// ==== GAME LOGIC ====
const prizeLevels = [0, 10, 20, 35, 70, 100, 600];
const players = [
    { name: "Phoenix", alive: true, race: "phoenix" },
    { name: "Unicorn", alive: true, race: "unicorn" },
    { name: "Dragon", alive: true, race: "dragon" },
    { name: "Centaur", alive: true, race: "centaur" },
    { name: "Werewolf", alive: true, race: "werewolf" },
    { name: "Pixie", alive: true, race: "pixie" },
    { name: "Hippogriff", alive: true, race: "hippogriff" },
    { name: "Basilisk", alive: true, race: "basilisk" },
];

let prizePot = 0;
let currentChain = 0;
let round = 1;
let eliminationLog = [];

const playersContainer = document.getElementById('players');
const statusDiv = document.getElementById('status');
const btnCorrect = document.getElementById('btnCorrect');
const btnIncorrect = document.getElementById('btnIncorrect');
const btnBank = document.getElementById('btnBank');

function renderPlayers() {
    playersContainer.innerHTML = '';
    const alivePlayers = [];

    players.forEach((p, index) => {
        const div = document.createElement('div');

        div.classList.add('card', 'player-card', `${p.race}-card`);

        if (p.alive) {
            div.classList.add('alive');
            alivePlayers.push(p);
        } else {
            div.classList.add('eliminated', 'eliminate');
        }

        div.textContent = p.name;
        div.title = p.alive ? 'Alive' : 'Eliminated';
        div.addEventListener('click', () => eliminatePlayer(index));
        playersContainer.appendChild(div);
    });

    if (alivePlayers.length === 2) {
        showFinalTwoModal(alivePlayers);
    }
}

function showFinalTwoModal(alivePlayers, finalScore = prizePot) {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");

    const modalPlayer1 = document.getElementById("modalPlayer1");
    const modalPlayer2 = document.getElementById("modalPlayer2");

    [modalPlayer1, modalPlayer2].forEach(div => {
        div.className = '';
        div.classList.add('player-card');
    });
    const scoreHeading = document.getElementById('finalscore');
    scoreHeading.textContent = `Final Score: ${finalScore}`;

    modalPlayer1.classList.add('card', 'player-card', `${alivePlayers[0].race}-card`, 'alive');
    modalPlayer1.textContent = alivePlayers[0].name;

    modalPlayer1.addEventListener('click', () => {
        const index = players.findIndex(p => p.name === alivePlayers[0].name);
        eliminatePlayer(index);
    });

    modalPlayer2.addEventListener('click', () => {
        const index = players.findIndex(p => p.name === alivePlayers[1].name);
        eliminatePlayer(index);
    });

    modalPlayer2.classList.add('card', 'player-card', `${alivePlayers[1].race}-card`, 'alive');
    modalPlayer2.textContent = alivePlayers[1].name;

    modalPlayer1.classList.remove('hidden');
    modalPlayer2.classList.remove('hidden');
}

function eliminatePlayer(index) {
    players[index].alive = !players[index].alive;

    if (!players[index].alive) {
        if (!eliminationLog.some(log => log.index === index)) {
            eliminationLog.push({
                index: index,
                name: players[index].name,
                race: players[index].race,
                time: new Date()
            });
        }
    } else {
        eliminationLog = eliminationLog.filter(log => log.index !== index);
    }

    renderPlayers();

    const status = players[index].alive ? 'revived' : 'eliminated';
    showAction(`${players[index].name} ${status}`);

    const alivePlayers = players.filter(p => p.alive);
    if (alivePlayers.length === 1) {
        endGame();
    }
}

document.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (key >= 1 && key <= players.length) {
        eliminatePlayer(key - 1);
    }
});

function assignScores() {
    const finalScore = prizePot;

    const alivePlayers = players.filter(p => p.alive);
    const eliminatedPlayers = eliminationLog.map(log => players[log.index]);

    const ranking = [...alivePlayers.reverse(), ...eliminatedPlayers.reverse()];

    ranking.forEach((player, i) => {
        let score = 0;
        if (i === 0) score = finalScore * 0.5;
        else if (i === 1) score = finalScore * 0.25;
        else if (i === 2 || i === 3) score = finalScore * 0.1;
        else if (i === 4) score = finalScore * 0.05;
        else score = 0;

        player.score = Math.floor(score);
    });

    return ranking;
}

function renderLeaderboard() {
    const playersContainer = document.getElementById('players-leaderboard');
    playersContainer.innerHTML = '';

    const ranking = assignScores();

    ranking.forEach((p, i) => {
        const row = document.createElement('div');
        row.classList.add('leaderboard-row');

        const rankDiv = document.createElement('div');
        rankDiv.classList.add('rank');
        rankDiv.textContent = `#${i + 1}`;

        const cardDiv = document.createElement('div');
        cardDiv.classList.add('leaderboard-card', 'player-card', 'leaderboard-card', `${p.race}-card`);
        cardDiv.textContent = p.name;

        const scoreDiv = document.createElement('div');
        scoreDiv.classList.add('score');
        scoreDiv.textContent = `+ ${p.score}`;

        row.appendChild(rankDiv);
        row.appendChild(cardDiv);
        row.appendChild(scoreDiv);

        playersContainer.appendChild(row);
    });
}

function endGame() {
    assignScores();
    renderLeaderboard();

    document.querySelector('.modalboard').classList.remove('hidden');
    document.querySelector('.overlay').classList.remove('hidden');
    document.querySelector('.modal').classList.add('hidden');
}

// ==== PRIZE BAR LOGIC ====
function updatePrizeBar() {
    const maxPrize = prizeLevels[prizeLevels.length - 1];
    const percentage = Math.min((prizePot / maxPrize) * 100, 100);
    const track = document.getElementById('prizeBarTrack');
    const label = document.getElementById('prizeBarLabel');
    const fill = document.getElementById('prizeBarFill');

    fill.style.width = `${percentage}%`;

    label.textContent = `${prizePot}`;

    requestAnimationFrame(() => {
        const trackWidth = track.offsetWidth;
        const labelPos = (percentage / 100) * trackWidth;
        label.style.left = `${labelPos}px`;
    });
    updateCheckpoints();
}

function updateCheckpoints() {
    document.querySelectorAll('.checkpoint').forEach(cp => {
        const threshold = parseInt(cp.dataset.threshold);
        cp.classList.toggle('reached', prizePot >= threshold);
    });
}

function positionCheckpoints() {
    const checkpoints = document.querySelectorAll('.checkpoint');
    const track = document.getElementById('prizeBarTrack');
    const maxPrize = prizeLevels[prizeLevels.length - 1];
    const trackWidth = track.offsetWidth;

    checkpoints.forEach(cp => {
        const value = parseInt(cp.dataset.threshold);
        const percent = value / maxPrize;
        const pos = percent * trackWidth;
        cp.style.left = `${pos}px`;
    });
}

window.addEventListener('resize', positionCheckpoints);
window.addEventListener('load', positionCheckpoints);

function showAction(command) {
    const actionDiv = document.getElementById('action');
    actionDiv.innerHTML = command;
}

function updateStatus() {
    statusDiv.textContent = `Round ${round} | Score: ${prizePot} | Current Chain: ${currentChain}`;

    function updateRewardSteps() {
        const steps = document.querySelectorAll('.reward-step');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === currentChain && currentChain < prizeLevels.length) {
                step.classList.add('active');
            }
        });
    }
    updateRewardSteps();
    updatePrizeBar();
}

btnCorrect.onclick = () => {
    currentChain++;
    updateStatus();
    showAction(`<div style="color: #69aa9b;">CORRECT!!</div>`);
};

btnIncorrect.onclick = () => {
    currentChain = 0;
    updateStatus();
    showAction(`<div style="color: #c96a6a;">INCORRECT</div>`);
};

btnBank.onclick = () => {
    prizePot += prizeLevels[currentChain];
    currentChain = 0;
    updateStatus();
    showAction(`<div style="color: #89bfd7;">SAVED</div>`);
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        btnBank.click();
    }
    if (e.key === 'ArrowRight') btnCorrect.click();
    if (e.key === 'ArrowLeft') btnIncorrect.click();
});

renderPlayers();
updateStatus();

// ==== TIMER LOGIC ====
let timerInterval;
let timeLeft = 90;
let isRunning = false;

const timerDisplay = document.getElementById('timerDisplay');
const timerDisplayWrapper = document.querySelector('.timer-display');
const toggleBtn = document.getElementById('toggleBtn');
const toggleIcon = document.getElementById('toggleIcon');
const resetBtn = document.getElementById('resetBtn');

function updateTimerDisplay() {
    const min = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const sec = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;

    if (timeLeft <= 10) {
        timerDisplay.style.color = '#ff0000';
    } else {
        timerDisplay.style.color = '';
    }
}

function animateTimerChange() {
    timerDisplayWrapper.classList.add('slide-out');
    setTimeout(() => {
        updateTimerDisplay();
        timerDisplayWrapper.classList.remove('slide-out');
        timerDisplayWrapper.classList.add('slide-in');
        setTimeout(() => {
            timerDisplayWrapper.classList.remove('slide-in');
        }, 400);
    }, 200);
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRunning = false;
            toggleBtn.innerHTML = '<img id="toggleIcon" src="./img/battle.png" alt="Start/Pause" class="icon-only" /> Battle';
            round++;
            prizePot += prizeLevels[currentChain];
            currentChain = 0;
            showAction(`End Round`);
            updateStatus();

            alert("Time to eliminate!");
            resetTimer();
            return;
        }
        timeLeft--;
        animateTimerChange();
    }, 1000);
    showAction(`Round ${round}`);
}

function toggleTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
        showAction(`Paused`);
        toggleBtn.innerHTML = '<img id="toggleIcon" src="./img/battle.png" alt="Start/Pause" class="icon-only" /> Battle';
    } else {
        isRunning = true;
        toggleBtn.innerHTML = '<img id="toggleIcon" src="./img/pause.png" alt="Start/Pause" class="icon-only" /> Pause';
        startTimer();
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timeLeft = 90;
    toggleBtn.innerHTML = '<img id="toggleIcon" src="./img/battle.png" alt="Start/Pause" class="icon-only" /> Battle';
    animateTimerChange();
    showAction(`Reset`);
}

toggleBtn.addEventListener('click', toggleTimer);
resetBtn.addEventListener('click', resetTimer);

updateTimerDisplay();

// ==== MODAL LOGIC ====
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const modalboard = document.querySelector(".modalboard");

const closeModal = function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
    modalboard.classList.add("hidden");
};

overlay.addEventListener("click", closeModal);