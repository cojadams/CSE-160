class Circle {
    constructor() {
      this.type = 'circle';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 10.0;
      this.segments = 10;
  
      this.matrix = new Matrix4();
      this.buffer = null;
    }
    
    render() {
  
      var xy = this.position;
      var rgba = this.color;
  
      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      if (this.buffer === null) {
        // Create a buffer object
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }
  
      this.generateVertices();
      
      drawTriangle3D(this.vertices, this.buffer);
    }
  
    generateVertices() {
  
      let [x, y, z] = this.position;
      var d = this.size / 200.0; // delta
  
      let v = [];
      let angleStep = 360 / this.segments;
      for (var angle = 0; angle < 360; angle = angle + angleStep) {
        let centerPt = [x, y];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [
          Math.cos((angle1 * Math.PI) / 180) * d,
          Math.sin((angle1 * Math.PI) / 180) * d,
        ];
        let vec2 = [
          Math.cos((angle2 * Math.PI) / 180) * d,
          Math.sin((angle2 * Math.PI) / 180) * d,
        ];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
  
        v.push(x, y, z, pt1[0], pt1[1],z, pt2[0], pt2[1],z);
      }
  
      this.vertices = v;
    }
  }