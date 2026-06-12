class WorldMap {
    constructor() {
        this.block_size = 0.1;
        this.text_map = ["WWWWWWWWWWWWW",
            "W...........W",
            "W...........W",
            "W...........W",
            "W...........W",
            "W...........W",
            "W...........W",
            "WWWWWWWWWWWWW"];
    }

}

export function MapInit() {
    return new WorldMap();
}
