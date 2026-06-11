#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0

uniform float u_time, frame_w, frame_h, my, mx, is_click;

uniform vec2 u_pos;
uniform float u_angle;

vec2 ray_pos;

void main() {
    float r = 0.03;
    
    float ys = float(gl_FragCoord.y), xs = float(gl_FragCoord.x);
    float coeff = mod(ys, 10.0) / 10.0;
    float isAfterFiveSec = step(5.0, u_time);

    vec4 backColor = mix(vec4(coeff, 0, 0, 1), vec4(0.2, 0.2, 0.2, 1), isAfterFiveSec);
    
    float coef_x = frame_w / frame_h; 
    vec2 uv =  (gl_FragCoord.xy / vec2(frame_w, frame_h)) * 2.0 - 1.0;
    
    vec2 toPlayer = vec2((uv.x - u_pos.x) * coef_x, uv.y - u_pos.y);
    float distToPlayer = length(toPlayer);

    if (distToPlayer < r) {
        o_color = vec4(1, 1, 1, 1);
        return;
    } 
    
    vec2 toStaticOrigin = vec2(uv.x * coef_x, uv.y);
    vec2 rayDir = normalize(vec2(cos(u_angle) * coef_x, sin(u_angle)));
    float scalar_projection = dot(toPlayer, rayDir);
    
    float distToRay = length(toPlayer - rayDir * scalar_projection);

    if (scalar_projection > 0.0 && distToRay < 0.008) {
        o_color = vec4(1.0, 1.0, 0.0, 1.0); 
        
    } else {
        o_color = backColor; 
    }

}