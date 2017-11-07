/**
 * @fileoverview Utilities for supporting rendering a terrain and animation.
 * @Junze Liu junzel2@illinois.edu
 */

var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Create a place to store terrain geometry
var tVertexPositionBuffer;

//Create a place to store normals for shading
var tVertexNormalBuffer;

// Create a place to store the terrain triangles
var tIndexTriBuffer;

// Create a place to store the heightss
var tVertexHeightBuffer; 

// // Create a place to store the fog switche for each pixel; 
// var tVertexFogSwitchBuffer; 

//Create a place to store the traingle edges
// var tIndexEdgeBuffer;

// View parameters
var eyePt = vec3.fromValues(0.0,0.5,-1.2);
var viewDir = vec3.fromValues(0.0,-1.9,-1.0);
var up = vec3.fromValues(1.0,0.0,0.0);
var viewPt = vec3.fromValues(0.0,0.0,0.0);
// Control parameters
var axis_of_roll = vec3.fromValues(0.0,0.0,1.0); 
var axis_of_pitch = vec3.fromValues(1.0,0.0,0.0);
var axis_of_yaw = vec3.fromValues(0.0,1.0,0.0); 
var lastTime = 0.0;
var x = 0;
var baseDir = vec3.fromValues(0.0,0.0,-1.0);
var baseUp = vec3.fromValues(0.0,1.0,0.0);
var rollleft = 0.0;
var rollfright = 0.0;
var pitchup = 0.0;
var pitchdown = 0.0;
var yawleft = 0.0; 
var yawright = 0.0; 
var speed = -0.001; 
var sign_fast = 0.0; 
var sign_slow = 0.0;
var keyspress ={};


// Create the normal
var nMatrix = mat3.create();

// Create ModelView matrix
var mvMatrix = mat4.create();

//Create Projection matrix
var pMatrix = mat4.create();

var mvMatrixStack = [];

// Create transform quaternion
var transquat = quat.create();


//-------------------------------------------------------------------------
/**
 * Populates terrain buffers for terrain generation
 */
function setupTerrainBuffers() {
    
    var vTerrain=[];
    var fTerrain=[];
    var nTerrain=[];
    var eTerrain=[];
    var hTerrain=[]; 
    var gridN=128;
    
    // Call terrain generating function from another script
    var numT = terrainFromIteration(gridN, -1,1,-1,1, vTerrain, fTerrain, nTerrain, hTerrain);

    console.log("Generated ", numT, " triangles"); 

    // Setup 
    tVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);      
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vTerrain), gl.STATIC_DRAW);
    tVertexPositionBuffer.itemSize = 3;
    tVertexPositionBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Specify normals to be able to do lighting calculations
    tVertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nTerrain),
                  gl.STATIC_DRAW);
    tVertexNormalBuffer.itemSize = 3;
    tVertexNormalBuffer.numItems = (gridN+1)*(gridN+1);
    
    // Specify faces of the terrain 
    tIndexTriBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fTerrain),
                  gl.STATIC_DRAW);
    tIndexTriBuffer.itemSize = 1;
    tIndexTriBuffer.numItems = numT*3;
    
    // Setup Edges
    generateLinesFromIndexedTriangles(fTerrain,eTerrain);  
    tIndexEdgeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexEdgeBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(eTerrain),
                  gl.STATIC_DRAW);
    tIndexEdgeBuffer.itemSize = 1;
    tIndexEdgeBuffer.numItems = eTerrain.length;

    // Setup Heights
    tVertexHeightBuffer = gl.createBuffer(); 
    gl.bindBuffer(gl.ARRAY_BUFFER, tVertexHeightBuffer); 
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hTerrain), 
                  gl.STATIC_DRAW); 
    tVertexHeightBuffer.itemSize = 1; 
    tVertexHeightBuffer.numItems = (gridN+1)*(gridN+1); 
    
}

//-------------------------------------------------------------------------
/**
 * Draws terrain from populated buffers
 */
function drawTerrain(){
 gl.polygonOffset(0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   

 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexHeightBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexHeightAttribute , 
                            tVertexHeightBuffer.itemSize, gl.FLOAT, false, 0, 0); 
    
 //Draw 
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexTriBuffer);
 gl.drawElements(gl.TRIANGLES, tIndexTriBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

//-------------------------------------------------------------------------
/**
 * Draws edge of terrain from the edge buffer
 */
function drawTerrainEdges(){
 gl.polygonOffset(1,1);
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexPositionBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, tVertexPositionBuffer.itemSize, 
                         gl.FLOAT, false, 0, 0);

 // Bind normal buffer
 gl.bindBuffer(gl.ARRAY_BUFFER, tVertexNormalBuffer);
 gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
                           tVertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);   
    
 //Draw 
 gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tIndexEdgeBuffer);
 gl.drawElements(gl.LINES, tIndexEdgeBuffer.numItems, gl.UNSIGNED_SHORT,0);      
}

//-------------------------------------------------------------------------
/**
 * Sends Modelview matrix to shader
 */
function uploadModelViewMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//-------------------------------------------------------------------------
/**
 * Sends projection matrix to shader
 */
function uploadProjectionMatrixToShader() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, 
                      false, pMatrix);
}

//-------------------------------------------------------------------------
/**
 * Generates and sends the normal matrix to the shader
 */
function uploadNormalMatrixToShader() {
  mat3.fromMat4(nMatrix,mvMatrix);
  mat3.transpose(nMatrix,nMatrix);
  mat3.invert(nMatrix,nMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

//----------------------------------------------------------------------------------
/**
 * Pushes matrix onto modelview matrix stack
 */
function mvPushMatrix() {
    var copy = mat4.clone(mvMatrix);
    mvMatrixStack.push(copy);
}


//----------------------------------------------------------------------------------
/**
 * Pops matrix off of modelview matrix stack
 */
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
      throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

//----------------------------------------------------------------------------------
/**
 * Sends projection/modelview matrices to shader
 */
function setMatrixUniforms() {
    uploadModelViewMatrixToShader();
    uploadNormalMatrixToShader();
    uploadProjectionMatrixToShader();
}

//----------------------------------------------------------------------------------
/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

//----------------------------------------------------------------------------------
/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

//----------------------------------------------------------------------------------
/**
 * Loads Shaders
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

//----------------------------------------------------------------------------------
/**
 * Setup the fragment and vertex shaders
 */
function setupShaders() {
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);

  // shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "fogSwitch");
  // gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexHeightAttribute= gl.getAttribLocation(shaderProgram, "aVertexHeight");
  gl.enableVertexAttribArray(shaderProgram.vertexHeightAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");

  shaderProgram.uniformLightPositionLoc = gl.getUniformLocation(shaderProgram, "uLightPosition");    
  shaderProgram.uniformAmbientLightColorLoc = gl.getUniformLocation(shaderProgram, "uAmbientLightColor");  
  shaderProgram.uniformDiffuseLightColorLoc = gl.getUniformLocation(shaderProgram, "uDiffuseLightColor");
  shaderProgram.uniformSpecularLightColorLoc = gl.getUniformLocation(shaderProgram, "uSpecularLightColor");

  shaderProgram.uniformAmbientMaterialColor = gl.getUniformLocation(shaderProgram, "uAmbientMaterialColor");  
  shaderProgram.uniformDiffuseMaterialColor = gl.getUniformLocation(shaderProgram, "uDiffuseMaterialColor");
  shaderProgram.uniformSpecularMaterialColor = gl.getUniformLocation(shaderProgram, "uSpecularMaterialColor");  

  shaderProgram.uniformFogSwitch = gl.getUniformLocation(shaderProgram, "uFogSwitch");  
}


//-------------------------------------------------------------------------
/**
 * Sends light information to the shader
 * @param {Float32Array} loc Location of light source
 * @param {Float32Array} a Ambient light strength
 * @param {Float32Array} d Diffuse light strength
 * @param {Float32Array} s Specular light strength
 */
function uploadLightsToShader(loc,a,d,s) {
  gl.uniform3fv(shaderProgram.uniformLightPositionLoc, loc);
  gl.uniform3fv(shaderProgram.uniformAmbientLightColorLoc, a);
  gl.uniform3fv(shaderProgram.uniformDiffuseLightColorLoc, d);
  gl.uniform3fv(shaderProgram.uniformSpecularLightColorLoc, s);
}

//----------------------------------------------------------------------------------
/**
 * Sends material information to the shader
 * @param {Float32Array} a Ambient material strength
 * @param {Float32Array} d Diffuse material strength
 * @param {Float32Array} s Specular material strength
 */
function uploadMaterialToShader(dcolor, acolor, scolor) {
  gl.uniform3fv(shaderProgram.uniformDiffuseMaterialColor, dcolor);
  gl.uniform3fv(shaderProgram.uniformAmbientMaterialColor, acolor);
  gl.uniform3fv(shaderProgram.uniformSpecularMaterialColor, scolor);
    
  // gl.uniform1f(shaderProgram.uniformShininess, shiny);
}

//----------------------------------------------------------------------------------
/**
 * Sends fog switch to the shader
 * @param {Float32Array} on / off
 */
function uploadFogSwitchToShader(fog_switch) {
  gl.uniform1f(shaderProgram.uniformFogSwitch, fog_switch); 
}


//----------------------------------------------------------------------------------
/**
 * Populate buffers with data
 */
function setupBuffers() {
    setupTerrainBuffers();
}

//----------------------------------------------------------------------------------
/**
 * event listening
 */
function keysdown(event){
    keyspress[event.keyCode] = true;
}

//----------------------------------------------------------------------------------
/**
 * event listening
 */
function keysup(event){
    keyspress[event.keyCode] = false;
}


//----------------------------------------------------------------------------------
/**
 * Draw call that applies matrix transformations to model and draws model in frame
 */
function draw() { 
    //execute the roll and pitch
    roll_left(rollleft); roll_right(rollright);
    pitch_up(pitchup);  pitch_down(pitchdown);
    yaw_left(yawleft); yaw_right(yawright); 
    fast_speed(sign_fast);   slow_speed(sign_slow); 
    
    // reset the quaternion transformation parameters
    rollleft=0.0; rollright=0.0; 
    pitchup=0.0;  pitchdown=0.0; 
    yawleft=0.0;  yawright=0.0; 

    var transformVec = vec3.create();
  
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // We'll use perspective 
    mat4.perspective(pMatrix,degToRad(45), gl.viewportWidth / gl.viewportHeight, 0.1, 200.0);

    //Use quaternion based viewing system to modify view parameters
    vec3.transformQuat(viewDir, baseDir, transquat);
    vec3.transformQuat(up, baseUp, transquat);

    // We want to look down -z, so create a lookat point in that direction    
    vec3.add(viewPt, eyePt, viewDir);
    // Then generate the lookat matrix and initialize the MV matrix to that view
    mat4.lookAt(mvMatrix,eyePt,viewPt,up);    
 
    //Draw Terrain
    mvPushMatrix();
    vec3.set(transformVec,0.0,-0.25,-3.0);
    mat4.translate(mvMatrix, mvMatrix,transformVec);
    mat4.rotateX(mvMatrix, mvMatrix, degToRad(-75));
    mat4.rotateZ(mvMatrix, mvMatrix, degToRad(25));     
    setMatrixUniforms();
    
    // // These options allow users also draw edges of each vertex
    // if ((document.getElementById("polygon").checked) || (document.getElementById("wirepoly").checked))
    // {
    //   uploadLightsToShader([0,1,1],[0.8,0.8,0.8],[1.0,1.0,1.0],[1.0,1.0,1.0]);
    //   uploadMaterialToShader([0.0, 0.0, 0.0], [0.5, 0.1, 0.0], [1.0, 1.0, 1.0])
    //   drawTerrain();
    // }
    
    // if(document.getElementById("wirepoly").checked){
    //   uploadLightsToShader([0,1,1],[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]);
    //   uploadMaterialToShader([0.5, 0.0, 0.0], [0.5, 0.1, 0.0], [1.0, 1.0, 1.0])
    //   drawTerrainEdges();
    // }

    // if(document.getElementById("wireframe").checked){
    //   uploadLightsToShader([0,1,1],[0.0,0.0,0.0],[0.0,0.0,0.0],[0.0,0.0,0.0]);
    //   uploadMaterialToShader([0.5, 0.0, 0.0], [0.5, 0.1, 0.0], [1.0, 1.0, 1.0])
    //   drawTerrainEdges();
    // }

    // These options allow users to turn on/off the fog
    // if switch is on
    if ((document.getElementById("fog").checked))
    {
      uploadFogSwitchToShader(1.0); 
    }
    // iff switch is off
    if(document.getElementById("no fog").checked){
      uploadFogSwitchToShader(0.0); 
    }

    uploadLightsToShader([0,1,1],[0.8,0.8,0.8],[1.0,1.0,1.0],[1.0,1.0,1.0]);
    uploadMaterialToShader([0.0, 0.0, 0.0], [0.5, 0.1, 0.0], [1.0, 1.0, 1.0]); 
    drawTerrain();

    mvPopMatrix();
  
}

//----------------------------------------------------------------------------------
/**
 * Animation to be called from tick. Updates globals and performs animation for each tick.
 */
function animate() {
    var timeNow = new Date().getTime();
    var transformVec = vec3.create();
    if (lastTime != 0) {
       // speed = -0.001 ;
       transformVec = vec3.fromValues(0.0,0.0,Math.min(0.0, speed));
       vec3.add(eyePt,eyePt,transformVec); 
    }
    lastTime = timeNow;   
}

//----------------------------------------------------------------------------------
/**
 * Startup function called from html code to start program.
 */
 function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  // glFogi(GL_FOG_COORD_SRC, GL_FOG_COORDINATE);
  setupShaders();
  setupBuffers();
  gl.clearColor(0.7, 0.7, 0.7, 1.0);
  gl.enable(gl.DEPTH_TEST);

  document.onkeydown = keysdown; 
  document.onkeyup = keysup; 

  tick();
}

//----------------------------------------------------------------------------------
/**
 * Detect whcih key is pressed and apply the related transformation
 */
function KeyboardEventHandle() {

  if (keyspress[37]) {
        rollleft =rollleft+0.15;
  }
  else {
        rollleft=0;
  }
    
  if (keyspress[39]) {
        rollright =rollright-0.15;
  }
  else{
        rollright=0;
  }
    
  if (keyspress[38]) {
        pitchup  = pitchup +0.15;
  }
  else{
        pitchup  = 0;
  }
    
  if (keyspress[40]) {
        pitchdown = pitchdown-0.15;
  }
  else {
        pitchdown = 0;
  }

  if (keyspress[187]) {
        sign_fast = -1.0; 
  }
  else {
        sign_fast = 0.0; 
  }

  if (keyspress[189]) {
        sign_slow = 1.0; 
  }
  else {
        sign_slow = 0.0; 
  }

  if (keyspress[188]) {
        yawleft =yawleft+0.15;
  }
  else{
        yawleft=0;
  }

  if (keyspress[190]) {
        yawright =yawright-0.15;
  }
  else{
        yawright=0;
  }
  
}

//----------------------------------------------------------------------------------
/**
 * Tick called for every animation frame.
 */
function tick() {
    requestAnimFrame(tick);
    KeyboardEventHandle();
    draw();
    animate();
}

