import {Vector3} from 'three';

const n = {
    subject:  true,
    autocalc: true,
};
export const point = n;
n.float = {x:0, y:0, z:0};
n.part = (d, s, c)=>{
    return new Vector3(c.x ?? 0, c.y ?? 0, c.z ?? 0); //d.part.point(  );
};

// n.make = (a={})=>{
//     a.pos
// };