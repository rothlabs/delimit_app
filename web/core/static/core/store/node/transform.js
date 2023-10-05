import {Vector3, Euler, Quaternion, Matrix4, MathUtils} from 'three';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const euler = new Euler();
const quaternion = new Quaternion();

export const transform = {};
transform.source = ['target'];
transform.float = [
    'move_x',  'move_y',  'move_z', 
    'turn_x',  'turn_y',  'turn_z', 
    'scale_x', 'scale_y', 'scale_z',
];
transform.result = (d, s, c)=>{
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
    return {
        points:(cnt) => s.target.points(cnt).map(pnt=> pnt.applyMatrix4(matrix)),
    }
}

// const wrap = (trgt, mtrx)=>({
//     points:(cnt) => trgt.points(cnt).map(pnt=> pnt.applyMatrix4(mtrx)),
//  });
 //wrap(c.target[0], matrix);

