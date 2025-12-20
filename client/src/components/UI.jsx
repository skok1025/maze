import React, { useState, useEffect } from 'react';
import { Joystick } from 'react-joystick-component';

const UI = ({ stage, hints, activateHint, activeHint, hintTimeLeft, joystickRef, health, setSprint }) => {
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

            {/* Health Bar */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '20px',
                width: '200px',
                height: '20px',
                backgroundColor: '#333',
                border: '2px solid white',
                borderRadius: '10px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${health}%`,
                    height: '100%',
                    backgroundColor: health > 50 ? 'lime' : health > 20 ? 'orange' : 'red',
                    transition: 'width 0.2s ease-out, background-color 0.2s'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: 'black',
                    textShadow: 'none'
                }}>
                    {health}%
                </div>
            </div>

            {/* Hint Timer Display */}
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

            {/* Hints Info and Buttons */}
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

            {/* Joystick (Always visible) */}
            <div style={{ position: 'absolute', bottom: '50px', right: '50px', pointerEvents: 'auto', display: 'flex', alignItems: 'flex-end' }}>
                {/* Run Button */}
                <button
                    onTouchStart={() => setSprint(true)}
                    onTouchEnd={() => setSprint(false)}
                    onMouseDown={() => setSprint(true)}
                    onMouseUp={() => setSprint(false)}
                    onMouseLeave={() => setSprint(false)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 0, 0, 0.5)',
                        color: 'white',
                        border: '2px solid white',
                        marginRight: '20px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        userSelect: 'none',
                        touchAction: 'none'
                    }}
                >
                    RUN
                </button>
                <Joystick
                    size={100}
                    sticky={false}
                    baseColor="#EEEEEE"
                    stickColor="#BBBBBB"
                    move={handleMove}
                    stop={handleStop}
                />
            </div>

            {/* Controls Guide (PC Only) */}
            {!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
                <div style={{
                    position: 'absolute',
                    top: '80px',
                    left: '20px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    padding: '10px',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    textAlign: 'left',
                    pointerEvents: 'none'
                }}>
                    <div style={{ marginBottom: '5px', fontWeight: 'bold', borderBottom: '1px solid #aaa', paddingBottom: '2px' }}>Controls</div>
                    <div>Move: WASD / Arrows</div>
                    <div>Run: Shift</div>
                </div>
            )}
        </div>
    );
};

export default UI;
