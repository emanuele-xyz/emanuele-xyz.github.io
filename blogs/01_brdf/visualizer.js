"use strict";

const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl2');
if (!gl) {
    alert("WebGL2 is not supported in this browser.");
}

// Vertex Shader
const vsSource = `#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
    `;

// Fragment Shader
const fsSource = `#version 300 es
    precision highp float;
    in vec2 v_uv;
    out vec4 outColor;
    uniform vec3 u_color;
    void main() {
      outColor = vec4(u_color, 1.0);
    }
    `;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const program = createProgram(gl, vsSource, fsSource);
gl.useProgram(program);

// Fullscreen quad vertices
const quadVertices = new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
]);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

const vbo = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

const aPositionLoc = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(aPositionLoc);
gl.vertexAttribPointer(aPositionLoc, 2, gl.FLOAT, false, 0, 0);

const uColorLoc = gl.getUniformLocation(program, 'u_color');

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255
    ];
}

let currentColor = hexToRgb(document.getElementById('color-picker').value);

// UI Event Listeners
document.getElementById('color-picker').addEventListener('input', (e) => {
    currentColor = hexToRgb(e.target.value);
    draw();
});

function draw() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.uniform3fv(uColorLoc, currentColor);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
}

draw(); // Initial render
