#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0

uniform float u_time, frame_w, frame_h, my, mx, is_click;
uniform float fract_w, fract_h;

void main() {
    float ys = float(gl_FragCoord.y), xs = float(gl_FragCoord.x);
    float coeff = mod(ys, 10.0) / 10.0;
    float isAfterFiveSec = step(5.0, u_time);

    o_color = vec4(1, 0, 0, 1);
    if (u_time < 5.0)
    {
        o_color = vec4(coeff, 0, 0, 1);
    }

    o_color = mix(vec4(coeff, 0, 0, 1), vec4(1, 0, 0, 1), isAfterFiveSec);
}