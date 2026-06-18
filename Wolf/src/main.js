import { add } from './math.js'
import { GameInit } from './game.js'

window.addEventListener("load", () => {
    console.log("abb");
    console.log(add(1, 3));

    onStart();

})

let canvas;
let gl;
let program;
let game;
let startTime;
let dmx = 0, dmy = 0;
let zoom = 1;
let isClicked = false;
let keys = {};

let frame_w = 2000;
let frame_h = 1000;

const MAP_PATH = "resources/maps/map4.png";
const WALL_PATH = "resources/textures/num_walls_2_cr.png";
const PLAYER_PATH = "resources/sprites/base_sprite.png"

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("WebGL2 isnt support");
        return false;
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    return true;
}

let shaderFs = ``;
let shaderVs = ``;

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let u_time_location;
let FrameW_location;
let FrameH_location;
let coefX_location;
let Mx_location;
let My_location;
let IsClick_location;

function initShaders() {

    const fs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const vs = getShader(shaderVs, gl.VERTEX_SHADER);

    if (!vs || !fs) {
        console.error("One of shaders hadn't compiled. Check the function <<getShader>>.");
        return;
    }

    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);

    game = GameInit(gl, program);

    u_time_location = gl.getUniformLocation(program, "u_time");
    FrameW_location = gl.getUniformLocation(program, "frame_w");
    FrameH_location = gl.getUniformLocation(program, "frame_h");
    coefX_location = gl.getUniformLocation(program, "coef_x");
    Mx_location = gl.getUniformLocation(program, "mx");
    My_location = gl.getUniformLocation(program, "my");
    IsClick_location = gl.getUniformLocation(program, "is_click");
}


let vertexBuffer;

function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [-1, 3, -1, -1, 3, -1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 1, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    if (game) {
        game.update(keys);
        game.render();
    }

    let timeFromStart = new Date().getTime() - startTime;

    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(FrameW_location, frame_w);
    gl.uniform1f(FrameH_location, frame_h);
    gl.uniform1f(coefX_location, frame_w / frame_h);
    gl.uniform1f(Mx_location, dmx);
    gl.uniform1f(My_location, dmy);
    gl.uniform1f(IsClick_location, isClicked);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

window.addEventListener("mousedown", (e) => {
    console.log("Click!");
    console.log(`Zone: (${e.x}, ${e.y})`);
    isClicked = !isClicked;
})
window.addEventListener("mouseup", (e) => {
    console.log("Up..");
    isClicked = !isClicked;
})

window.addEventListener("mousemove", (e) => {
    if (isClicked) {
        dmx += e.movementX;
        dmy -= e.movementY;
    }
})

window.addEventListener("keydown", (e) => {
    keys[e.code] = true;
})
window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
})

async function loadMapAndStart() {
    try {
        await game.init(MAP_PATH, WALL_PATH, PLAYER_PATH);
        console.log('Map loaded, size:', game.mapWidth, 'x', game.mapHeight);
        startTime = new Date().getTime();
        drawScene();
    } catch (err) {
        console.error('Map loading error:', err);
        throw err;
    }
}

function onStart() {
    canvas = document.getElementById("webgl-canvas");

    if (!initGL(canvas)) {
        return;
    }

    fetch("resources/shaders/frag.glsl")
        .then(response => response.text())
        .then(text => shaderFs = text)
        .then(() => fetch("resources/shaders/vert.glsl"))
        .then(response => response.text())
        .then(text => shaderVs = text)
        .then(() => initShaders())
        .then(() => initBuffer())
        .then(() => loadMapAndStart())
        .catch(err => console.error('Init error:', err));

}
