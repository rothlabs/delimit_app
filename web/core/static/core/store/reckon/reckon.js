import { Matrix4, Vector3, Euler, Quaternion, MathUtils, CatmullRomCurve3 } from 'three';
import {current} from 'immer';
import lodash from 'lodash';
import {curve} from './curve.js';
import {surface} from './surface.js';
import {shape} from './shape.js';
import {layer} from './layer.js';

const zero_vector = new Vector3();
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const te = new Euler();
const tq = new Quaternion();
const tm = new Matrix4();

export const create_reckon_slice =(set,get)=>({reckon:{
    ...curve,
    ...shape,
    ...surface,
    ...layer,
    count: 0,
    up(d, n, cause){ // rename to d.reckon.up // might need to check for node existence or track original reckon call
        d.reckon.base(d, n, cause);
    },
    base(d, n, cause=[]){ // different causes are making reckons happen more than needed ?!?!?!?!?!?!
        d.reckon.count++; // could be causing extra reckson ?!?!?!?!?!
        d.reckon.v(d, n, 'name story'); // make this loop to do all string_tags except text
        if(d.cast_map[d.n[n].t]){ // it is a category node if its tag is in the cast map
            d.n[n].c[d.n[n].t] = true;
            d.cast.down(d, n, d.n[n].t, {shallow:d.cast_shallow_map[d.n[n].t]});
        }
        d.reckon.base_transform(d,n,cause);
        // d.reckon[d.n[n].t].node(d,n,cause) (d.reckon.surface.node())
        if(d.reckon[d.n[n].t]) d.reckon[d.n[n].t](d,n,cause); // get more cast_downs from here so it all goes down in one cast.down call ?!?!?!
        d.node.for_r(d, n, r=> d.next('reckon.up', r, [...cause, d.n[n].t+'__'+r])); // this does not send causes up the chain ?!?!?!?! [...cause, d.n[n].t]
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
            }else{   delete d.n[n].c[t];  } // d.n[n].c[t]=null; // should delete attr instead ?!?!?!
        });
        if(lodash.isEmpty(result)) return null; 
        return result;
    },
    matrix(d, n, ct, func, matrix){
        if(d.n[n][ct].matrix_list == undefined){
            if(func == d.pop_nc) return false;
            d.n[n][ct].matrix_list = [];
        }
        const result = func(d.n[n][ct].matrix_list, matrix);
        if(d.n[n][ct].matrix_list.length < 1){
            delete d.n[n][ct].matrix_list;
            delete d.n[n][ct].matrix;
            delete d.n[n][ct].invert;
            return;
        }
        d.n[n][ct].matrix = d.n[n][ct].matrix_list.sort((a,b)=>b.o-a.o).reduce((a,b)=>a.multiply(b.c), new Matrix4());
        d.n[n][ct].invert = d.n[n][ct].matrix.clone().invert();
        return result;
    },
    base_transform(d, n, cause=[]){ // put this in base and make it work for at least one component (just scale_x for example)
        //try{
        if(cause.length < 1) return;
        const sc = cause[0].split('__'); //'make.node',
        if(['make.edge','delete.edge','auxiliary'].includes(cause[0]) || (sc[0]=='decimal' && sc[1]==n)){ //'make.node',
            const nn = d.reckon.v(d, n, 'move_x move_y move_z turn_x turn_y turn_z scale_x scale_y scale_z'); 
            if(d.n[n].c.transform == true){
                d.clear.down(d, n, {base_matrix:d.n[n].c.base_matrix}, {base_matrix:d.n[n].ax.base_matrix});
                delete d.n[n].c.transform;
                delete d.n[n].c.base_matrix;
                delete d.n[n].ax.base_matrix;
            }
            if(nn){ //  && Object.keys(nn).length > 0
                v1.set(0,0,0);
                if(nn.move_x != undefined) v1.setX(nn.move_x);
                if(nn.move_y != undefined) v1.setY(nn.move_y);
                if(nn.move_z != undefined) v1.setZ(nn.move_z);
                v2.set(0,0,0);
                if(nn.turn_x != undefined) v2.setX(MathUtils.degToRad(nn.turn_x));
                if(nn.turn_y != undefined) v2.setY(MathUtils.degToRad(nn.turn_y));
                if(nn.turn_z != undefined) v2.setZ(MathUtils.degToRad(nn.turn_z));
                tq.setFromEuler(te.setFromVector3(v2));
                v3.set(1,1,1);
                if(nn.scale_x != undefined) v3.setX(nn.scale_x);
                if(nn.scale_y != undefined) v3.setY(nn.scale_y);
                if(nn.scale_z != undefined) v3.setZ(nn.scale_z);
                tm.compose(v1, tq, v3);   
                const c_ax = (d.n[n].c.auxiliary ? 'ax' : 'c');
                d.n[n][c_ax].base_matrix = {n:n, o:0, c:tm.clone()};
                d.reckon.matrix(d, n, c_ax, d.add_nc, d.n[n][c_ax].base_matrix);
                //d.n[n][c_ax].pos = new Vector3().setFromMatrixPosition(d.n[n].ax.matrix);
                d.n[n].c.transform = true;
                d.cast.down(d,n,'base_matrix'); 
                //console.log('reckon transform!!!!');
            }
        }
        //}}catch{} //}catch(e){console.log(e)}
    },
    point(d, n, cause=[]){ // make big list of vector3 that can be assigned and released to improve performance (not creating new vector3 constantly)
        try{ //if(pos){
            const nn = d.reckon.v(d, n, 'x y z');
            d.n[n].c.xyz = new Vector3(0,0,0); // create vector on make.node so it can just be reused here ?!?!?!?!?!
            if(nn.x != undefined) d.n[n].c.xyz.setX(nn.x);
            if(nn.y != undefined) d.n[n].c.xyz.setY(nn.y);
            if(nn.z != undefined) d.n[n].c.xyz.setZ(nn.z);
            d.n[n].c.pos = d.n[n].c.xyz;
            if(d.n[n].c.matrix) d.n[n].c.pos = d.n[n].c.pos.clone().applyMatrix4(d.n[n].c.matrix);
            if(d.n[n].ax.matrix) d.n[n].ax.pos = d.n[n].c.pos.clone().applyMatrix4(d.n[n].ax.matrix);
            else d.n[n].ax.pos = d.n[n].c.pos;
        }catch{} //console.error(e)
    },
}});



//d.reckon.invert(d, n, c_ax, d.add_nc, d.n[n][c_ax].base_invert);
                // if(d.n[n][c_ax].matrix_list == undefined) d.n[n][c_ax].matrix_list = [];
                // if(d.n[n][c_ax].invert_list == undefined) d.n[n][c_ax].invert_list = [];
                // d.add_nc(d.n[n][c_ax].matrix_list, d.n[n][c_ax].base_matrix);
                // d.add_nc(d.n[n][c_ax].invert_list, d.n[n][c_ax].base_invert);
                // d.n[n][c_ax].matrix = d.n[n][c_ax].matrix_list.reduce((a,b)=>a.multiply(b.c), new Matrix4());
                // d.n[n][c_ax].invert = d.n[n][c_ax].invert_list.reduce((a,b)=>a.multiply(b.c), new Matrix4());


// invert(d, n, ct, func, invert){
    //     if(d.n[n][ct].invert_list == undefined){
    //         if(func == d.pop_nc) return false;
    //         d.n[n][ct].invert_list = [];
    //     }
    //     const result = func(d.n[n][ct].invert_list, invert);
    //     d.n[n][ct].invert = d.n[n][ct].invert_list.reduce((a,b)=>a.multiply(b.c), new Matrix4());
    //     return result;
    // },


// d.n[n][c_ax].matrix = d.n[n][c_ax].base_matrix;
                // d.n[n][c_ax].invert = d.n[n][c_ax].base_invert;
                // if(d.n[n][c_ax].matrix_list){
                //     d.n[n][c_ax].matrix = d.n[n][c_ax].matrix_list.reduce((a,b)=>a.multiply(b), d.n[n][c_ax].matrix.clone());
                //     d.n[n][c_ax].invert = d.n[n][c_ax].invert_list.reduce((a,b)=>a.multiply(b), d.n[n][c_ax].invert.clone());
                // }

// else{ d.node.for_r(d,n,r=>{ if(d.n[r].c.matrix){
            //     d.n[n].c.matrix = d.n[r].c.matrix;
            //     d.n[n].c.inverse = d.n[r].c.inverse;
            //     d.n[n].c.pos.applyMatrix4(d.n[n].c.matrix);
            // }})}

            // else{ d.node.for_r(d,n,r=>{ if(d.n[r].ax.matrix){
            //     d.n[n].ax.matrix = d.n[r].ax.matrix;
            //     d.n[n].ax.inverse = d.n[r].ax.inverse;
            //     d.n[n].ax.pos.applyMatrix4(d.n[n].ax.matrix);
            // }})}


// list(d, n, t, func){ // build in n:n and color:color pick_color, 
    //     d.n[n].c[t] = [];
    //     d.n[n].n[t] && d.n[n].n[t].forEach(nn=>{
    //         if(d.node.be(d,nn)) d.n[n].c[t].push({n:nn, ...func(nn)}); //color:d.n[nn].pick.color[pick_color],
    //     });
    // },


//const sp = pto.slice(i+1,i+10).sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                    //pto2.push(sp[0]);
                    //console.log('before and after sort:');
                    //console.log(pto.slice(i+1,i+5).map(p=> p.distanceTo(pto[i])));
                    //console.log(sp.map(p=> p.distanceTo(pto[i])));
                    //const tmp = pto[i+1];
                    //pto[i+1] = sp[0];
                    //pto[pto.indexOf(sp[0])] = tmp;

// if(pto[i+1].distanceTo(pto[i]) > pto[i+2].distanceTo(pto[i])){
//     const tmp = pto[i+1];
//     pto[i+1] = pto[i+2];
//     pto[i+2] = tmp;
// }

//const pts = pto.slice(i+1,i+4).sort((a,b)=> a.distanceTo(pto[i])-b.distanceTo(pto[i]));


// atom(d,n,cause){
    //     d.reckon.base(d, n,cause);
    // },
    // default(d,n,cause){
    //     d.reckon.base(d,n,cause);
    // },


// var cast_downs = '';
        // var clear_downs = [];
        // d.node.cats(d,n).forEach(t=>{
        //     if(d.cat_cast_tags.includes(t)){
        //         console.log('trying to cast', d.n[n].c[t]);
        //         if(d.n[n].c[t] != true){
        //             d.n[n].c[t] = true;
        //             cast_downs += t+' ';
        //         }else{
        //             if(d.n[n].c[t] != undefined){
        //                 clear_downs.push(t);
        //             }
        //         }
        //     }
        // });
        // if(clear_downs.length) d.clear.down(d,n,clear_downs);
        // if(cast_downs) d.cast.down(d,n,cast_downs);

// //d.clear.down(d, n, d.cat_cast_tags);
// var cast_downs = '';
// //var clear_downs = [];
// d.node.cats(d,n).forEach(t=>{
//     if(d.cat_cast_tags[t]){
//         if(d.n[n].c[t] != true){
//             d.n[n].c[t] = true;
//             cast_downs += t+' ';
//         }
//     }
//     // }else{
//     //     if(d.n[n].c[t] != undefined){
//     //         clear_downs.push(t);
//     //     }
//     // }
// });
// //d.clear.down(d,n,clear_downs);
// d.cast.down(d,n,cast_downs);

// d.n[n].public = false;
// if(d.n[n].r['viewer'] && d.n[n].r['viewer'].includes(d.cats.public)) d.n[n].public = true; // put asset checker here too ?!?!?!?!

// //if(!(cause.split('__').includes('color') && !d.pick.color_tags.includes(d.n[r].t))){

//d.n[n].l.pos   = new Vector3(nn.x, nn.y, nn.z); // local
            //d.n[n].w.pos = d.n[n].l.pos;
            //const trans = d.n[d.node.rt0(d,n,'transform')].c;
            //d.n[n].w.pos = new Vector3(pos.x*trans.scale_x, pos.y*trans.scale_y, pos.z*trans.scale_z);
            //d.n[n].w.pos.applyMatrix4(d.n[d.node.rt0(d,n,'transform')].c.matrix); //d.n[n].r.transform[0]

//d.next('reckon_down.node', n);
                //d.node.for_nt(d,n,'point', p=>d.next('reckon.up', p, n));
//console.log('transform reckon cause ',cause);
            //if(!cause.split('__').some(c=> (c==n || c=='point'))){ // put this check in base?
            //if(!cause.split('__').some(c=> (c=='point'))){ // only reckon if caused by direct float? so c='float' ?!?!?!?!?


// matrix(d,n){
    //     const matrix = d.reckon.v(d, n, 'element');
    //     if(matrix) d.n[n].c.matrix = new Matrix4(...matrix.element).transpose();
    // },

// const scale = d.reckon.v(d, n, 'scale_x scale_y scale_z');
//         //if(scale) d.n[n].c.scale = new Vector3(scale.x, scale.y, scale.z);
//         if(d.n[n].n.matrix){
//             const nn = d.n[n].n.matrix[0];
//             if(d.node.be(d,nn) && d.n[nn].c.matrix != undefined){
//                 const matrix = d.n[nn].c.matrix;
//                 d.n[n].c.matrix = matrix;
//                 const pos = new Vector3().setFromMatrixPosition(matrix);
//                 const rot = new Euler().setFromRotationMatrix(matrix); // 0,0,0,'XYZ'
//                 d.n[n].w.pos = pos;
//                 d.n[n].c.rot = rot;
//                 d.n[n].c.x=pos.x;    d.n[n].c.y=pos.y;    d.n[n].c.z=pos.z;
//                 d.n[n].c.turn_x = d.rnd(MathUtils.radToDeg(rot.x));   
//                 d.n[n].c.turn_y = d.rnd(MathUtils.radToDeg(rot.y));   
//                 d.n[n].c.turn_z = d.rnd(MathUtils.radToDeg(rot.z));
//             }
//         }



//const trans = d.n[n].r.transform[0];//d.node.r(d,n,{filter:r=> d.n[r].t=='transform'})[0]; 
            // if(d.node.be(d,d.n[n].r.transform)){ // make try catch func that takes func and performs next func with result of first if first success 
            //     const trans = d.n[n].r.transform[0];
            //     if(d.n[trans].c.matrix){
            //         d.n[n].w.pos = new Vector3().copy(d.n[n].l.pos).applyMatrix4(d.n[trans].c.matrix); //d.n[trans].c.matrix).transpose()
            //     }
            // }
            // d.try(()=> d.n[n].r.transform[0].c.matrix, matrix=>{
            //     d.n[n].w.pos = d.n[n].w.pos.clone().applyMatrix4(matrix);
            // });


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

        // d.n[n].c.pts = [];
        // d.n[n].n.point && d.n[n].n.point.forEach(p=>{
        //     if(d.node.be(d,p)){
        //         d.n[n].c.pts.push({n:p, x:d.n[p].c.x, y:d.n[p].c.y, z:d.n[p].c.z, color:d.n[p].pick.color[0]});
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