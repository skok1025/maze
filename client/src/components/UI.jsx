import React from 'react';
import { Joystick } from 'react-joystick-component';

const UI = ({ stage, hints, activateHint, hintActive, hintTimeLeft, joystickRef }) => {
    const handleMove = (e) => {
        if (joystickRef) {
            // e.x and e.y are relative values
            joystickRef.current = { x: e.x, y: e.y };
        }
    };

    const handleStop = () => {
        if (joystickRef) {
            joystickRef.current = { x: 0, y: 0 };
        }
    };

    return (
        <div className="ui-overlay">
            <div className="stage-info">Stage: {stage}</div>
            <div className="hints-info">
                {hintActive && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '4rem',
                        color: 'yellow',
                        fontWeight: 'bold',
                        textShadow: '2px 2px 4px black',
                        pointerEvents: 'none'
                    }}>
                        {hintTimeLeft}
                    </div>
                )}
                <span style={{ marginRight: '10px' }}>Hints: {hints}</span>
                <button onClick={activateHint} disabled={hints <= 0 && !hintActive} style={{ marginLeft: '10px' }}>
                    {hintActive ? 'Stop Hint' : 'Use Hint'}
                </button>
            </div>
            <div style={{ position: 'absolute', bottom: '50px', right: '50px', pointerEvents: 'auto' }}>
                <Joystick
                    size={100}
                    sticky={false}
                    baseColor="#EEEEEE"
                    stickColor="#BBBBBB"
                    move={handleMove}
                    stop={handleStop}
                />
            </div>
        </div>
    );
};

export default UI;
