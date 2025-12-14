import React from 'react';

const UI = ({ stage, hints, activateHint, hintActive, hintTimeLeft }) => {
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
        </div>
    );
};

export default UI;
