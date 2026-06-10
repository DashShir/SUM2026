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

const shaderFs = `#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0

uniform float u_time, frame_w, frame_h, my, mx, is_click;
uniform float fract_w, fract_h;

vec2 CmplSet( float A, float B )
{
    vec2 r;

    r.x = A;
    r.y = B;

    return r;
}

vec2 CmplAddCmpl( vec2 Z1, vec2 Z2 )
{
    vec2 r;

    r.x = Z1.x + Z2.x;
    r.y = Z1.y + Z2.y;

    return r;
}

vec2 CmplMulCmpl( vec2 Z1, vec2 Z2 )
{
    vec2 r;

    r.x = Z1.x * Z2.x - Z1.y * Z2.y;
    r.y = Z1.x * Z2.y + Z1.y * Z2.x;

    return r;
}


float CmplNorm2( vec2 Z )
{
    return Z.x * Z.x + Z.y * Z.y;
}

int Jul( vec2 Z, vec2 C )
{
    int i = 0;
    vec2 Zi = Z;

    while (i < 255 && CmplNorm2(Zi) < 4.0)
    {
        Zi = CmplAddCmpl(CmplMulCmpl(Zi, Zi), C);
        i++;
    }

    return i;
}

float Mandl( vec2 Z )
{
    float i = 0.0;
    vec2 Zi = Z;

    while (i < 255.0 && CmplNorm2(Zi) < 4.0)
    {
        Zi = CmplAddCmpl(CmplMulCmpl(Zi, Zi), Z);
        i += 1.0;
    }

    return i;
}


void main() {
    float ys = float(gl_FragCoord.y), xs = float(gl_FragCoord.x);
    float x1 = 2.0, x0 = -2.0, y1 = 2.0, y0 = -2.0;

    o_color = vec4(0, cos(u_time) * cos(u_time), 1, 1);

    float n = 0.4;
    vec2 Z1 = (gl_FragCoord.xy - vec2(mx, my)) * vec2(fract_w, fract_h) * 4.0 / vec2(frame_w, frame_h) - vec2(2.0, 2.0);
    vec2 C = vec2(0.2 + 0.5 * sin(u_time / 10.0), 0.39 + sin(u_time / 10.0 + 3.0));
    n = float(Mandl(Z1));
    n = float(Jul(Z1, C));

    o_color = vec4(n / 200.0, 0.6, 1, 1);
}`;

const shaderVs = `#version 300 es
precision highp float;

layout (location = 0) in vec2 a_pos;

void main() {
    gl_Position = vec4(a_pos, 0, 1);
}`;

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
    initShaders();
    initBuffer();

    startTime = new Date().getMilliseconds();
    drawScene();
}

window.onload = onStart;