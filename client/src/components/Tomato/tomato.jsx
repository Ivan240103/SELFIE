import React, { useEffect, useState } from 'react';
import "./tomato.css";
import image from "./tomato.png"

function Tomato(){
    const [buttonActivated, setButtonActivated] = useState(false);
    const [buttonPaused, setButtonPaused] = useState(true);
    const [optionsOpened, setOptionOpened] = useState(false);
    const [pauseTime, setPauseTime] = useState(false);
    const [selectPauseTime, setSelectPauseTime] = useState(5);
    const [selectStudyTime, setSelectStudyTime] = useState(25);
    const [currentSession, setCurrentSession] = useState(1);
    const [numberOfSessions, setNumberOfSessions] = useState(4);
    const [currentSecond, setCurrentSecond] = useState(0);

    return (
        <>
        <div className="main">
            <div className="pom-container" id="pom-container">
                <div className="pom-header">
                    <div className="pom-custom" id="settings"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.1765 27.2143H27C26.4706 25.2857 24.75 24 22.6324 24C20.1176 24 18 26.0571 18 28.5C18 30.9429 20.1176 33 22.6324 33C24.75 33 26.4706 31.7143 27 29.7857H30.1765C30.9706 29.7857 31.5 29.1429 31.5 28.5C31.5 27.7286 30.9706 27.2143 30.1765 27.2143Z" fill="white"/><path d="M15.2234 27H5.7766C5.01064 27 4.5 27.75 4.5 28.5C4.5 29.4 5.1383 30 5.7766 30H15.2234C15.9894 30 16.5 29.25 16.5 28.5C16.5 27.6 15.8617 27 15.2234 27Z" fill="white"/><path d="M5.7766 9H15.2234C15.9894 9 16.5 8.25 16.5 7.5C16.5 6.75 15.8617 6 15.2234 6H5.7766C5.01064 6 4.5 6.75 4.5 7.5C4.5 8.25 5.1383 9 5.7766 9Z" fill="white"/><path d="M22.6324 12C24.75 12 26.4706 10.7143 27 8.78571H30.1765C30.9706 8.78571 31.5 8.14286 31.5 7.5C31.5 6.85714 30.8382 6.21429 30.1765 6.21429H27C26.4706 4.28571 24.75 3 22.6324 3C20.1176 3 18 5.05714 18 7.5C18 9.94286 20.1176 12 22.6324 12Z" fill="white"/><path d="M5.82353 19.2857H9C9.52941 21.0857 11.25 22.5 13.3676 22.5C15.8824 22.5 18 20.4429 18 18C18 15.5571 15.8824 13.5 13.3676 13.5C11.25 13.5 9.52941 14.7857 9 16.7143H5.82353C5.02941 16.7143 4.5 17.3571 4.5 18C4.5 18.6429 5.16176 19.2857 5.82353 19.2857Z" fill="white"/><path d="M30.2097 16.5H20.7903C20.0161 16.5 19.5 17.25 19.5 18C19.5 18.75 20.1452 19.5 20.7903 19.5H30.2097C30.9839 19.5 31.5 18.75 31.5 18C31.5 17.25 30.9839 16.5 30.2097 16.5Z" fill="white"/></svg></div>
                    <div className="pom-tomato">
                        <div className="dot"></div>
                        <div className="tomato">
                            <div className="tmt-img"><img src={image} alt="" srcset="" id="tmt"/></div>
                        </div>
                    </div>
                    <div className="pom-nightmode" id="night"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.4494 33.0001C14.3994 33.0001 10.4994 31.5001 7.4994 28.5001C1.4994 22.5001 1.4994 13.0501 7.3494 7.20014C9.4494 4.95014 12.2994 3.45014 15.4494 3.00014C16.0494 2.85014 16.6494 3.15014 16.9494 3.75014C17.2494 4.35014 17.2494 4.95014 16.7994 5.40014C13.4994 9.15014 13.7994 15.0001 17.3994 18.6001C20.9994 22.2001 26.6994 22.5001 30.4494 19.2001C30.8994 18.7501 31.6494 18.7501 32.0994 19.0501C32.6994 19.3501 32.9994 19.9501 32.8494 20.5501C32.3994 23.7001 30.8994 26.4001 28.7994 28.6501C25.9494 31.5001 22.1994 33.0001 18.4494 33.0001Z" fill="white"/></svg></div>
                </div>
                <div className="pom-content">
                    <div className="pom-sessions" id="sessions">1 of <div><input type="text" value="4" id="ses-selector"/></div><div> sessions</div></div>
                    <div className="pom-time-next">
                        <div className="time" id="time">25:00</div>
                    </div>
                    <div className="pom-control" id="play"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white"/></svg></div>
                    <div className="pom-reset"><svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M34.3508 13.442L30.9065 3.73563C30.4572 2.70616 29.5587 1.97083 28.5104 1.82377C27.4621 1.6767 26.4138 2.1179 25.8148 3.0003L24.7665 4.47096C21.4719 2.70616 17.4285 2.1179 13.6846 3.0003C7.54458 4.32389 2.7524 9.32414 1.70411 15.3538C0.955336 19.9129 2.30314 24.4719 5.14849 27.8545C8.14361 31.237 12.4865 33.2959 17.1289 33.2959C23.5684 33.2959 29.2591 29.4722 31.6552 23.5895C31.9548 23.0013 31.805 22.413 31.5055 21.9718C31.206 21.5306 30.6069 21.2365 30.0079 21.2365H25.9645C24.6167 21.2365 23.5684 21.6777 22.8197 22.5601C21.0226 24.7661 18.327 25.6485 15.6314 25.2073C12.9358 24.619 10.5397 22.413 9.94067 19.6188C9.49141 17.4128 9.94067 15.0597 11.4382 13.442C12.786 11.6772 15.0324 10.6477 17.2787 10.6477C18.1772 10.6477 19.2255 10.7948 19.9743 11.236L18.7763 12.8537C18.1772 13.7361 18.0275 14.9126 18.6265 15.795C19.0758 16.6774 20.1241 17.2657 21.1723 17.2657L31.6552 17.1186C32.1045 17.1186 32.5538 16.9716 33.003 16.8245C34.2011 16.2362 34.8001 14.7656 34.3508 13.442Z" fill="white"/></svg></div>
                </div>
                <div className="pom-footer">
                    <div className="pom-info"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 6C11.3726 6 6 11.3726 6 18C6 24.6274 11.3726 30 18 30C24.6274 30 30 24.6274 30 18C30 11.3726 24.6274 6 18 6ZM3 18C3 9.71573 9.71573 3 18 3C26.2843 3 33 9.71573 33 18C33 26.2843 26.2843 33 18 33C9.71573 33 3 26.2843 3 18ZM18 11.7C16.2784 11.7 15 12.9784 15 14.7C15 15.5284 14.3284 16.2 13.5 16.2C12.6716 16.2 12 15.5284 12 14.7C12 11.3216 14.6216 8.7 18 8.7C21.3784 8.7 24 11.3216 24 14.7C24 17.5582 22.1236 19.8747 19.5 20.5203V20.55C19.5 21.3784 18.8284 22.05 18 22.05C17.1716 22.05 16.5 21.3784 16.5 20.55V19.2C16.5 18.3716 17.1716 17.7 18 17.7C19.7216 17.7 21 16.4216 21 14.7C21 12.9784 19.7216 11.7 18 11.7ZM18 22.95C18.8284 22.95 19.5 23.6216 19.5 24.45V25.8C19.5 26.6284 18.8284 27.3 18 27.3C17.1716 27.3 16.5 26.6284 16.5 25.8V24.45C16.5 23.6216 17.1716 22.95 18 22.95Z" fill="white"/></svg></div>
                    <div className="pom-blank"></div>
                    <div className="pom-volume"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.55 3.44982C19.05 2.69982 17.4 2.99982 16.05 4.04982C12.9 6.59982 9.45 8.99982 5.7 10.9498C3.15 12.2998 1.5 14.9998 1.5 17.9998C1.5 20.8498 3.15 23.5498 5.7 25.0498C9.15 26.8498 12.6 29.2498 16.05 32.0998C16.8 32.6998 17.7 32.9998 18.75 32.9998C19.35 32.9998 19.95 32.8498 20.55 32.5498C22.05 31.7998 22.95 30.4498 22.95 28.7998V7.19982C22.95 5.54982 22.05 4.04982 20.55 3.44982Z" fill="white"/><path d="M25.95 22.1998C26.25 22.4998 26.7 22.6498 27 22.6498C27.3 22.6498 27.75 22.4998 28.05 22.1998C29.25 21.1498 29.85 19.4998 29.85 17.8498C29.85 16.1998 29.25 14.6998 28.05 13.4998C27.45 12.8998 26.55 12.8998 25.95 13.4998C25.35 14.0998 25.35 14.9998 25.95 15.5998C26.55 16.1998 26.85 16.9498 26.85 17.6998C26.85 18.4498 26.55 19.1998 25.95 19.7998C25.35 20.6998 25.35 21.5998 25.95 22.1998Z" fill="black"/><path d="M27.7501 7.65012C27.0001 7.35012 26.1001 7.65012 25.8001 8.40012C25.5001 9.15012 25.8001 10.0501 26.5501 10.3501C29.5501 11.7001 31.5001 14.7001 31.5001 17.8501C31.5001 21.1501 29.5501 24.1501 26.4001 25.5001C25.6501 25.8001 25.3501 26.7001 25.6501 27.4501C25.9501 28.0501 26.4001 28.3501 27.0001 28.3501C27.1501 28.3501 27.4501 28.3501 27.6001 28.2001C31.8001 26.5501 34.5001 22.5001 34.5001 18.0001C34.5001 13.5001 31.8001 9.45012 27.7501 7.65012Z" fill="white"/></svg></div>
                </div>
            </div>    

            <div className="pom-container-settings" id="container-settings">
                <div className="pom-header">
                    <div className="pom-blank-setting"><p id="title">Settings</p></div>
                    <div className="settings-close"><svg id="settings-close" width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.56424 6.72873L13.5689 16.7287C14.165 17.6243 14.165 18.9675 13.5689 19.8631L6.4152 29.8631C5.37196 31.3556 6.4152 33.2959 8.20362 33.2959H18.0399C19.3813 33.2959 20.5735 32.6989 21.4677 31.5049L29.2176 20.6093C30.2608 19.266 30.2608 17.3257 29.2176 15.9825L21.4677 5.08694C20.7226 3.89291 19.3813 3.2959 18.0399 3.2959H8.35266C6.56424 3.2959 5.52099 5.2362 6.56424 6.72873Z" fill="white"/></svg> </div>
                </div>
                <div className="pom-content">
                    <div className="studytime-selector">
                        <div className="study-selector">
                            <div className="stsel-title" id="sttitle">Study time: </div>
                            <div className="stsel-selected" id="stsel-selected">25 min</div>
                            <div className="stsel-arrow" id="study-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(40, 40, 40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                              </div>
                        </div>
                        <div className="study-options">
                            <div className="rectangle" id="study-rectangle"></div>
                            <div className="options" id="study-options">
                                <div className="stdop" id="opt">25 min</div>
                                <div className="stdop" id="opt">30 min</div>
                                <div className="stdop" id="opt">35 min</div>
                                <div className="stdop" id="opt">40 min</div>
                            </div>
                        </div>                        
                    </div>  
                    <div className="pausetime-selector">
                        <div className="pause-selector" id="pause-sel" >
                            <div className="pssel-title" id="pstitle">Pause time: </div>
                            <div className="pssel-selected" id='pssel-selected'>5 min</div>
                            <div className="pssel-arrow" id="pause-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(40, 40, 40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                              </div>
                        </div>
                        <div className="pause-options">
                            <div className="rectangle" id="pause-rectangle"></div>
                            <div className="options" id="pause-options">
                                <div className="psop" id="opt">5 min</div>
                                <div className="psop" id="opt">10 min</div>
                                <div className="psop" id="opt">15 min</div>
                                <div className="psop" id="opt">20 min</div>
                            </div>
                        </div> 
                    </div>
                    
                </div>
                <div className="pom-footer">
                    
                </div>
            </div>


        </div>

    <svg>
        <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo"></feColorMatrix>
            <feBlend in="SourceGraphic" in2="goo" />
        </filter>
    </svg>
    </>
    );
}

export default Tomato;


/* 

VERSIONE DI CHAT PER PRENDERE SPUNTO

import React, { useEffect, useState } from 'react';
import "./tomato.css";
import image from "./tomato.png"

function Tomato() {
    const [buttonActivated, setButtonActivated] = useState(false);
    const [buttonPaused, setButtonPaused] = useState(true);
    const [optionsOpened, setOptionOpened] = useState(false);
    const [selectPauseTime, setSelectPauseTime] = useState(5); // Pause time in minutes
    const [selectStudyTime, setSelectStudyTime] = useState(25); // Study time in minutes
    const [currentSession, setCurrentSession] = useState(1);
    const [numberOfSessions, setNumberOfSessions] = useState(4);
    const [timeLeft, setTimeLeft] = useState(selectStudyTime * 60); // Time left in seconds
    const [isStudying, setIsStudying] = useState(true); // True if studying, false if on a break

    // Update the timer every second
    useEffect(() => {
        let interval = null;
        if (buttonActivated && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            if (isStudying) {
                // Switch to break time
                setIsStudying(false);
                setTimeLeft(selectPauseTime * 60); // Set time left to pause time
                setCurrentSession(prevSession => prevSession + 1);
            } else {
                // Switch back to study time
                setIsStudying(true);
                if (currentSession < numberOfSessions) {
                    setTimeLeft(selectStudyTime * 60); // Reset time left to study time
                } else {
                    // All sessions complete
                    resetTimer();
                }
            }
        }
        return () => clearInterval(interval);
    }, [buttonActivated, timeLeft, isStudying, selectPauseTime, selectStudyTime, currentSession, numberOfSessions]);

    const startTimer = () => {
        setButtonActivated(true);
        setButtonPaused(false);
    };

    const pauseTimer = () => {
        setButtonPaused(true);
        setButtonActivated(false);
    };

    const resetTimer = () => {
        setButtonActivated(false);
        setButtonPaused(true);
        setTimeLeft(selectStudyTime * 60);
        setCurrentSession(1);
        setIsStudying(true);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <>
            <div className="main">
                <div className="pom-container" id="pom-container">
                    <div className="pom-header">
                        {/* Header Icons }
                        <div className="pom-custom" id="settings">...</div>
                        <div className="pom-tomato">
                            <div className="dot"></div>
                            <div className="tomato">
                                <div className="tmt-img"><img src={image} alt="" srcSet="" id="tmt" /></div>
                            </div>
                        </div>
                        <div className="pom-nightmode" id="night">...</div>
                    </div>
                    <div className="pom-content">
                        <div className="pom-sessions" id="sessions">{currentSession} of <div><input type="text" value={numberOfSessions} id="ses-selector" readOnly /></div><div> sessions</div></div>
                        <div className="pom-time-next">
                            <div className="time" id="time">{formatTime(timeLeft)}</div>
                        </div>
                        <div className="pom-control" id="play" onClick={buttonPaused ? startTimer : pauseTimer}>
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {buttonPaused ?
                                    <path d="M30.6693 14.0114L11.6966 2.15371C8.4254 0.342116 4.5 2.48309 4.5 6.27097V29.8217C4.5 33.4449 8.4254 35.7505 11.6966 33.7742L30.6693 21.9165C33.7769 20.1049 33.7769 15.823 30.6693 14.0114Z" fill="white" />
                                    :
                                    <path d="M10 8v20l20-10L10 8z" fill="white" />
                                }
                            </svg>
                        </div>
                        <div className="pom-reset" onClick={resetTimer}>
                            <svg width="36" height="37" viewBox="0 0 36 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M34.3508 13.442L30.9065 3.73563C30.4572 2.70616 29.5587 1.97083 28.5104 1.82377C27.4621 1.6767 26.4138 2.1179 25.8148 3.0003L24.7665 4.47096C21.4719 2.70616 17.4285 2.1179 13.6846 3.0003C7.54458 4.32389 2.7524 9.32414 1.70411 15.3538C0.955336 19.9129 2.30314 24.4719 5.14849 27.8545C8.14361 31.237 12.4865 33.2959 17.1289 33.2959C23.5684 33.2959 29.2591 29.4722 31.6552 23.5895C31.9548 23.0013 31.805 22.413 31.5055 21.9718C31.206 21.5306 30.6069 21.2365 30.0079 21.2365H25.9645C24.6167 21.2365 23.5684 21.6777 22.8197 22.5601C21.0226 24.7661 18.327 25.6485 15.6314 25.2073C12.9358 24.619 10.5397 22.413 9.94067 19.6188C9.49141 17.4128 9.94067 15.0597 11.4382 13.442C12.786 11.6772 15.0324 10.6477 17.2787 10.6477C18.1772 10.6477 19.2255 10.7948 19.9743 11.236L18.7763 12.8537C18.1772 13.7361 18.0275 14.9126 18.6265 15.795C19.0758 16.6774 20.1241 17.2657 21.1723 17.2657L31.6552 17.1186C32.1045 17.1186 32.5538 16.9716 33.003 16.8245C34.2011 16.2362 34.8001 14.7656 34.3508 13.442Z" fill="white" />
                            </svg>
                        </div>
                    </div>
                    <div className="pom-footer">
                        <div className="pom-info">...</div>
                        <div className="pom-blank"></div>
                        <div className="pom-volume">...</div>
                    </div>
                </div>
            </div>
            <div className="pom-container-settings" id="container-settings">
                {/* Settings Section }
                <div className="pom-header">
                    <div className="pom-blank-setting"><p id="title">Settings</p></div>
                    <div className="settings-close">...</div>
                </div>
                <div className="pom-content">
                    <div className="studytime-selector">
                        <div className="study-selector">
                            <div className="stsel-title" id="sttitle">Study time: </div>
                            <div className="stsel-selected" id="stsel-selected">{selectStudyTime} min</div>
                            <div className="stsel-arrow" id="study-arrow">...</div>
                        </div>
                        <div className="study-options">
                            <div className="rectangle-select" onClick={() => setSelectStudyTime(15)}>15</div>
                            <div className="rectangle-select" onClick={() => setSelectStudyTime(25)}>25</div>
                            <div className="rectangle-select" onClick={() => setSelectStudyTime(30)}>30</div>
                        </div>
                    </div>
                    <div className="pausetime-selector">
                        <div className="pause-selector">
                            <div className="pause-title" id="patitle">Pause time: </div>
                            <div className="pause-selected" id="pasel-selected">{selectPauseTime} min</div>
                            <div className="pause-arrow" id="pause-arrow">...</div>
                        </div>
                        <div className="pause-options">
                            <div className="rectangle-select" onClick={() => setSelectPauseTime(3)}>3</div>
                            <div className="rectangle-select" onClick={() => setSelectPauseTime(5)}>5</div>
                            <div className="rectangle-select" onClick={() => setSelectPauseTime(10)}>10</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Tomato;
*/