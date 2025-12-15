import React from 'react';
import { Joystick } from 'react-joystick-component';

const UI = ({ stage, hints, activateHint, activeHint, hintTimeLeft, joystickRef }) => {
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
            {activeHint && (
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
            <div className="hints-info" style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '10px' }}>Hints: {hints}</span>
                <button
                    onClick={() => activateHint('minimap')}
                    disabled={hints <= 0 && !activeHint || (activeHint && activeHint !== 'minimap')}
                    style={{ marginLeft: '10px' }}
                >
                    {activeHint === 'minimap' ? 'Stop Map' : 'Map'}
                </button>
                <button
                    onClick={() => activateHint('zoomout')}
                    disabled={hints <= 0 && !activeHint || (activeHint && activeHint !== 'zoomout')}
                    style={{ marginLeft: '10px' }}
                >
                    {activeHint === 'zoomout' ? 'Stop Zoom' : 'Zoom'}
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
