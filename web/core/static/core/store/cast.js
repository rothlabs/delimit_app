import {current} from 'immer';
import { MathUtils, Vector3, Euler, Quaternion } from "three";

const tv = new Vector3();
const te = new Euler();

export const create_cast_slice=(set,get)=>({cast:{
    down(d,n,c){ 
        const content = {};
        c.split(' ').forEach(c=> content[c]=d.n[n].c[c]);
        d.node.for_n(d, n, (r,n)=> d.cast.base(d,n,content));
    },
    base(d,n,c){
        Object.entries(c).forEach(([t,c])=>{
            if(d.cast_tags[t]) d.n[n].c[t] = c; 
        });
        if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,c);
        if(!d.cast_end[d.n[n].t]) d.node.for_n(d, n, (r,n)=> d.cast.base(d,n,c));
    },
    point(d,n,c){
        if(c.matrix) d.next('reckon.node',n);
    },
    mixed_line(d,n,c){
        if(c.matrix) d.next('reckon.node',n,'matrix');
    },
}});


// d.cast_tags.forEach(t => { // make loop through c first and check if in cast tag
//     if(c[t]!=undefined) d.n[n].c[t] = c[t]; 
// });


// down(d,n,c){ 
//     const content = {};
//     c.split(' ').forEach(c=> content[c]=d.n[n].c[c]);
//     d.node.for_n(d, n, (r,n)=> d.cast.base(d,n,content));
// },
// base(d,n,c){
//     //d.n[n].c.matrix = c.matrix;
//     //d.n[n].c.inverse_matrix = c.inverse_matrix;
//     d.cast_tags.forEach(t => {
//         if(c[t]!=undefined) d.n[n].c[t] = c[t]; 
//     });
//     if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,c);
//     d.node.for_n(d, n, (r,n)=> d.cast.base(d,n,c));
// },

// down(d,n,c){ 
//     d.node.for_n(d, n, (r,n)=> d.cast.base(d,n,c));
// },

// down(d,n,c){ 
//     const content = {};
//     c.split(' ').forEach(c => content[c]=d.n[n].c[c]);
//     d.node.for_n(d, n, n=> d.cast.base(d,n,content));
// },
// base(d,n,c){
//     if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,c);
//     d.node.for_n(d, n, n=> d.cast.base(d,n,c));
// },
// point(d,n,c){
//     if(c.matrix){
//         d.n[n].c.matrix = c.matrix;
//         d.n[n].c.inverse_matrix = c.matrix
//         d.next('reckon.node',n);
//     }
// },


// v(d,n,t,v){ // might need to check for node existence or track original reckon call
//     if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,t,v);
// },
// high_level_node(d,n,t,v){

// }

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