import { Matrix4, Vector3, Euler, Quaternion, MathUtils } from "three";
import {current} from 'immer';
import lodash from 'lodash';

const zero_vector = new Vector3();
const tv1 = new Vector3();
const tv2 = new Vector3();
const te = new Euler();
const tq = new Quaternion();
const tm = new Matrix4();

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    node(d, n, cause){ // rename to d.reckon.up // might need to check for node existence or track original reckon call
        d.reckon.base(d, n, cause);
        //if(d.reckon[d.n[n].t])                 {d.reckon[d.n[n].t](d,n,cause); d.reckon.base(d,n,cause);}
        //else if(d.atom_tags.includes(d.n[n].t)){d.reckon.atom(d,n,cause)}
        //else                                   {d.reckon.default(d,n,cause)} // could delete this?
    },
    base(d, n, cause=''){
        d.reckon.count++;
        d.reckon.v(d, n, 'name story'); // make this loop to do all string_tags except text
        if(d.cat_cast[d.n[n].t]){ // make dictionary (Object.fromEntries) for fast lookup ?!?!?!?!?!
            d.n[n].c[d.n[n].t] = true;
            d.cast.down(d, n, d.n[n].t);
        }
        if(d.reckon[d.n[n].t]) d.reckon[d.n[n].t](d,n,cause); // get more cast_downs from here so it all goes down in one cast.down call ?!?!?!
        d.node.for_r(d, n, r=> d.next('reckon.node', r, cause+'__'+d.n[n].t)); // got to watch out for cycle
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
    list(d, n, t, func){ // build in n:n and color:color pick_color, 
        d.n[n].c[t] = [];
        d.n[n].n[t] && d.n[n].n[t].forEach(nn=>{
            if(d.node.be(d,nn)) d.n[n].c[t].push({n:nn, ...func(nn)}); //color:d.n[nn].pick.color[pick_color],
        });
    },
    // atom(d,n,cause){
    //     d.reckon.base(d, n,cause);
    // },
    // default(d,n,cause){
    //     d.reckon.base(d,n,cause);
    // },
    point(d, n, cause){ // make big list of vector3 that can be assigned and released to improve performance (not creating new vector3 constantly)
        try{ //if(pos){
            const nn = d.reckon.v(d, n, 'x y z');
            d.n[n].c.pos = new Vector3(nn.x, nn.y, nn.z);
            if(d.n[n].c.matrix){ d.n[n].c.pos.applyMatrix4(d.n[n].c.matrix) }
            else{ d.node.for_r(d,n,r=>{ if(d.n[r].c.matrix){
                d.n[n].c.matrix = d.n[r].c.matrix;
                d.n[n].c.inverse_matrix = d.n[r].c.inverse_matrix;
                d.n[n].c.pos.applyMatrix4(d.n[n].c.matrix);
            }})}
        }catch{} //console.error(e)
    },
    line(d,n){
        d.reckon.list(d, n, 'point', n=>({ // 0,   
            pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector) // does it need to copy the pos? 
        })); //x:d.n[n].c.x, y:d.n[n].c.y, z:d.n[n].c.z,   pos:d.n[n].c.pos
    }, //pos:(d.n[n].c.pos ? new Vector3().copy(d.n[n].c.pos) : zero_vector)
    transform(d,n,cause=''){ // put this in base and make it work for at least one component (just scale_x for example)
        try{
            if(['make.node', 'make.edge', '__decimal'].includes(cause)){
                const nn = d.reckon.v(d, n, 'move_x move_y move_z turn_x turn_y turn_z scale_x scale_y scale_z'); 
                tv1.set(nn.move_x, nn.move_y, nn.move_z);
                te.set(MathUtils.degToRad(nn.turn_x), MathUtils.degToRad(nn.turn_y), MathUtils.degToRad(nn.turn_z));
                tq.setFromEuler(te);
                tv2.set(nn.scale_x, nn.scale_y, nn.scale_z);
                tm.compose(tv1, tq, tv2);
                d.n[n].c.matrix = new Matrix4().copy(tm);
                d.n[n].c.inverse_matrix = new Matrix4().copy(tm).invert();
                d.cast.down(d,n,'matrix inverse_matrix'); // {matrix:d.n[n].c.matrix, inverse_matrix:d.n[n].c.inverse_matrix} just send c
            }
        }catch{} //}catch(e){console.log(e)}
    },
    mixed_line(d,n,cause=''){
        try{

        }catch(e){console.log(e)}
    },
}});



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

//d.n[n].c.pos_l   = new Vector3(nn.x, nn.y, nn.z); // local
            //d.n[n].c.pos = d.n[n].c.pos_l;
            //const trans = d.n[d.node.rt0(d,n,'transform')].c;
            //d.n[n].c.pos = new Vector3(pos.x*trans.scale_x, pos.y*trans.scale_y, pos.z*trans.scale_z);
            //d.n[n].c.pos.applyMatrix4(d.n[d.node.rt0(d,n,'transform')].c.matrix); //d.n[n].r.transform[0]

//d.next('reckon_down.node', n);
                //d.node.for_nt(d,n,'point', p=>d.next('reckon.node', p, n));
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
//                 d.n[n].c.pos = pos;
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
            //         d.n[n].c.pos = new Vector3().copy(d.n[n].c.pos_l).applyMatrix4(d.n[trans].c.matrix); //d.n[trans].c.matrix).transpose()
            //     }
            // }
            // d.try(()=> d.n[n].r.transform[0].c.matrix, matrix=>{
            //     d.n[n].c.pos = d.n[n].c.pos.clone().applyMatrix4(matrix);
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