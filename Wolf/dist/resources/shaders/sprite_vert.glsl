#version 300 es
layout (location = 0) in vec2 a_pos;

uniform vec2 u_sprite_center;
uniform vec2 u_sprite_size;

out vec2 v_uv;
/*
void main() {
    vec2 finalPos = u_sprite_center + a_pos * u_sprite_size;
    float zDepth = (u_sprite_center.y / 10.0) * 2.0 - 1.0; 
    zDepth = clamp(zDepth, -1.0, 1.0);
    gl_Position = vec4(finalPos.x, finalPos.y, zDepth, 1.0);
    v_uv = a_pos * 0.5 + 0.5; 
}
*/
void main() {
    gl_Position = vec4(a_pos, 0, 1);
}