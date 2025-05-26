const WORLD_UP = new Vector3([0, 1, 0]);

class Camera {
  constructor() {
    // fixed eye height
    this.eye    = new Vector3([0, .8, 3]);  // e.g. 1.6m tall
    this.at     = new Vector3([0, .8, 2]); 
    this.up     = new Vector3(WORLD_UP.elements);
    this.pitchAngle = 0;                     
  }

  getViewMatrix() {
    return new Matrix4().setLookAt(
        this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
        this.at.elements[0], this.at.elements[1], this.at.elements[2],
        this.up.elements[0], this.up.elements[1], this.up.elements[2]
    );
  }

  getProjMatrix(aspect) {
    return new Matrix4().setPerspective(100, aspect, 0.1, 100.0);
  }

  // ——— Movement: project onto XZ-plane ———
  forward(dist = 0.1) {
    // full view‑dir
    const f = new Vector3(this.at.elements)
                .sub(this.eye)
                .normalize();
    // zero out vertical
    f.elements[1] = 0;
    f.normalize();
    f.mul(dist);
    this.eye.add(f);
    this.at.add(f);
  }

  back(dist = 0.1) {
    const f = new Vector3(this.eye.elements)
                .sub(this.at)
                .normalize();
    f.elements[1] = 0;
    f.normalize();
    f.mul(dist);
    this.eye.add(f);
    this.at.add(f);
  }

  left(dist = 0.1) {
    // get horizontal forward
    const f = new Vector3(this.at.elements)
                .sub(this.eye)
                .normalize();
    f.elements[1] = 0; f.normalize();
    // right = forward × worldUp
    const right = Vector3.cross(f, WORLD_UP).normalize();
    right.mul(dist);
    this.eye.sub(right);
    this.at.sub(right);
  }

  right(dist = 0.1) {
    const f = new Vector3(this.at.elements)
                .sub(this.eye)
                .normalize();
    f.elements[1] = 0; f.normalize();
    const right = Vector3.cross(f, WORLD_UP).normalize();
    right.mul(dist);
    this.eye.add(right);
    this.at.add(right);
  }
  
  moveUp(dist = 0.1){
    const offset = new Vector3(WORLD_UP.elements)
                    .normalize()
                    .mul(dist);
    this.eye.add(offset);
    this.at.add(offset);
  }

  moveDown(dist = 0.1) {
    this.moveUp(-dist);
  }


  // ——— Yaw only about world‑up ———
  yaw(angleDeg) {
    const R = new Matrix4().setRotate(angleDeg, 0, 1, 0);
    const forward = new Vector3(this.at.elements)
                       .sub(this.eye)
                       .normalize();
    const f4 = R.multiplyVector4(new Vector4([...forward.elements, 0]));
    this.at = new Vector3(this.eye.elements)
                .add(new Vector3(f4.elements.slice(0,3)));
    // up stays WORLD_UP (no need to rotate it)
    this.up = new Vector3(WORLD_UP.elements);
  }

  // ——— Pitch about camera’s right axis, with clamp ———
  pitch(angleDeg) {
    // clamp total pitch to avoid flipping
    const next = this.pitchAngle + angleDeg;
    if (next > 89 || next < -89) return;
    this.pitchAngle = next;

    // right axis based on horizontal forward
    const forward = new Vector3(this.at.elements)
                       .sub(this.eye)
                       .normalize();
    const right = Vector3.cross(forward, WORLD_UP).normalize();

    const R = new Matrix4()
      .setRotate(angleDeg, right.elements[0], right.elements[1], right.elements[2]);

    // rotate forward
    const f4 = R.multiplyVector4(new Vector4([...forward.elements, 0]));
    this.at = new Vector3(this.eye.elements)
                .add(new Vector3(f4.elements.slice(0,3)));

    // recompute up = right × forward
    const newF = new Vector3(f4.elements.slice(0,3)).normalize();
    this.up = Vector3.cross(right, newF).normalize();
  }
}