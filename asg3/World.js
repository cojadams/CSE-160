// Vertex shader program
var VSHADER_SOURCE =`
precision mediump float;
attribute vec4 a_Position;
attribute vec2 a_UV;
attribute vec4 a_VertexColor;   // NEW
varying vec2 v_UV;
varying vec4 v_Color;           // NEW
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
uniform mat4 u_GlobalScaleMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_GlobalScaleMatrix * u_ModelMatrix * a_Position ;
    v_UV = a_UV;
    v_Color = a_VertexColor;
}`

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -3){                      // true per-vertext enterpolation
        gl_FragColor = v_Color;                     

    }else if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;                 // Use color

    } else if (u_whichTexture == -1) {              // Use UV debug color
        gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {               // Use texture0
        gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_whichTexture == 1) {               // use texture1
        gl_FragColor = texture2D(u_Sampler1, v_UV);

    } else if (u_whichTexture == 2) {               // use texture2
        gl_FragColor = texture2D(u_Sampler2, v_UV);

    } else if (u_whichTexture == 3) {               // use texture3
        gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else if (u_whichTexture == 4){                // use texture4
        gl_FragColor = texture2D(u_Sampler4, v_UV);

    } else if (u_whichTexture == 5){                // use texture5
        gl_FragColor = texture2D(u_Sampler5, v_UV);

    }else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1);        // Error, put redish
    }

}`

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// key variables
const keys = { forward: false, back: false, left: false, right: false, up: false, down: false};

// Global Variable
let canvas;
let gl;
let a_Position;
let a_VertexColor;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_GlobalScaleMatrix;
let u_whichTexture;
var g_shapesList = [];
const obstacles = [];
var g_walkAnimation = true;
let g_walkAngle1 = 180;
let g_walkAngle2 = 180;
let g_armSpeed = 1;

// Textures
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;

// Globals related to UI elments
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_globalAngle=0;

// Mouse control
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_globalScale = 0;          
let previous_x = null, previous_y = null;
let g_rotation_factor = 1;

// create a global camera instance
const camera = new Camera();
let isDragging = false;
let lastX = 0, lastY = 0;
const sensitivity = 0.5;  // Degrees per pixel

// time variables
let lastTime = performance.now();
var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
// current position
let g_personPos    = [3, 0, -24];
// optional facing angle (degrees)
let g_personAngle  = 0;
// target to walk to (or null if stopped)
let g_personTarget = null;
// speed in world‑units per second
const g_personSpeed = 2.0;


function setupWebGL(){ 
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
  
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
  
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  
  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }
  gl.enableVertexAttribArray(a_Position);

  // get texture coordinates
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
      console.log("Failed to get the storage location of a_UV");
      return;
  }
  gl.enableVertexAttribArray(a_UV);

  // get the new color attribute
  a_VertexColor = gl.getAttribLocation(gl.program, 'a_VertexColor');
  if (a_VertexColor < 0) {
    console.log('Failed to get a_VertexColor');
  }
  gl.enableVertexAttribArray(a_VertexColor);

  // get the storage locatin of u_whichTexture
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of U_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // get the u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix){
      console.log("failed to get u_ViewMatrix");
      return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
      console.log('Failed to get u_ProjectionMatrix');
      return;
  }

  // get the storage location of samplers
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
      console.log('Failed to get the storage of u_Sampler0');
      return;
  }
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
      console.log('Failed to get the storage of u_Sampler1');
      return;
  }
  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
      console.log('Failed to get the storage of u_Sampler2');
      return;
  }
  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
      console.log('Failed to get the storage of u_Sampler3');
      return;
  }
  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
      console.log('Failed to get the storage of u_Sampler4');
      return;
  }
  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
      console.log('Failed to get the storage of u_Sampler5');
      return;
  }
  
  // get the storage location of u_GlobalScaleMatrix
  u_GlobalScaleMatrix = gl.getUniformLocation(gl.program, 'u_GlobalScaleMatrix');
  if(!u_GlobalScaleMatrix) {
    console.log('Failed to get the storage location of u_GlobalScaleMatrix');
    return;
  }
  
  // initialize all three matrices
  let I = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix,        false, I.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, I.elements);
  gl.uniformMatrix4fv(u_GlobalScaleMatrix,  false, I.elements);
  

  // define view and projection matrices
  let viewMatrix = new Matrix4();
  let projMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);
}


// Handle raw mouse deltas for yaw & ptich
function onMouseMove(e) {
  const dx = e.movementX;
  const dy = e.movementY;
  const sensitivity = 0.2;
  camera.yaw( -dx * sensitivity );
  camera.pitch(-dy * sensitivity);
  renderAllShapes();
}

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  // lock pointer
  canvas.addEventListener('click', () =>  canvas.requestPointerLock());
  canvas.addEventListener('mouseup', () => isDragging = false);

  // bind/unbind pointer
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
      // Locked -> start listening to raw mouse movements
      document.addEventListener('mousemove', onMouseMove, false);
    } else {
      // Unlocked -> stop listening
      document.removeEventListener('mousemove', onMouseMove, false);
    }
  }, false);

  // keydown listener
  window.addEventListener('keydown', ev => {
    switch(ev.key) {
      case 'w':  keys.forward = true; break;
      case 'W':  keys.forward = true; break;  
      case 's':  keys.back    = true; break;
      case 'S':  keys.back    = true; break;
      case 'a':  keys.left    = true; break;
      case 'A':  keys.left    = true; break;
      case 'd':  keys.right   = true; break;
      case 'D':  keys.right   = true; break;
      case ' ':  keys.up      = true; break;
      case 'Shift': keys.down = true; break;
    }
  });

  // keyup listener
  window.addEventListener('keyup', ev => {
    switch(ev.key) {
      case 'w': keys.forward  = false; break;
      case 'W': keys.forward  = false; break;
      case 's': keys.back     = false; break;
      case 'S': keys.back     = false; break;
      case 'a': keys.left     = false; break;
      case 'A': keys.left     = false; break;
      case 'd': keys.right    = false; break;
      case 'D': keys.right    = false; break;
      case ' ': keys.up       = false; break;
      case 'Shift': keys.down = false; break;
    }
  })

}

function initTextures() {
  // define your textures in one place:
  const list = [
    { src: 'img/sky.jpg',                   unit: 0, sampler: u_Sampler0 },
    { src: 'img/test.png',                  unit: 1, sampler: u_Sampler1 },
    { src: 'img/elyvisions/rainbow_up.png', unit: 2, sampler: u_Sampler2 },
    { src: 'img/elyvisions/sh_dn.png',      unit: 3, sampler: u_Sampler3 },
    { src: 'img/tile.jpeg',                 unit: 4, sampler: u_Sampler4 },
    { src: 'img/asphalt.avif',              unit: 5, sampler: u_Sampler5 }
    // …add more entries here…
  ];

  list.forEach(({ src, unit, sampler }) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';        // if needed
    img.onload = () => sendTextureToUnit(unit, sampler, img);
    img.src    = src;
  });

  return true;
}

function isPowerOf2(v) {
  return (v & (v - 1)) === 0;
}

/**
 * Uploads an Image to a given texture unit and GLSL sampler.
 *
 * @param {number} unit         — texture unit index (0,1,2,…)
 * @param {WebGLUniformLocation} samplerUniform — the u_SamplerN uniform
 * @param {HTMLImageElement} image
 */
function sendTextureToUnit(unit, samplerUniform, image) {
  const tex = gl.createTexture();
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);

  gl.texImage2D(
    gl.TEXTURE_2D, 0,
    gl.RGBA, gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  );

  // NPOT must use these:
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    // POT: enable mipmaps & higher‑quality filtering
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );

    // anisotropic if available
    const ext = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );
    if (ext) {
      const maxAniso = gl.getParameter(
        ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT
      );
      gl.texParameterf(
        gl.TEXTURE_2D,
        ext.TEXTURE_MAX_ANISOTROPY_EXT,
        maxAniso
      );
    }

  } else {
    // NPOT fallback: no mipmaps
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      gl.LINEAR
    );
  }

  gl.uniform1i(samplerUniform, unit);
}

/**
 * @param {[number,number,number]} p  — candidate camera position
 * @returns {boolean} true if p lies inside any obstacle
 */
function isColliding(p) {
  for (const {min, max} of obstacles) {
    if (
      p[0] >= min[0] && p[0] <= max[0] &&
      p[1] >= min[1] && p[1] <= max[1] &&
      p[2] >= min[2] && p[2] <= max[2]
    ) {
      return true;
    }
  }
  return false;
}

  
function main() {
    
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();
  
  initTextures();

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1.0);

  // Render
  requestAnimationFrame(tick);
}
  
function angleUpdater(x,y, rotationFactor) {
  
  if (previous_x != 0 || previous_y != 0) {
  
    if (x - previous_x > 0) {
      g_globalYAngle = (g_globalYAngle + rotationFactor) % 360;
    } else if (x - previous_x < 0) {
      g_globalYAngle = (g_globalYAngle - rotationFactor) % 360;
    }
  
    if (y - previous_y < 0) {
      if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
        g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
      } else { 
        g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
      }
    } else if (y - previous_y > 0) {
      if (Math.abs(g_globalYAngle) < 90 || Math.abs(g_globalYAngle) > 270) {
        g_globalXAngle = (g_globalXAngle - rotationFactor) % 360;
      } else { 
        g_globalXAngle = (g_globalXAngle + rotationFactor) % 360;
      }
    }
    previous_x = x;
    previous_y = y;
  }
  
  if (previous_x == 0 && previous_y == 0) {
    previous_x = x;
    previous_y = y;
  }
}

let g_prevTime = Date.now() * .001;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  const now = performance.now();
  
  const delta = (now - lastTime) / 1000;
  g_seconds = performance.now()/1000.0 - g_startTime; // seconds elapsed
  lastTime = now;

  const time = Date.now() * .001;
  g_prevTime = time;
  const dt = time - g_prevTime;
  

  const walkSpeed = 5;      // units per second

  // move based on which keys are held
  if (keys.forward) camera.forward( walkSpeed * delta );
  if (keys.back)    camera.back( walkSpeed * delta );
  if (keys.left)    camera.left( walkSpeed * delta );
  if (keys.right)   camera.right( walkSpeed * delta );
  if (keys.up)      camera.moveUp( walkSpeed * delta);
  if (keys.down)    camera.moveDown( walkSpeed * delta);
   
  updatePerson(dt);
  personWalk();
  drawScene();                  // Draw everything
  requestAnimationFrame(tick);  // Tell the browser to update again when it has time
  
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
    
  

  // Pass the projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(70, canvas.width/canvas.height, .1, 100); // angle, aspect ratio, near plane, far plane
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Build the view matrix from the camera
  const viewMat = new Matrix4();
  viewMat.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0],  camera.at.elements[1],  camera.at.elements[2],
    camera.up.elements[0],  camera.up.elements[1],  camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(-g_globalYAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(-g_globalXAngle, 1, 0, 0);
  globalRotMat = globalRotMat.rotate(-g_globalZAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)
  
  // pass the global scale matrix
  var globalScaMat = new Matrix4().scale(1 + g_globalScale, 1 + g_globalScale, 1 + g_globalScale);
  gl.uniformMatrix4fv(u_GlobalScaleMatrix, false, globalScaMat.elements);
  
  let R = new Matrix4()
  .rotate(-g_globalYAngle, 0,1,0)
  .rotate(-g_globalXAngle, 1,0,0)
  .rotate(-g_globalZAngle, 0,0,1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, R.elements);
  
  // Build & send the scale
  let S = new Matrix4().scale(
    1 + g_globalScale,
    1 + g_globalScale,
    1 + g_globalScale
  );
  gl.uniformMatrix4fv(u_GlobalScaleMatrix, false, S.elements);
    
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
}


function sendTextToHTMl(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID)
  }
  htmlElm.innerHTML = text;
}
  
function drawScene(){
  // Check the time at the start of this function
  var startTime = performance.now();
  
  renderAllShapes();
  drawMap();
  
  

  // drawOctopus(1, 1, 1, .5);

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTMl(" fps: " + Math.floor(10000/duration)/10, "numdot");
}
  
function click(ev) {

  // Extract the event click and return it in WebGL coordinates
  [x,y] = convertCoordinatesEventToGL(ev);
  
  let point;
  if (g_selectedType == POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);
  
  // Draw every shape that is supposed to be in the canvas
  renderAllShapes();
}
  
// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return([x,y]);
}
