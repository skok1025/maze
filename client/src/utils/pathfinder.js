export const findPath = (start, end, mazeData, size) => {
    // A* Algorithm
    const openSet = [];
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    const startKey = `${start.x},${start.y}`;
    const endKey = `${end.x},${end.y}`;

    openSet.push(start);
    gScore.set(startKey, 0);
    fScore.set(startKey, heuristic(start, end));

    while (openSet.length > 0) {
        // Get node with lowest fScore
        let current = openSet[0];
        let lowestF = fScore.get(`${current.x},${current.y}`) || Infinity;

        for (let i = 1; i < openSet.length; i++) {
            const score = fScore.get(`${openSet[i].x},${openSet[i].y}`) || Infinity;
            if (score < lowestF) {
                lowestF = score;
                current = openSet[i];
            }
        }

        if (current.x === end.x && current.y === end.y) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.indexOf(current), 1);
        closedSet.add(`${current.x},${current.y}`);

        const neighbors = getNeighbors(current, mazeData, size);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.x},${neighbor.y}`;
            if (closedSet.has(neighborKey)) continue;

            const tentativeGScore = (gScore.get(`${current.x},${current.y}`) || 0) + 1;

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tentativeGScore >= (gScore.get(neighborKey) || Infinity)) {
                continue;
            }

            cameFrom.set(neighborKey, current);
            gScore.set(neighborKey, tentativeGScore);
            fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, end));
        }
    }

    return []; // No path found
};

const heuristic = (a, b) => {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const getNeighbors = (cell, mazeData, size) => {
    const neighbors = [];
    const { x, y } = cell;

    // Check walls to determine accessible neighbors
    if (!cell.walls.top && y > 0) neighbors.push(mazeData[y - 1][x]);
    if (!cell.walls.bottom && y < size - 1) neighbors.push(mazeData[y + 1][x]);
    if (!cell.walls.left && x > 0) neighbors.push(mazeData[y][x - 1]);
    if (!cell.walls.right && x < size - 1) neighbors.push(mazeData[y][x + 1]);

    return neighbors;
};

const reconstructPath = (cameFrom, current) => {
    const totalPath = [current];
    let key = `${current.x},${current.y}`;
    while (cameFrom.has(key)) {
        current = cameFrom.get(key);
        key = `${current.x},${current.y}`;
        totalPath.unshift(current);
    }
    return totalPath;
};
