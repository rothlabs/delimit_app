import {current} from 'immer';
//import { MathUtils, Vector3, Euler, Quaternion } from "three";

//const tv = new Vector3();
//const te = new Euler();

export const create_clear_slice=(set,get)=>({clear:{
    down(d,n,c,ax){ // change to (d,r,n) 
        const change = {}
        Object.entries(c).forEach(([t,c])=>{
            if(d.cast_map[t] && d.n[n].c[t] === c){ 
                change[t] = true;
                delete d.n[n].c[t]; 
            }
        });
        Object.entries(ax).forEach(([t,ax])=>{
            if(d.cast_map[t] && d.n[n].ax[t] === ax){
                change[t] = true;
                delete d.n[n].ax[t]; 
            }
        });
        if(change.auxiliary) d.next('reckon.up', n, ['auxiliary']);
        if(d.clear[d.n[n].t]) d.clear[d.n[n].t](d,n,change);
        d.node.for_n(d, n, (r,n)=> d.clear.down(d,n,c,ax));
    },
    // transform(d,n,c){
    //     //console.log('auxiliary check', d.n[n].c.auxiliary, c.auxiliary);
    //     //console.log('try to reckon transform from clear');
    //     if(c.auxiliary) {
    //         //console.log('reckon transform from clear');
    //         d.next('reckon.up', n, ['auxiliary']);
    //     }
    // },
    point(d,n,c){
        if(c.matrix) d.next('reckon.up',n); // check if matrix actually changed ?!?!?!?!?!
    },
}});


// d.cast_tags.forEach(t=>{
//     if(c[t]!=undefined && d.n[n].c[t] === c[t]) delete d.n[n].c[t]; 
// });

// down(d,n,c){ 
//     if(Array.isArray(c)){//if(typeof c === 'string'){
//         const content = {};
//         c.forEach(t=> {
//             if(d.n[n].c[t]) content[t]=d.n[n].c[t];
//         });
//         //console.log('clear cat',content);
//         //d.node.for_n(d, n, (r,n)=> d.clear.base(d,n,content));
//         d.clear.base(d,n,content);
//     }else{
//         d.clear.base(d,n,c);
//     }
// },

//if(d.n[n].c.matrix === c.matrix) delete d.n[n].c.matrix; //d.n[n].c.matrix = null;
        //if(d.n[n].c.inverse_matrix === c.inverse_matrix) delete d.n[n].c.inverse_matrix;//d.n[n].c.inverse_matrix = null;

        //typeof myVar === 'string'


        // down(d,n,c){ 
        //     d.cast_tags.forEach(t => {
        //         if(c[t]!=undefined && d.n[n].c[t] === c[t]) delete d.n[n].c[t]; 
        //     });
        //     if(d.clear[d.n[n].t]) d.clear[d.n[n].t](d,n,c);
        //     d.node.for_n(d, n, (r,n)=> d.clear.down(d,n,c));
        // },