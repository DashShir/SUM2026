class WorldMap {
    constructor() {
        this.block_size = 0.05;
        this.block_thin = 0.0005;
        this.text_map = ["WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
            "W........W....................................W",
            "W........W....................................W",
            "W....WW....WWWW...............................W",
            "W....WW....WWWW....W.....W.....W......W.......W",
            "W........W....................................W",
            "W........W....................................W",
            "W....WW....WWWW...............................W",
            "W.....................W.....W.....W......W....W",
            "W........W....................................W",
            "W........W....................................W",
            "W....WW....WWWW...............................W",
            "W.....................W.....W.....W......W....W",
            "W....WW....WWWW....W.....W.....W......W.......W",
            "W....WW....WWWW....W.....W.....W......W.......W",
            "WWWWW...WW..........W.....W.....W......W......W",
            "W.............................................W",
            "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW"];
        this.mapWidth = this.text_map[0].length;
        this.mapHeight = this.text_map.length;

    }

    canMove(x, y, coef) {
        const sc_mapW = this.mapWidth * this.block_size;
        const sc_mapH = this.mapHeight * this.block_size;

        const gridX = (x * sc_mapW / 2) + sc_mapW / 2;
        const gridY = (y * sc_mapH / 2) + sc_mapH / 2;

        const cellX = Math.floor(gridX / this.block_size);
        const cellY = this.mapHeight - 1 - Math.floor(gridY / this.block_size);

        if (cellX < 0 || cellX >= this.mapWidth || cellY < 0 || cellY >= this.mapHeight) {
            return false;
        }
        return this.text_map[cellY][cellX] === '.';
    }

    countCollision(x, y, ray_angle) {

    }

}

export function MapInit() {
    return new WorldMap();
}
