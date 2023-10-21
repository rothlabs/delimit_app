import {Vector3} from 'three';

const n = {};
export const point = n;
n.autocalc = true;
n.float = {x:0, y:0, z:0};
n.reckon = (d, s, c)=>{
    const x = c.x ?? 0;
    const y = c.y ?? 0;
    const z = c.z ?? 0;
    return new Vector3(x, y, z); //d.part.point(  );
};

// n.make = (a={})=>{
//     a.pos
// };