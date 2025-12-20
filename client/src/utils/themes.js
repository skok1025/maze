export const THEMES = [
    {
        name: 'Forest',
        sky: '#87CEEB',
        wall: '#8B4513', wallDetail: '#5D4037', wallTexture: 'wood',
        floor: '#2E8B57', floorDetail: '#006400', floorTexture: 'noise' // Grass
    },
    {
        name: 'Desert',
        sky: '#87CEEB',
        wall: '#D2B48C', wallDetail: '#C19A6B', wallTexture: 'stone', // Sandstone
        floor: '#F4A460', floorDetail: '#DAA520', floorTexture: 'noise' // Sand
    },
    {
        name: 'Ocean',
        sky: '#B0E0E6',
        wall: '#000080', wallDetail: '#0000CD', wallTexture: 'brick', // Blue bricks
        floor: '#F0E68C', floorDetail: '#BDB76B', floorTexture: 'noise' // Sand floor
    },
    {
        name: 'Volcano',
        sky: '#FF4500',
        wall: '#8B0000', wallDetail: '#400000', wallTexture: 'stone',
        floor: '#FF8C00', floorDetail: '#FF4500', floorTexture: 'noise' // Magma
    },
    {
        name: 'City',
        sky: '#87CEEB',
        wall: '#808080', wallDetail: '#696969', wallTexture: 'brick',
        floor: '#A9A9A9', floorDetail: '#696969', floorTexture: 'tech' // Pavement/Road
    },
    {
        name: 'Ice',
        sky: '#E0FFFF',
        wall: '#ADD8E6', wallDetail: '#F0FFFF', wallTexture: 'ice',
        floor: '#F0FFFF', floorDetail: '#FFFFFF', floorTexture: 'ice'
    },
    {
        name: 'Space',
        sky: '#000000',
        wall: '#2F4F4F', wallDetail: '#00CED1', wallTexture: 'tech',
        floor: '#000000', floorDetail: '#191970', floorTexture: 'tech'
    },
    {
        name: 'Candy',
        sky: '#FFC0CB',
        wall: '#FF69B4', wallDetail: '#FF1493', wallTexture: 'brick', // Pink bricks
        floor: '#FFFACD', floorDetail: '#FFD700', floorTexture: 'noise'
    },
    {
        name: 'Crystal',
        sky: '#E0FFFF',
        wall: '#00FFFF', wallDetail: '#E0FFFF', wallTexture: 'ice',
        floor: '#7FFFD4', floorDetail: '#F0FFFF', floorTexture: 'ice'
    },
    {
        name: 'Dungeon',
        sky: '#000000',
        wall: '#696969', wallDetail: '#2F4F4F', wallTexture: 'stone',
        floor: '#2F4F4F', floorDetail: '#000000', floorTexture: 'stone'
    },
];

export const getTheme = (stage) => {
    const index = (stage - 1) % THEMES.length;
    return THEMES[index];
};
