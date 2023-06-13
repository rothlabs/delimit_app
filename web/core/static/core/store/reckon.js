import { Vector3 } from "three";
import {current} from 'immer';
import { subSS } from '../app.js';

const zero_vector = new Vector3();

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    node(d, n, cause){ // might need to check for node existence or track original reckon call
        if(d.reckon[d.n[n].t])                 {d.reckon[d.n[n].t](d,n,cause); d.reckon.base(d,n,cause);}
        else if(d.atom_tags.includes(d.n[n].t)){d.reckon.atom(d,n,cause)}
        else                                   {d.reckon.default(d,n,cause)} // could delete this?
    },
    base(d, n, cause){
        d.reckon.count++;
        d.reckon.v(d, n, 'name');
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
            if(d.n[n].n && d.n[n].n[t] && d.node.be(d,d.n[n].n[t][0])){
                result[t] = d.n[d.n[n].n[t][0]].v;
                d.n[n].c[t] = result[t];
            }else{   d.n[n].c[t]=null;  }
        });
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
        d.n[n].c.pos = new Vector3(pos.x, pos.y, pos.z); // for convenience in calculations elsewhere
    },
    line(d,n){
        d.reckon.list(d, n, 'point', 3, n=>({   pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector)  })); //x:d.n[n].c.x, y:d.n[n].c.y, z:d.n[n].c.z,   pos:d.n[n].c.pos
    }, //pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector)
    // group(d,n){ // use a.cause='edge_create' and a.cause='edge_deleted'?
    //     //if(d.n[n].c.n == undefined) d.n[n].c.n = [];
    //     const nodes = (d.n[n].n.group ? d.n[n].n.group : []);//d.node.n(d, n, {filter:n=>d.n[n].n});//.filter(n=> d.n[n].n);
    //     if(d.n[n].c.n == undefined) d.n[n].c.n = nodes;
    //     if(d.n[n].c.pushed == undefined) d.n[n].c.pushed = [];
    //     if(d.n[n].c.removed == undefined) d.n[n].c.removed = [];
    //     if(nodes.join() != d.n[n].c.n.join()){
    //         d.n[n].c.pushed = [];
    //         d.n[n].c.removed = [];
    //         nodes.forEach(nn=>{
    //             if(!d.n[n].c.n.includes(nn)) d.n[n].c.pushed.push(nn);
    //         });
    //         d.n[n].c.n.forEach((nn,i)=>{
    //             if(!nodes.includes(nn)) d.n[n].c.removed.push({n:nn, i:i.toString()});
    //         });
    //         d.n[n].c.n = nodes;
    //     }
    // },
    // equalizer(d,n,a){
    //     console.log('equalizer', a);
    //     const grps = d.n[n].n.group;
    //     if(grps){ // && !d.n[n].c.stop 
    //         if(!d.n[n].c.grp) d.n[n].c.grp = [];

    //         var cg = [];
    //         grps.forEach(g=>{
    //             if(d.n[g].c.pushed != undefined && d.n[g].c.removed != undefined){
    //                 if(!d.n[n].c.grp[g]) d.n[n].c.grp[g] = {pushed:d.n[g].c.pushed, removed:d.n[g].c.removed};
    //                 if(d.n[n].c.grp[g].pushed.join() != d.n[g].c.pushed.join() || d.n[n].c.grp[g].removed.map(rm=>rm.n).join() != d.n[g].c.removed.map(rm=>rm.n).join()){
    //                     cg.push(g);
    //                 }
    //                 d.n[n].c.grp[g].pushed = d.n[g].c.pushed;
    //                 d.n[n].c.grp[g].removed = d.n[g].c.removed;
    //             }
    //         });
    //         if(cg.length){
    //             cg = cg[0];
    //             grps.forEach(g=>{
    //                 if(g!=cg){
    //                     d.n[cg].c.pushed.forEach(pn=>{
    //                         const cpy = d.remake.copy(d, pn, {root:g});
    //                         d.add(d.n[g].c.n, cpy); // add to group content so it doesn't see a diff and cause infinit loop
    //                     });
    //                     d.n[cg].c.removed.forEach(rm=>{
    //                         //console.log('equalizer remove i', i);
    //                         if(d.n[g].n.group){
    //                             const rmn = d.n[g].n.group[rm.i];
    //                             if(rmn){
    //                                 //console.log('equalizer remove rmv', rmv);
    //                                 d.delete.node(d, rmn);
    //                                 d.pop(d.n[g].c.n, rmn); // add to group content so it doesn't see a diff and cause infinit loop
    //                             }
    //                         }
    //                     });
    //                 }
    //             });
    //         }
    //     }
    // }
    //sketch(d,n){
        //d.reckon.list(d, n, 'line', n=>({}));
    //},
}});



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
        // if(a&&a.src){
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