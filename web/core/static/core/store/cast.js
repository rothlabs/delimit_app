import {current} from 'immer';
import { MathUtils, Vector3, Euler, Quaternion } from "three";

const tv = new Vector3();
const te = new Euler();

export const create_cast_slice=(set,get)=>({cast:{
    v(d,n,t,v){ // might need to check for node existence or track original reckon call
        if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,t,v);
    },
    // high_level_node(d,n,t,v){

    // }
}});

//if(['rx','ry','rz'].includes(t)) v = MathUtils.degToRad(v);

// transform(d,n,t,v){
//     if(!d.n[n].n[t]) d.n[n].c[t] = v; 
//     const matrix_node = d.n[n].n.matrix;
//     const matrix = d.n[matrix_node].c.matrix;
//     if(matrix){
//         tv.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z);
//         te.set(MathUtils.degToRad(d.n[n].c.turn_x), MathUtils.degToRad(d.n[n].c.turn_y), MathUtils.degToRad(d.n[n].c.turn_z));
//         matrix.makeRotationFromEuler(te);
//         matrix.setPosition(tv);
//         d.node.set(d, matrix_node, {element:matrix.elements});
//     }
//     console.log('try to reckon points');
//     d.node.for_nt(d,n,'point', p=>d.next('reckon.node',p));
// }