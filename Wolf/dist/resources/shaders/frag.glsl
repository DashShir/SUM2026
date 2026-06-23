#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

#define FRAME_W 500.0
#define FRAME_H 500.0
#define ys float(gl_FragCoord.y)
#define xs float(gl_FragCoord.x)
#define NUM_OF_RAYS 25.0
#define VIEW_ANGLE 1.302 //rad
#define MAX_OTHERS 10

uniform float u_time, frame_w, frame_h, coef_x, my, mx, is_click;

uniform vec2 u_pos;
uniform float u_angle;

uniform sampler2D u_map_tex; 
uniform sampler2D u_wall_texture;

uniform vec2 u_map_size;    
uniform float u_block_size, u_block_thin; 

uniform vec2 u_other_positions[10];
uniform vec2 u_other_directions[10];
uniform int u_other_is_moving[10];
uniform int u_other_count;  

uniform sampler2D u_player_texture;
    
struct vec6 {
    vec3 a;
    vec3 b;
};

void drawCircle(vec4 backColor, vec2 uv) {
    float r = 0.03;
    vec2 toPlayer = vec2((uv.x - u_pos.x), uv.y - u_pos.y);
    float distToPlayer = length(toPlayer);

    if (distToPlayer < r) {
        o_color = vec4(1, 1, 1, 1);
        return;
    } 
}

void drawRay(vec4 backColor, vec2 uv, float cur_angle) {
    //toPlayer = vec2((uv.x - u_pos.x) * coef_x, uv.y - u_pos.y);
    vec2 toPlayer = vec2((uv.x - u_pos.x), uv.y - u_pos.y);

    //vec2 toStaticOrigin = vec2(uv.x * coef_x, uv.y);
    vec2 toStaticOrigin = vec2(uv.x, uv.y);
    vec2 rayDir = normalize(vec2(cos(cur_angle), sin(cur_angle)));
    float scalar_projection = dot(toPlayer, rayDir);
    
    float distToRay = length(toPlayer - rayDir * scalar_projection);

    if (scalar_projection > 0.0 && distToRay < 0.0008) {
        o_color = vec4(1.0, 1.0, 0.0, 1.0); 
    }
}

vec3 getWallColor(ivec2 blockPos) {
    if (blockPos.x < 0 || float(blockPos.x) >= u_map_size.x ||
        blockPos.y < 0 || float(blockPos.y) >= u_map_size.y) {
        return vec3(0.0); 
    }
 
    vec2 uv = (vec2(blockPos) + 0.5) / u_map_size;

    return texture(u_map_tex, uv).rgb;
}

vec6 castSingleRay(vec2 start_vec, vec2 direction) {
    vec2 mapWorldSize = u_map_size * u_block_size;
    vec2 corrected_start = start_vec + mapWorldSize * 0.5;
    corrected_start.y = mapWorldSize.y - corrected_start.y;
    
    vec2 gridStart = corrected_start / u_block_size;
    int blockX = int(floor(gridStart.x));
    int blockY = int(floor(gridStart.y));
    ivec2 mapPos = ivec2(blockX, blockY);
    
    vec2 worldDirection = direction; 
    direction.y = -direction.y;

    
    vec2 deltaDist;
    deltaDist.x = 1.0 / max(abs(direction.x), 0.000001);
    deltaDist.y = 1.0 / max(abs(direction.y), 0.000001);

    ivec2 step;
    step.x = direction.x < 0.0 ? -1 : 1;
    step.y = direction.y < 0.0 ? -1 : 1;

    vec2 sideDist;
    if (direction.x < 0.0) {
        sideDist.x = (gridStart.x - float(mapPos.x)) * deltaDist.x;
    } else {
        sideDist.x = (float(mapPos.x) + 1.0 - gridStart.x) * deltaDist.x;
    } 
    if (direction.y < 0.0) {
        sideDist.y = (gridStart.y - float(mapPos.y)) * deltaDist.y;
    } else {
        sideDist.y = (float(mapPos.y) + 1.0 - gridStart.y) * deltaDist.y;
    }

    vec2 lastStep;
    int hitted = 0;
    vec3 hitColor;

    float playerRadius = 0.012; 
    
    for (int i = 0; i < 50; i++) {
        if (sideDist.x < sideDist.y) {
            sideDist.x += deltaDist.x;
            mapPos.x += step.x;
            lastStep = vec2(1.0, 0.0);
        } else {
            sideDist.y += deltaDist.y;
            mapPos.y += step.y;
            lastStep = vec2(0.0, 1.0);
        }

        vec3 curWall = getWallColor(mapPos);

        if (length(curWall) > 0.5) {
                hitted = 1;
                hitColor = curWall;
                break;
            }
    }


    if (hitted == 0) {
        return vec6(vec3(0), vec3(0, 0, -1));
    }

    float t;
    float wallX;
    int side; 

    if (lastStep.x > lastStep.y) {
        t = sideDist.x - deltaDist.x;
        side = 0;
        wallX = gridStart.y + t * direction.y;
    } else {
        t = sideDist.y - deltaDist.y;
        side = 1;
        wallX = gridStart.x + t * direction.x;
    }

    wallX = fract(wallX);

    vec3 a = hitColor;
    vec3 b = vec3(wallX, float(side), t * u_block_size);
    return vec6(a, b);

}


vec6 getRayDist(float angle) {
    vec2 dir = vec2(cos(angle), sin(angle));
    return castSingleRay(u_pos, dir);
}

float getRayAngle() {
    float normX = (xs / frame_w) * 2.0 - 1.0;
    float delta = atan(normX * tan(VIEW_ANGLE / 2.0));
    
    float angle = u_angle - delta;
    return angle;
}

void drawOthers(vec2 uv, float corrected_dist) {
    vec2 lookDir = vec2(cos(u_angle), sin(u_angle));
    vec2 rightDir = vec2(lookDir.y, -lookDir.x);
 
    for (int j = 0; j < MAX_OTHERS; j++) {

        if (j >= u_other_count) break;

        vec2 spritePos = u_other_positions[j];
        vec2 spriteDir = u_other_directions[j];
        int spriteMovement = u_other_is_moving[j];

        vec2 dirToSprite = spritePos - u_pos;
        
        float rotX = dot(dirToSprite, lookDir);  
        float rotY = dot(dirToSprite, rightDir); 
        if (rotX > 0.05 && rotX < corrected_dist) {
            float fovScale = tan(VIEW_ANGLE * 0.5);
            float spriteScreenX = (rotY / rotX) / fovScale;
            
            float sprite_h = 0.19 / rotX * 0.9;  
            float sprite_w = (0.19 / rotX) / fovScale * 0.9;

            spriteScreenX = spriteScreenX * coef_x;
            float sprite_w_screen = sprite_w * coef_x;

            vec2 normalLook = normalize(lookDir);
            vec2 normalRight = normalize(rightDir);
            vec2 normalSpriteDir = normalize(spriteDir);

            float dotForward = dot(normalSpriteDir, normalLook);
            float dotRight = dot(normalSpriteDir, normalRight);

            float frameIndex = 0.0; 

            if (dotForward < -0.707) {
                frameIndex = 0.0; 
            } else if (dotRight < -0.707) {
                frameIndex = 1.0; 
            } else if (dotForward > 0.707) {
                frameIndex = 2.0; 
            } else if (dotRight > 0.707) {
                frameIndex = 3.0; 
            } else {
                if (abs(dotForward) > abs(dotRight)) {
                    frameIndex = (dotForward > 0.0) ? 2.0 : 0.0;
                } else {
                    frameIndex = (dotRight > 0.0) ? 3.0 : 1.0;
                }
            }
            
            float frameCount = 4.0;
            float frameWidth = 1.0 / frameCount;
            float normX = (uv.x - spriteScreenX) / sprite_w + 0.5;

            if (normX >= 0.0 && normX <= 1.0) {
                float spriteTexX = (frameIndex + normX) * frameWidth;
                float spriteTexY = -(uv.y / sprite_h) * 0.5 + 0.28;
                
                if (spriteTexY >= 0.0 && spriteTexY <= 1.0 && spriteTexX <= (frameIndex + 1.0) * frameWidth) {
                    vec4 spriteColor = texture(u_player_texture, vec2(spriteTexX, spriteTexY));
                    
                    if (spriteColor.a > 0.0) {
                        float spriteBright = clamp(0.7 / (rotX + 0.2), 0.0, 1.0);
                        o_color = vec4(mix(o_color.rgb, spriteColor.rgb * spriteBright, spriteColor.a), 1.0);
                        break; 
                    }
                }
            }
        }
       
    }
}

void drawEvironment(vec2 uv) {
    float angle = getRayAngle();
    
    vec6 rayData = getRayDist(angle);
    vec3 color = rayData.a;
    vec3 rayInfo = rayData.b;
    float dist = rayInfo.z;
    
    float corrected_dist = (dist > 0.0) ? dist * cos(angle - u_angle) : 10000.0;

    if (dist < 0.0) {
        if (uv.y > 0.0) {
            o_color = vec4(0.1, 0.1, 0.1, 1.0);
        } else {
            o_color = vec4(0.2, 0.2, 0.2, 1.0);
        }
        
    } else {

        float corrected_dist = dist * cos(angle - u_angle);

        float wall_h = 0.15 / corrected_dist;
        float bright = 1.0 - smoothstep(0.1, 0.55, corrected_dist);
        bright = clamp(0.7 / (corrected_dist + 0.2), 0.0, 1.0);
        
        if (abs(uv.y) < wall_h) {
            float texX = rayInfo.x;
            float texY = -(uv.y / wall_h) * 0.5 + 0.5; 
            texX *= 0.41;

            vec3 texColor = texture(u_wall_texture, vec2(texX, texY)).rgb;

            if (color.r > 0.5 && color.g < 0.1 && color.b < 0.1)
            {
                if (rayInfo.y > 0.5) {
                    texColor *= 0.65;
                }
                o_color = vec4(texColor * bright, 1);
            } else {
                if (rayInfo.y > 0.5) {
                    color *= 0.65;
                }
                o_color = vec4(color * bright, 1);
            }
        } else if (uv.y > wall_h) {
            o_color = vec4(0.1, 0.1, 0.1, 1);
        } else {
            o_color = vec4(0.2, 0.2, 0.2, 1);
        }
    }

    drawOthers(uv, corrected_dist);

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

    float is_wall = texture(u_map_tex, tex_uv).r + texture(u_map_tex, tex_uv).g;

    if (is_wall > 0.5) {
        o_color = vec4(texture(u_map_tex, tex_uv).r, texture(u_map_tex, tex_uv).g, texture(u_map_tex, tex_uv).b, 1.0); 
        
        vec2 inBlock = mod(mapSpace, u_block_size);
        float thickness = u_block_thin;
        if (inBlock.x < thickness || inBlock.x > u_block_size - thickness || 
            inBlock.y < thickness || inBlock.y > u_block_size - thickness) {
            o_color = vec4(0.1, 1, 0.1, 1.0); 
        }
    }
}

void drawOrientir() {
    float rad = 15.0 * 15.00;
    rad = 45.0 * 45.0;

    if (xs * xs + ys * ys < rad) {
        o_color = vec4(1.0, 0.498, 0.153, 1.0);
    }

    float dx_lt = xs;
    float dy_lt = ys - frame_h;
    if (dx_lt * dx_lt + dy_lt * dy_lt < rad) {
        o_color = vec4(0.247, 0.282, 0.800, 1.0);
    }

    float dx_rb = xs - frame_w;
    float dy_rb = ys;
    if (dx_rb * dx_rb + dy_rb * dy_rb < rad) {
        o_color = vec4(0.60, 0.85, 0.91, 1.0);
    }

    float dx_rt = xs - frame_w;
    float dy_rt = ys - frame_h;
    if (dx_rt * dx_rt + dy_rt * dy_rt < rad) {
        o_color = vec4(0.639, 0.286, 0.643, 1.0);
    }
}

void main() {
    float coeff = mod(ys, 10.0) / 10.0;
    float isAfterFiveSec = step(5.0, u_time);
    vec4 backColor = mix(vec4(coeff, 0, 0, 1), vec4(0.2, 0.2, 0.2, 1), isAfterFiveSec);

    vec2 uv =  (gl_FragCoord.xy / vec2(frame_w, frame_h)) * 2.0 - 1.0;
    uv.x *= coef_x;

    o_color = backColor;
    bool show_minimap = false; 

    if (show_minimap) {
        drawBlocks(uv);
        drawPlaneRays(backColor, uv);   
    } else {
        drawEvironment(uv); 
        drawOrientir();     
    }
}