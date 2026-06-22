import { MapInit } from './map.js'
import { TexInit } from './texture.js'
import { PlayerTexInit } from './player.js'
import { Network } from './net.js'

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

        this.playerTex = PlayerTexInit(gl);
        this.uPlayerTex = gl.getUniformLocation(program, "u_player_texture");
        this.uOtherDirections = gl.getUniformLocation(program, "u_other_directions");
        this.uOtherIsMoving = gl.getUniformLocation(program, "u_other_is_moving");

        this.map = MapInit(gl);

        this.wallTex = TexInit(gl);
        this.uWallTex = gl.getUniformLocation(program, "u_wall_texture");

        this.blockSize = this.map.block_size;

        this.mapWidth = this.map.mapWidth;
        this.mapHeight = this.map.mapHeight;

        this.coef = this.gl.canvas.width / this.gl.canvas.height;

        this.network = new Network("ws://localhost:8001");
        this.network.connect();
    }

    async init(imagePath, texPath, playerPath) {
        await this.map.loadMap(imagePath);
        await this.wallTex.loadTex(texPath);
        await this.playerTex.loadPlayer(playerPath);

        this.mapWidth = this.map.mapWidth;
        this.mapHeight = this.map.mapHeight;
        console.log('Map texture loaded:', this.map.map_tex);
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

        //this.PlayerX = Math.max(-halfMapW, Math.min(halfMapW, this.PlayerX));
        //this.PlayerY = Math.max(-halfMapH, Math.min(halfMapH, this.PlayerY));

        this.network.sendUpdate(this.PlayerX, this.PlayerY, this.PlayerAngle);
    }

    render() {
        const flatPositions = new Float32Array(20);
        const flatDirections = new Float32Array(20);
        const flatIsMoving = new Int32Array(10);
        let count = 0;

        for (const id in this.network.otherPlayers) {
            if (count >= 10) break;

            const p = this.network.otherPlayers[id];
            flatPositions[count * 2] = p.x;
            flatPositions[count * 2 + 1] = p.y;
            flatDirections[count * 2] = Math.cos(p.angle || 0);
            flatDirections[count * 2 + 1] = Math.sin(p.angle || 0);
            flatIsMoving[count] = p.isMoving ? 1 : 0;
            count++;
        }

        const uOtherPositions = this.gl.getUniformLocation(this.program, "u_other_positions");
        const uOtherCount = this.gl.getUniformLocation(this.program, "u_other_count");

        this.gl.uniform2fv(uOtherPositions, flatPositions);
        this.gl.uniform1i(uOtherCount, count);

        this.gl.uniform2fv(this.uOtherDirections, flatDirections);
        this.gl.uniform1iv(this.uOtherIsMoving, flatIsMoving);

        this.gl.uniform2f(this.uPosition, this.PlayerX, this.PlayerY);
        this.gl.uniform1f(this.uAngle, this.PlayerAngle);

        this.map.bind(0);
        this.gl.uniform1i(this.uMapTex, 0);

        this.wallTex.bind(1);
        this.gl.uniform1i(this.uWallTex, 1);

        this.playerTex.bind(2);
        this.gl.uniform1i(this.uPlayerTex, 2);

        this.gl.uniform2f(this.uMapSize, this.mapWidth, this.mapHeight);
        this.gl.uniform1f(this.uBlockSize, this.blockSize);
        this.gl.uniform1f(this.uBlockThin, this.map.block_thin);
    }
}

export function GameInit(gl, program) {
    return new Game(gl, program);
}

