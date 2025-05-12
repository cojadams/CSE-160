
// returns u⋅v
function dot(u, v) {
    return u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
}
  
// returns a unit version of v
function normalize(v) {
    const len = Math.hypot(v[0], v[1], v[2]);
    return len === 0 ? [0,0,0] : [ v[0]/len, v[1]/len, v[2]/len ];
}

class Cylinder {
    constructor(color = [1,1,1,1]) {
      this.type = 'cylinder';
      this.matrix = new Matrix4();
      this.segments = 30;
      this.color = color.slice();
      this.buffer = null;
      this.vertices = [];
    }
  
    render() {
      gl.uniform1i(u_whichTexture, -2);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      const [r,g,b,a]   = this.color;
      const L = 0.5, H = 0.5;
      const lightDir    = normalize([0,1,-1]);
      const d = 2*Math.PI / this.segments;

      for (let i = 0; i < this.segments; i++) {
        const θ1 = i   * d,  θ2 = (i+1) * d;
        const x1 = Math.cos(θ1)*L,  z1 = Math.sin(θ1)*L;
        const x2 = Math.cos(θ2)*L,  z2 = Math.sin(θ2)*L;

        // — top cap in the XZ plane at y=+H
        let shade = Math.max(0, dot([0,1,0], lightDir));
        gl.uniform4f(u_FragColor, r*shade, g*shade, b*shade, a);
        drawTriangle3D([  0, H, 0,   x2, H, z2,   x1, H, z1 ]);

        // — bottom cap at y=-H
        shade = Math.max(0, dot([0,-1,0], lightDir));
        gl.uniform4f(u_FragColor, r*shade, g*shade, b*shade, a);
        drawTriangle3D([  0, -H, 0,   x1, -H, z1,   x2, -H, z2 ]);

        // — side (two tris)
        const n = normalize([ (x1+x2)/2, 0, (z1+z2)/2 ]);
        shade = Math.max(0, dot(n, lightDir));
        gl.uniform4f(u_FragColor, r*shade, g*shade, b*shade, a);

        // tri A
        drawTriangle3D([
          x1,  H, z1,
          x1, -H, z1,
          x2,  H, z2
        ]);
        // tri B
        drawTriangle3D([
          x2,  H, z2,
          x1, -H, z1,
          x2, -H, z2
        ]);
      }
    }
  
}