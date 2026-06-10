import { add } from './math.js'
import { Pane } from 'tweakpane'


window.addEventListener("load", () => {
    const params = {
        factor: 30,
        title: "rollup test",
        color: "#e51a00"
    }

    const pane = new Pane();
    pane.addBinding(params, "factor");
    pane.addBinding(params, "title");
    pane.addBinding(params, "color");

    console.log("abb");
    console.log(add(1, 3));

    onStart();

    setInterval(() => {
        const str = JSON.stringify(params);
        console.log(str);

        /*
        try {
            const obj = JSON.parse("xyz");
        } catch (err) {
            console.log(err);
        }
        */
    }, 1000)
})

let gl;
let startTime;
let dmx = 0, dmy = 0;
let zoom = 1;
let isClicked = false;

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
let Mx_location;
let My_location;
let IsClick_location;
let FractW_location;
let FractH_location;

function initShaders() {

    const fs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const vs = getShader(shaderVs, gl.VERTEX_SHADER);

    if (!vs || !fs) {
        console.error("One of shaders hadn't compiled. Check the function <<getShader>>.");
        return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);

    u_time_location = gl.getUniformLocation(program, "u_time");
    FrameW_location = gl.getUniformLocation(program, "frame_w");
    FrameH_location = gl.getUniformLocation(program, "frame_h");
    Mx_location = gl.getUniformLocation(program, "mx");
    My_location = gl.getUniformLocation(program, "my");
    IsClick_location = gl.getUniformLocation(program, "is_click");
    FractW_location = gl.getUniformLocation(program, "fract_w");
    FractH_location = gl.getUniformLocation(program, "fract_h");
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

    let timeFromStart = new Date().getMilliseconds() - startTime;
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(FrameW_location, 2000);
    gl.uniform1f(FrameH_location, 1000);
    gl.uniform1f(Mx_location, dmx);
    gl.uniform1f(My_location, dmy);
    gl.uniform1f(IsClick_location, isClicked);
    gl.uniform1f(FractW_location, 1);
    gl.uniform1f(FractH_location, 0.5);

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

function onStart() {
    let canvas = document.getElementById("webgl-canvas");

    canvas.onmousemove = (ev) => {
        console.log(`(${ev.x}, ${ev.y})`);
    };

    if (!initGL(canvas)) {
        return;
    }

    fetch("shaders/frag.glsl")
        .then(response => response.text())
        .then(text => shaderFs = text)
        .then(() => fetch("shaders/vert.glsl"))
        .then(response => response.text())
        .then(text => shaderVs = text)
        .then(() => initShaders())
        .then(() => initBuffer())
        .then(() => startTime = new Date().getMilliseconds())
        .then(() => drawScene());

}

window.onload = onStart;