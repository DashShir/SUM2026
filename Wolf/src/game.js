import { MapInit } from './map.js'

class Game {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.PlayerX = 0.0;
        this.PlayerY = 0.0;
        this.PlayerAngle = 0.0;
        this.PlayerSpeed = 0.002;
        this.PlayerRotSpeed = 0.0351;

        this.uPosition = gl.getUniformLocation(program, "u_pos");
        this.uAngle = gl.getUniformLocation(program, "u_angle");

        this.uMapTex = gl.getUniformLocation(program, "u_map_tex");
        this.uMapSize = gl.getUniformLocation(program, "u_map_size");
        this.uBlockSize = gl.getUniformLocation(program, "u_block_size");
        this.uBlockThin = gl.getUniformLocation(program, "u_block_thin");

        this.map = MapInit(gl);

        this.blockSize = this.map.block_size;

        this.mapWidth = this.map.mapWidth;
        this.mapHeight = this.map.mapHeight;

        this.coef = this.gl.canvas.width / this.gl.canvas.height;


    }

    async init(imagePath = 'maps/map2.png') {
        await this.map.loadImage(imagePath);
        this.mapWidth = this.map.mapWidth;
        this.mapHeight = this.map.mapHeight;
        console.log('Texture loaded:', this.map.texture);
        console.log('Map size:', this.mapWidth, this.mapHeight);
    }



    update(keys) {

        if (keys['ArrowLeft']) this.PlayerAngle += this.PlayerRotSpeed;
        if (keys['ArrowRight']) this.PlayerAngle -= this.PlayerRotSpeed;

        const dirX = Math.cos(this.PlayerAngle);
        const dirY = Math.sin(this.PlayerAngle);

        if (keys['ArrowUp']) {
            const nextX = this.PlayerX + dirX * this.PlayerSpeed;
            const nextY = this.PlayerY + dirY * this.PlayerSpeed;

            if (this.map.canMove(nextX, this.PlayerY)) {
                this.PlayerX = nextX;
            }
            if (this.map.canMove(this.PlayerX, nextY)) {
                this.PlayerY = nextY;
            }
        }

        if (keys['ArrowDown']) {
            const nextX = this.PlayerX - dirX * this.PlayerSpeed;
            const nextY = this.PlayerY - dirY * this.PlayerSpeed;

            if (this.map.canMove(nextX, this.PlayerY)) {
                this.PlayerX = nextX;
            }
            if (this.map.canMove(this.PlayerX, nextY)) {
                this.PlayerY = nextY;
            }
        }

        const halfMapW = (this.mapWidth * this.blockSize) / 2;
        const halfMapH = (this.mapHeight * this.blockSize) / 2;

        this.PlayerX = Math.max(-halfMapW, Math.min(halfMapW, this.PlayerX));
        this.PlayerY = Math.max(-halfMapH, Math.min(halfMapH, this.PlayerY));


    }

    render() {
        this.gl.uniform2f(this.uPosition, this.PlayerX, this.PlayerY);
        this.gl.uniform1f(this.uAngle, this.PlayerAngle);

        this.map.bind(0);
        this.gl.uniform1i(this.uMapTex, 0);

        this.gl.uniform2f(this.uMapSize, this.mapWidth, this.mapHeight);
        this.gl.uniform1f(this.uBlockSize, this.blockSize);
        this.gl.uniform1f(this.uBlockThin, this.map.block_thin);
    }
}

export function GameInit(gl, program) {
    return new Game(gl, program);
}

