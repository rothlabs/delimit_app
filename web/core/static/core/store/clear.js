import {current} from 'immer';
//import { MathUtils, Vector3, Euler, Quaternion } from "three";

//const tv = new Vector3();
//const te = new Euler();

export const create_clear_slice=(set,get)=>({clear:{
    down(d,n,c,ax){ // change to (d,r,n) 
        const change = {}
        const content_packs = [{c:c,t:'c'},{c:ax,t:'ax'}];
        content_packs.forEach(c=>{
            Object.entries(c.c).forEach(([t,cc])=>{
                if(d.cast_map[t]) {
                    if(t=='base_matrix' && cc){
                        change.matrix = d.reckon.matrix(d, n, c.t, d.pop_nc, cc);
                    // }else if(t=='base_invert'){
                    //     change.invert = d.reckon.invert(d, n, c.t, d.pop_nc, cc);
                    }else{
                        if(d.n[n][c.t][t] === cc){ 
                            change[t] = true;
                            delete d.n[n][c.t][t]; 
                        }
                    }
                }
            });
        });
        // Object.entries(ax).forEach(([t,ax])=>{
        //     if(d.cast_map[t] && d.n[n].ax[t] === ax){
        //         change[t] = true;
        //         delete d.n[n].ax[t]; 
        //     }
        // });
        if(change.auxiliary) d.next('reckon.up', n, ['auxiliary']);
        if(d.clear[d.n[n].t]) d.clear[d.n[n].t](d,n,change);
        d.node.for_n(d, n, (r,n)=> d.clear.down(d,n,c,ax));
    },
    point(d,n,c){
        if(c.matrix) d.next('reckon.up', n); 
    },
    // mixed_curve(d,n,c){
    //     if(c.matrix){
    //         d.next('reckon.up', n); 
    //         console.log('mixed_curve reckon because of matrix clear');
    //     }
    // },
    ellipse(d,n,c){
        if(c.matrix){
            d.next('reckon.up', n); 
            //console.log('mixed_curve reckon because of matrix clear');
        }
    },
}});


// transform(d,n,c){
    //     //console.log('auxiliary check', d.n[n].c.auxiliary, c.auxiliary);
    //     //console.log('try to reckon transform from clear');
    //     if(c.auxiliary) {
    //         //console.log('reckon transform from clear');
    //         d.next('reckon.up', n, ['auxiliary']);
    //     }
    // },
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
        //if(d.n[n].c.inverse === c.inverse) delete d.n[n].c.inverse;//d.n[n].c.inverse = null;

        //typeof myVar === 'string'


        // down(d,n,c){ 
        //     d.cast_tags.forEach(t => {
        //         if(c[t]!=undefined && d.n[n].c[t] === c[t]) delete d.n[n].c[t]; 
        //     });
        //     if(d.clear[d.n[n].t]) d.clear[d.n[n].t](d,n,c);
        //     d.node.for_n(d, n, (r,n)=> d.clear.down(d,n,c));
        // },