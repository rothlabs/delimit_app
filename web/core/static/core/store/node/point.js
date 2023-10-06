import {Vector3} from 'three';

const n = {};
n.float = ['x', 'y', 'z'];
n.part = (d, s, c)=>{
    const x = c.x ?? 0;
    const y = c.y ?? 0;
    const z = c.z ?? 0;
    return new Vector3(x, y, z); //d.part.point(  );
}
export const point = n;