const groundHeight = -.751;

  function drawGround() {
    // Draw ground
    var ground = new Cube();
    ground.color = [0, 0, 0, 1];
    ground.textureNum = 3;
    ground.matrix.translate(0, -.751, 0);
    ground.matrix.scale(50, 0, 50);
    ground.matrix.translate(-.5, 0, -.5);
    ground.renderfast();

    // Draw the floor
    var floor = new Cube();
    floor.color = [1, 0, 0, 1];
    floor.textureNum = 4;
    floor.matrix.translate(0, -.75, 0);
    floor.matrix.scale(12, 0, 12);
    floor.matrix.translate(-.5, 0, -.5);
    floor.renderfast();
    
    // draw parking lot
    var parking = new Cube();
    parking.textureNum = 5;
    parking.matrix.translate(-2, groundHeight + .01, -25).scale(8.5, 0, 19);
    parking.renderfast();

    var parking1 = new Cube();
    parking1.textureNum = 5;
    parking1.matrix.translate(6.2, groundHeight + .01, -12.6).scale(12, 0, 19);
    parking1.renderfast();

    var s1 = new Cube();
    s1.color = [1, 1, 0, 1];
    s1.textureNum = -3;
    s1.matrix
      .translate(7, groundHeight+.03, 1.5)
      .scale(6, .001, .1);
    s1.renderfast();
    var s2 = new Cube();
    s2.color = [1, 1, 0, 1];
    s2.textureNum = -3;
    s2.matrix
      .translate(7, groundHeight+.03, -3)
      .scale(6, .001, .1);
    s2.renderfast();


  }

  function drawSky() {
    // Sky box
    var sky = new Cube();
    sky.color = [0, 0, 1, 1];
    sky.textureNum = 2;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.renderfast();

  }

  function drawBuilding() {
    // draw front wall
    const fwall = new Cube();
    fwall.color = [0.8, 1.0, 1.0, 1.0];
    fwall.textureNum = -3;
    fwall.matrix.translate(0, -.75, 0);
    fwall.matrix.scale(2, 5, .4);
    fwall.matrix.translate(-3.15, 0, -16);
    fwall.renderfast();
    const fwallcoord = new Matrix4(fwall.matrix);
    
    // front window
    const fwall1 = new Cube();
    fwall1.matrix = new Matrix4(fwallcoord);
    fwall1.color = [0.8, 1.0, 1.0, 1.0];
    fwall1.textureNum = -3;
    fwall1.matrix.translate(1, 0, 0);
    fwall1.matrix.scale(2, .2, 1);
    fwall1.renderfast();
    const fwallcoord1 = new Matrix4(fwall1.matrix);
    
    const fwall2 = new Cube();
    fwall2.matrix = new Matrix4(fwallcoord1);
    fwall2.color = [0.8, 1.0, 1.0, 1.0];
    fwall2.textureNum = -3;
    fwall2.matrix.translate(0, 4, 0);
    fwall2.renderfast();
    
    // front window pane
    const fwindow = new Cube();
    fwindow.matrix = new Matrix4(fwallcoord1);
    fwindow.color = [0, 0, 0, 1];
    fwindow.textureNum = -3;
    fwindow.matrix.translate(.5, 1, .35);
    fwindow.matrix.scale(.02, 3, .25);
    fwindow.renderfast();
    
    const fwindow1 = new Cube();
    fwindow1.matrix = new Matrix4(fwallcoord1);
    fwindow1.color = [0, 0, 0, 1];
    fwindow1.textureNum = -3;
    fwindow1.matrix.translate(0, 2.4, .3511);
    fwindow1.matrix.scale(1, .1, .2499);
    fwindow1.renderfast();
    
    const fwall3 = new Cube();
    fwall3.matrix = new Matrix4(fwallcoord);
    fwall3.color = [0.8, 1.0, 1.0, 1.0];
    fwall3.textureNum = -3;
    fwall3.matrix.translate(3, 0, 0);
    fwall3.matrix.scale(1.2, 1, 1);
    fwall3.renderfast();
    const fwallcoord3 = new Matrix4(fwall3.matrix)
    
    const fwall4 = new Cube();
    fwall4.matrix = new Matrix4(fwallcoord3);
    fwall4.color = [0.8, 1.0, 1.0, 1.0];
    fwall4.textureNum = -3;
    fwall4.matrix.translate(1, .8, 0);
    fwall4.matrix.scale(.9, .2, 1);
    fwall4.renderfast();
    
    const fwall5 = new Cube();
    fwall5.matrix = new Matrix4(fwallcoord);
    fwall5.color = [0.8, 1.0, 1.0, 1.0];
    fwall5.textureNum = -3;
    fwall5.matrix.translate(5.2, 0, 0);
    fwall5.matrix.scale(1.15, 1, 1);
    fwall5.renderfast();
    
    // draw back wall
    const bwall = new Cube();
    bwall.color = [0.8, 1.0, 1.0, 1.0];
    bwall.textureNum = -3;
    bwall.matrix.translate(0, -.75, 0);
    bwall.matrix.scale(12, 5, .4);
    bwall.matrix.translate(-.5, 0, 15);
    bwall.renderfast();
    
    // draw right wall
    const rwall = new Cube();
    rwall.color = [0.8, 1.0, 1.0, 1.0];
    rwall.textureNum = -3;
    rwall.matrix.translate(0, -.75, 0);
    rwall.matrix.scale(.4, 5, 2);
    rwall.matrix.translate(15, 0, 2.2);
    rwall.renderfast();
    const rwallcoord = new Matrix4(rwall.matrix);
    
    // right window
    const rwall1 = new Cube();
    rwall1.matrix = new Matrix4(rwallcoord);
    rwall1.color = [0.8, 1.0, 1.0, 1.0];
    rwall1.textureNum = -3;
    rwall1.matrix.translate(0, 0, -2);
    rwall1.matrix.scale(1, .2, 2);
    rwall1.renderfast(); 
    const rwallcoord1 = new Matrix4(rwall1.matrix);
    
    const rwall2 = new Cube();
    rwall2.matrix = new Matrix4(rwallcoord1);
    rwall2.color = [0.8, 1.0, 1.0, 1.0];
    rwall2.textureNum = -3;
    rwall2.matrix.translate(0, 4, 0);
    rwall2.renderfast();
    
    // right window frame
    const rwindow = new Cube();
    rwindow.matrix = new Matrix4(rwall1.matrix);
    rwindow.color = [0, 0, 0, 1];
    rwindow.textureNum = -3;
    rwindow.matrix.translate(.35, 1, .5);
    rwindow.matrix.scale(.2, 3, .03);
    rwindow.renderfast();
    
    const rwindow1 = new Cube();
    rwindow1.matrix = new Matrix4(rwall1.matrix);
    rwindow1.color = [0, 0, 0, 1];
    rwindow1.textureNum = -3;
    rwindow1.matrix.translate(.351, 2.4, 0);
    rwindow1.matrix.scale(.2, .1, 1);
    rwindow1.renderfast();
    
    const rwall3 = new Cube();
    rwall3.matrix = new Matrix4(rwallcoord);
    rwall3.color = [0.8, 1.0, 1.0, 1.0];
    rwall3.textureNum = -3;
    rwall3.matrix.translate(0, 0, -2.5);
    rwall3.matrix.scale(1, 1, .5);
    rwall3.renderfast();
    
    const rwall4 = new Cube();
    rwall4.matrix = new Matrix4(rwallcoord);
    rwall4.color = [0.8, 1.0, 1.0, 1.0];
    rwall4.textureNum = -3;
    rwall4.matrix.translate(0, 0, -5.2);
    rwall4.matrix.scale(1, 1, .7)
    rwall4.renderfast();
    const rwallcoord4 = new Matrix4(rwall4.matrix);
    
    const rwall5 = new Cube();
    rwall5.matrix = new Matrix4(rwallcoord4);
    rwall5.color = [0.8, 1.0, 1.0, 1.0];
    rwall5.textureNum = -3;
    rwall5.matrix.translate(0.001, 0, 1);
    rwall5.matrix.scale(1, .2, 2.9);
    rwall5.renderfast();
    const rwallcoord5 = new Matrix4(rwall5.matrix);
    
    const rwindow2 = new Cube();
    rwindow2.matrix = new Matrix4(rwallcoord5);
    rwindow2.color = [0, 0, 0, 1];
    rwindow2.textureNum = -3;
    rwindow2.matrix.translate(.35, 1, .5);
    rwindow2.matrix.scale(.2, 3, .03);
    rwindow2.renderfast();
    
    const rwindow3 = new Cube();
    rwindow3.matrix = new Matrix4(rwallcoord5);
    rwindow3.color = [0, 0, 0, 1];
    rwindow3.textureNum = -3;
    rwindow3.matrix.translate(.351, 2.4, 0);
    rwindow3.matrix.scale(.2, .1, 1);
    rwindow3.renderfast();
    
    const rwall6 = new Cube();
    rwall6.matrix = new Matrix4(rwallcoord5);
    rwall6.color = [0.8, 1.0, 1.0, 1.0];
    rwall6.textureNum = -3;
    rwall6.matrix.translate(0, 4, 0);
    rwall6.renderfast();
    
    
    // draw left wall
    const lwall = new Cube();
    lwall.color = [0.8, 1.0, 1.0, 1.0];
    lwall.textureNum = -3;
    lwall.matrix.translate(0, -.75, 0);
    lwall.matrix.scale(.4, 5, 2);
    lwall.matrix.translate(-16, 0, 2.2);
    lwall.renderfast();
    const lwallcoord = new Matrix4(lwall.matrix);
    
    const lwall1 = new Cube();
    lwall1.matrix = new Matrix4(lwallcoord);
    lwall1.color = [0.8, 1.0, 1.0, 1.0];
    lwall1.textureNum = -3;
    lwall1.matrix.translate(0, 0, -2);
    lwall1.matrix.scale(1, .2, 2);
    lwall1.renderfast(); 
    const lwallcoord1 = new Matrix4(lwall1.matrix);
    
    const lwall2 = new Cube();
    lwall2.matrix = new Matrix4(lwallcoord1);
    lwall2.color = [0.8, 1.0, 1.0, 1.0];
    lwall2.textureNum = -3;
    lwall2.matrix.translate(0, 4, 0);
    lwall2.renderfast();
    
    const lwindow = new Cube();
    lwindow.matrix = new Matrix4(lwall1.matrix);
    lwindow.color = [0, 0, 0, 1];
    lwindow.textureNum = -3;
    lwindow.matrix.translate(.35, 1, .5);
    lwindow.matrix.scale(.2, 3, .03);
    lwindow.renderfast();
    
    const lwindow1 = new Cube();
    lwindow1.matrix = new Matrix4(lwall1.matrix);
    lwindow1.color = [0, 0, 0, 1];
    lwindow1.textureNum = -3;
    lwindow1.matrix.translate(.351, 2.4, 0);
    lwindow1.matrix.scale(.2, .1, 1);
    lwindow1.renderfast();
    
    const lwall3 = new Cube();
    lwall3.matrix = new Matrix4(lwallcoord);
    lwall3.color = [0.8, 1.0, 1.0, 1.0];
    lwall3.textureNum = -3;
    lwall3.matrix.translate(0, 0, -2.5);
    lwall3.matrix.scale(1, 1, .5);
    lwall3.renderfast();
    
    const lwall4 = new Cube();
    lwall4.matrix = new Matrix4(lwallcoord);
    lwall4.color = [0.8, 1.0, 1.0, 1.0];
    lwall4.textureNum = -3;
    lwall4.matrix.translate(0, 0, -5.2);
    lwall4.matrix.scale(1, 1, .7)
    lwall4.renderfast();
    const lwallcoord4 = new Matrix4(lwall4.matrix);
    
    const lwall5 = new Cube();
    lwall5.matrix = new Matrix4(lwallcoord4);
    lwall5.color = [0.8, 1.0, 1.0, 1.0];
    lwall5.textureNum = -3;
    lwall5.matrix.translate(0.001, 0, 1);
    lwall5.matrix.scale(1, .2, 2.9);
    lwall5.renderfast();
    const lwallcoord5 = new Matrix4(lwall5.matrix);
    
    const lwindow2 = new Cube();
    lwindow2.matrix = new Matrix4(lwallcoord5);
    lwindow2.color = [0, 0, 0, 1];
    lwindow2.textureNum = -3;
    lwindow2.matrix.translate(.35, 1, .5);
    lwindow2.matrix.scale(.2, 3, .03);
    lwindow2.renderfast();
    
    const lwindow3 = new Cube();
    lwindow3.matrix = new Matrix4(lwallcoord5);
    lwindow3.color = [0, 0, 0, 1];
    lwindow3.textureNum = -3;
    lwindow3.matrix.translate(.351, 2.4, 0);
    lwindow3.matrix.scale(.2, .1, 1);
    lwindow3.renderfast();
    
    const lwall6 = new Cube();
    lwall6.matrix = new Matrix4(lwallcoord5);
    lwall6.color = [0.8, 1.0, 1.0, 1.0];
    lwall6.textureNum = -3;
    lwall6.matrix.translate(0, 4, 0);
    lwall6.renderfast();
    
    // roof
    const roof = new Cube();
    roof.color = [.5, 0, 0, 1];
    roof.textureNum = -3;
    roof.matrix.translate(-8, 4.25, -8);
    roof.matrix.scale(16, 1, 16);
    roof.renderfast();
  }

  function drawCounter() {
    // counter
    var counter = new Cube();
    counter.color = [.5, .5, .5, 1];
    counter.textureNum = -3;
    counter.matrix.translate(-6, -.75, 2);
    counter.matrix.scale(8, 1, 1);
    counter.renderfast();
    
    var counter1 = new Cube();
    counter1.color = [.5, .5, .5, 1];
    counter1.textureNum = -3;
    counter1.matrix.translate(1, -.75, 3);
    counter1.matrix.scale(1, 1, 1.5);
    counter1.renderfast();
  }

  function drawTableAndChair(x, y, z, r) {    
    // table
    const table = new Cube();
    table.color = [.8, .8, .8, 1];
    table.textureNum = -3;
    table.matrix.translate(x, y, z);
    if (r != 0) {
      table.matrix.rotate(r, 0, 1, 0);
    }
    table.matrix.scale(1, .1, 1);
    table.renderfast();
    const tablecoord = new Matrix4(table.matrix);
  
    const tstand = new Cube();
    tstand.matrix = new Matrix4(tablecoord);
    tstand.color = [0, 0, 0, 1];
    tstand.textureNum = -3;
    tstand.matrix.translate(.4, -10, .4);
    tstand.matrix.scale(.2, 10, .2);
    tstand.renderfast();
    
    const tleg = new Cube();
    tleg.matrix = new Matrix4(tablecoord);
    tleg.color = [0, 0, 0, 1];
    tleg.textureNum = -3;
    tleg.matrix.translate(.45, -10, 0);
    tleg.matrix.scale(.1, 1, 1);
    tleg.renderfast();
    
    const tleg1 = new Cube();
    tleg1.matrix = new Matrix4(tablecoord);
    tleg1.color = [0, 0, 0, 1];
    tleg1.textureNum = -3;
    tleg1.matrix.translate(0, -10, .45);
    tleg1.matrix.scale(1, 1, .1);
    tleg1.renderfast();
    
    // chair1 to table
    const chairbase = new Cube();
    chairbase.matrix = new Matrix4(tablecoord);
    chairbase.color = [.4, .2, .2, 1];
    chairbase.textureNum = -3;
    chairbase.matrix.translate(-.5, -4, .2);
    chairbase.matrix.scale(.7, 1, .6);
    chairbase.renderfast();
    const cbcoord = new Matrix4(chairbase.matrix);
    
    const chairleg = new Cube();
    chairleg.matrix = new Matrix4(cbcoord);
    chairleg.color = chairbase.color;
    chairleg.textureNum = -3;
    chairleg.matrix.scale(.1, 5.5, .1);
    chairleg.matrix.translate(0, -1, 1);
    chairleg.renderfast();
    
    const chairleg1 = new Cube();
    chairleg1.matrix = new Matrix4(cbcoord);
    chairleg1.color =chairbase.color;
    chairleg1.textureNum = -3;
    chairleg1.matrix.translate(.8, 0, 0);
    chairleg1.matrix.scale(.1, 5.5, .1);
    chairleg1.matrix.translate(0, -1, 1);
    chairleg1.renderfast();
    
    const chairleg2 = new Cube();
    chairleg2.matrix = new Matrix4(cbcoord);
    chairleg2.color = chairbase.color;
    chairleg2.textureNum = -3;
    chairleg2.matrix.translate(.8, 0, .8);
    chairleg2.matrix.scale(.1, 5.5, .1);
    chairleg2.matrix.translate(0, -1, 0);
    chairleg2.renderfast();
    
    const chairleg3 = new Cube();
    chairleg3.matrix = new Matrix4(cbcoord);
    chairleg3.color = chairbase.color;
    chairleg3.textureNum = -3;
    chairleg3.matrix.translate(0, 0, .8);
    chairleg3.matrix.scale(.1, 5.5, .1);
    chairleg3.matrix.translate(0, -1, 0);
    chairleg3.renderfast();
    
    const chairback = new Cube();
    chairback.matrix = new Matrix4(cbcoord);
    chairback.color = chairbase.color;
    chairback.textureNum = -3;
    chairback.matrix.scale(.1, 7, .999);
    chairback.renderfast();
    
    // chair2 to table
    const chairbase2 = new Cube();
    chairbase2.matrix = new Matrix4(tablecoord);
    chairbase2.color = [.4, .2, .2, 1];
    chairbase2.textureNum = -3;
    chairbase2.matrix.translate(1.5, -4, .8);
    chairbase2.matrix.scale(.7, 1, .6);
    chairbase2.matrix.rotate(180, 0, 1, 0);
    chairbase2.renderfast();
    const cb2coord = new Matrix4(chairbase2.matrix);
    
    const chair2leg = new Cube();
    chair2leg.matrix = new Matrix4(cb2coord);
    chair2leg.color = chairbase.color;
    chair2leg.textureNum = -3;
    chair2leg.matrix.scale(.1, 5.5, .1);
    chair2leg.matrix.translate(0, -1, 1);
    chair2leg.renderfast();
    
    const chair2leg1 = new Cube();
    chair2leg1.matrix = new Matrix4(cb2coord);
    chair2leg1.color =chairbase.color;
    chair2leg1.textureNum = -3;
    chair2leg1.matrix.translate(.8, 0, 0);
    chair2leg1.matrix.scale(.1, 5.5, .1);
    chair2leg1.matrix.translate(0, -1, 1);
    chair2leg1.renderfast();
    
    const chair2leg2 = new Cube();
    chair2leg2.matrix = new Matrix4(cb2coord);
    chair2leg2.color = chairbase.color;
    chair2leg2.textureNum = -3;
    chair2leg2.matrix.translate(.8, 0, .8);
    chair2leg2.matrix.scale(.1, 5.5, .1);
    chair2leg2.matrix.translate(0, -1, 0);
    chair2leg2.renderfast();
    
    const chair2leg3 = new Cube();
    chair2leg3.matrix = new Matrix4(cb2coord);
    chair2leg3.color = chairbase.color;
    chair2leg3.textureNum = -3;
    chair2leg3.matrix.translate(0, 0, .8);
    chair2leg3.matrix.scale(.1, 5.5, .1);
    chair2leg3.matrix.translate(0, -1, 0);
    chair2leg3.renderfast();
    
    const chair2back = new Cube();
    chair2back.matrix = new Matrix4(cb2coord);
    chair2back.color = chairbase.color;
    chair2back.textureNum = -3;
    chair2back.matrix.scale(.1, 7, .999);
    chair2back.renderfast();
  }


  function drawMap() {
    
    drawGround();
    
    drawSky();
    
    drawBuilding();
    
    drawCounter();
    drawRegister();
    
    drawTableAndChair(-5, .2, -5, 0);
    drawTableAndChair(-5, .2, -2, 0);
    drawTableAndChair(-2, .2, -2, 0);
    drawTableAndChair(-2, .2, -5, 0);
    
    drawTableAndChair(4, .2, -2, 90);
    drawTableAndChair(4, .2, 3, 90);
    
    drawPizza();
    drawPerson(
      g_personPos[0],
      g_personPos[1],
      g_personPos[2],
      g_personAngle
      
    );
    personWalk();

    drawCar(8, -.3, 3, [.5, 0, 0, 1]);
    drawCar(8, -.3, -2, [0, .3, 0, 1]);
    
  }

  function drawCar(x, y, z, c) {

    const rootMat = new Matrix4()
      .setIdentity()
      .translate(x, y, z);

    const cBody = new Cube();
    cBody.color      = c;
    cBody.textureNum = -3;
    cBody.matrix     = new Matrix4(rootMat)
                        .translate(-.5, 0, 0)
                        .scale(4.7, 1, 2);
    cBody.renderfast();

    const cTop = new Cube();
    cTop.color      = c;
    cTop.textureNum = -3;
    cTop.matrix     = new Matrix4(rootMat)
                        .translate(1.4, .8, 0.25)
                        .scale(1.5, 1.0, 1.5);
    cTop.renderfast();

    const cFront = new Cube();
    cFront.color      = [1,1,1,1];
    cFront.textureNum = -3;
    cFront.matrix     = new Matrix4(rootMat)
                        .translate( .95,  0.31, 0.31 )
                        .rotate(45, 0, 0, 1)
                        .scale(1.35, 0.7, 1.4);
    cFront.renderfast();

    const cBack = new Cube();
    cBack.color      = [1,1,1,1];
    cBack.textureNum = -3;
    cBack.matrix     = new Matrix4(rootMat)
                        .translate(3.3,  0.35, 0.31)
                        .rotate(45,  0, 0, 1)
                        .scale(0.7,  1.309, 1.4);
    cBack.renderfast();

    const w1 = new Cylinder([0, 0, 0, 1]);
    w1.matrix = new Matrix4(rootMat)
                .translate(.8, 0, 2)
                .rotate(90, 1, 0, 0)
                .scale(1, .4, 1);
    w1.render();

    const w2 = new Cylinder([0, 0, 0, 1]);
    w2.matrix = new Matrix4(rootMat)
                .translate(.8, 0, 0)
                .rotate(270, 1, 0, 0)
                .rotate(180, 0, 1, 0)
                .scale(1, .4, 1);
    w2.render();

    const w3 = new Cylinder([0, 0, 0, 1]);
    w3.matrix = new Matrix4(rootMat)
                .translate(3.2, 0, 2)
                .rotate(90, 1, 0, 0)
                .scale(1, .4, 1);
    w3.render();

    const w4 = new Cylinder([0, 0, 0, 1]);
    w4.matrix = new Matrix4(rootMat)
                .translate(3.2, 0, 0)
                .rotate(270, 1, 0, 0)
                .rotate(180, 0, 1, 0)
                .scale(1, .4, 1);
    w4.render();

  }

  function drawRegister(){
    const base = new Cube();
    base.color = [.2, .2, .2, 1];
    base.textureNum = -3;
    base.matrix.translate(0, .25, 2.3).scale(.5, .2, .5);
    base.renderfast();
    const basecd = new Matrix4(base.matrix);

    const top1 = new Cube();
    top1.color = base.color;
    top1.textureNum = -3;
    top1.matrix = new Matrix4(basecd);
    top1.matrix.translate(0,.5,0).scale(1, 1.5, .5);
    top1.renderfast();

    const drawer = new Cube();
    drawer.matrix = new Matrix4(basecd);
    drawer.color = base.color;
    drawer.textureNum = -3;
    drawer.matrix.translate(.05, 0, .15).scale(.9, .9, .9); // change z to 1 for open
    drawer.renderfast();

    // const top2 = new Triangle3D();
    // top2.matrix = new Matrix4(basecd);
    // top2.color = [1, 1, 1, 1];
    // top2.matrix.translate(.5,1.2,.5);
    // top2.matrix.rotate(90, 0, 1, 0);
    // top2.matrix.scale(1, 1, .98);
    // top2.renderfast();
  }

  function drawPizza(){
    var pizza = new Cylinder([1,1,0,1]);
    // reset the model matrix for the pizza
    
    pizza.matrix.setIdentity();
    pizza.matrix.translate(-2, .3, 2.5).scale(.8, .1, .8)

    // upload that matrix to the shader
    gl.uniformMatrix4fv(
      u_ModelMatrix,          // from connectVariablesToGLSL()
      false,
      pizza.matrix.elements
    );

    // renderfast() the cylinder
    pizza.render();
  }

  function walkTo(tx, ty, tz) {
    g_personTarget   = [tx, ty, tz];
    g_walkAnimation  = true;   // so arms swing
  }

function updatePerson(dt) {
    if (!g_personTarget) return;

    // vector to target
    const dx   = g_personTarget[0] - g_personPos[0];
    const dz   = g_personTarget[2] - g_personPos[2];
    const dist = Math.hypot(dx, dz);
    if (dist < 0.01) {
      g_personPos    = g_personTarget.slice();
      g_personTarget = null;
      g_walkAnimation = false;
      return;
    }

    // move forward by speed*delta
    const move = Math.min(dist, g_personSpeed * delta);
    g_personPos[0] += (dx / dist) * move;
    g_personPos[2] += (dz / dist) * move;

    // update facing angle
    g_personAngle = Math.atan2(dx, dz) * 180/Math.PI;
}


  function drawPerson(x, y, z, angle = 0){
    
    const pRoot = new Matrix4()
      .setIdentity()
      .translate(x, y, z)
      .rotate(angle, 0, 1, 0);

    // Draw the body cube
    const body = new Cube();
    body.color = [0, .4, 0, 1];
    body.textureNum = -3;
    body.matrix = new Matrix4(pRoot)
                    .translate(-.25, 0, -.25)
                    .scale(0.5, .6, .5);
                    // .scale(4, 4,4);
    body.renderfast();
    // const bodyCoord = new Matrix4(body.matrix);
  
    // butt
    const butt = new Cube();
    butt.color = [.2, .2, .6, 1];
    butt.textureNum = -3;
    butt.matrix = new Matrix4(pRoot)
                    .translate(-.3, -.1, -.2501)
                    .scale(.6, .3, .51);
    butt.renderfast();

    // left leg
    const leftLeg = new Cube();
    // leftLeg.matrix = new Matrix4(bodyCoord);
    leftLeg.color = [.2, .2, .6, 1];
    leftLeg.textureNum = -3;
    leftLeg.matrix = new Matrix4(pRoot)
      .translate(.1, 0, .1)  
      .rotate(g_walkAngle1, 1, 0, 0)
      .scale(.2, .68, .25);
    leftLeg.renderfast();
    const leftLegCD = new Matrix4(leftLeg.matrix);
  
    // left foot
    const leftFoot = new Cube();
    leftFoot.matrix = new Matrix4(leftLegCD);
    leftFoot.color = [0, 0, 0, 1];
    leftFoot.textureNum = -3;
    leftFoot.matrix.translate(-.1, .9, -.3);
    leftFoot.matrix.scale(1.2, .1, 1.5);
    leftFoot.renderfast();
  
    // right leg
    const rightLeg = new Cube();
    // rightLeg.matrix = new Matrix4(bodyCoord);
    rightLeg.color = [.2, .2, .6, 1];
    rightLeg.textureNum = -3;
    rightLeg.matrix = new Matrix4(pRoot)  
                        .rotate(g_walkAngle2, 1, 0, 0)
                        .translate(-.3, 0, -.1)
                        .scale(.2, .68, .25);
    rightLeg.renderfast();
    const rightLegCD = new Matrix4(rightLeg.matrix);
  
    // right foot
    const rightFoot = new Cube();
    rightFoot.matrix = new Matrix4(rightLegCD);
    rightFoot.color = [0, 0, 0, 1];
    rightFoot.textureNum = -3;
    rightFoot.matrix.translate(-.1, .9, -.3);
    rightFoot.matrix.scale(1.2, .1, 1.5);
    rightFoot.renderfast();

    const shoulder = new Cube();
    shoulder.color = [0, .4, 0, 1];
    shoulder.textureNum = -3;
    shoulder.matrix = new Matrix4(pRoot)
                        .translate(-.35, .6, -.25)
                        .scale(.7, .3, .5);
    shoulder.renderfast();
  
    // neck
    const neck = new Cube();
    // neck.matrix = new Matrix4(bodyCoord);
    neck.color = [.8, .4, .4, 1];
    neck.textureNum = -3;
    neck.matrix = new Matrix4(pRoot)
                    .translate(-.1, .9, -.1)
                    .scale(.2, .1, .2);
    neck.renderfast();
    const neckCD = new Matrix4(neck.matrix);
  
    //head
    var head = new Cube();
    // head.matrix = new Matrix4(neckCD)
    head.color = neck.color;
    head.textureNum = -3;
    head.matrix = new Matrix4(pRoot)
                    .translate(-.2, 1, -.2)
                    .scale(.4, .4, .4);
    head.renderfast();
  
    // left arm
    const leftArm = new Cube();
    // leftArm.matrix = new Matrix4(bodyCoord);
    leftArm.color = body.color
    leftArm.textureNum = -3;
    leftArm.matrix = new Matrix4(pRoot)
                      .translate(-.2, .7, -.1)
                      .rotate(150, 0, 0, 1)
                      .scale(.15, .7, .15);
    leftArm.renderfast();
    const leftArmCD = new Matrix4(leftArm.matrix);
  
    // left hand
    const leftHand = new Cube();
    leftHand.matrix = leftArmCD;
    leftHand.color = neck.color;
    leftHand.textureNum = -3;
    // leftHand.matrix = new Matrix4(pRoot)
    //                     .translate(-.1, 1, -.1)
    //                     .scale(1.2, .2, 1.2);
    leftHand.matrix.translate(-.1, .9, -.1).scale(1.2, .2, 1.2)
    leftHand.renderfast();
  
    // right arm
    const rightArm = new Cube();
    // rightArm.matrix = new Matrix4(bodyCoord);
    rightArm.color = body.color;
    rightArm.textureNum = -3;
    rightArm.matrix = new Matrix4(pRoot)
                        .translate(.35, .8, -.1)
                        .rotate(-150, 0, 0, 1)
                        .scale(.15, .7, .15);
    rightArm.renderfast();
    const rightArmCD = new Matrix4(rightArm.matrix);
  
    // right hand
    const rightHand = new Cube();
    rightHand.matrix = new Matrix4(rightArmCD);
    rightHand.color = neck.color;
    rightHand.textureNum = -3;
    rightHand.matrix.translate(-.1, .9, -.1).scale(1.2, .2, 1.2);
    // rightHand.matrix = new Matrix4(pRoot)
    //                     .translate(-.1, 1, -.1)
    //                     .scale(1.2, .2, 1.2);
    rightHand.renderfast();
  
  }

  function personWalk() {
  if (g_walkAnimation) {
    const t = g_armSpeed * g_seconds;
    const base = 180, amp = 30;
    g_walkAngle1 = base + amp * Math.sin(2*t +      Math.PI/4);
    g_walkAngle2 = base + amp * Math.sin(2*t +  5 * Math.PI/4);
  }

  


}