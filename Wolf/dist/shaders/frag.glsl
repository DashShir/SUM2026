#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0
#define ys float(gl_FragCoord.y)
#define xs float(gl_FragCoord.x)
#define NUM_OF_RAYS 25.0
#define VIEW_ANGLE 1.02 //rad

uniform float u_time, frame_w, frame_h, coef_x, my, mx, is_click;

uniform vec2 u_pos;
uniform float u_angle;

uniform sampler2D u_map_tex; 
uniform vec2 u_map_size;    
uniform float u_block_size, u_block_thin; 

vec2 ray_pos;
vec2 toPlayer;
    
void drawCircle(vec4 backColor, vec2 uv) {
    float r = 0.03;
   
    float distToPlayer = length(toPlayer);

    if (distToPlayer < r) {
        o_color = vec4(1, 1, 1, 1);
        return;
    } 
}

void drawRay(vec4 backColor, vec2 uv, float cur_angle) {
    //toPlayer = vec2((uv.x - u_pos.x) * coef_x, uv.y - u_pos.y);
    toPlayer = vec2((uv.x - u_pos.x), uv.y - u_pos.y);

    //vec2 toStaticOrigin = vec2(uv.x * coef_x, uv.y);
    vec2 toStaticOrigin = vec2(uv.x, uv.y);
    vec2 rayDir = normalize(vec2(cos(cur_angle), sin(cur_angle)));
    float scalar_projection = dot(toPlayer, rayDir);
    
    float distToRay = length(toPlayer - rayDir * scalar_projection);

    if (scalar_projection > 0.0 && distToRay < 0.0008) {
        o_color = vec4(1.0, 1.0, 0.0, 1.0); 
    }
}

float isWall(vec2 point) {
    vec2 mapWorldSize = u_map_size * u_block_size;
    vec2 worldPos = point + mapWorldSize * 0.5;
    worldPos.y = mapWorldSize.y - worldPos.y;
    vec2 uv = worldPos / mapWorldSize;

    int blockX = int(floor(worldPos.x / u_block_size));
    int blockY = int(floor(worldPos.y / u_block_size));

    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return 1.0; 
    }

    return texture(u_map_tex, uv).r;
}

float castSingleRay(vec2 start_vec, vec2 direction) {
    float stepSize = 0.004;  
    float maxDistance = 2.0; 
    
    for (float t = 0.0; t < maxDistance; t += stepSize) {
        vec2 point = start_vec + direction * t;  
        if (isWall(point) > 0.5) {            
            return t;                         
        }
    }
    return -1.0;
}


float getRayDist(float angle) {
    vec2 dir = vec2(cos(angle), sin(angle));
    return castSingleRay(u_pos, dir);
}

float getRayAngle() {
    float normX = (xs / frame_w) * 2.0 - 1.0;
    float delta = atan(normX * tan(VIEW_ANGLE / 2.0));
    
    float angle = u_angle - delta;
    return angle;
}

void drawAll(vec2 uv) {
    float angle = getRayAngle();
    float dist = getRayDist(angle);
    float corrected_dist = dist * cos(angle - u_angle);

    float wall_h = 0.05 / corrected_dist;
    float bright = 1.0 - smoothstep(0.1, 0.55, corrected_dist);
    //bright = 0.5;
    if (abs(uv.y) < wall_h) {
        o_color = vec4(0.9 * bright, 0, 0, 1);
    } else if (uv.y > wall_h) {
        o_color = vec4(0.1, 0, 0.2, 1);
    } else {
        o_color = vec4(0.1, 0.2, 0, 1);
    }

}

void drawPlaneRays(vec4 backColor, vec2 uv) {
    float startAngle = u_angle - VIEW_ANGLE * 0.5;
    float angleStep = VIEW_ANGLE / NUM_OF_RAYS;

    float cur_angle = startAngle;


    for (float i = 0.0; i < NUM_OF_RAYS; i++) {
        drawRay(backColor, uv, cur_angle);
        cur_angle += angleStep;
    }
}

void drawBlocks(vec2 uv) {
    vec2 uv_new = vec2(uv.x, - uv.y);
    vec2 mapWorldSize = u_map_size * u_block_size;
    vec2 worldPos = mapWorldSize * vec2(uv_new.x, uv_new.y) * 0.5;

    vec2 mapSpace = worldPos + mapWorldSize * 0.5;

    vec2 tex_uv = mapSpace / mapWorldSize;

    float is_wall = texture(u_map_tex, tex_uv).r;

    if (is_wall > 0.5) {
        o_color = vec4(1, 0.3, 0.3, 1.0); 
        
        vec2 inBlock = mod(mapSpace, u_block_size);
        float thickness = u_block_thin;
        if (inBlock.x < thickness || inBlock.x > u_block_size - thickness || 
            inBlock.y < thickness || inBlock.y > u_block_size - thickness) {
            o_color = vec4(0.1, 1, 0.1, 1.0); 
        }
    }
}

void main() {
    float coeff = mod(ys, 10.0) / 10.0;
    float isAfterFiveSec = step(5.0, u_time);
    vec4 backColor = mix(vec4(coeff, 0, 0, 1), vec4(0.2, 0.2, 0.2, 1), isAfterFiveSec);

    vec2 uv =  (gl_FragCoord.xy / vec2(frame_w, frame_h)) * 2.0 - 1.0;
    uv.x *= coef_x;

    o_color = backColor;
    
    //drawAllRays();
    drawAll(uv);
    //drawBlocks(uv);
    //drawRay(backColor, uv);
    drawPlaneRays(backColor, uv);
    drawCircle(backColor, uv);
    

}