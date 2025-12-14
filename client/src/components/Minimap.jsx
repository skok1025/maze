import React from 'react';

const CELL_SIZE = 2;

const Minimap = ({ mazeData, size, playerPos }) => {
    // Calculate player grid position
    const floorSize = size * CELL_SIZE;
    const offset = (floorSize / 2) - (CELL_SIZE / 2);
    const gridX = Math.round((playerPos.x + offset) / CELL_SIZE);
    const gridY = Math.round((playerPos.z + offset) / CELL_SIZE);

    return (
        <div className="minimap" style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '200px',
            height: '200px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: '2px solid white',
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
            padding: '5px'
        }}>
            {mazeData.map((row, y) => (
                row.map((cell, x) => {
                    const isPlayer = x === gridX && y === gridY;
                    const isExit = x === size - 1 && y === size - 1;

                    let backgroundColor = 'transparent';
                    let borderRadius = '0%';
                    let boxShadow = 'none';
                    let transform = 'none';

                    if (isPlayer) {
                        backgroundColor = 'red';
                        borderRadius = '50%';
                        boxShadow = '0 0 5px 2px white';
                        transform = 'scale(1.2)';
                    }
                    else if (isExit) backgroundColor = 'green';

                    // Walls borders
                    const borderTop = cell.walls.top ? '1px solid white' : 'none';
                    const borderRight = cell.walls.right ? '1px solid white' : 'none';
                    const borderBottom = cell.walls.bottom ? '1px solid white' : 'none';
                    const borderLeft = cell.walls.left ? '1px solid white' : 'none';

                    return (
                        <div key={`${x}-${y}`} style={{
                            backgroundColor,
                            borderRadius,
                            boxShadow,
                            transform,
                            borderTop,
                            borderRight,
                            borderBottom,
                            borderLeft,
                            boxSizing: 'border-box',
                            zIndex: isPlayer ? 10 : 1
                        }} />
                    );
                })
            ))}
        </div>
    );
};

export default Minimap;
