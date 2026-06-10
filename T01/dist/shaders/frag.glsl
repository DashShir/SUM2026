#version 300 es
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
}