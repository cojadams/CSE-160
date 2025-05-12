class Cube{
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.textureNum = -1;
    }
    
    render() {
        // var xy = this.position;
        var rgba = this.color;
        // var size = this.size;
        // var segments = this.segments;

        // Pass the texture number
        // gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        // front
        gl.uniform4f(u_FragColor, rgba[0] * .9, rgba[1] * .9, rgba[2] * .9, rgba[3]);
        drawTriangle3D( [0,0,0,   1,1,0,    1,0,0 ] );
        drawTriangle3D( [0,0,0,   0,1,0,    1,1,0 ] );

        // back
        gl.uniform4f(u_FragColor, rgba[0] * .55, rgba[1] * .55, rgba[2] * .55, rgba[3]);
        drawTriangle3D( [0,0,1,   1,0,1,    1,1,1] );
        drawTriangle3D( [0,0,1,   1,1,1,    0,1,1] );

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

    renderfast() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];
        var alltexture = [];
        var allcolors = [];
        
        // helper: push a face of the cube
        const pushFace = (verts, uv, shade) => {
            allverts .push(...verts);
            alltexture.push(...uv);
            // for each triangle vertex, push the shaded color
            for (let i = 0; i < verts.length/3; i++) {
            allcolors.push(rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
            }
        };

        // face  (shade = .9)
        pushFace(
            [0,0,0,  1,1,0,  1,0,0,  0,0,0,  0,1,0,  1,1,0],
            [0,0, 1,1, 1,0,          0,0, 0,1, 1,1],
            0.9
        );
        // back (shade = .3)
        pushFace(
            [0,0,1,  1,0,1,  1,1,1,  0,0,1,  1,1,1,  0,1,1],
            [0,0, 0,1, 1,1,          0,0, 1,1, 1,0],
            0.55
        );

        // bottom
        pushFace(
            [0,0,0, 1,0,1, 0,0,1,   0,0,0, 1,0,0, 1,0,1],
            [0,0, 1,1, 1,0,             0,0, 0,1, 1,1 ],
            .2
        );

        // left
        pushFace(
            [0,0,0, 0,1,1, 0,0,1,    0,0,0, 0,1,0, 0,1,1],
            [0,0, 1,1, 1,0, 0,0, 0,1, 1,1],
            .6
        );
    
        // right
        pushFace(
            [1,0,0,   1,1,0,    1,1,1, 1,0,0,   1,1,1,    1,0,1],
            [0,0, 0,1, 1,1, 0,0, 1,1, 1,0],
            0.6
        );

        // top
        pushFace(
            [0,1,0,   1,1,1,    0,1,1, 0,1,0,   1,1,0,    1,1,1],
            [0,0, 1,1, 1,0, 0,0, 0,1, 1,1],
            .8
        );

        if (this.textureNum === -3 ){
            drawTriangle3DUV(allverts, alltexture, allcolors);
        } else {
            drawTriangle3DUV(allverts, alltexture, allcolors);
        }
        
    }
}