import { Matrix4, Vector3, Euler, MathUtils } from "three";
import {current} from 'immer';
import { subSS } from '../app.js';
import lodash from 'lodash';

const zero_vector = new Vector3();
const tm = new Matrix4();

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    node(d, n, cause){ // might need to check for node existence or track original reckon call
        if(d.reckon[d.n[n].t])                 {d.reckon[d.n[n].t](d,n,cause); d.reckon.base(d,n,cause);}
        else if(d.atom_tags.includes(d.n[n].t)){d.reckon.atom(d,n,cause)}
        else                                   {d.reckon.default(d,n,cause)} // could delete this?
    },
    base(d, n, cause){
        d.reckon.count++;
        d.reckon.v(d, n, 'name story'); // make this loop to do all string_tags except text
        d.node.for_r(d, n, r=>{
            if(!(cause=='color' && !d.pick.reckon_tags.includes(d.n[r].t))) d.next('reckon.node', r, cause); //{src:n, ...a}
        }); // got to watch out for cycle
        d.n[n].public = false;
        if(d.n[n].r['viewer'] && d.n[n].r['viewer'].includes(d.public)) d.n[n].public = true; // put asset checker here too ?!?!?!?!
        d.next('design.update'); 
        d.next('inspect.update'); 
    },
    v(d, n, t){
        const result = {};
        t.split(' ').forEach(t=>{
            if(d.n[n].n && d.n[n].n[t]){ //  && d.node.be(d,d.n[n].n[t][0])
                if(d.n[n].n[t].length > 1){ // and tag is not singleton ?!?!?! (x, y, z, etc should only have one!) 
                    result[t] = [];
                    d.n[n].n[t].forEach(nn=>{
                        if(d.node.be(d,nn)) result[t].push(d.n[nn].v);
                    });
                }else if(d.node.be(d,d.n[n].n[t][0])){
                    result[t] = d.n[d.n[n].n[t][0]].v;
                }
                d.n[n].c[t] = result[t];
            }else{   d.n[n].c[t]=null;  }
        });
        if(lodash.isEmpty(result)) return null;
        return result;
    },
    atom(d,n,cause){
        d.reckon.base(d, n,cause);
    },
    default(d,n,cause){
        d.reckon.base(d,n,cause);
    },
    list(d, n, t, pick_color, func){ // build in n:n and color:color
        d.n[n].c[t] = [];
        d.n[n].n[t] && d.n[n].n[t].forEach(nn=>{
            if(d.node.be(d,nn)) d.n[n].c[t].push({n:nn, color:d.n[nn].pick.color[pick_color], ...func(nn)});
        });
    },
    point(d,n){ // make big list of vector3 that can be assigned and released to improve performance (not creating new vector3 constantly)
        const pos = d.reckon.v(d, n, 'x y z');
        if(pos){
            d.n[n].c.pos   = new Vector3(pos.x, pos.y, pos.z); // local
            //const trans = d.n[n].r.transform[0];//d.node.r(d,n,{filter:r=> d.n[r].t=='transform'})[0]; 
            if(d.node.be(d,d.n[n].r.transform)){ // make try catch func that takes func and performs next func with result of first if first success 
                const trans = d.n[n].r.transform[0];
                if(d.n[trans].c.matrix){
                    d.n[n].c.pos_g = new Vector3().copy(d.n[n].c.pos).applyMatrix4(d.n[trans].c.matrix); //d.n[trans].c.matrix).transpose()
                }
            }
        }
    },
    line(d,n){
        d.reckon.list(d, n, 'point', 3, n=>({   
            pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector)  
        })); //x:d.n[n].c.x, y:d.n[n].c.y, z:d.n[n].c.z,   pos:d.n[n].c.pos
    }, //pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector)
    matrix(d,n){
        const matrix = d.reckon.v(d, n, 'element');
        if(matrix) d.n[n].c.matrix = new Matrix4(...matrix.element).transpose();
    },
    transform(d,n){
        if(d.n[n].n.matrix){
            const nn = d.n[n].n.matrix[0];
            if(d.node.be(d,nn) && d.n[nn].c.matrix != undefined){
                const matrix = d.n[nn].c.matrix;
                d.n[n].c.matrix = matrix;
                const pos = new Vector3().setFromMatrixPosition(matrix);
                const rot = new Euler().setFromRotationMatrix(matrix); // 0,0,0,'XYZ'
                d.n[n].c.pos = pos;
                d.n[n].c.rot = rot;
                d.n[n].c.x=pos.x;    d.n[n].c.y=pos.y;    d.n[n].c.z=pos.z;
                d.n[n].c.rx = d.rnd(MathUtils.radToDeg(rot.x));   
                d.n[n].c.ry = d.rnd(MathUtils.radToDeg(rot.y));   
                d.n[n].c.rz = d.rnd(MathUtils.radToDeg(rot.z));
            }
        }
    },

    //sketch(d,n){
        //d.reckon.list(d, n, 'line', n=>({}));
    //},
}});





// v(d, n, t){
//     const result = {};
//     t.split(' ').forEach(t=>{
//         if(d.n[n].n && d.n[n].n[t] && d.node.be(d,d.n[n].n[t][0])){
//             result[t] = d.n[d.n[n].n[t][0]].v;
//             d.n[n].c[t] = result[t];
//         }else{   d.n[n].c[t]=null;  }
//     });
//     return result;
// },


// if(d.n[n].c.grp) d.n[n].c.grp.forEach(unsub=>{
//     unsub();
// });
// d.n[n].c.grp = [];
// grps.forEach(g=>{
//     d.n[n].c.grp.push(subSS(d=> (d.n[g] ? d.n[g].n.group : null), (grp, prev_grp)=>{
//         console.log('subSS');
//         console.log(g, prev_grp, grp);
//     }));
// });


//for (var i = 0; i < grps.length; i++) {
//    const g = grps[i];

//d.n[n].c.n = d.node.n(d,n).filter(n=> d.n[n].n);
        // if(a.src){
        //     if(d.node.be(d,a.src) && d.n[a.src].n){
        //         d.add(d.n[n].c.nodes, a.src);
        //     }else{
        //         d.pop(d.n[n].c.nodes, a.src);
        //     }
        // }

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