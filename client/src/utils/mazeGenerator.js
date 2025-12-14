export const generateMaze = (width, height) => {
    const grid = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            row.push({
                x,
                y,
                visited: false,
                walls: { top: true, right: true, bottom: true, left: true },
            });
        }
        grid.push(row);
    }

    const stack = [];
    const start = grid[0][0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current, grid, width, height);

        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }

    return grid;
};

const getUnvisitedNeighbors = (cell, grid, width, height) => {
    const neighbors = [];
    const { x, y } = cell;

    if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]); // Top
    if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]); // Right
    if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]); // Bottom
    if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]); // Left

    return neighbors;
};

const removeWalls = (a, b) => {
    const xDiff = a.x - b.x;
    const yDiff = a.y - b.y;

    if (xDiff === 1) {
        a.walls.left = false;
        b.walls.right = false;
    } else if (xDiff === -1) {
        a.walls.right = false;
        b.walls.left = false;
    }

    if (yDiff === 1) {
        a.walls.top = false;
        b.walls.bottom = false;
    } else if (yDiff === -1) {
        a.walls.bottom = false;
        b.walls.top = false;
    }
};
