import {Vector3} from 'three';

export const point = {};
point.float = ['x', 'y', 'z'];
point.result = (d, s, c)=>{
    console.log('reckon point');
    const x = c.x ?? 0;
    const y = c.y ?? 0;
    const z = c.z ?? 0;
    return new Vector3(x, y, z);
}