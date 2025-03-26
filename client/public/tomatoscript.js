document.addEventListener('DOMContentLoaded', init);

var buttonactivated;
var optionsstudyopened;
var optionspauseopened;
var selectedstudytime;
var selectedpausetime;
var numberofsessions;
var currentsession;
var interval;
var ispausetime;
var currentsecond;
var isnightmode;
var finished = false; 

function playNotificationSound() {
  var audio = new Audio('./notification.mp3');
  audio.play();
}

function init() {
  buttonactivated = false;
  optionsstudyopened = false;
  optionspauseopened = false;
  ispausetime = false;
  isnightmode = false;
  selectedpausetime = 5;
  selectedstudytime = 35;
  currentsession = 1;
  numberofsessions = 4;
  currentsecond = 0;
  finished = false;

  buttonlistener();
  settingsposition();
  window.addEventListener('resize', settingsposition);
  settingslistener();
  closebuttonlistener();
  openoptionslistener();
  openpauseoptionslistener();
  stdoptionslistener();
  psoptionslistener();
  changesessionslistener();

  document.querySelector('.pom-info').addEventListener('click', resetTimer);
  document.querySelector('.pom-reset').addEventListener('click', restartTimer);
  document.querySelector('.pom-volume').addEventListener('click', skipToNextSession);
  document.getElementById('calculate-cycles').addEventListener('click', calculateCycles);

  loadLastPomodoro();
}

window.addEventListener('beforeunload', function (e) {
  clearInterval(interval);
  buttonactivated = false;
  var playButton = document.getElementById('play');
  playButton.innerHTML =
    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>' +
    '</svg>';

  const timeElement = document.getElementById('time');
  const timeStr = timeElement.innerHTML; 
  const parts = timeStr.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  const totalSeconds = minutes * 60 + seconds;

  const interrupted = finished ? "f" : (buttonactivated ? "n" : (ispausetime ? "p" : "s"));
  const remainingMinutes = (interrupted !== "n") ? totalSeconds : -1;
  const remainingLoops = (interrupted !== "n") ? currentsession : -1;
  const modification = new Date().toISOString();

  const data = {
    studyMinutes: selectedstudytime,
    pauseMinutes: selectedpausetime,
    loops: numberofsessions,
    interrupted: interrupted,
    remainingMinutes: remainingMinutes,
    remainingLoops: remainingLoops,
    modification: modification
  };

  const url = 'http://localhost:8000/api/tomatoes';
  const payload = JSON.stringify(data);
  const blob = new Blob([payload], { type: 'application/json' });
  navigator.sendBeacon(url, blob);
});

function calculateCycles() {
  var input = document.getElementById('available-time-input').value;
  var totalMinutes = parseFloat(input);
  if (isNaN(totalMinutes) || totalMinutes <= 0) {
    document.getElementById('cycle-proposals').innerHTML = "Inserisci un tempo valido.";
    return;
  }

  var studyTime = (typeof selectedstudytime !== 'undefined') ? selectedstudytime : 35;
  var pauseTime = (typeof selectedpausetime !== 'undefined') ? selectedpausetime : 5;
  var cycleDuration = studyTime + pauseTime;
  var cycles = Math.floor(totalMinutes / cycleDuration);
  if (cycles < 1) cycles = 1;

  var cycleTime = totalMinutes / cycles;
  pauseTime = Math.round(cycleTime - studyTime);
  cycles = Math.round(cycles);

  selectedstudytime = studyTime;
  selectedpausetime = pauseTime;
  numberofsessions = cycles;

  var sessionElement = document.getElementById('sessions');
  sessionElement.innerHTML =
    '1 of <div><input type="text" value="' + numberofsessions + '" id="ses-selector"></div><div> sessions</div>';
  changesessionslistener();

  var timeElement = document.getElementById('time');
  timeElement.innerHTML = (studyTime < 10 ? '0' : '') + studyTime + ':00';

  closeSettingsPanel();
}

function closeSettingsPanel() {
  var containersettings = document.getElementById('container-settings');
  var closebutton = document.getElementById('settings-close');
  var settingstitle = document.getElementById('title');
  var optionstext = document.querySelectorAll('#opt');
  var titlest = document.getElementById('sttitle');
  var sttime = document.getElementById('stsel-selected');
  var pslest = document.getElementById('pstitle');
  var pstime = document.getElementById('pssel-selected');

  containersettings.style.width = '0vh';
  closebutton.style.width = '0vh';
  settingstitle.style.display = 'none';
  optionstext.forEach(function(div) {
    div.style.display = 'none';
  });
  titlest.style.display = 'none';
  sttime.style.display = 'none';
  pslest.style.display = 'none';
  pstime.style.display = 'none';
  closepsopt();
  closestdfopt();
}

function restartTimer() {
  finished = true;
  clearInterval(interval);
  currentsecond = 0;
  var tomato = document.getElementById('tmt');
  tomato.style.transform = 'rotate(0deg)';
  var timeElement = document.getElementById('time');
  if (ispausetime) {
    timeElement.innerHTML = (selectedpausetime < 10 ? '0' : '') + selectedpausetime + ':00';
  } else {
    timeElement.innerHTML = (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
  }
  var playButton = document.getElementById('play');
  playButton.innerHTML =
    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>' +
    '</svg>';
  buttonactivated = false;
  savePomodoro();
}

function resetTimer() {
  finished = true;
  clearInterval(interval);
  buttonactivated = false;
  currentsecond = 0;
  currentsession = 1;
  ispausetime = false;
  var timeElement = document.getElementById('time');
  timeElement.innerHTML = (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
  var tomato = document.getElementById('tmt');
  tomato.style.transform = 'rotate(0deg)';
  var sessionElement = document.getElementById('sessions');
  sessionElement.innerHTML =
    '1 of <div><input type="text" value="' + numberofsessions + '" id="ses-selector"></div><div> sessions</div>';
  changesessionslistener();
  var playButton = document.getElementById('play');
  playButton.innerHTML =
    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>' +
    '</svg>';
  savePomodoro();
}

function skipToNextSession() {
  clearInterval(interval);
  currentsecond = 0;
  var tomato = document.getElementById('tmt');
  tomato.style.transform = 'rotate(0deg)';
  var timeElement = document.getElementById('time');
  var sessionsElement = document.getElementById('sessions');

  if (ispausetime && currentsession === numberofsessions) {
    resetTimer();
    return;
  }

  if (!ispausetime) {
    timeElement.innerHTML = (selectedpausetime < 10 ? '0' : '') + selectedpausetime + ':00';
    ispausetime = true;
  } else {
    currentsession++;
    sessionsElement.innerHTML =
      currentsession +
      ' of <div><input type="text" value="' + numberofsessions + '" id="ses-selector"></div><div> sessions</div>';
    changesessionslistener();
    timeElement.innerHTML = (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
    ispausetime = false;
  }

  var playButton = document.getElementById('play');
  playButton.innerHTML =
    '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>' +
    '</svg>';
  buttonactivated = false;
  savePomodoro();
}

function timer(timeElement) {
  var timeParts = timeElement.innerHTML.split(':');
  var minutes = parseInt(timeParts[0]);
  var seconds = parseInt(timeParts[1]);
  var sessions = document.getElementById('sessions');
  var tomato = document.getElementById('tmt');
  interval = setInterval(function() {
    currentsecond = (currentsecond + 6) % 360;

    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(interval);
        if (currentsession === numberofsessions) {
          finished = true;
          resetTimer();
          return;
        } else {
          if (ispausetime === false) {
            playNotificationSound();
            timeElement.innerHTML = (selectedpausetime < 10 ? '0' : '') + selectedpausetime + ':00';
            timer(timeElement);
            ispausetime = true;
          } else {
            playNotificationSound();
            currentsession++;
            sessions.innerHTML =
              currentsession +
              ' of <div><input type="text" value="' + numberofsessions + '" id="ses-selector"></div><div> sessions</div>';
            changesessionslistener();
            timeElement.innerHTML = (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
            timer(timeElement);
            ispausetime = false;
          }
          savePomodoro();
          return;
        }
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    tomato.style.transform = 'rotate(' + currentsecond + 'deg)';
    timeElement.innerHTML =
      (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }, 1000);
}

function checkbuttonstatus(playbutton, interval, currenttime) {
  if (buttonactivated) {
    playbutton.innerHTML =
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/>' +
      '</svg>';
    buttonactivated = false;
    clearInterval(interval);
    savePomodoro();
  } else {
    playbutton.innerHTML =
      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M11.0572 33H8.43432C6.24859 33 4.5 31.2 4.5 28.95V7.05C4.5 4.8 6.24859 3 8.43432 3H11.0572C13.2429 3 14.9915 4.8 14.9915 7.05V28.8C15.1372 31.2 13.3886 33 11.0572 33Z" fill="white"/>' +
        '<path d="M27.5625 33H24.9375C22.75 33 21 31.2 21 28.95V7.05C21 4.8 22.75 3 24.9375 3H27.5625C29.75 3 31.5 4.8 31.5 7.05V28.8C31.5 31.2 29.75 33 27.5625 33Z" fill="white"/>' +
      '</svg>';
    timer(currenttime);
    buttonactivated = true;
    savePomodoro();
  }
}

function buttonlistener() {
  var playbutton = document.getElementById('play');
  var timeElement = document.getElementById('time');
  playbutton.addEventListener('click', function() {
    checkbuttonstatus(playbutton, interval, timeElement);
  });
}

function settingsposition() {
  const container = document.querySelector('.pom-container');
  const duplicate = document.querySelector('.pom-container-settings');
  const containerRect = container.getBoundingClientRect();
  duplicate.style.top = containerRect.top + 'px';
  duplicate.style.left = containerRect.left + 'px';
}

function settingslistener() {
  var settingsbutton = document.getElementById('settings');
  var containersettings = document.getElementById('container-settings');
  var closebutton = document.getElementById('settings-close');
  var settingstitle = document.getElementById('title');
  var optionstext = document.querySelectorAll('#opt');
  var titlest = document.getElementById('sttitle');
  var sttime = document.getElementById('stsel-selected');
  var pslest = document.getElementById('pstitle');
  var pstime = document.getElementById('pssel-selected');
  settingsbutton.addEventListener('click', function() {
    containersettings.style.width = '40vh';
    closebutton.style.width = '36px';
    settingstitle.style.display = 'flex';
    optionstext.forEach(function(div) {
      div.style.display = 'flex';
    });
    titlest.style.display = 'flex';
    sttime.style.display = 'flex';
    pslest.style.display = 'flex';
    pstime.style.display = 'flex';
  });
}

function closebuttonlistener() {
  var closebutton = document.getElementById('settings-close');
  var containersettings = document.getElementById('container-settings');
  var settingstitle = document.getElementById('title');
  var optionstext = document.querySelectorAll('#opt');
  var titlest = document.getElementById('sttitle');
  var sttime = document.getElementById('stsel-selected');
  var pslest = document.getElementById('pstitle');
  var pstime = document.getElementById('pssel-selected');
  closebutton.addEventListener('click', function() {
    containersettings.style.width = '0vh';
    closebutton.style.width = '0vh';
    settingstitle.style.display = 'none';
    optionstext.forEach(function(div) {
      div.style.display = 'none';
    });
    titlest.style.display = 'none';
    sttime.style.display = 'none';
    pslest.style.display = 'none';
    pstime.style.display = 'none';
    closepsopt();
    closestdfopt();
  });
}

function changesessionslistener() {
  var sessel = document.getElementById('ses-selector');
  if (sessel) {
    sessel.addEventListener('input', function() {
      if (!isNaN(sessel.value)) {
        console.log("Numero sessioni aggiornato: " + sessel.value);
        numberofsessions = parseInt(sessel.value, 10);
      }
    });
  }
}

function openstdopt() {
  var arrowbutton = document.getElementById('study-arrow');
  var rectangle = document.getElementById('study-rectangle');
  var pausetimesel = document.getElementById('pause-sel');
  rectangle.style.marginTop = "-1vh";
  rectangle.style.marginBottom = "0vh";
  arrowbutton.style.transform = 'rotateX(180deg)';
  pausetimesel.style.marginTop = '-2vh';
  optionsstudyopened = true;
}

function closestdfopt() {
  var arrowbutton = document.getElementById('study-arrow');
  var rectangle = document.getElementById('study-rectangle');
  var pausetimesel = document.getElementById('pause-sel');
  rectangle.style.marginTop = "-5.5vh";
  rectangle.style.marginBottom = "-3vh";
  arrowbutton.style.transform = 'rotateX(0deg)';
  pausetimesel.style.marginTop = '-8vh';
  optionsstudyopened = false;
}

function openpsopt() {
  var arrowbutton2 = document.getElementById('pause-arrow');
  var rectangle2 = document.getElementById('pause-rectangle');
  rectangle2.style.marginTop = "-1vh";
  rectangle2.style.marginBottom = "0vh";
  arrowbutton2.style.transform = 'rotateX(180deg)';
  optionspauseopened = true;
}

function closepsopt() {
  var arrowbutton2 = document.getElementById('pause-arrow');
  var rectangle2 = document.getElementById('pause-rectangle');
  rectangle2.style.marginTop = "-5.5vh";
  rectangle2.style.marginBottom = "-3vh";
  arrowbutton2.style.transform = 'rotateX(0deg)';
  optionspauseopened = false;
}

function openoptionslistener() {
  var arrowbutton = document.getElementById('study-arrow');
  var rectangle = document.getElementById('study-rectangle');
  var pausetimesel = document.getElementById('pause-sel');
  arrowbutton.addEventListener('click', function() {
    if (optionsstudyopened == false) {
      openstdopt();
      closepsopt();
    } else {
      closestdfopt();
    }
  });
}

function openpauseoptionslistener() {
  var arrowbutton2 = document.getElementById('pause-arrow');
  var rectangle2 = document.getElementById('pause-rectangle');
  arrowbutton2.addEventListener('click', function() {
    if (optionspauseopened == false) {
      openpsopt();
      closestdfopt();
    } else {
      closepsopt();
    }
  });
}

function stdoptionslistener() {
  var divsoptions = document.querySelectorAll('.stdop');
  var time = document.getElementById('time');
  var selstd = document.getElementById('stsel-selected');
  divsoptions.forEach(function(div) {
    div.addEventListener('click', function() {
      time.innerHTML = this.innerHTML.replace(/\D/g, '') + ':00';
      selectedstudytime = parseInt(this.innerHTML.replace(/\D/g, ''), 10);
      selstd.innerHTML = this.innerHTML;
      closestdfopt();
    });
  });
}

function psoptionslistener() {
  var divsoptions = document.querySelectorAll('.psop');
  var selps = document.getElementById('pssel-selected');
  divsoptions.forEach(function(div) {
    div.addEventListener('click', function() {
      selectedpausetime = parseInt(this.innerHTML.replace(/\D/g, ''), 10);
      selps.innerHTML = this.innerHTML;
      closepsopt();
    });
  });
}

function savePomodoro() {
  const timeElement = document.getElementById('time');
  const timeStr = timeElement.innerHTML;
  const parts = timeStr.split(':');
  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;
  const totalSeconds = minutes * 60 + seconds; 

  const interrupted = finished ? "f" : (buttonactivated ? "n" : (ispausetime ? "p" : "s"));
  const remainingMinutes = (interrupted !== "n") ? totalSeconds : -1;
  const remainingLoops = (interrupted !== "n") ? currentsession : -1;
  const modification = new Date().toISOString();

  const data = {
    studyMinutes: selectedstudytime,
    pauseMinutes: selectedpausetime,
    loops: numberofsessions,
    interrupted: interrupted,
    remainingMinutes: remainingMinutes,
    remainingLoops: remainingLoops,
    modification: modification
  };

  fetch('http://localhost:8000/api/tomatoes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data),
    keepalive: true
  })
    .then(response => {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Non autenticato');
      }
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.text();
    })
    .then(result => {
      console.log('Pomodoro salvato con successo:', result);
    })
    .catch(error => {
      console.error('Errore nel salvataggio del pomodoro:', error);
    });
}

function loadLastPomodoro() {
  fetch('http://localhost:8000/api/tomatoes/last', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => {
      if (response.status === 401) {
        window.location.href = '/login';
        throw new Error('Non autenticato');
      }
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (Array.isArray(data) && data.length > 0) {
        data = data[0];
      }
      if (data && Object.keys(data).length > 0) {
        if (data.interrupted !== undefined && data.interrupted === "f") {
          console.log('Pomodoro finito, uso i valori di default.');
          selectedstudytime = 35;
          selectedpausetime = 5;
          numberofsessions = 4;
          currentsession = 1;
          document.getElementById('time').innerHTML =
            (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
          document.getElementById('sessions').innerHTML =
            '1 of <div><input type="text" value="' + numberofsessions + 
            '" id="ses-selector"></div><div> sessions</div>';
          changesessionslistener();
          return;
        }

        console.log('Ultimo pomodoro caricato:', data);
        selectedstudytime = (data.studyMinutes !== undefined) ? data.studyMinutes : 35;
        selectedpausetime = (data.pauseMinutes !== undefined) ? data.pauseMinutes : 5;
        numberofsessions = (data.loops !== undefined) ? data.loops : 4;
        
        if (data.interrupted !== undefined && data.interrupted === "p") {
          ispausetime = true;
        } else {
          ispausetime = false;
        }

        const timeElement = document.getElementById('time');
        if (data.remainingMinutes !== undefined && data.remainingMinutes !== -1) {
          const totalSec = data.remainingMinutes;
          const mins = Math.floor(totalSec / 60);
          const secs = totalSec % 60;
          timeElement.innerHTML =
            (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        } else {
          timeElement.innerHTML =
            (selectedstudytime < 10 ? '0' : '') + selectedstudytime + ':00';
        }

        if (data.remainingLoops !== undefined && data.remainingLoops !== -1) {
          currentsession = data.remainingLoops;
        } else {
          currentsession = 1;
        }

        document.getElementById('sessions').innerHTML =
          currentsession +
          ' of <div><input type="text" value="' + numberofsessions +
          '" id="ses-selector"></div><div> sessions</div>';
        changesessionslistener();
      } else {
        console.log('Nessun dato pomodoro trovato, utilizzo i valori di default.');
      }
    })
    .catch(error => {
      console.error('Errore nel caricamento dell\'ultimo pomodoro:', error);
    });
}
