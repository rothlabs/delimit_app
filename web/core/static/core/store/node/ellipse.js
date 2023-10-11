import {Vector3, Matrix4, MathUtils, EllipseCurve} from 'three';
import {current} from 'immer';

const v1 = new Vector3();
const v2 = new Vector3();
const up = new Vector3(0,1,0);
const make = (c)=> new EllipseCurve(
    0,  0,                            // aX, aY
    c.radius_a, c.radius_b,           // xRadius, yRadius
    MathUtils.degToRad(c.angle_a-90), // aStartAngle,
    MathUtils.degToRad(c.angle_b-90), // aEndAngle
    false,                            // aClockwise
    0                                 // aRotation
);

const n = {};
n.autocalc = true;
n.float = {
    x:0, y:0, z:0, 
    axis_x:0, axis_y:1, axis_z:0, 
    radius_a:10, radius_b:10, 
    angle_a:0, angle_b:180,
};
n.reckon = (d, s, c)=>{
    const matrix = new Matrix4().lookAt(v1, v2.set(c.axis_x, c.axis_y, c.axis_z), up);
    matrix.setPosition(c.x, c.y, c.z);
    return d.part.curve(d, make(c), matrix.multiply(c.matrix));
};
export const ellipse = n; 

