// Shaders
let VSHADER = `
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;
    // uniform mat4 u_GlobalRotateMatrix;
    // uniform mat4 u_GlobalScaleMatrix;

    uniform mat4 u_NormalMatrix;

    varying vec3 n;
    varying vec4 worldPos;
    varying vec3 v_Color;
    varying vec3 v_Normal;

    void main() {
        v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));

        // mapping obj coord system to world coord system
        worldPos = u_ModelMatrix * vec4(a_Position, 1);

        n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz;     // Normal

        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let FSHADER = `
    precision mediump float;
    uniform vec3 u_Color;
    
    uniform vec3 u_ambientColor;
    uniform vec3 u_diffuseColor;
    uniform vec3 u_specularColor;

    uniform vec3 u_lightDirection;
    uniform vec3 u_lightLocation;
    uniform vec3 u_eyePosition;

    varying vec3 n;
    varying vec4 worldPos;
    varying vec3 v_Normal;

    uniform bool u_Flat;
    uniform bool u_NormalLighting;
    uniform bool u_LightOn;

    // uniform vec3 u_spotPosition;
    // uniform vec3 u_spotDirection;
    // uniform float u_spotCosCutoff;
    // uniform float u_spotExponent;
    // uniform vec3 u_spotColor;

    uniform vec3  u_dirLightPos;       // was u_lightDirection; now a position
    uniform float u_dirAttConst;       
    uniform float u_dirAttLin;
    uniform float u_dirAttQuad;
    uniform float u_dirRange;          // optional: max distance
    

    vec3 calcAmbient() {
        return u_ambientColor * u_Color;
    }

    vec3 calcDiffuse(vec3 l, vec3 n, vec3 dColor) {
        float nDotl = max(dot(l, n), 0.0);
        return dColor * u_Color * nDotl;
    }

    vec3 calcSpecular(vec3 r, vec3 v){
        float rDotv = max(dot(r, v), 0.0);
        float rDotvPowerS = pow(rDotv, 22.0);
        return u_specularColor * u_Color * rDotvPowerS;
    }

    void main() {
        if (u_Flat) {
            gl_FragColor = vec4(u_Color, 1.0);
            return;
        } else if (u_NormalLighting) {
            // 1) build a pure-normal color
            vec3 normalColor = (normalize(v_Normal) + 1.0) * 0.5;

            // 2) if lighting is OFF, just show normals
            if (!u_LightOn) {
                gl_FragColor = vec4(normalColor, 1.0);
                return;
            }

            // 3) otherwise compute full-lit color (same as Phong branch):
            vec3 v = normalize(u_eyePosition - worldPos.xyz);

            // — infinite directional light —
            vec3 L0    = normalize(u_lightDirection);
            vec3 diff0 = calcDiffuse(L0, n, u_diffuseColor);
            vec3 spec0 = calcSpecular(reflect(-L0, n), -v);

            // — finite directional light —
            vec3 dirToFrag = u_dirLightPos - worldPos.xyz;
            float d1        = length(dirToFrag);
            vec3  l1        = normalize(dirToFrag);
            float att1      = (d1 > u_dirRange)
                            ? 0.0
                            : 1.0/(u_dirAttConst + u_dirAttLin*d1 + u_dirAttQuad*d1*d1);
            vec3 r1         = reflect(-l1, n);
            vec3 diff1      = calcDiffuse(l1, n, u_diffuseColor) * att1;
            vec3 spec1      = calcSpecular(r1, -v)              * att1;

            // — point light —
            vec3 l2         = normalize(u_lightLocation - worldPos.xyz);
            vec3 r2         = reflect(-l2, n);
            vec3 diff2      = calcDiffuse(l2, n, u_diffuseColor);
            vec3 spec2      = calcSpecular(r2, -v);

            vec3 ambient    = calcAmbient();
            vec3 litColor   = ambient
                            + (diff0 + diff1 + diff2)
                            + (spec0 + spec1 + spec2);

            // 4) tint the lit color by your normals
            gl_FragColor = vec4(litColor * normalColor, 1.0);
            return;
        }

        // default Phong lighting when u_Flat=false and u_NormalLighting=false
        
        // view vector
        vec3 v = normalize(u_eyePosition - worldPos.xyz);

        // infinite directional (sun) light
        vec3 L0    = normalize(u_lightDirection);
        vec3 diff0 = calcDiffuse(L0, n, u_diffuseColor);
        vec3 spec0 = calcSpecular(reflect(-L0, n), -v);

        // finite directional light (now positional)
        vec3 dirToFrag = u_dirLightPos - worldPos.xyz;
        float d1        = length(dirToFrag);
        vec3  l1        = normalize(dirToFrag);
        float att1;
        if (d1 > u_dirRange) {
            att1 = 0.0;
        } else {
            att1 = 1.0 / (u_dirAttConst + u_dirAttLin * d1 + u_dirAttQuad * d1 * d1);
        }
        vec3 r1        = reflect(-l1, n);
        vec3 diffuse1 = calcDiffuse(l1, n, u_diffuseColor) * att1;
        vec3 spec1    = calcSpecular(r1, -v)              * att1;

        // point light
        vec3 l2        = normalize(u_lightLocation - worldPos.xyz);
        vec3 r2        = reflect(-l2, n);
        vec3 diffuse2 = calcDiffuse(l2, n, u_diffuseColor);
        vec3 spec2    = calcSpecular(r2, -v);

        // ambient term
        vec3 ambient   = calcAmbient();

        // combine all contributions
        vec3 v_Color = ambient
                     + (diff0    + diffuse1 + diffuse2)
                     + (spec0    + spec1    + spec2);

        gl_FragColor = vec4(v_Color, 1.0);
    }`;

let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

let models = [];

let lightDirection = new Vector3([0.5, 0.5, 0.5]);
let lightLocation = new Vector3([0.0, 0.5, 1.0]);
let lightRotation = new Matrix4().setRotate(1, 0, 1, 0);
let spotLocation = new Vector3([0.0, 4.0, 0.0])

const sunPos   = [ 1.0, 1.0, 1.0 ];  // box center
const sunRange =  8.0;               // light reaches ~8 units
const c = 1.0, l = 0.09, q = 0.032;   // attenuation terms


// uniform locations
let u_ModelMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;

let u_NormalMatrix = null;
let u_Color = null;
let u_ambientColor = null;
let u_diffuseColor= null;
let u_specularColor = null;

let u_lightPosition = null;
let u_lightLocation = null;
let u_lightDirection = null;
let u_eyePosition = null;

let u_dirLightPos  = null;
let u_dirAttConst   = null;
let u_dirAttLin     = null;
let u_dirAttQuad    = null;
let u_dirRange      = null;

let u_Flat = null;
let u_NormalLighting = null;
let u_LightOn = null;

// key variables
const keys = { 
    forward: false, 
    back: false, 
    left: false, 
    right: false, 
    up: false, 
    down: false
};
let camera;

// globals
let g_flat = false;
let g_normalLighting = false;
let g_lightOn = true;
let g_pointAnimation = false;
let g_diffuseColor = [0.8, 0.8, 0.8, 1];
let g_specularColor = [1.0, 1.0, 1.0, 1];

//  time variables
let lastTime = performance.now();
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;


function setupWebGL(){
    // retrieve the canvas tag from html document
    canvas = document.getElementById("webgl");

    // get the rendering context for 3D drawing for webgl
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // clear screen
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
    // compiling both shaders and sending them to the GPU
    if (!initShaders(gl, VSHADER, FSHADER)) {
        console.log("Failed to initialize shaders");
        return -1;
    }

    // retrieve uniforms from shaders
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location u_ModelMatrix');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    if (!u_ViewMatrix){
        console.log('Failed to get the storage location u_ViewMatrix');
        return;
    }
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    if (!u_ProjMatrix){
        console.log('Failed to get the storage location u_ProjMatrix');
        return;
    }
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    if (!u_NormalMatrix){
        console.log('Failed to get the storage location u_NormalMatrix');
        return;
    }

    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    if (!u_Color){
        console.log('Failed to get the storage location u_Color');
        return;
    }
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor"); 
    if (!u_ambientColor){
        console.log('Failed to get the storage location u_ambientColor');
        return;
    }
    u_diffuseColor = gl.getUniformLocation(gl.program, "u_diffuseColor");
    if (!u_diffuseColor){
        console.log('Failed to get the storage location u_diffuseColor');
        return;
    }
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    if(!u_specularColor){
        console.log('Failed to get the storage location u_specularColor');
        return;
    }

    // u_lightDirection = gl.getUniformLocation(gl.program, "u_lightDirection");
    // if(!u_lightDirection){
    //     console.log('Failed to get the storage location u_lightDirection');
    //     return;
    // }
    u_eyePosition = gl.getUniformLocation(gl.program, "u_eyePosition");
    if (!u_eyePosition){
        console.log('Failed to get the storage location u_eyePosition');
        return;
    }
    u_lightLocation = gl.getUniformLocation(gl.program, "u_lightLocation");
    if (!u_lightLocation){
        console.log('Failed to get the storage location u_lightLocation');
        return;
    }
    // after you get u_lightLocation, etc…
    u_dirLightPos   = gl.getUniformLocation(gl.program, 'u_dirLightPos');
    u_dirAttConst   = gl.getUniformLocation(gl.program, 'u_dirAttConst');
    u_dirAttLin     = gl.getUniformLocation(gl.program, 'u_dirAttLin');
    u_dirAttQuad    = gl.getUniformLocation(gl.program, 'u_dirAttQuad');
    u_dirRange      = gl.getUniformLocation(gl.program, 'u_dirRange');

    
    u_Flat = gl.getUniformLocation(gl.program, "u_Flat");
    if (!u_Flat) {
        console.log('Failed to get the storage location u_Flat');
        return;
    }

    u_NormalLighting = gl.getUniformLocation(gl.program, "u_NormalLighting");
    if (!u_NormalLighting) {
        console.log('Failed to get the storage location u_NormalLighting');
        return;
    }

    u_LightOn = gl.getUniformLocation(gl.program, "u_LightOn");
}

// Handle raw mouse deltas for yaw & ptich
function onMouseMove(e) {
  const dx = e.movementX;
  const dy = e.movementY;
  const sensitivity = 0.15;
  camera.yaw( -dx * sensitivity );
  camera.pitch(-dy * sensitivity);
}


function addActionsForHTMLUI(){
    
    // diffuse color generators
    [['R','0'], ['G','1'], ['B','2']].forEach(([ch, idx]) => {
        const slider  = document.getElementById('diffuse'+ch);
        const display = document.getElementById('diffuse'+ch+'Display');
        slider.addEventListener('input', () => {
            g_diffuseColor[idx] = parseFloat(slider.value);
            display.textContent = slider.value;
        });
    });
    
    // specular color generators
    [['R','0'], ['G','1'], ['B','2']].forEach(([ch, idx]) => {
        const slider  = document.getElementById('specular'+ch);
        const display = document.getElementById('specular'+ch+'Display');
        slider.addEventListener('input', () => {
            g_specularColor[idx] = parseFloat(slider.value);
            display.textContent = slider.value;
        });
    });

    window.addEventListener("keydown", e => {
        // let speed = 1.0;

        switch (e.key) {
            case "w":   keys.forward  = true; break;
            case "s":   keys.back     = true; break;
            case "a":   keys.left     = true; break;
            case "d":   keys.right      = true; break;
        }
    });

    // keyup listener
    window.addEventListener("keyup", e => {
        switch(e.key) {
            case 'w': keys.forward  = false; break;
            case 's': keys.back     = false; break;
            case 'a': keys.left     = false; break;
            case 'd': keys.right    = false; break;      
        }
    });

    // lock pointer
    canvas.addEventListener('click', () =>  canvas.requestPointerLock());
    canvas.addEventListener('mouseup', () => isDragging = false);

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === canvas) {
            // Locked -> start listening to raw mouse movements
            document.addEventListener('mousemove', onMouseMove, false);
        } else {
            // Unlocked -> stop listening
            document.removeEventListener('mousemove', onMouseMove, false);
        }
    }, false);

    // animation buttons
    // document.getElementById('ambientOn').onclick = () => {g_ambientOn = true;};
    // document.getElementById('ambientOff').onclick = () => {g_ambientOn = false;};
    // document.getElementById('diffuseOn').onclick = () => {g_diffuseOn = true;};
    // document.getElementById('diffuseOff').onclick = () => {g_diffuseOn = false;};
    // document.getElementById('specularOn').onclick = () => {g_specularOn = true;};
    // document.getElementById('specularOff').onclick = () => {g_specularOn = false;};

    // document.getElementById('lightingOn').onclick = () => {
    //     g_flat = true;
    //     g_normalLighting = false;
    // };
    // document.getElementById('lightingOff').onclick = () => {
    //     g_flat = false;
    //     g_normalLighting = true;
    // };

    document.getElementById('phongMode').onclick = () => {
        g_flat = false;
        g_normalLighting = false;
    };
    document.getElementById('flatMode').onclick = () => {
        g_flat = true;
        g_normalLighting = false;
    };
    document.getElementById('normalMode').onclick = () => {
        g_flat = false;
        g_normalLighting = true;
    };
    

    document.getElementById('pointAnimateOn').onclick = () => {g_pointAnimation = true;};
    document.getElementById('pointAnimateOff').onclick = () => {g_pointAnimation = false};

    document.getElementById('lightOn').onclick  = () => { g_lightOn = true; };
    document.getElementById('lightOff').onclick = () => { g_lightOn = false; };
}

function drawModel(model) {
    // update model matrix combining translate, rotate and scale from cube
    modelMatrix.setIdentity();

    modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

    // apply rotations for this part of the animal
    modelMatrix.rotate(model.rotate[0], 1, 0, 0);
    modelMatrix.rotate(model.rotate[1], 0, 1, 0);
    modelMatrix.rotate(model.rotate[2], 0, 0, 1);

    modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    // Compute normal matrix N_mat = (M^-1).T
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    // set u_color variable from fragment shader
    gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

    // send vertices and indices from model to the shaders
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normals), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

    // gl.unifom3f(u_Color, 0, 0, 0)

    //gl.drawElements(gl.LINE_LOOP, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function initBuffer(attributeName, n) {
    let shaderBuffer = gl.createBuffer();
    if (!shaderBuffer) {
        console.log("can't create shaderBuffer");
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attributeName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
    
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    g_seconds = performance.now()/1000.0 - g_startTime; // seconds elapsed
    lastTime = now;

    const time = Date.now() * .001;
    g_prevTime = time;
    const dt = time - g_prevTime;
    const walkSpeed = 5;      // units per second

    if (keys.forward)   camera.forward( walkSpeed * delta );
    if (keys.back)      camera.back( walkSpeed * delta );
    if (keys.left)      camera.left( walkSpeed * delta );
    if (keys.right)     camera.right( walkSpeed * delta );

    if (g_pointAnimation){
        lightLocation = lightRotation.multiplyVector3(lightLocation);
    }
    
    gl.uniform3fv(u_lightLocation, lightLocation.elements);
    pointLightSphere.setTranslate(lightLocation.elements[0], lightLocation.elements[1], lightLocation.elements[2]);
    
    // update eye position to the shader
    gl.uniform3f(
        u_eyePosition, 
        camera.eye.elements[0], 
        camera.eye.elements[1], 
        camera.eye.elements[2]
    );

    const V = camera.getViewMatrix();
    gl.uniformMatrix4fv(u_ViewMatrix, false, V.elements);

    const aspect = canvas.width / canvas.height;
    const P = camera.getProjMatrix(aspect);
    gl.uniformMatrix4fv(u_ProjMatrix, false, P.elements);

    // // update view matrix in the shader
    // gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

    // // update projection matrix in the shader
    // gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);
    
    gl.uniform1i(u_Flat, g_flat ? 1 : 0);
    gl.uniform1i(u_NormalLighting, g_normalLighting ? 1 : 0);
    gl.uniform1i(u_LightOn, g_lightOn ? 1 : 0); 
    gl.uniform3f(u_diffuseColor, g_diffuseColor[0], g_diffuseColor[1], g_diffuseColor[2]);
    gl.uniform3f(u_specularColor, g_specularColor[0], g_specularColor[1], g_specularColor[2]);
    // gl.uniform3fv(u_lightLocation, lightLocation.elements);

    for (let m of models) {
        drawModel(m);
    }
    
    requestAnimationFrame(draw);
}


function addModel(color, shapeType) {
    let model = null;
    switch(shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "sphere":
            model = new Sphere(color);
            break;
    }
    if (model) {
        models.push(model);
    }

    return model;
}


function main() {
    
    setupWebGL();
    
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    connectVariablesToGLSL();

    // set camera data
    camera = new Camera();
    
    // initialize buffers
    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("can't create buffer");
        return -1;
    }

    // position the “sun” inside the box:
    gl.uniform3fv(u_dirLightPos,   sunPos);
    gl.uniform1f(u_dirAttConst,    c);
    gl.uniform1f(u_dirAttLin,      l);
    gl.uniform1f(u_dirAttQuad,     q);
    gl.uniform1f(u_dirRange,       sunRange);


    // set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor, g_diffuseColor[0], g_diffuseColor[1], g_diffuseColor[2]);
    gl.uniform3f(u_specularColor, g_specularColor[0], g_specularColor[1], g_specularColor[2]);
    gl.uniform3fv(u_lightDirection, lightDirection.elements); 
    gl.uniform3fv(u_lightLocation, lightLocation.elements);

    let skybox = addModel([1, 1, 1], "cube");
    skybox.setScale(-5, -5, -5);
    skybox.setTranslate(0, 4, 0);

    // draw 3 main shapes
    let n = 3;
    for (let i = -n/2; i < n/2; i++){
        let r = Math.random();
        let g = Math.random();
        let b = Math.random();

        let cube = addModel([r, g, b], "cube");
        cube.setScale(0.5, 0.5, 0.5);
        cube.setTranslate(2*i+ 1.0, -0.5, 0.0);

        let sphere = addModel([r, g, b], "sphere");
        sphere.setScale(0.5, 0.5, 0.5);
        sphere.setTranslate(2*i+1.0, 0.5, 0.0);
    }    

    pointLightSphere = new Sphere([1.0, 1.0, 1.0]); 
    pointLightSphere.setScale(0.1, 0.1, 0.1);
    pointLightSphere.setTranslate(lightLocation);

    models.push(pointLightSphere);
    
    addActionsForHTMLUI();

    draw();
}


