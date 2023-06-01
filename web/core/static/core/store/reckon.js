import { Vector3 } from "three";
import {current} from 'immer';

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    node(d, n){ // might need to check for node existence or track original reckon call
        if(d.reckon[d.n[n].t]){                  d.reckon[d.n[n].t](d, n); d.reckon.base(d, n);  }
        else if(d.atom_tags.includes(d.n[n].t)){ d.reckon.atom(d, n);    }
        else{                                    d.reckon.default(d, n);     } // could delete this?
    },
    base(d, n){
        d.reckon.count++;
        d.node.for_r(d, n, r=> d.next('reckon.node', r)); // got to watch out for cycle
        d.next('design.update'); 
        d.next('inspect.update'); 
    },
    v(d, n, t){
        const result = {};
        t.split(' ').forEach(t=>{
            if(d.n[n].n && d.n[n].n[t] && d.node.be(d,d.n[n].n[t][0])){
                result[t] = d.n[d.n[n].n[t][0]].v;
                d.n[n].c[t] = result[t];
            }else{  d.n[n].c[t]=null; }
        });
        return result;
    },
    atom(d,n){
        d.reckon.base(d, n);
    },
    default(d,n){
        d.reckon.v(d, n, 'name');
        d.reckon.base(d, n);
    },
    list(d, n, t, func){ // build in n:n and color:color
        d.n[n].c[t] = [];
        d.n[n].n[t] && d.n[n].n[t].forEach(nn=>{
            if(d.node.be(d,nn)) d.n[n].c[t].push({n:nn, color:d.n[nn].pick.color[0], ...func(nn)});
        });
    },
    point(d,n){
        const pos = d.reckon.v(d, n, 'x y z');
        d.n[n].c.pos = new Vector3(pos.x, pos.y, pos.z); // for convenience in calculations elsewhere
    },
    line(d,n){
        d.reckon.list(d, n, 'point', n=>({   pos:d.n[n].c.pos   })); //x:d.n[n].c.x, y:d.n[n].c.y, z:d.n[n].c.z,
    },
    sketch(d,n){
        //d.reckon.list(d, n, 'line', n=>({}));
    },
}});

        // d.n[n].c.points = [];
        // d.n[n].n.point && d.n[n].n.point.forEach(p=>{
        //     if(d.node.be(d,p)){
        //         d.n[n].c.points.push({n:p, x:d.n[p].c.x, y:d.n[p].c.y, z:d.n[p].c.z, color:d.n[p].pick.color[0]});
        //     }
        // }); 



// v(d, n, t, o){
//     if(!o) o=0;
//     if(d.n[n].n[t] && o < d.n[n].n[t].length && d.node.be(d,d.n[n].n[t][o])){ // d.n[n].n && 
//         d.n[n].c[t] = d.n[d.n[n].n[t][o]].v;
//     }else{  d.n[n].c[t] = null; }
// },


//if(!d.n[n].c.point) d.n[n].c.point = {pos:new Vector3()};
//d.n[n].c.point = {pos: d.n[n].c.point.pos.set(pos.x, pos.y, pos.z)};
        //d.n[n].c.point = {pos: new Vector3(pos.x, pos.y, pos.z)};
        //if(!d.n[n].c.vector3)d.n[n].c.vector3 = new Vector3();
        //d.n[n].c.vector3.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z); // make sure each val is not undefined?