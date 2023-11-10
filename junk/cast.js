import {current} from 'immer';
import { Matrix4, MathUtils, Vector3, Euler, Quaternion } from "three";

const tv = new Vector3();
const te = new Euler();

export const create_cast_slice=(set,get)=>({cast:{
    down(d,n,c,a={}){ 
        const content = {};
        const ax = {};
        c.split(' ').forEach(c=>{
            //if(c=='auxiliary') console.log(c); 
            if(d.n[n].c[c] != undefined) content[c] = d.n[n].c[c];
            //if(d.n[n].ax[c] != undefined) ax[c] = d.n[n].ax[c];
        });
        // if(ax) c.split(' ').forEach(c=> content[c]=d.n[n].ax[c])
        // else c.split(' ').forEach(c=> content[c]=d.n[n].c[c]);

        // Object.entries(content).forEach(([t,c])=>{
        //     d.n[n].c[t] = c; 
        // });
        // Object.entries(ax).forEach(([t,ax])=>{
        //     d.n[n].ax[t] = ax; 
        // });

        d.graph.for_stem(d, n, (r,n)=> d.cast.base(d,n,content,ax,a));
    },
    base(d,n,c,ax,a={}){
        const change = {c:{},ax:{}};
        const content_packs = [{c:c,t:'c'},{c:ax,t:'ax'}];
        content_packs.forEach(cp=>{
            Object.entries(cp.c).forEach(([t,cc])=>{
                if(d.cast_map[t]) {
                    if(t=='base_matrix'){
                        cc = {...cc, o:cc.o+1};
                        if(cp.t=='c') c.base_matrix = cc;
                        else          ax.base_matrix = cc;
                        d.reckon.matrix(d, n, cp.t, d.add_nc,  cc);
                        change[cp.t].matrix = true;
                    }else{
                        if(d.n[n][cp.t][t] != cc){ // !==
                            change[cp.t][t] = true;
                            d.n[n][cp.t][t] = cc; 
                        }
                    }
                }
            });
        });
        // Object.entries(ax).forEach(([t,ax])=>{
        //     if(d.cast_map[t]){
        //         if(d.n[n].ax[t] != ax){
        //             change[t] = true;
        //             d.n[n].ax[t] = ax; 
        //         }
        //     }
        // });
        if(change.c.auxiliary) d.next('reckon.up', n, ['auxiliary']);
        if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,change); // merge c and ax together here ?!?!?!?!?
        if(a.shallow) return;
        if(!d.cast_end[d.n[n].t]) d.graph.for_stem(d, n, (r,n)=> d.cast.base(d,n,c,ax,a));
    },
    point(d,n,ch){ 
        if(ch.c.matrix) d.next('reckon.up', n); // , ['matrix']
        if(ch.ax.matrix) d.next('reckon.up', n, ['casted_matrix']); // , ['matrix']
    },
    // mixed_curve(d,n,ch){
    //     if(ch.c.matrix) d.next('reckon.up', n); // , ['matrix']
    //     if(ch.ax.matrix) d.next('reckon.up', n, ['casted_matrix']); // , ['matrix']
    // },
    ellipse(d,n,ch){
        if(ch.c.matrix) d.next('reckon.up', n); // , ['matrix']
        if(ch.ax.matrix) d.next('reckon.up', n, ['casted_matrix']); // , ['matrix']
    },
    // surface(d,n,ch){
    //     if(ch.c.matrix) d.next('reckon.up', n); // , ['matrix']
    //     if(ch.ax.matrix) d.next('reckon.up', n, ['casted_matrix']); // , ['matrix']
    // },
}});


// transform(d,n,c){
    //     //console.log('auxiliary check', d.n[n].c.auxiliary, c.auxiliary);
    //     //console.log('try to reckon transform');
    //     if(c.auxiliary) {
    //         //console.log('reckon transform');
    //         d.next('reckon.up', n, ['auxiliary']);
    //     }
    // },

//if(d.n[n][c.t].matrix_list == undefined) d.n[n][c.t].matrix_list = [];
                        //d.add_nc(d.n[n][c.t].matrix_list, cc);
                        //d.reckon.matrix(d, n, c.t);


// d.cast_tags.forEach(t => { // make loop through c first and check if in cast tag
//     if(c[t]!=undefined) d.n[n].c[t] = c[t]; 
// });


// down(d,n,c){ 
//     const content = {};
//     c.split(' ').forEach(c=> content[c]=d.n[n].c[c]);
//     d.graph.for_stem(d, n, (r,n)=> d.cast.base(d,n,content));
// },
// base(d,n,c){
//     //d.n[n].c.matrix = c.matrix;
//     //d.n[n].c.inverse = c.inverse;
//     d.cast_tags.forEach(t => {
//         if(c[t]!=undefined) d.n[n].c[t] = c[t]; 
//     });
//     if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,c);
//     d.graph.for_stem(d, n, (r,n)=> d.cast.base(d,n,c));
// },

// down(d,n,c){ 
//     d.graph.for_stem(d, n, (r,n)=> d.cast.base(d,n,c));
// },

// down(d,n,c){ 
//     const content = {};
//     c.split(' ').forEach(c => content[c]=d.n[n].c[c]);
//     d.graph.for_stem(d, n, n=> d.cast.base(d,n,content));
// },
// base(d,n,c){
//     if(d.cast[d.n[n].t]) d.cast[d.n[n].t](d,n,c);
//     d.graph.for_stem(d, n, n=> d.cast.base(d,n,c));
// },
// point(d,n,c){
//     if(c.matrix){
//         d.n[n].c.matrix = c.matrix;
//         d.n[n].c.inverse = c.matrix
//         d.next('reckon.up',n);
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
//         d.graph.set(d, matrix_node, {element:matrix.elements});
//     }
//     console.log('try to reckon points');
//     d.graph.for_stem_of_tag(d,n,'point', p=>d.next('reckon.up',p));
// }