import {current} from 'immer';
//import { MathUtils, Vector3, Euler, Quaternion } from "three";

//const tv = new Vector3();
//const te = new Euler();

export const create_clear_slice=(set,get)=>({clear:{
    down(d,n,c){ 
        if(d.n[n].c.matrix === c.matrix) d.n[n].c.matrix = null;
        if(d.n[n].c.inverse_matrix === c.inverse_matrix) d.n[n].c.inverse_matrix = null;
        if(d.clear[d.n[n].t]) d.clear[d.n[n].t](d,n,c);
        d.node.for_n(d, n, (r,n)=> d.clear.down(d,n,c));
    },
    point(d,n,c){
        if(c.matrix) d.next('reckon.node',n);
    },
}});
