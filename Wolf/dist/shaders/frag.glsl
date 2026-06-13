#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0
#define ys float(gl_FragCoord.y)
#define xs float(gl_FragCoord.x)
#define NUM_OF_RAYS 15.0
#define VIEW_ANGLE 1.22 //rad

uniform float u_time, frame_w, frame_h, coef_x, my, mx, is_click;

uniform vec2 u_pos;
uniform float u_angle;

uniform float u_map[1000];  
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
    toPlayer = vec2((uv.x - u_pos.x) * coef_x, uv.y - u_pos.y);
    
    vec2 toStaticOrigin = vec2(uv.x * coef_x, uv.y);
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
    
    int blockX = int(floor(worldPos.x / u_block_size));
    int blockY = int(floor(worldPos.y / u_block_size));

    if (blockX >= 0 && blockX < int(u_map_size.x) && blockY >= 0 && blockY < int(u_map_size.y)) {
        int mapIndex = blockY * int(u_map_size.x) + blockX;
        return step(0.5, u_map[mapIndex]);
    }    
    return 0.0;
}

float castSingleRay(vec2 origin, vec2 direction) {
    float distance = 0.0;   
    float stepSize = 0.04;  
    float maxDistance = 2.0; 
    
    for (float t = 0.0; t < maxDistance; t += stepSize) {
        vec2 point = origin + direction * t;  
        if (isWall(point) > 0.5) {            
            return t;                         
        }
    }
    return -1.0;
}

void drawAllRays() {
    float angle_view = 0.8;
    float startAngle = u_angle - angle_view * 0.5;
    float endAngle = u_angle + angle_view * 0.5;

    float verticalStripes = 1800.0;          
    float stripeWidth = frame_w / verticalStripes;

    int rayIndex = int(floor(xs / stripeWidth));
    
    float curX = xs / frame_w;
    
    float rayAngle = startAngle + curX * angle_view;
    
    float angleStep = angle_view / verticalStripes;
    rayAngle = startAngle + float(rayIndex) * angleStep;
    
    vec2 rayDirection = vec2(cos(rayAngle) * coef_x, sin(rayAngle));

    float distance = castSingleRay(u_pos, rayDirection);
    
    if (distance > 0.0) {
        float brightness = 1.0 - smoothstep(0.0, 0.5, distance);
        o_color = vec4(0.4, 0.4, 0.4, 1.0) * brightness;
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

    int blockX = int(floor(mapSpace.x / u_block_size));
    int blockY = int(floor(mapSpace.y / u_block_size));

    if (blockX >= 0 && blockX < int(u_map_size.x) && blockY >= 0 && blockY < int(u_map_size.y)) {
        int mapIndex = blockY * int(u_map_size.x) + blockX;
        float isWall = u_map[mapIndex];

        if (isWall > 0.5) {
            o_color = vec4(1, 0.3, 0.3, 1.0); 
            
            vec2 inBlock = mod(mapSpace, u_block_size);
            float thickness = u_block_thin;
            if (inBlock.x < thickness || inBlock.x > u_block_size - thickness || 
                inBlock.y < thickness || inBlock.y > u_block_size - thickness) {
                o_color = vec4(0.1, 1, 0.1, 1.0); 
            }

        }
    }
}

void main() {
    float coeff = mod(ys, 10.0) / 10.0;
    float isAfterFiveSec = step(5.0, u_time);
    vec4 backColor = mix(vec4(coeff, 0, 0, 1), vec4(0.2, 0.2, 0.2, 1), isAfterFiveSec);

    vec2 uv =  (gl_FragCoord.xy / vec2(frame_w, frame_h)) * 2.0 - 1.0;
    
    o_color = backColor;
    
    //drawAllRays();
    drawBlocks(uv);
    //drawRay(backColor, uv);
    drawPlaneRays(backColor, uv);
    drawCircle(backColor, uv);
    

}