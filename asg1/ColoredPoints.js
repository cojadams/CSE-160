// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  } `

// Fragment shader program
var FSHADER_SOURCE =`
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size){
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elments
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_selectedSeg = 10;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  // Button Events 
  document.getElementById('green').onclick = function() { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
  document.getElementById('red').onclick = function() { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
  document.getElementById('blue').onclick = function() {g_selectedColor = [0.0, 0.0, 1.0, 1.0]; };
  document.getElementById('clearButton').onclick = function() {g_shapesList = []; renderAllShapes();  };

  document.getElementById('pointButton').onclick = function()     { g_selectedType = POINT };
  document.getElementById('triangleButton').onclick = function()  { g_selectedType = TRIANGLE };
  document.getElementById('circleButton').onclick = function()    { g_selectedType = CIRCLE };

  // Color slider Events
  document.getElementById('redSlide').addEventListener('mouseup',   function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup',  function() { g_selectedColor[2] = this.value/100; });

  // Size slider evenets
  document.getElementById('sizeSlide').addEventListener('mouseup',  function() { g_selectedSize = this.value; });
  document.getElementById('circleSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

  // SHREK BUTTON
  document.getElementById('shrek').onclick = drawShrek;

}

function main() {
  
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

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

// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  
  // Check the time at the start of this function
  var startTime = performance.now();
  
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  var duration = performance.now() - startTime;
  sendTextToHTMl("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTMl(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID)
  }
  htmlElm.innerHTML = text;
}

function drawShrek(){
  // Clear the canvas first if you want to start a fresh drawing
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // ---------- left ear ----------
  // Set the color to green.
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
  // Call drawTriangle with hardcoded vertices. (Coordinates here are in clip space [-1,1].)
  // For example, this triangle could represent one ear:
  drawTriangle([
    -0.7, 0.8,   
    -0.5, 0.4,   
    -0.9, 0.6
  ]);
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([
    -.7, .6,
    -.8, .6,
    -.7, .7
  ])

  // ---------- right ear ----------
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
  drawTriangle([
    0.7, 0.8,    
    0.9, 0.6,    
    0.5, 0.4     
  ]);
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([
    .7, .6,
    .8, .6,
    .7, .7
  ])


  // ---------- head ----------
  // Set the color to a brownish shade (for example).
  gl.uniform4f(u_FragColor, 0.0, 1.0, 0.0, 1.0);
  // A large triangle for a face:
  
  // bottom triangle
  drawTriangle([
    0.0, 0.0,  // top vertex
    -0.3, -0.7,  // left vertex
    0.3, -0.7   // right vertex
  ]);
  drawTriangle([
    0.0, 0.0,   // top
    0.3, -0.7,
    0.65, -0.43
  ])
  drawTriangle([
    0.0, 0.0, //top
    0.65, -0.43, // left
    0.7, -0.2
  ])
  drawTriangle([
    0.0, 0.0,
    0.7, -0.2,
    0.7, 0.2
  ])
  drawTriangle([
    0.0, 0.0,
    0.7, 0.2,
    0.65, 0.43
  ])
  drawTriangle([
    0.0, 0.0,
    0.65, 0.43,
    0.3, 0.7
  ])
  //top triangle
  drawTriangle([
    0.0, 0.0,
    0.3, 0.7,
    -0.3, 0.7
  ])
  drawTriangle([
    0.0, 0.0,
    -0.3, 0.7,
    -0.65, 0.43
  ])
  drawTriangle([
    0.0, 0.0,
    -0.65, 0.43,
    -.7, .2
  ])
  drawTriangle([
    0.0, 0.0,
    -.7, .2,
    -.7, -.2
  ])
  drawTriangle([
    0.0, 0.0,
    -.7, -.2,
    -.65, -.43
  ])
  drawTriangle([
    0.0, 0.0,
    -.65, -.43,
    -0.3, -0.7
  ])
  
  gl.uniform4f(u_FragColor, 0.0, .5, 0.0, 1.0);
  drawTriangle([
    0.0, -.6,
    -.3, -.7,
    .3, -.7
  ])
  drawTriangle([
    .3, -.7,
    .65, -.43,
    .7, -.2
  ])
  drawTriangle([
    -.3, -.7,
    -.65, -.43,
    -.7, -.2
  ])

  // ---------- left eye ----------
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  
  drawTriangle([
    -.4, .15,
    -.5, 0.23,
    -.4, .3,
  ]);

  drawTriangle([
    -.4, .23,
    -.3, .3,
    -.4, .3
  ]);

  drawTriangle([
    -.3, .23,
    -.4, 0.23,
    -.3, .3,
  ]);

  drawTriangle([
    -.3, .23,
    -.4, .23,
    -.4, .15
  ])

  drawTriangle([
    -.4, .15,
    -.3, .15,
    -.3, .23
  ])

  drawTriangle([
    -.3, .3,
    -.3, .15,
    -.2, .23
    ])

  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  
  drawTriangle([
    -.3, .19,
    -.4, .19,
    -.3, .27
  ])

  drawTriangle([
    -.3, .27,
    -.4, .27,
    -.4, .19
  ])
  
  // ---------- right eye ----------
  // Change the color to red.
  gl.uniform4f(u_FragColor, 1.0, 1.0, 1.0, 1.0);
  
  drawTriangle([
    .4, .15,
    .5, 0.23,
    .4, .3,
  ]);

  drawTriangle([
    .4, .23,
    .3, .3,
    .4, .3
  ]);

  drawTriangle([
    .3, .23,
    .4, 0.23,
    .3, .3,
  ]);

  drawTriangle([
    .3, .23,
    .4, .23,
    .4, .15
  ])

  drawTriangle([
    .4, .15,
    .3, .15,
    .3, .23
  ])

  drawTriangle([
    .3, .3,
    .3, .15,
    .2, .23
    ])

  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  
  drawTriangle([
    .3, .19,
    .4, .19,
    .3, .27
  ])

  drawTriangle([
    .3, .27,
    .4, .27,
    .4, .19
  ])

  // ---------- nose ----------
  gl.uniform4f(u_FragColor, 0.0, 0.6, 0.0, 1.0);
  drawTriangle([
    -.1, 0,
    .1, 0,
    0, .1
  ])
  drawTriangle([
    .1, 0,
    .1, .1,
    0, .1
  ])
  drawTriangle([
    .1, 0,
    .2, .05,
    .1, .1
  ])
  drawTriangle([
    .2, .05,
    .2, .1,
    .1, .1
  ])
  drawTriangle([
    .2, .1,
    .15, .15,
    .1, .1
  ])

  drawTriangle([
    -.1, 0,
    0, .1,
    -.1, .1
  ])

  drawTriangle([
    -.2, .05,
    -.1, 0,
    -.1, .1
  ])
  drawTriangle([
    -.2, .05,
    -.1, .1,
    -.2, .1
  ])
  drawTriangle([
    -.2, .1,
    -.15, .15,
    -.1, .1
  ])
  gl.uniform4f(u_FragColor, 0.0, 0.0, 0.0, 1.0);
  drawTriangle([
    .1, 0,
    .15, 0,
    .2, .05
  ])
  drawTriangle([
    -.1, 0,
    -.15, 0,
    -.2, .05
  ])

  // ---------- mouth ----------
  gl.uniform4f(u_FragColor, 0.4, 0.2, 0.0, 1.0);
  drawTriangle([
    0, -.2,
    -.25, -.25,
    .25, -.25
  ])
  drawTriangle([
    0, -.2,
    .25, -.25,
    .25, -.2
  ])
  drawTriangle([
    0, -.2,
    .25, -.2,
    .15, -.15
  ])
  drawTriangle([
    .25, -.25,
    .4, -.15,
    .25, -.2
  ])
  drawTriangle([
    .25, -.2,
    .4, -.15,
    .15, -.15
  ])

  drawTriangle([
    0, -.2,
    -.25, -.25,
    -.25, -.2
  ])
  drawTriangle([
    -0, -.2,
    -.25, -.2,
    -.15, -.15
  ])
  drawTriangle([
    -.25, -.25,
    -.4, -.15,
    -.25, -.2
  ])
  drawTriangle([
    -.25, -.2,
    -.4, -.15,
    -.15, -.15
  ])
  
  
  // ---------- left eye brow ----------
  gl.uniform4f(u_FragColor, 0.3, 0.2, 0.2, 1.0);
  drawTriangle([
    -.3, .35,
    -.3, .4,
    -.4, .35
  ])
  drawTriangle([
    -.4, .35,
    -.3, .4,
    -.4, .4
  ])
  drawTriangle([
    -.5, .35,
    -.4, .35,
    -.4, .4
  ])
  drawTriangle([
    -.3, .35,
    -.25, .35,
    -.3, .4
  ])
  drawTriangle([
    -.3, .35,
    -.2, .3,
    -.25, .35
  ])

// ---------- right eye brow ----------
  drawTriangle([
    .3, .35,
    .3, .4,
    .4, .35
  ])
  drawTriangle([
    .4, .35,
    .3, .4,
    .4, .4
  ])
  drawTriangle([
    .5, .35,
    .4, .35,
    .4, .4
  ])
  drawTriangle([
    .3, .35,
    .25, .35,
    .3, .4
  ])
  drawTriangle([
    .3, .35,
    .2, .3,
    .25, .35
  ])

}


