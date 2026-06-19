#version 300 es
precision highp float;

in vec2 v_uv; 
uniform sampler2D u_sprite_texture;
uniform float u_sprite_bright;  

out vec4 o_color;

void main() {
    vec4 texColor = texture(u_sprite_texture, v_uv);
    
    if (texColor.a < 0.1 || (texColor.r < 0.02 && texColor.g < 0.02 && texColor.b < 0.02)) {
        discard;
    }
    o_color = vec4(texColor.rgb * u_sprite_bright, 1.0);
}