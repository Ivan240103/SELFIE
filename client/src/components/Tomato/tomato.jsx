import React, { useEffect, useState } from 'react';
import "./tomato.css";

const PomodoroTimer = () => {
    const [buttonActivated, setButtonActivated] = useState(false);
    const [optionsStudyOpened, setOptionsStudyOpened] = useState(false);
    const [optionsPauseOpened, setOptionsPauseOpened] = useState(false);
    const [isPauseTime, setIsPauseTime] = useState(false);
    const [isNightMode, setIsNightMode] = useState(false);
    const [selectedPauseTime, setSelectedPauseTime] = useState(5);
    const [selectedStudyTime, setSelectedStudyTime] = useState(25);
    const [currentSession, setCurrentSession] = useState(1);
    const [numberOfSessions, setNumberOfSessions] = useState(4);
    const [currentSecond, setCurrentSecond] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        init();
        window.addEventListener('resize', settingsPosition);
        return () => {
            window.removeEventListener('resize', settingsPosition);
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    const init = () => {
        setCurrentSecond(0);
        setCurrentSession(1);
        // Other initializations can be done here
        buttonListener();
        settingsPosition();
    };

    const timer = (timeElement) => {
        let timeParts = timeElement.innerHTML.split(':');
        let minutes = parseInt(timeParts[0]);
        let seconds = parseInt(timeParts[1]);

        const sessions = document.getElementById('sessions');
        const tomato = document.getElementById('tmt');

        const id = setInterval(() => {
            setCurrentSecond(prev => prev + 360 / (selectedStudyTime * 60));
            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(id);
                    if (currentSession !== numberOfSessions) {
                        if (!isPauseTime) {
                            timeElement.innerHTML = '0' + selectedPauseTime + ':' + '00';
                            timer(timeElement);
                            setIsPauseTime(true);
                        } else {
                            setCurrentSession(prev => prev + 1);
                            sessions.innerHTML = `${currentSession} of <div><input type="text" value="${numberOfSessions}" id="ses-selector"></div><div> sessions</div>`;
                            timeElement.innerHTML = selectedStudyTime + ':' + '00';
                            timer(timeElement);
                            setIsPauseTime(false);
                        }
                    } else {
                        // Reset tutto
                    }
                    return;
                } else {
                    minutes--;
                    seconds = 59;
                }
            } else {
                seconds--;
            }
            tomato.style.transform = 'rotate(' + currentSecond + 'deg)';
            timeElement.innerHTML = (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }, 1000);
        setIntervalId(id); // Set the interval ID
    };

    const checkButtonStatus = (playButton, timeElement) => {
        if (buttonActivated) {
            playButton.innerHTML = `<svg> ... </svg>`; // Your SVG content here
            setButtonActivated(false);
            clearInterval(intervalId);
        } else {
            playButton.innerHTML = `<svg> ... </svg>`; // Your SVG content here
            timer(timeElement);
            setButtonActivated(true);
        }
    };

    const buttonListener = () => {
        const playButton = document.getElementById('play');
        const timeElement = document.getElementById('time');

        playButton.addEventListener('click', () => {
            checkButtonStatus(playButton, timeElement);
        });
    };

    const settingsPosition = () => {
        const container = document.querySelector('.pom-container');
        const duplicate = document.querySelector('.pom-container-settings');

        const containerRect = container.getBoundingClientRect();
        duplicate.style.top = containerRect.top + 'px';
        duplicate.style.left = containerRect.left + 'px';
    };

    // Other methods remain similar, updating state using `setState` methods where needed

    return (
        <div className="main">
            <div className="pom-container">
                <div className="pom-header">
                    <div className="pom-sessions" id="sessions">
                        {currentSession} of <div><input type="text" value={numberOfSessions} id="ses-selector" /></div><div> sessions</div>
                    </div>
                    <div className="pom-nightmode" id="nightmode">
                        {/* Icon for night mode can go here */}
                    </div>
                    <div className="pom-control" id="settings">
                        {/* Settings icon can go here */}
                    </div>
                </div>
                <div className="pom-content">
                    <div className="pom-time-next">
                        <div className="time" id="time">{selectedStudyTime}:00</div>
                    </div>
                    <div className="pom-tomato" id="tmt">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="tmt-img">
                            <img src="tomato.png" alt="Pomodoro Timer" />
                        </div>
                    </div>
                </div>
                <div className="pom-footer">
                    <div className="pom-reset" id="play">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white" />
                        </svg>
                    </div>
                    <div className="pom-time-next">
                        <div className="pom-time-blank"></div>
                        <div className="next">Next</div>
                    </div>
                </div>
            </div>
            <div className="pom-container-settings" id="container-settings">
                <div className="pom-blank-setting">
                    <p id="title">Settings</p>
                    <div className="settings-close" id="settings-close">
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 18L36 36M0 0L18 18L36 0" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
                <div className="studytime-selector" id="study-sel">
                    <div className="study-selector" id="study-button">
                        Study Time
                        <div className="stsel-selected" id="stsel-selected">{selectedStudyTime}</div>
                        <div className="stsel-arrow" id="study-arrow">▼</div>
                    </div>
                    <div className="study-options">
                        <div className="options" id="study-rectangle">
                            <div className="stdop" onClick={() => setSelectedStudyTime(25)}>25</div>
                            <div className="stdop" onClick={() => setSelectedStudyTime(30)}>30</div>
                            <div className="stdop" onClick={() => setSelectedStudyTime(45)}>45</div>
                            <div className="stdop" onClick={() => setSelectedStudyTime(60)}>60</div>
                        </div>
                    </div>
                </div>
                <div className="pausetime-selector" id="pause-sel">
                    <div className="pause-selector" id="pause-button">
                        Pause Time
                        <div className="pelsel-selected" id="pelsel-selected">{selectedPauseTime}</div>
                        <div className="pelsel-arrow" id="pause-arrow">▼</div>
                    </div>
                    <div className="pause-options">
                        <div className="options" id="pause-rectangle">
                            <div className="pstop" onClick={() => setSelectedPauseTime(5)}>5</div>
                            <div className="pstop" onClick={() => setSelectedPauseTime(10)}>10</div>
                            <div className="pstop" onClick={() => setSelectedPauseTime(15)}>15</div>
                            <div className="pstop" onClick={() => setSelectedPauseTime(20)}>20</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PomodoroTimer;
