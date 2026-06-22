class WallTex {
    constructor(gl) {
        this.wall_tex = null;
        this.loaded = false;
        this.gl = gl;
    }

    async loadTex(texPath) {
        const img = new Image();
        img.src = texPath;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                this.texWidth = img.width;
                this.texHeight = img.height;

                this.wall_tex = this.gl.createTexture();
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.wall_tex);

                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
                    this.gl.RGBA, this.gl.UNSIGNED_BYTE, img);

                this.loaded = true;
                resolve();
            };

            img.onerror = () => reject(new Error("Couldn't load walls"));
        });

    }

    bind(textureUnit = 1) {
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.wall_tex);
    }
}
export function TexInit(gl) {
    return new WallTex(gl);
}
