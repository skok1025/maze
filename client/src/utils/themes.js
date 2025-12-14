export const THEMES = [
    { floor: '#88cc88', wall: '#228822', sky: '#ccffcc', name: 'Forest' },
    { floor: '#ccaa88', wall: '#884422', sky: '#ffeecc', name: 'Desert' },
    { floor: '#8888cc', wall: '#222288', sky: '#ccccff', name: 'Ocean' },
    { floor: '#cc8888', wall: '#882222', sky: '#ffcccc', name: 'Volcano' },
    { floor: '#cccccc', wall: '#444444', sky: '#eeeeee', name: 'City' },
    { floor: '#eeeeee', wall: '#88ccff', sky: '#ffffff', name: 'Ice' },
    { floor: '#444444', wall: '#aaaaaa', sky: '#000022', name: 'Space' },
    { floor: '#cc88cc', wall: '#882288', sky: '#ffccff', name: 'Candy' },
    { floor: '#88cccc', wall: '#228888', sky: '#ccffff', name: 'Crystal' },
    { floor: '#aaaaaa', wall: '#000000', sky: '#333333', name: 'Dungeon' },
];

export const getTheme = (stage) => {
    const index = (stage - 1) % THEMES.length;
    return THEMES[index];
};
