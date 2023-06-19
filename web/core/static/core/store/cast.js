import {current} from 'immer';
import { MathUtils } from "three";

export const create_cast_slice=(set,get)=>({cast:{
    v(d,n,t,v){ // might need to check for node existence or track original reckon call
        if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,t,v);
    },
    transform(d,n,t,v){
        d.n[n].c[t] = v; 
        d.n[n].c.pos.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z);
        d.n[n].c.rot.set(
            MathUtils.degToRad(d.n[n].c.rx), MathUtils.degToRad(d.n[n].c.ry), MathUtils.degToRad(d.n[n].c.rz) 
        );
        const matrix = d.n[n].n.matrix;
        if(matrix){
            d.n[matrix[0]].c.matrix.makeRotationFromEuler(d.n[n].c.rot);
            d.n[matrix[0]].c.matrix.setPosition(d.n[n].c.pos);
            d.node.set(d, matrix[0], {element:d.n[matrix[0]].c.matrix.elements});
            d.node.for_nt(d,n,'point', p=>d.next('reckon.node',p));
        }
    }
}});

//if(['rx','ry','rz'].includes(t)) v = MathUtils.degToRad(v);