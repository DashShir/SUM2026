class WorldMap {
    constructor(gl) {
        this.block_size = 0.05;
        this.block_thin = 0.0005;
        this.texture = null;
        this.loaded = false;
        this.gl = gl;
        this.collisionData = null;

    }

    async loadImage(imagePath) {
        const img = new Image();
        img.src = imagePath;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                this.mapWidth = img.width;
                this.mapHeight = img.height;
                this.mapWorldWidth = this.mapWidth * this.block_size;
                this.mapWorldHeight = this.mapHeight * this.block_size;

                this.texture = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                    this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);

                this.readCollisionData(img);

                this.loaded = true;
                resolve();
            };

            img.onerror = () => reject(new Error("Couldn't load map"));
        });

    }

    readCollisionData(img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        let wallCount = 0;
        this.collisionData = new Uint8Array(img.width * img.height);
        for (let i = 0; i < this.collisionData.length; i++) {
            const r = imageData.data[i * 4];
            const g = imageData.data[i * 4 + 1];
            const b = imageData.data[i * 4 + 2];

            if (r > 40 || g > 40 || b > 40) {
                this.collisionData[i] = 1;
                wallCount++;
            } else {
                this.collisionData[i] = 0; // Чистый черный космос — ходить можно
            }
        }
        console.log('Walls found:', wallCount, 'out of', this.collisionData.length);
    }

    worldToGrid(worldX, worldY) {
        const normX = (worldX + this.mapWorldWidth / 2) / this.mapWorldWidth;
        const normY = 1 - (worldY + this.mapWorldHeight / 2) / this.mapWorldHeight;

        const cellX = Math.floor(normX * this.mapWidth);
        const cellY = Math.floor(normY * this.mapHeight);

        return { cellX, cellY };
    }

    canMove(x, y) {
        if (!this.loaded)
            return false;

        const { cellX, cellY } = this.worldToGrid(x, y);

        if (cellX < 0 || cellX >= this.mapWidth || cellY < 0 || cellY >= this.mapHeight)
            return false;

        return this.collisionData[cellY * this.mapWidth + cellX] === 0;
    }

    bind(textureUnit = 0) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }
}

export function MapInit(gl) {
    return new WorldMap(gl);
}
