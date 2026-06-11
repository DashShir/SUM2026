class Game {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;

        this.PlayerX = 0.0;
        this.PlayerY = 0.0;
        this.PlayerAngle = 0.0;
        this.PlayerSpeed = 0.02;
        this.PlayerRotSpeed = 0.07;

        this.uPosition = gl.getUniformLocation(program, "u_pos");
        this.uAngle = gl.getUniformLocation(program, "u_angle");
    }

    countRay() {
        const coef = this.gl.canvas.width / this.gl.canvas.height;

        this.screenMinX = -coef;
        this.screenMaxX = coef;

        this.screenMinY = -1.0;
        this.screenMaxY = 1.0;

        const dirX = Math.cos(this.PlayerAngle);
        const dirY = Math.sin(this.PlayerAngle);

        let tMinX = (this.screenMinX - this.PlayerX) / dirX;
        let tMaxX = (this.screenMaxX - this.PlayerX) / dirX;

        let tMinY = (this.screenMinY - this.PlayerY) / dirY;
        let tMaxY = (this.screenMaxY - this.PlayerY) / dirY;

        if (tMinX > tMaxX) [tMinX, tMaxX] = [tMaxX, tMinX];
        if (tMinY > tMaxY) [tMinY, tMaxY] = [tMaxY, tMinY];

        let tX;
        if (tMinX < 0)
            tX = tMaxX;
        else
            tX = tMinX;

        let tY;
        if (tMinY < 0)
            tY = tMaxY;
        else
            tY = tMinY;

        let tHit = Math.min(tX, tY);

        const hitX = this.PlayerX + dirX * tHit;
        const hitY = this.PlayerY + dirY * tHit;

        return [hitX, hitY];
    }

    update(keys) {
        const [hitX, hitY] = this.countRay();
        const moveX = Math.cos(this.PlayerAngle);
        const moveY = Math.sin(this.PlayerAngle)


        if (keys['ArrowUp']) {
            this.PlayerX += this.PlayerSpeed * moveX;
            this.PlayerY += this.PlayerSpeed * moveY;
        }

        if (keys['ArrowDown']) {
            this.PlayerX -= this.PlayerSpeed * moveX;
            this.PlayerY -= this.PlayerSpeed * moveY;
        }

        if (keys['ArrowLeft']) this.PlayerAngle += this.PlayerRotSpeed;
        if (keys['ArrowRight']) this.PlayerAngle -= this.PlayerRotSpeed;

        this.PlayerX = Math.max(-1.0, Math.min(1.0, this.PlayerX));
        this.PlayerY = Math.max(-1.0, Math.min(1.0, this.PlayerY));

    }

    render() {
        this.gl.uniform2f(this.uPosition, this.PlayerX, this.PlayerY);
        this.gl.uniform1f(this.uAngle, this.PlayerAngle);

    }
}

export function GameInit(gl, program) {
    return new Game(gl, program);
}

