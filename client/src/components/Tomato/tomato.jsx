import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import "./tomato.css";
=======
import "../../css/tomato.css";

// TODO: AUTENTICAZIONEEE!!!
>>>>>>> 2db00811234cda54ccd19de39cc9cd9b82873e7d

function Tomato() {
    const [buttonActivated, setButtonActivated] = useState(false);
    const [buttonPaused, setButtonPaused] = useState(true);
    const [pauseTime, setPauseTime] = useState(false);
    const [selectPauseTime, setSelectPauseTime] = useState(5);
    const [selectStudyTime, setSelectStudyTime] = useState(30);
    const [currentSession, setCurrentSession] = useState(1);
    const [numberOfSessions, setNumberOfSessions] = useState(5);
    const [currentSecond, setCurrentSecond] = useState(selectStudyTime * 60);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [totalTime, setTotalTime] = useState("");

    useEffect(() => {
        let interval;
        if (buttonActivated && !buttonPaused) {
            interval = setInterval(() => {
                setCurrentSecond((prev) => {
                    if (prev <= 0) {
                        if (!pauseTime) {
                            setPauseTime(true);
                            setCurrentSecond(selectPauseTime * 60);
                        } else {
                            setCurrentSession((prevSession) =>
                                prevSession >= numberOfSessions ? 1 : prevSession + 1
                            );
                            setPauseTime(false);
                            setCurrentSecond(selectStudyTime * 60);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [
        buttonActivated,
        buttonPaused,
        pauseTime,
        selectStudyTime,
        selectPauseTime,
        currentSession,
        numberOfSessions,
    ]);

    function calculateCycles(totalMinutes){
        const studyTime = 35;
        const breakTime = 5;
        const cycleTime = studyTime + breakTime;

        const cycles = Math.floor(totalMinutes / cycleTime);
        const remainingTime = totalMinutes % cycleTime;

        let finalStudyTime = studyTime;
        let finalBreakTime = breakTime;
        let finalSessions = cycles;

        if (remainingTime > 0) {
            finalStudyTime = Math.min(remainingTime, studyTime);
            finalBreakTime = Math.max(remainingTime - studyTime, 0);
            finalSessions += 1;
        }

        return { studyTime: finalStudyTime, breakTime: finalBreakTime, sessions: finalSessions };
    };

    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    function handleStartPauseClick(){
        setButtonPaused(!buttonPaused);
        if (buttonPaused) {
            setButtonActivated(true);
        }
    };

    function handleResetClick(){
        setButtonActivated(false);
        setButtonPaused(true);
        setCurrentSecond(selectStudyTime * 60);
        setCurrentSession(1);
        setPauseTime(false);
    };

    function handleSkipClick(){
        if (pauseTime) {
            setPauseTime(false);
            setCurrentSecond(selectStudyTime * 60);
            setCurrentSession((prevSession) => {
                if (prevSession >= numberOfSessions) {
                    return 1; 
                }
                return prevSession + 1; 
            });
        } else {
            setPauseTime(true);
            setCurrentSecond(selectPauseTime * 60);
        }
    };


    function handleRestartCycleClick(){
        setCurrentSession(1);
        setCurrentSecond(selectStudyTime * 60); 
        setPauseTime(false); 
    };

    function handleEndCycleClick(){
        setButtonActivated(false);
        setButtonPaused(true);
        setCurrentSecond(0); 
        setCurrentSession(numberOfSessions); 
    };

    function toggleSettings(){
        setSettingsOpen(!settingsOpen);
    };

    function handleSelectChange(e){
        const { name, value } = e.target;
        if (name === 'studyTime') {
            setSelectStudyTime(Number(value));
            setCurrentSecond(Number(value) * 60);
        } else if (name === 'pauseTime') {
            setSelectPauseTime(Number(value));
        } else if (name === 'sessions') {
            setNumberOfSessions(Number(value));
        }
    };

    function handleTotalTimeChange(e){
        setTotalTime(e.target.value);
    };

    function handleStartCycles(){
        if (totalTime.trim() !== "") {
            const totalMinutes = Number(totalTime);
            if (totalMinutes > 0) {
                const { studyTime, breakTime, sessions } = calculateCycles(totalMinutes);
                setSelectStudyTime(studyTime);
                setSelectPauseTime(breakTime);
                setNumberOfSessions(sessions);
                setCurrentSecond(studyTime * 60);
                setSettingsOpen(false);
                setButtonActivated(true);
                setButtonPaused(false);
            }
        } else {
            setCurrentSecond(selectStudyTime * 60);
            setSettingsOpen(false);
            setButtonActivated(true);
            setButtonPaused(false);
        }
    };


    return (
        <div className="main">
            <div className="pom-container">
                <div className="pom-header">
                    <div className="pom-custom">
                        <button className="settings-toggle" onClick={toggleSettings}>
                            &#9776;
                        </button>
                    </div>
                </div>

                <div className="pom-content">
                    {settingsOpen ? (
                        <div className="pom-settings-content">
                            <div className="studytime-selector">
                                <label htmlFor="studyTime" className="selector-label">Tempo studio:</label>
                                <select
                                    name="studyTime"
                                    value={selectStudyTime}
                                    onChange={handleSelectChange}
                                    className="selector">
                                    {[15, 20, 25, 30, 35, 40].map((time) => (
                                        <option key={time} value={time}>{time} min</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pausetime-selector">
                                <label htmlFor="pauseTime" className="selector-label">Tempo pausa:</label>
                                <select
                                    name="pauseTime"
                                    value={selectPauseTime}
                                    onChange={handleSelectChange}
                                    className="selector">
                                    {[5, 10, 15, 20].map((time) => (
                                        <option key={time} value={time}>{time} min</option>
                                    ))}
                                </select>
                            </div>
                            <div className="sessions-selector">
                                <label htmlFor="sessions" className="selector-label">Sessioni:</label>
                                <select
                                    name="sessions"
                                    value={numberOfSessions}
                                    onChange={handleSelectChange}
                                    className="selector">
                                    {[4, 5, 6, 7, 8].map((number) => (
                                        <option key={number} value={number}>{number} sessioni</option>
                                    ))}
                                </select>
                            </div>
                            <div className="total-time-selector">
                                <label htmlFor="totalTime" className="selector-label">Tempo totale (minuti):</label>
                                <input
                                    type="number"
                                    id="totalTime"
                                    value={totalTime}
                                    onChange={handleTotalTimeChange}
                                    className="total-time-input"
                                />
                                <button onClick={handleStartCycles} disabled={buttonActivated}>Invia</button>
                            </div>

                        </div>
                    ) : (
                        <>
                            <div className="pom-sessions">
                                {`Sessione ${currentSession} di ${numberOfSessions}`}
                            </div>

                            <div className="pom-time-next">
                                <div className="time">{formatTime(currentSecond)}</div>
                            </div>
                            <div className="pom-control">
                                <button onClick={handleStartPauseClick}>
                                    {buttonPaused ? "Inizia" : "Pausa"}
                                </button>
                            </div>
                            <div className="pom-reset">
                                <button onClick={handleResetClick}>Ricomincia</button>
                            </div>
                            <div className="pom-skip">
                                <button onClick={handleSkipClick}>Salta</button>
                            </div>
                            <div className="pom-restart-cycle">
                                <button onClick={handleRestartCycleClick}>Ricomincia ciclo</button>
                            </div>
                            <div className="pom-end-cycle">
                                <button onClick={handleEndCycleClick}>Fine ciclo</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Tomato;
