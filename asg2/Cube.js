class Cube{
    constructor() {
        this.type = 'cube';
        // this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        // this.size = 5.0;
        // this.segments = 10;
        this.matrix = new Matrix4();
    }
    
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // var segments = this.segments;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // face
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3D( [0,0,0,   1,1,0,    1,0,0 ] );
        drawTriangle3D( [0,0,0,   0,1,0,    1,1,0 ] );

        // back
        gl.uniform4f(u_FragColor, rgba[0] * .3, rgba[1] * .3, rgba[2] * .3, rgba[3]);
        drawTriangle3D( [0,0,1,   1,0,1,    1,1,1] );
        drawTriangle3D( [0,0,1,   1,1,1,    0,1,1] );

        // Other sides of cube top, bottom, left, right, back
        // bottom
        gl.uniform4f(u_FragColor, rgba[0] * .2, rgba[1] * .2, rgba[2] * .2, rgba[3]);
        drawTriangle3D( [0,0,0,   1,0,1,    0,0,1] );
        drawTriangle3D( [0,0,0,   1,0,0,    1,0,1] );

        // left
        gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
        drawTriangle3D( [0,0,0,   0,1,1,    0,0,1] );
        drawTriangle3D( [0,0,0,   0,1,0,    0,1,1] );
        
        // right
        gl.uniform4f(u_FragColor, rgba[0] * .6, rgba[1] * .6, rgba[2] * .6, rgba[3]);
        drawTriangle3D( [1,0,0,   1,1,0,    1,1,1] );
        drawTriangle3D( [1,0,0,   1,1,1,    1,0,1] );

        // top
        gl.uniform4f(u_FragColor, rgba[0] * .8, rgba[1] * .8, rgba[2] * .8, rgba[3]);
        drawTriangle3D( [0,1,0,   1,1,1,    0,1,1] );
        drawTriangle3D( [0,1,0,   1,1,0,    1,1,1] );
    }
}