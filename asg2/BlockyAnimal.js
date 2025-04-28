// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_GlobalScaleMatrix;
  void main() {
   gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
   gl_Position = u_GlobalScaleMatrix
               * u_GlobalRotateMatrix
               * u_ModelMatrix
               * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_GlobalScaleMatrix;

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

  u_GlobalScaleMatrix = gl.getUniformLocation(gl.program, 'u_GlobalScaleMatrix');
  if(!u_GlobalScaleMatrix) {
    console.log('Failed to get the storage location of u_GlobalScaleMatrix');
    return;
  }

  // initialize all three matrices
  let I = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix,             false, I.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix,      false, I.elements);
  gl.uniformMatrix4fv(u_GlobalScaleMatrix,       false, I.elements);

  // Set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elments
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;
let g_globalAngle=0;
let g_armAnimation = false;

// Arm angle globals
let g_arm1Angle1 = 20;
let g_arm2Angle1 = 20;
let g_arm3Angle1 = 20;
let g_arm4Angle1 = 20;
let g_arm5Angle1 = 20;
let g_arm6Angle1 = 20;
let g_arm7Angle1 = 20;
let g_arm8Angle1 = 20;

let g_headScale = 1;
let g_headPulseAmp = 0.1;
let g_headSpeed = .3;
let g_armSpeed = 1.5;
const t = g_armSpeed * g_seconds;

let g_bodyColor = [0.75, 0.0, 0.3, 1.0];

// Mouse control
let g_globalXAngle = 0;
let g_globalYAngle = 0;
let g_globalZAngle = 0;
let g_globalScale = -.5;          
let previous_x = null, previous_y = null;
let g_rotation_factor = 1;



// Set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  // click rotation and zoom scroll events
  document.getElementById('rotationFactor').addEventListener('mousemove', function() { g_rotation_factor = Number(this.value); renderAllShapes(); });
  
  
  // animation buttons
  document.getElementById('armAnimOnButton').onclick  = () => { g_armAnimation = true;  };
  document.getElementById('armAnimOffButton').onclick = () => { g_armAnimation = false; };

 // head‐pulse amplitude slider
  const headPulseSlider  = document.getElementById('headPulseSlider');
  const headPulseDisplay = document.getElementById('headPulseDisplay');
  headPulseSlider.addEventListener('input', function() {
    g_headPulseAmp = Number(this.value);
    headPulseDisplay.textContent = this.value;
    // ← force an immediate redraw
    renderAllShapes();
  });

  // head‐pulse speed slider
  const headPulseSpeedSlider  = document.getElementById('headPulseSpeedSlider');
  const headPulseSpeedDisplay = document.getElementById('headPulseSpeedDisplay');
  headPulseSpeedSlider.addEventListener('input', function() {
    g_headSpeed = Number(this.value);
    headPulseSpeedDisplay.textContent = this.value;
    // ← force an immediate redraw
    renderAllShapes();
  });
  // Arm speed slider
  const armSpeedSlider = document.getElementById('armSpeedSlider');
  const armSpeedDisplay = document.getElementById('armSpeedDisplay');
  armSpeedSlider.addEventListener('input', function() {
      g_armSpeed = Number(this.value);
      armSpeedDisplay.textContent = this.value + '×';
  });
  

  // Arm‐rotation slider:
  // Arm 1
  const arm1Slider = document.getElementById('arm1Slider');
  const arm1Display = document.getElementById('arm1AngleDisplay');
  arm1Slider.addEventListener('input', function() { g_arm1Angle1 = Number(this.value); arm1Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 2
  const arm2Slider = document.getElementById('arm2Slider');
  const arm2Display = document.getElementById('arm2AngleDisplay');
  arm2Slider.addEventListener('input', function() { g_arm2Angle1 = Number(this.value); arm2Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 3
  const arm3Slider = document.getElementById('arm3Slider');
  const arm3Display = document.getElementById('arm3AngleDisplay');
  arm3Slider.addEventListener('input', function() { g_arm3Angle1 = Number(this.value); arm3Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 4
  const arm4Slider = document.getElementById('arm4Slider');
  const arm4Display = document.getElementById('arm4AngleDisplay');
  arm4Slider.addEventListener('input', function() { g_arm4Angle1 = Number(this.value); arm4Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 5
  const arm5Slider = document.getElementById('arm5Slider');
  const arm5Display = document.getElementById('arm5AngleDisplay');
  arm5Slider.addEventListener('input', function() { g_arm5Angle1 = Number(this.value); arm5Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 6
  const arm6Slider = document.getElementById('arm6Slider');
  const arm6Display = document.getElementById('arm6AngleDisplay');
  arm6Slider.addEventListener('input', function() { g_arm6Angle1 = Number(this.value); arm6Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 7
  const arm7Slider = document.getElementById('arm7Slider');
  const arm7Display = document.getElementById('arm7AngleDisplay');
  arm7Slider.addEventListener('input', function() { g_arm7Angle1 = Number(this.value); arm7Display.textContent = this.value + '°'; renderAllShapes(); });
  
  // Arm 8
  const arm8Slider = document.getElementById('arm8Slider');
  const arm8Display = document.getElementById('arm8AngleDisplay');
  arm8Slider.addEventListener('input', function() { g_arm8Angle1 = Number(this.value); arm8Display.textContent = this.value + '°'; renderAllShapes(); });

  // color generators
  [['R','0'], ['G','1'], ['B','2']].forEach(([ch, idx]) => {
    const slider  = document.getElementById('body'+ch);
    const display = document.getElementById('body'+ch+'Display');
    slider.addEventListener('input', function(){
      g_bodyColor[idx] = Number(this.value);
      display.textContent = Number(this.value).toFixed(2);
      renderAllShapes();
    });
  });
}

function main() {
  
  // Set up canvas and gl variables
  setupWebGL();
  // Set up GLSL shader programs and connect GLSL variables
  connectVariablesToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = ev => {
    [previous_x, previous_y] = convertCoordinatesEventToGL(ev);
  };
  canvas.onmousemove = ev => {
    if (ev.buttons === 1) {                        // only when left-button is down
      const [x, y] = convertCoordinatesEventToGL(ev);
      angleUpdater(x, y, g_rotation_factor);       // update g_globalX/Y/ZAngle
      // update previous so the next delta is correct
      previous_x = x;  
      previous_y = y;
      renderAllShapes();                            // re-draw with the new rotation
  } };
  canvas.onwheel     = ev => { ev.preventDefault(); handleScroll(ev); };

  // Specify the color for clearing <canvas>
  gl.clearColor(0, .1, .3, 1.0);


  // Render
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
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

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;

  // Update angles
  updateAnimationAngles();

  // Draw everything
  drawScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);

}

// Update the angles of everything if currently animated
function updateAnimationAngles() {

  if (g_armAnimation) {
    const t = g_armSpeed * g_seconds;
    const base = 20, amp = 30;
    g_arm1Angle1 = base + amp * Math.sin(t +      Math.PI/4);
    g_arm2Angle1 = base + amp * Math.sin(t +  2 * Math.PI/4);
    g_arm3Angle1 = base + amp * Math.sin(t +      Math.PI/4);
    g_arm4Angle1 = base + amp * Math.sin(t +  2 * Math.PI/4);
    g_arm5Angle1 = base + amp * Math.sin(t +      Math.PI/4);
    g_arm6Angle1 = base + amp * Math.sin(t +  3 * Math.PI/4);
    g_arm7Angle1 = base + amp * Math.sin(t +      Math.PI/4);
    g_arm8Angle1 = base + amp * Math.sin(t +  3 * Math.PI/4);

    g_headScale = 1 + g_headPulseAmp * Math.sin(g_headSpeed * Math.PI * g_seconds);

  }
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes(){
  
  // Check the time at the start of this function
  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(-g_globalYAngle, 0, 1, 0);
  globalRotMat = globalRotMat.rotate(-g_globalXAngle, 1, 0, 0);
  globalRotMat = globalRotMat.rotate(-g_globalZAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

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
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Check the time at the end of the function, and show on web page
  var duration = performance.now() - startTime;
  sendTextToHTMl(" fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTMl(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID)
  }
  htmlElm.innerHTML = text;
}

function drawScene(){
  renderAllShapes();

  const headColor   = g_bodyColor.slice();
  const lightist = [
    headColor[0] * 1.1,
    headColor[1] * 1.1,
    headColor[2] * 1.1,
    headColor[3] 
  ]
  const light = [
    headColor[0] * 0.9,
    headColor[1] * 0.9,
    headColor[2] * 0.9,
    headColor[3] 
  ]
  const bottomColor = [
    headColor[0] * 0.8,
    headColor[1] * 0.8,
    headColor[2] * 0.8,
    headColor[3]        
  ];
  const mid = [
    headColor[0] * 0.7,
    headColor[1] * 0.7,
    headColor[2] * 0.7,
    headColor[3]  
  ]

  const bottomColor1 = [
    headColor[0] * 0.6,
    headColor[1] * 0.6,
    headColor[2] * 0.6,
    headColor[3] 
  ]
  
  

  const headPos = new Matrix4().translate(-0.25, .075, 0);
  const headHalfWidth  = 0.25;
  const headHalfHeight = 0.25;

  const headBase = new Matrix4(headPos)
  .translate(headHalfWidth,  headHalfHeight, 0)
  .scale(g_headScale, g_headScale, g_headScale)
  .translate(-headHalfWidth, -headHalfHeight, 0);
  
  // basis for head
  const head1 = new Cube();
  head1.color = bottomColor;
  head1.matrix = new Matrix4(headBase).scale(.5, .5, .5);
  head1.render();
  const head1Coord = new Matrix4(head1.matrix);

 
  // Head back
  const headback = new Cube();
  headback.color = bottomColor1;
  headback.matrix = new Matrix4(headBase).translate(.05, .2, .1).scale(.4, .4, .75);
  headback.render();
  const headbackCoord = new Matrix4(headback.matrix); 

  // Head Top
  const backTop1 = new Cube();
  backTop1.color = bottomColor;
  backTop1.matrix = new Matrix4(headbackCoord).translate(.13, 1, .13).scale(.75, .1, .75);
  backTop1.render();
  const headbackcoord1 = new Matrix4(backTop1.matrix);

  const backTop2 = new Cube();
  backTop2.color = mid;
  backTop2.matrix = new Matrix4(headbackcoord1);
  backTop2.matrix.translate(.13, 1, .13);
  backTop2.matrix.scale(.75, 1, .75);
  backTop2.render();
  const headbackcoord2 = new Matrix4(backTop2.matrix);

  const backTop3 = new Cube();
  backTop3.color = lightist;
  backTop3.matrix = headbackcoord2;
  backTop3.matrix.translate(.13, .75, .13);
  backTop3.matrix.scale(.75, .75, .75);
  backTop3.render();

  // Head bottom
  const headbottom = new Cube();
  headbottom.color = bottomColor;
  headbottom.matrix = new Matrix4(headPos).translate(-0.15, -0.075, -0.15).scale(.8, .12, .8);
  headbottom.render();
  const headbottomCoord = new Matrix4(headbottom.matrix);
    
  const headbottom1 = new Cube();
  headbottom1.color = headColor;
  headbottom1.matrix = new Matrix4(headbottomCoord).translate(.05, 1, .05).scale(0.9, 0.5, 0.9);
  headbottom1.render();

  const headbottom2 = new Cube();
  headbottom2.color = bottomColor1;
  headbottom2.matrix = new Matrix4(headbottomCoord).translate(0.12, 1.5, 0.12).scale(0.75, 0.5, 0.75);
  headbottom2.render();


  // head right
  const backright = new Cube();
  backright.color = bottomColor;
  backright.matrix = new Matrix4(headbackCoord);
  backright.matrix.translate(1, .1, 0.05).scale(0.1, .8, 0.9);
  backright.render();
  const backrightCoord = new Matrix4(backright.matrix);

  const backright1 = new Cube();
  backright1.color = lightist
  backright1.matrix = backrightCoord;
  backright1.matrix.translate(1, .12, .12);
  backright1.matrix.scale(.75, .75, .75);
  backright1.render();

  // head left
  const backleft = new Cube();
  backleft.color = bottomColor;
  backleft.matrix = new Matrix4(headbackCoord);
  backleft.matrix.translate(-.1, .1, 0.05).scale(0.1, .8, 0.9);
  backleft.render();
  const backleftCoord = new Matrix4(backleft.matrix);

  const backleft1 = new Cube();
  backleft1.color = lightist;
  backleft1.matrix = backleftCoord;
  backleft1.matrix.translate(-.7, .12, .12);
  backleft1.matrix.scale(.75, .75, .75);
  backleft1.render();


  // right eye 
  const eye1 = new Cube();
  eye1.color  = [.1, .1, .1, 1];                 
  eye1.matrix = new Matrix4(head1Coord).translate(.8, .8, -.1).scale(0.3, 0.3, 0.3);
  eye1.render();
  const eye1Coord = new Matrix4(eye1.matrix);

  const eye11 = new Cube();
  eye11.color = [1, 1, 1, 1];
  eye11.matrix = new Matrix4(eye1Coord).translate(.5, .2, .2).scale(.5, .5, .5).rotate(45, 0, 1, 0);
  eye11.render();




  // left eye
  const eye2 = new Cube();
  eye2.color  = [.1, .1, .1, 1];
  eye2.matrix = new Matrix4(head1Coord).translate(-.1, .8, -.1).scale(0.3, 0.3, 0.3);
  eye2.render();
  const eye2Coord = new Matrix4(eye2.matrix);

  const eye21 = new Cube();
  eye21.color = [1, 1, 1, 1];
  eye21.matrix = new Matrix4(eye2Coord).translate(-.2, .2, .2).scale(.5, .5, .5).rotate(45, 0, 1, 0);
  eye21.render();



  // Arm1
  var arm = new Cube();
  arm.color = bottomColor1;
  arm.matrix.translate(.1, -.25, -.1);
  arm.matrix.scale(.15, .3, .15);
  arm.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm.render();
  var armcoord = new Matrix4(arm.matrix);

  var arm1 = new Cube();
  arm1.color = mid;
  arm1.matrix = armcoord;
  arm1.matrix.translate(.13, -.75, .15);
  arm1.matrix.scale(.75, 1, .75);
  arm1.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm1.render();
  var arm1coord = new Matrix4(arm1.matrix);

  var arm2 = new Cube();
  arm2.color = bottomColor;
  arm2.matrix = arm1coord;
  arm2.matrix.translate(.13, -.75, .15);
  arm2.matrix.scale(.75, 1, .75);
  arm2.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm2.render();
  var arm2coord = new Matrix4(arm2.matrix);

  var arm3 = new Cube();
  arm3.color = light;
  arm3.matrix = arm2coord;
  arm3.matrix.translate(.13, -.75, .15);
  arm3.matrix.scale(.75, 1, .75);
  arm3.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm3.render();
  var arm3coord = new Matrix4(arm3.matrix);

  var arm4 = new Cube();
  arm4.color = headColor;
  arm4.matrix = arm3coord;
  arm4.matrix.translate(.13, -.75, .15);
  arm4.matrix.scale(.75, 1, .75);
  arm4.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm4.render();
  var arm4coord = new Matrix4(arm4.matrix);

  var arm5 = new Cube();
  arm5.color = lightist;
  arm5.matrix = arm4coord;
  arm5.matrix.translate(.13, -.75, .15);
  arm5.matrix.scale(.75, 1, .75);
  arm5.matrix.rotate(g_arm1Angle1, 1, 0, .5);
  arm5.render();

  // arm 2
  var arm6 = new Cube();
  arm6.color = bottomColor1;
  arm6.matrix.translate(-.25,  -.25, -.1);
  arm6.matrix.scale(.15, .3, .15);
  arm6.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm6.render();
  var arm6coord = new Matrix4(arm6.matrix);

  var arm7 = new Cube();
  arm7.color = mid;
  arm7.matrix = arm6coord;
  arm7.matrix.translate(.13, -.75, .15);
  arm7.matrix.scale(.75, 1, .75);
  arm7.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm7.render();
  var arm7coord = new Matrix4(arm7.matrix);

  var arm8 = new Cube();
  arm8.color = bottomColor1;
  arm8.matrix = arm7coord;
  arm8.matrix.translate(.13, -.75, .15);
  arm8.matrix.scale(.75, 1, .75);
  arm8.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm8.render();
  var arm8coord = new Matrix4(arm8.matrix);

  var arm9 = new Cube();
  arm9.color = light;
  arm9.matrix = arm8coord;
  arm9.matrix.translate(.13, -.75, .15);
  arm9.matrix.scale(.75, 1, .75);
  arm9.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm9.render();
  var arm9coord = new Matrix4(arm9.matrix);

  var arm10 = new Cube();
  arm10.color = headColor;
  arm10.matrix = arm9coord;
  arm10.matrix.translate(.13, -.75, .15);
  arm10.matrix.scale(.75, 1, .75);
  arm10.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm10.render();
  var arm10coord = new Matrix4(arm10.matrix);

  var arm11 = new Cube();
  arm11.color = lightist;
  arm11.matrix = arm10coord;
  arm11.matrix.translate(.13, -.75, .15);
  arm11.matrix.scale(.75, 1, .75);
  arm11.matrix.rotate(g_arm2Angle1, 1, .5, 0);
  arm11.render();

  // arm 3
  var arm12 = new Cube();
  arm12.color = bottomColor1;
  arm12.matrix.translate(-.35,  -.25, .15);
  arm12.matrix.rotate(90, 0, 1, 0);
  arm12.matrix.scale(.15, .3, .15);
  arm12.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm12.render();
  var arm12coord = new Matrix4(arm12.matrix);

  var arm13 = new Cube();
  arm13.color = mid;
  arm13.matrix = arm12coord;
  arm13.matrix.translate(.13, -.75, .15);
  arm13.matrix.scale(.75, 1, .75);
  arm13.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm13.render();
  var arm13coord = new Matrix4(arm13.matrix);

  var arm14 = new Cube();
  arm14.color = bottomColor;
  arm14.matrix = arm13coord;
  arm14.matrix.translate(.13, -.75, .15);
  arm14.matrix.scale(.75, 1, .75);
  arm14.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm14.render();
  var arm14coord = new Matrix4(arm14.matrix);

  var arm15 = new Cube();
  arm15.color = light;
  arm15.matrix = arm14coord;
  arm15.matrix.translate(.13, -.75, .15);
  arm15.matrix.scale(.75, 1, .75);
  arm15.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm15.render();
  var arm15coord = new Matrix4(arm15.matrix);

  var arm16 = new Cube();
  arm16.color = headColor;
  arm16.matrix = arm15coord;
  arm16.matrix.translate(.13, -.75, .15);
  arm16.matrix.scale(.75, 1, .75);
  arm16.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm16.render();
  var arm16coord = new Matrix4(arm16.matrix);

  var arm17 = new Cube();
  arm17.color = lightist;
  arm17.matrix = arm16coord;
  arm17.matrix.translate(.13, -.75, .15);
  arm17.matrix.scale(.75, 1, .75);
  arm17.matrix.rotate(g_arm3Angle1, 1, 0, .5);
  arm17.render();

  // arm 4
  var arm18 = new Cube();
  arm18.color = bottomColor1;
  arm18.matrix.translate(-.35,  -.25, .5);
  arm18.matrix.rotate(90, 0, 1, 0);
  arm18.matrix.scale(.15, .3, .15);
  arm18.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm18.render();
  var arm18coord = new Matrix4(arm18.matrix);

  var arm19 = new Cube();
  arm19.color = mid;
  arm19.matrix = arm18coord;
  arm19.matrix.translate(.13, -.75, .15);
  arm19.matrix.scale(.75, 1, .75);
  arm19.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm19.render();
  var arm19coord = new Matrix4(arm19.matrix);

  var arm20 = new Cube();
  arm20.color = bottomColor;
  arm20.matrix = arm19coord;
  arm20.matrix.translate(.13, -.75, .15);
  arm20.matrix.scale(.75, 1, .75);
  arm20.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm20.render();
  var arm20coord = new Matrix4(arm20.matrix);

  var arm21 = new Cube();
  arm21.color = light;
  arm21.matrix = arm20coord;
  arm21.matrix.translate(.13, -.75, .15);
  arm21.matrix.scale(.75, 1, .75);
  arm21.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm21.render();
  var arm21coord = new Matrix4(arm21.matrix);

  var arm22 = new Cube();
  arm22.color = headColor;
  arm22.matrix = arm21coord;
  arm22.matrix.translate(.13, -.75, .15);
  arm22.matrix.scale(.75, 1, .75);
  arm22.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm22.render();
  var arm22coord = new Matrix4(arm22.matrix);

  var arm23 = new Cube();
  arm23.color = lightist;
  arm23.matrix = arm22coord;
  arm23.matrix.translate(.13, -.75, .15);
  arm23.matrix.scale(.75, 1, .75);
  arm23.matrix.rotate(g_arm4Angle1, 1, .5, 0);
  arm23.render();

  // arm 5
  var arm24 = new Cube();
  arm24.color = bottomColor1;
  arm24.matrix.translate(-.1, -.25, .6);
  arm24.matrix.rotate(180, 0, 1, 0);
  arm24.matrix.scale(.15, .3, .15);
  arm24.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm24.render();
  var arm24coord = new Matrix4(arm24.matrix);

  var arm25 = new Cube();
  arm25.color = mid;
  arm25.matrix = arm24coord;
  arm25.matrix.translate(.13, -.75, .15);
  arm25.matrix.scale(.75, 1, .75);
  arm25.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm25.render();
  var arm25coord = new Matrix4(arm25.matrix);

  var arm26 = new Cube();
  arm26.color = bottomColor;
  arm26.matrix = arm25coord;
  arm26.matrix.translate(.13, -.75, .15);
  arm26.matrix.scale(.75, 1, .75);
  arm26.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm26.render();
  var arm26coord = new Matrix4(arm26.matrix);

  var arm27 = new Cube();
  arm27.color = light;
  arm27.matrix = arm26coord;
  arm27.matrix.translate(.13, -.75, .15);
  arm27.matrix.scale(.75, 1, .75);
  arm27.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm27.render();
  var arm27coord = new Matrix4(arm27.matrix);

  var arm28 = new Cube();
  arm28.color = headColor;
  arm28.matrix = arm27coord;
  arm28.matrix.translate(.13, -.75, .15);
  arm28.matrix.scale(.75, 1, .75);
  arm28.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm28.render();
  var arm28coord = new Matrix4(arm28.matrix);

  var arm29 = new Cube();
  arm29.color = lightist;
  arm29.matrix = arm28coord;
  arm29.matrix.translate(.13, -.75, .15);
  arm29.matrix.scale(.75, 1, .75);
  arm29.matrix.rotate(g_arm5Angle1, 1, 0, .5);
  arm29.render();

  // arm 6
  var arm30 = new Cube();
  arm30.color = bottomColor1;
  arm30.matrix.translate(.25, -.25, .6);
  arm30.matrix.rotate(180, 0, 1, 0);
  arm30.matrix.scale(.15, .3, .15);
  arm30.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm30.render();
  var arm30coord = new Matrix4(arm30.matrix);

  var arm31 = new Cube();
  arm31.color = mid;
  arm31.matrix = arm30coord;
  arm31.matrix.translate(.13, -.75, .15);
  arm31.matrix.scale(.75, 1, .75);
  arm31.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm31.render();
  var arm31coord = new Matrix4(arm31.matrix);

  var arm32 = new Cube();
  arm32.color = bottomColor;
  arm32.matrix = arm31coord;
  arm32.matrix.translate(.13, -.75, .15);
  arm32.matrix.scale(.75, 1, .75);
  arm32.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm32.render();
  var arm32coord = new Matrix4(arm32.matrix);

  var arm33 = new Cube();
  arm33.color = light;
  arm33.matrix = arm32coord;
  arm33.matrix.translate(.13, -.75, .15);
  arm33.matrix.scale(.75, 1, .75);
  arm33.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm33.render();
  var arm33coord = new Matrix4(arm33.matrix);

  var arm34 = new Cube();
  arm34.color = headColor;
  arm34.matrix = arm33coord;
  arm34.matrix.translate(.13, -.75, .15);
  arm34.matrix.scale(.75, 1, .75);
  arm34.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm34.render();
  var arm34coord = new Matrix4(arm34.matrix);

  var arm35 = new Cube();
  arm35.color = lightist;
  arm35.matrix = arm34coord;
  arm35.matrix.translate(.13, -.75, .15);
  arm35.matrix.scale(.75, 1, .75);
  arm35.matrix.rotate(g_arm6Angle1, 1, .5, 0);
  arm35.render();

  // arm 7
  var arm36 = new Cube();
  arm36.color = bottomColor1;
  arm36.matrix.translate(.35, -.25, 0);
  arm36.matrix.rotate(270, 0, 1, 0);
  arm36.matrix.scale(.15, .3, .15);
  arm36.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm36.render();
  var arm36coord = new Matrix4(arm36.matrix);

  var arm37 = new Cube();
  arm37.color = mid;
  arm37.matrix = arm36coord;
  arm37.matrix.translate(.13, -.75, .15);
  arm37.matrix.scale(.75, 1, .75);
  arm37.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm37.render();
  var arm37coord = new Matrix4(arm37.matrix);

  var arm38 = new Cube();
  arm38.color = bottomColor;
  arm38.matrix = arm37coord;
  arm38.matrix.translate(.13, -.75, .15);
  arm38.matrix.scale(.75, 1, .75);
  arm38.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm38.render();
  var arm38coord = new Matrix4(arm38.matrix);

  var arm39 = new Cube();
  arm39.color = light;
  arm39.matrix = arm38coord;
  arm39.matrix.translate(.13, -.75, .15);
  arm39.matrix.scale(.75, 1, .75);
  arm39.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm39.render();
  var arm39coord = new Matrix4(arm39.matrix);

  var arm40 = new Cube();
  arm40.color = headColor;
  arm40.matrix = arm39coord;
  arm40.matrix.translate(.13, -.75, .15);
  arm40.matrix.scale(.75, 1, .75);
  arm40.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm40.render();
  var arm40coord = new Matrix4(arm40.matrix);

  var arm41 = new Cube();
  arm41.color = lightist;
  arm41.matrix = arm40coord;
  arm41.matrix.translate(.13, -.75, .15);
  arm41.matrix.scale(.75, 1, .75);
  arm41.matrix.rotate(g_arm7Angle1, 1, .5, 0);
  arm41.render();
  
  // arm 8
  var arm42 = new Cube();
  arm42.color = bottomColor1;
  arm42.matrix.translate(.35, -.25, .35);
  arm42.matrix.rotate(270, 0, 1, 0);
  arm42.matrix.scale(.15, .3, .15);
  arm42.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm42.render();
  var arm42coord = new Matrix4(arm42.matrix);

  var arm43 = new Cube();
  arm43.color = mid;
  arm43.matrix = arm42coord;
  arm43.matrix.translate(.13, -.75, .15);
  arm43.matrix.scale(.75, 1, .75);
  arm43.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm43.render();
  var arm43coord = new Matrix4(arm43.matrix);

  var arm44 = new Cube();
  arm44.color = bottomColor;
  arm44.matrix = arm43coord;
  arm44.matrix.translate(.13, -.75, .15);
  arm44.matrix.scale(.75, 1, .75);
  arm44.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm44.render();
  var arm44coord = new Matrix4(arm44.matrix);

  var arm45 = new Cube();
  arm45.color = light;
  arm45.matrix = arm44coord;
  arm45.matrix.translate(.13, -.75, .15);
  arm45.matrix.scale(.75, 1, .75);
  arm45.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm45.render();
  var arm45coord = new Matrix4(arm45.matrix);

  var arm46 = new Cube();
  arm46.color = headColor;
  arm46.matrix = arm45coord;
  arm46.matrix.translate(.13, -.75, .15);
  arm46.matrix.scale(.75, 1, .75);
  arm46.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm46.render();
  var arm46coord = new Matrix4(arm46.matrix);

  var arm47 = new Cube();
  arm47.color = lightist;
  arm47.matrix = arm46coord;
  arm47.matrix.translate(.13, -.75, .15);
  arm47.matrix.scale(.75, 1, .75);
  arm47.matrix.rotate(g_arm8Angle1, 1, 0, .5);
  arm47.render();
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

function handleScroll(ev) {
  if (ev.deltaY < 0) {
    g_globalScale += 0.01;
  } else {
    // scale down when scrolling down
    g_globalScale -= 0.01;
  }

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