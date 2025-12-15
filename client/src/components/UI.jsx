import React from 'react';
import { Joystick } from 'react-joystick-component';

const UI = ({ stage, hints, activateHint, activeHint, hintTimeLeft, joystickRef, controlType }) => {
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

            {/* Show Joystick only if controlType is 'joystick' */}
            {controlType === 'joystick' && (
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
            )}

            {/* Show keyboard controls hint if controlType is 'keyboard' */}
            {controlType === 'keyboard' && (
                <div style={{
                    position: 'absolute',
                    bottom: '50px',
                    right: '50px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 60px)',
                    gridTemplateRows: 'repeat(2, 60px)',
                    gap: '5px'
                }}>
                    {/* Top row - only up arrow */}
                    <div></div>
                    <button
                        onTouchStart={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 1 };
                        }}
                        onTouchEnd={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        onMouseDown={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 1 };
                        }}
                        onMouseUp={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        style={{
                            width: '60px',
                            height: '60px',
                            fontSize: '24px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '2px solid #333',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        ▲
                    </button>
                    <div></div>

                    {/* Bottom row - left, down, right */}
                    <button
                        onTouchStart={() => {
                            if (joystickRef) joystickRef.current = { x: -1, y: 0 };
                        }}
                        onTouchEnd={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        onMouseDown={() => {
                            if (joystickRef) joystickRef.current = { x: -1, y: 0 };
                        }}
                        onMouseUp={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        style={{
                            width: '60px',
                            height: '60px',
                            fontSize: '24px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '2px solid #333',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        ◄
                    </button>
                    <button
                        onTouchStart={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: -1 };
                        }}
                        onTouchEnd={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        onMouseDown={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: -1 };
                        }}
                        onMouseUp={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        style={{
                            width: '60px',
                            height: '60px',
                            fontSize: '24px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '2px solid #333',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        ▼
                    </button>
                    <button
                        onTouchStart={() => {
                            if (joystickRef) joystickRef.current = { x: 1, y: 0 };
                        }}
                        onTouchEnd={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        onMouseDown={() => {
                            if (joystickRef) joystickRef.current = { x: 1, y: 0 };
                        }}
                        onMouseUp={() => {
                            if (joystickRef) joystickRef.current = { x: 0, y: 0 };
                        }}
                        style={{
                            width: '60px',
                            height: '60px',
                            fontSize: '24px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '2px solid #333',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            touchAction: 'none'
                        }}
                    >
                        ►
                    </button>
                </div>
            )}
        </div>
    );
};

export default UI;
