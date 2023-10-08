import {Vector3, Euler, Quaternion, Matrix4, MathUtils} from 'three';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const euler = new Euler();
const quaternion = new Quaternion();

const n = {};
n.source = ['target'];
n.float = {
    move_x:0,  move_y:0,  move_z:0, 
    turn_x:0,  turn_y:0,  turn_z:0, 
    scale_x:1, scale_y:1, scale_z:1,
};
n.part = (d, s, c)=>{
    v1.setX(c.move_x ?? 0);
    v1.setY(c.move_y ?? 0);
    v1.setZ(c.move_x ?? 0);
    v2.setX(MathUtils.degToRad(c.turn_x ?? 0));
    v2.setY(MathUtils.degToRad(c.turn_y ?? 0));
    v2.setZ(MathUtils.degToRad(c.turn_z ?? 0));
    v3.setX(c.scale_x ?? 0);
    v3.setY(c.scale_y ?? 0);
    v3.setZ(c.scale_z ?? 0);
    quaternion.setFromEuler(euler.setFromVector3(v2));
    const matrix = new Matrix4().compose(v1, quaternion, v3); 
    return s.target.transform(matrix);
}
export const transform = n;

// const wrap = (trgt, mtrx)=>({
//     points:(cnt) => trgt.points(cnt).map(pnt=> pnt.applyMatrix4(mtrx)),
//  });
 //wrap(c.target[0], matrix);

