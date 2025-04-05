//asg0.js
function main(){

    // Retrieve <canvas> element
    canvas = document.getElementById('cnv1');
    if (!canvas){
        console.log('Failed to retrieve the <canvas> element');
        return false;
    }

    //get the rendering context for 2DCG
    ctx = canvas.getContext('2d');

    //Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';               // Set a black color
    ctx.fillRect(0, 0, canvas.width, canvas.height);    // fill a rectangle with the color
}

function drawVector(v, color){
    ctx.strokeStyle = color;

    // get center of x and y axis
    let cx = canvas.width/2;
    let cy = canvas.height/2;

    var scale = 20;
    
    var endx = cx + v.elements[0] * scale;
    var endy = cy - v.elements[1] * scale;
    

    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.lineTo(endx, endy);
    ctx.stroke();
}


function handleDrawEvent(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';               
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    

    var v1x = document.getElementById("v1x").value;
    console.log("v1 x:", v1x);
    var v1y = document.getElementById("v1y").value;
    console.log("v1 y:", v1y);

    var v1 = new Vector3([v1x, v1y, 0]);
    console.log("vector v1:", v1);
    drawVector(v1, "red");

    var v2x = document.getElementById("v2x").value;
    console.log("v2 x:", v2x);
    var v2y = document.getElementById("v2y").value;
    console.log("v2 y:", v2y);

    var v2 = new Vector3([v2x, v2y, 0]);
    console.log("vector v2:", v2);
    drawVector(v2, "blue");
}

function angleBetween(v1, v2){
    var d = Vector3.dot(v1,v2);
    var alpha = d / (v1.magnitude() * v2.magnitude());
    var angleRads = Math.acos(alpha);
    var angleDeg = angleRads * (180 / Math.PI)
    console.log("angle:", angleDeg, "degrees");
}

function areaTriangle(v1, v2){
    let v3 = Vector3.cross(v1, v2);
    let area = v3.magnitude() * .5;
    console.log("Area of the triangle:", area);
}

function handleDrawOptionEvent(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';               
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var op = document.getElementById("Operation").value;
    console.log(op);

    var v1x = document.getElementById("v1x").value;
    console.log("v1 x:", v1x);
    var v1y = document.getElementById("v1y").value;
    console.log("v1 y:", v1y);

    var v1 = new Vector3([v1x, v1y, 0]);
    console.log(v1);
    drawVector(v1, "red");

    var v2x = document.getElementById("v2x").value;
    console.log("v2 x:", v2x);
    var v2y = document.getElementById("v2y").value;
    console.log("v2 y:", v2y);

    var v2 = new Vector3([v2x, v2y, 0]);
    console.log(v2);
    drawVector(v2, "blue");

    var scal = document.getElementById("Scalar").value;

    if (op == "Add"){
        v1.add(v2);
        drawVector(v1, "green");
        console.log(v1);
    } else if (op == "Subtract"){
        v1.sub(v2);
        drawVector(v1, "green");
        console.log(v1);
    } else if (op == "Multiply"){
        v1.mul(scal);
        v2.mul(scal);
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (op == "Divide"){
        v1.div(scal);
        v2.div(scal);
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (op == "Magnitude"){
        console.log(v1.magnitude());
        console.log(v2.magnitude());
    } else if (op == "Normalize"){
        v1.normalize();
        v2.normalize();
        drawVector(v1, "green");
        drawVector(v2, "green");
    } else if (op == "Angle Between"){
        angleBetween(v1, v2);
    } else if (op == "Area"){
        areaTriangle(v1, v2);
    }

}