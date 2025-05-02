document.addEventListener('DOMContentLoaded', init);

const playIcon = `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>
</svg>`
const env = window.parent.ENV;

let interval;
let taskId;
let buttonActivated;
let optionsStudyOpened;
let optionsPauseOpened;
let selectedStudyTime;
let selectedPauseTime;
let sessionsNumber;
let currentSession;
let isPauseTime;
let finished;
let currentPomodoroId; // Traccia il pomodoro caricato
let elapsedTime; // Serve per tenere traccia del tempo se stoppo il timer

// eslint-disable-next-line no-unused-vars
function plan() {
  localStorage.setItem('tomato', JSON.stringify({
    studyMinutes: selectedStudyTime,
    pauseMinutes: selectedPauseTime,
    loops: sessionsNumber
  }))
  window.parent.location.href = '/calendar';
}

function startStudyTime(resume = false) {
  const totalDuration = selectedStudyTime * 60; // durata totale in secondi

  if (!resume) {
    // Se è il primo avvio, salva il timestamp corrente e resetta elapsedTime
    elapsedTime = 0;
  }

  // Creazione o aggiornamento del blocco di stile dinamico per gestire l’animazione
  let styleSheet = document.getElementById('dynamic-style');
  if (!styleSheet) {
    styleSheet = document.createElement("style");
    styleSheet.id = "dynamic-style";
    document.head.appendChild(styleSheet);
  }
  styleSheet.innerText = `
    .barstudy::before, .barstudy::after {
      animation: rotate ${totalDuration}s linear forwards;
      animation-delay: -${elapsedTime}s;
      animation-play-state: running;
    }
  `;

  // Rimuovi la classe che mette in pausa l'animazione
  document.getElementById('bar-study').classList.remove('pause-animation');
}

function startPauseTime(resume = false) {
  const totalDuration = selectedPauseTime * 60; // durata totale in secondi della pausa

  if (!resume) {
    elapsedTime = 0;
  }
  // Creazione/aggiornamento del blocco per l'animazione "back" per il tempo di pausa
  let pauseStyleSheet = document.getElementById('dynamic-pause-style');
  if (!pauseStyleSheet) {
    pauseStyleSheet = document.createElement("style");
    pauseStyleSheet.id = "dynamic-pause-style";
    document.head.appendChild(pauseStyleSheet);
  }
  pauseStyleSheet.innerText = `
    .barstudy::before, .barstudy::after {
      animation: back ${totalDuration}s linear forwards;
      animation-delay: -${elapsedTime}s;
      animation-play-state: running;
    }
  `;

  // Rimuove eventuali classi di pausa per far ripartire l'animazione della pausa
  document.getElementById('bar-study').classList.remove('pause-animation');
}

function playNotificationSound() {
  const audio = new Audio('../audio/notification.mp3');
  audio.play();
}

async function init() {
  const timeElement = document.getElementById('time');
  taskId = localStorage.getItem('taskId') ?? null
  if (taskId) {
    localStorage.removeItem('taskId')
  }
  const tomatoData = taskId ? await loadPlannedTomato() : await loadLastPomodoro()
  console.log('TOMATO:', tomatoData)

  if (Object.keys(tomatoData).length > 0 && tomatoData.interrupted !== "f") {
    selectedStudyTime = tomatoData.studyMinutes;
    selectedPauseTime = tomatoData.pauseMinutes;
    sessionsNumber = tomatoData.loops;
    isPauseTime = tomatoData.interrupted === "p"
    currentPomodoroId = tomatoData._id
    timeElement.innerHTML = `${selectedStudyTime}`.padStart(2, '0') + ':00';
    currentSession = 0
    if (tomatoData.interrupted !== "n") {
      // era stato interrotto
      const mins = Math.floor(tomatoData.remainingSeconds / 60);
      const secs = tomatoData.remainingSeconds % 60;
      timeElement.innerHTML = `${mins}`.padStart(2, '0') + ":" + `${secs}`.padStart(2, '0')
      currentSession = tomatoData.loops - tomatoData.remainingLoops;
    }
  } else {
    selectedStudyTime = 25;
    selectedPauseTime = 5;
    sessionsNumber = 3;
    currentSession = 0;
    isPauseTime = false;
    currentPomodoroId = null;
    timeElement.innerHTML = `${selectedStudyTime}`.padStart(2, '0') + ':00';
  }
  finished = false;
  document.getElementById('sessions').innerHTML = (currentSession + 1) +
    ' di <div><input type="text" value="' + sessionsNumber +
    '" id="ses-selector"></div><div> cicli</div>';
  buttonActivated = false;
  optionsStudyOpened = false;
  optionsPauseOpened = false;
  elapsedTime = 0;

  addButtonListener();
  setSettingsPosition();
  window.addEventListener('resize', setSettingsPosition);
  addSettingsListener();
  addCloseButtonListener();
  addOpenStudyOptionsListener();
  addOpenPauseOptionsListener();
  stdOptionsListener();
  psOptionsListener();
  changeSessionsListener();
  document.querySelector('.pom-info').addEventListener('click', resetTimer);
  document.querySelector('.pom-reset').addEventListener('click', restartTimer);
  document.querySelector('.pom-volume').addEventListener('click', skipToNextSession);
  document.getElementById('calculate-cycles').addEventListener('click', calculateCycles);
}

async function fetchPlannedTomatoId() {
  try {
    const response = await fetch(`${env.API_URL}/api/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const task = await response.json();
      return task.tomatoId
    } else {
      throw new Error()
    }
  } catch (error) { }
}

async function loadPlannedTomato() {
  const tomatoId = await fetchPlannedTomatoId()
  try {
    const response = await fetch(`${env.API_URL}/api/tomatoes/${tomatoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.ok) {
      const tomato = await response.json();
      return tomato
    } else {
      throw new Error()
    }
  } catch (error) { }
}

async function loadLastPomodoro() {
  const response = await fetch(`${env.API_URL}/api/tomatoes/last`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })

  if (response.ok) {
    return await response.json();
  }
  return undefined
}

window.addEventListener('beforeunload', async function (e) {
  clearInterval(interval);
  buttonActivated = false;
  document.getElementById('play').innerHTML = playIcon

  if (currentPomodoroId) {
    await savePomodoro()
  }
});

function calculateCycles() {
  const input = document.getElementById('available-time-input').value;
  const totalMinutes = parseFloat(input);
  if (isNaN(totalMinutes) || totalMinutes <= 0) {
    document.getElementById('cycle-proposals').innerHTML = "Inserisci un tempo valido.";
    return;
  }

  const studyTime = (typeof selectedStudyTime !== 'undefined') ? selectedStudyTime : 25;
  let pauseTime = (typeof selectedPauseTime !== 'undefined') ? selectedPauseTime : 5;
  const cycleDuration = studyTime + pauseTime;
  let cycles = Math.floor(totalMinutes / cycleDuration);
  if (cycles < 1) cycles = 1;

  const cycleTime = totalMinutes / cycles;
  pauseTime = Math.round(cycleTime - studyTime);
  cycles = Math.round(cycles);

  selectedStudyTime = studyTime;
  selectedPauseTime = pauseTime;
  sessionsNumber = cycles;

  const sessionElement = document.getElementById('sessions');
  sessionElement.innerHTML =
    '1 di <div><input type="text" value="' + sessionsNumber + '" id="ses-selector"></div><div> cicli</div>';
  changeSessionsListener();

  const timeElement = document.getElementById('time');
  timeElement.innerHTML = (studyTime < 10 ? '0' : '') + studyTime + ':00';

  closeSettingsPanel();
}

function closeSettingsPanel() {
  const containerSettings = document.getElementById('container-settings');
  const closeButton = document.getElementById('settings-close');
  const settingsTitle = document.getElementById('title');
  const optionsText = document.querySelectorAll('#opt');
  const titleSt = document.getElementById('sttitle');
  const stTime = document.getElementById('stsel-selected');
  const titlePs = document.getElementById('pstitle');
  const psTime = document.getElementById('pssel-selected');

  containerSettings.style.width = '0vh';
  closeButton.style.width = '0vh';
  settingsTitle.style.display = 'none';
  optionsText.forEach((div) => {
    div.style.display = 'none';
  });
  titleSt.style.display = 'none';
  stTime.style.display = 'none';
  titlePs.style.display = 'none';
  psTime.style.display = 'none';
  closePsOpt();
  closeStdOpt();
}

function restartTimer() {
  finished = false;
  clearInterval(interval);
  document.getElementById('tmt').style.transform = 'rotate(0deg)';
  const timeElement = document.getElementById('time');
  if (isPauseTime) {
    timeElement.innerHTML = (selectedPauseTime < 10 ? '0' : '') + selectedPauseTime + ':00';
  } else {
    timeElement.innerHTML = (selectedStudyTime < 10 ? '0' : '') + selectedStudyTime + ':00';
  }
  document.getElementById('play').innerHTML = playIcon
  buttonActivated = false;
}

function resetTimer() {
  finished = false;
  clearInterval(interval);
  buttonActivated = false;
  currentSession = 0;
  isPauseTime = false;
  elapsedTime = 0; // Reset di elapsedTime

  document.getElementById('time').innerHTML = (selectedStudyTime < 10 ? '0' : '') + selectedStudyTime + ':00';

  document.getElementById('tmt').style.transform = 'rotate(0deg)';

  document.getElementById('sessions').innerHTML = '1 di <div><input type="text" value="' + sessionsNumber + '" id="ses-selector"></div><div> cicli</div>';

  changeSessionsListener();
  document.getElementById('play').innerHTML = playIcon
}

async function skipToNextSession() {
  clearInterval(interval);
  elapsedTime = 0; // Reset di elapsedTime per far ripartire l'animazione da zero
  document.getElementById('tmt').style.transform = 'rotate(0deg)';

  const timeElement = document.getElementById('time');
  const sessionsElement = document.getElementById('sessions');

  if (isPauseTime && currentSession + 1 === sessionsNumber) {
    finished = true;
    await savePomodoro();
    resetTimer();
    return;
  }

  if (!isPauseTime) {
    timeElement.innerHTML = (selectedPauseTime < 10 ? '0' : '') + selectedPauseTime + ':00';
    isPauseTime = true;
  } else {
    currentSession++;
    sessionsElement.innerHTML =
      (currentSession + 1) +
      ' di <div><input type="text" value="' + sessionsNumber + '" id="ses-selector"></div><div> cicli</div>';
    changeSessionsListener();
    timeElement.innerHTML = (selectedStudyTime < 10 ? '0' : '') + selectedStudyTime + ':00';
    isPauseTime = false;
  }

  const playButton = document.getElementById('play');
  playButton.innerHTML = playIcon
  buttonActivated = false;
  await savePomodoro();
}

function timer(timeElement) {
  const timeParts = timeElement.innerHTML.split(':');
  let minutes = parseInt(timeParts[0]);
  let seconds = parseInt(timeParts[1]);

  interval = setInterval(async function () {
    // Aggiorna elapsedTime in base alla modalità attuale (studio o pausa)
    if (!isPauseTime) {
      elapsedTime = selectedStudyTime * 60 - (minutes * 60 + seconds);
    } else {
      elapsedTime = selectedPauseTime * 60 - (minutes * 60 + seconds);
    }

    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(interval);
        if (currentSession + 1 === sessionsNumber) {
          finished = true;
          await savePomodoro();
          resetTimer();
          return;
        } else {
          playNotificationSound();
          elapsedTime = 0;
          if (isPauseTime === false) {
            timeElement.innerHTML = `${selectedPauseTime}`.padStart(2, '0') + ':00';
            timer(timeElement);
            // Avvia la pausa con animazione "back"
            startPauseTime();
            isPauseTime = true;
          } else {
            currentSession++;
            document.getElementById('sessions').innerHTML = (currentSession + 1) +
              ' di <div><input type="text" value="' + sessionsNumber + '" id="ses-selector"></div><div> cicli</div>';
            changeSessionsListener();
            timeElement.innerHTML = `${selectedStudyTime}`.padStart(2, '0') + ':00';
            timer(timeElement);
            // Avvia il tempo di studio con animazione "rotate"
            startStudyTime();
            isPauseTime = false;
          }
          await savePomodoro();
          return;
        }
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }

    timeElement.innerHTML = `${minutes}`.padStart(2, '0') + ':' + `${seconds}`.padStart(2, '0')
  }, 1000);
}

async function checkButtonStatus(playButton, currentInterval, currentTime) {
  
  if (buttonActivated) {
    playButton.innerHTML = playIcon
    buttonActivated = false;
    clearInterval(currentInterval);
    // Aggiunge la classe di pausa per sospendere l'animazione
    document.getElementById('bar-study').classList.add('pause-animation');
  } else {
    playButton.innerHTML =
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M11.0572 33H8.43432C6.24859 33 4.5 31.2 4.5 28.95V7.05C4.5 4.8 6.24859 3 8.43432 3H11.0572C13.2429 3 14.9915 4.8 14.9915 7.05V28.8C15.1372 31.2 13.3886 33 11.0572 33Z" fill="white"/>' +
      '<path d="M27.5625 33H24.9375C22.75 33 21 31.2 21 28.95V7.05C21 4.8 22.75 3 24.9375 3H27.5625C29.75 3 31.5 4.8 31.5 7.05V28.8C31.5 31.2 29.75 33 27.5625 33Z" fill="white"/>' +
      '</svg>';
    buttonActivated = true;
    timer(currentTime);
    // A seconda di isPauseTime, riprende l'animazione corretta
    if (isPauseTime) {
      startPauseTime(true);
    } else {
      startStudyTime(true);
    }
  }
  await savePomodoro();
}

function addButtonListener() {
  const playButton = document.getElementById('play');
  const timeElement = document.getElementById('time');
  playButton.addEventListener('click', async function () {
    await checkButtonStatus(playButton, interval, timeElement);
  });
}

function setSettingsPosition() {
  const container = document.querySelector('.pom-container');
  const duplicate = document.querySelector('.pom-container-settings');
  const containerRect = container.getBoundingClientRect();
  duplicate.style.top = containerRect.top + 'px';
  duplicate.style.left = containerRect.left + 'px';
}

function addSettingsListener() {
  const settingsButton = document.getElementById('settings');
  const closeButton = document.getElementById('settings-close');
  const containerSettings = document.getElementById('container-settings');
  const settingsTitle = document.getElementById('title');
  const optionsText = document.querySelectorAll('#opt');
  const titleSt = document.getElementById('sttitle');
  const stTime = document.getElementById('stsel-selected');
  const titlePs = document.getElementById('pstitle');
  const psTime = document.getElementById('pssel-selected');
  settingsButton.addEventListener('click', function () {
    containerSettings.style.width = '42vh';
    closeButton.style.width = '36px';
    settingsTitle.style.display = 'flex';
    optionsText.forEach((div) => {
      div.style.display = 'flex';
    });
    titleSt.style.display = 'flex';
    stTime.style.display = 'flex';
    titlePs.style.display = 'flex';
    psTime.style.display = 'flex';
  });
}

function addCloseButtonListener() {
  const closeButton = document.getElementById('settings-close');
  const containerSettings = document.getElementById('container-settings');
  const settingsTitle = document.getElementById('title');
  const optionsText = document.querySelectorAll('#opt');
  const titleSt = document.getElementById('sttitle');
  const stTime = document.getElementById('stsel-selected');
  const titlePs = document.getElementById('pstitle');
  const psTime = document.getElementById('pssel-selected');
  closeButton.addEventListener('click', function () {
    containerSettings.style.width = '0vh';
    closeButton.style.width = '0vh';
    settingsTitle.style.display = 'none';
    optionsText.forEach((div) => {
      div.style.display = 'none';
    });
    titleSt.style.display = 'none';
    stTime.style.display = 'none';
    titlePs.style.display = 'none';
    psTime.style.display = 'none';
    closePsOpt();
    closeStdOpt();
  });
}

function changeSessionsListener() {
  const sesSel = document.getElementById('ses-selector');
  if (sesSel) {
    sesSel.addEventListener('input', function () {
      if (!isNaN(sesSel.value)) {
        sessionsNumber = parseInt(sesSel.value, 10);
      }
    });
  }
}

function openStdOpt() {
  const arrowButton = document.getElementById('study-arrow');
  const rectangle = document.getElementById('study-rectangle');
  const pauseTimeSel = document.getElementById('pause-sel');
  rectangle.style.marginTop = "-1vh";
  rectangle.style.marginBottom = "0vh";
  arrowButton.style.transform = 'rotateX(180deg)';
  pauseTimeSel.style.marginTop = '-2vh';
  optionsStudyOpened = true;
}

function closeStdOpt() {
  const arrowButton = document.getElementById('study-arrow');
  const rectangle = document.getElementById('study-rectangle');
  const pauseTimeSel = document.getElementById('pause-sel');
  rectangle.style.marginTop = "-5.5vh";
  rectangle.style.marginBottom = "-3vh";
  arrowButton.style.transform = 'rotateX(0deg)';
  pauseTimeSel.style.marginTop = '-8vh';
  optionsStudyOpened = false;
}

function openPsOpt() {
  const arrowButton = document.getElementById('pause-arrow');
  const rectangle = document.getElementById('pause-rectangle');
  rectangle.style.marginTop = "-1vh";
  rectangle.style.marginBottom = "0vh";
  arrowButton.style.transform = 'rotateX(180deg)';
  optionsPauseOpened = true;
}

function closePsOpt() {
  const arrowButton = document.getElementById('pause-arrow');
  const rectangle = document.getElementById('pause-rectangle');
  rectangle.style.marginTop = "-5.5vh";
  rectangle.style.marginBottom = "-3vh";
  arrowButton.style.transform = 'rotateX(0deg)';
  optionsPauseOpened = false;
}

function addOpenStudyOptionsListener() {
  const arrowButton = document.getElementById('study-arrow');
  arrowButton.addEventListener('click', function () {
    if (!optionsStudyOpened) {
      openStdOpt();
      closePsOpt();
    } else {
      closeStdOpt();
    }
  });
}

function addOpenPauseOptionsListener() {
  const arrowButton = document.getElementById('pause-arrow');
  arrowButton.addEventListener('click', function () {
    if (!optionsPauseOpened) {
      openPsOpt();
      closeStdOpt();
    } else {
      closePsOpt();
    }
  });
}

function stdOptionsListener() {
  const divsOptions = document.querySelectorAll('.stdop');
  const time = document.getElementById('time');
  const selStd = document.getElementById('stsel-selected');
  divsOptions.forEach((div) => {
    div.addEventListener('click', function () {
      time.innerHTML = this.innerHTML.replace(/\D/g, '') + ':00';
      selectedStudyTime = parseInt(this.innerHTML.replace(/\D/g, ''), 10);
      selStd.innerHTML = this.innerHTML;
      closeStdOpt();
    });
  });
}

function psOptionsListener() {
  const divsOptions = document.querySelectorAll('.psop');
  const selPs = document.getElementById('pssel-selected');
  divsOptions.forEach((div) => {
    div.addEventListener('click', function () {
      selectedPauseTime = parseInt(this.innerHTML.replace(/\D/g, ''), 10);
      selPs.innerHTML = this.innerHTML;
      closePsOpt();
    });
  });
}

async function savePomodoro() {
  const timeStr = document.getElementById('time').innerHTML;
  const parts = timeStr.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  const totalSeconds = minutes * 60 + seconds;
  // il salvataggio avviene solo a timer cominciato
  const interrupted = finished ? "f" : (isPauseTime ? "p" : "s");
  const remainingSeconds = (interrupted !== "f") ? totalSeconds : -1;
  const remainingLoops = (interrupted !== "f") ? sessionsNumber - currentSession : -1;

  const data = {
    studyMinutes: selectedStudyTime,
    pauseMinutes: selectedPauseTime,
    loops: sessionsNumber,
    interrupted: interrupted,
    remainingSeconds: remainingSeconds,
    remainingLoops: remainingLoops
  };

  const url = currentPomodoroId
    ? `${env.API_URL}/api/tomatoes/${currentPomodoroId}`
    : `${env.API_URL}/api/tomatoes/`;
  const method = currentPomodoroId ? 'PUT' : 'POST';
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data),
      keepalive: true
    })

    if (!response.ok) {
      throw new Error()
    }
    const result = await response.json()
    if (!currentPomodoroId) {
      currentPomodoroId = result._id
    }
  } catch (error) { }
}
