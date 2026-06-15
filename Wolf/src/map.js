class WorldMap {
    constructor() {
        this.block_size = 0.05;
        this.block_thin = 0.0005;
        this.text_map = ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "W........W....................................W",
            "W........W....................................W",
            "W....WW....WWWW...............................W",
            "W....WW....WWWW...............................W",
            "W........W....................................W",
            "W........W....................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "W.............................................W",
            "WWWWWWWWWW....................................W",
            "W.............................................W",
            "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"];
        this.mapWidth = this.text_map[0].length;
        this.mapHeight = this.text_map.length;

        this.mapWorldWidth = this.mapWidth * this.block_size;
        this.mapWorldHeight = this.mapHeight * this.block_size;
    }

    worldToGrid(worldX, worldY) {
        const normX = (worldX + this.mapWorldWidth / 2) / this.mapWorldWidth;
        const normY = (worldY + this.mapWorldHeight / 2) / this.mapWorldHeight;

        const cellX = Math.floor(normX * this.mapWidth);
        const cellY = Math.floor(normY * this.mapHeight);

        return { cellX, cellY };
    }

    canMove(x, y) {
        const { cellX, cellY } = this.worldToGrid(x, y);

        if (cellX < 0 || cellX >= this.mapWidth || cellY < 0 || cellY >= this.mapHeight) {
            return false;
        }

        return this.text_map[cellY][cellX] === '.';
    }


}

export function MapInit() {
    return new WorldMap();
}
