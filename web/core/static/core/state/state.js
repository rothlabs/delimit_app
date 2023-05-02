import {create} from 'zustand';
import {produce} from 'immer';
import {subscribeWithSelector} from 'zmiddle';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, uppercase} from '../app.js';
import {shallow as shallow_compare} from 'shallow';

export const shallow = shallow_compare;
const default_tags={'p':'Part', 'b':'Switch', 'i':'Integer', 'f':'Decimal', 's':'Text'}; 

export const use_d = create(subscribeWithSelector((set,get) => ({ 
    n: {},
    name: (id)=> {
        const n = get().n;
        return n[id].m=='p' && n[id].e1.name ? n[n[id].e1.name[0]].v : '';
    },
    tag: (id)=> {
        const n = get().n;
        return n[id].m=='p' && n[id].t ? uppercase(n[id].t) : default_tags[n[id].m];
    },
    selection: [],
    select: (id,selected)=>set(produce(d=>{
        if(selected){ 
            const i = d.selection.indexOf(id);
            if (i < 0) d.selection.push(id); 
        } 
        else{ 
            const i = d.selection.indexOf(id);
            if (i !== -1) d.selection.splice(i, 1);
        } 
    })),
    search: {depth:null, ids:null},
    set: func=>set(produce(d=>func(d))),
    merge: data=>set(produce(d=>{
        const window_size = (window.innerWidth+window.innerHeight)/4;
        ['b','i','f','s'].forEach(m=>{
            data[m].forEach(a=>{
                if(d.n[a.id]){
                    d.n[a.id].v = a.v;
                    d.n[a.id].e = [];
                    d.n[a.id].e2 = {}; 
                }else{  
                    d.n[a.id] = { m:m, v:a.v, e2:{}, e:[], 
                        vis: {
                            pos:random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                            dir: new Vector3(),
                        }}; 
                }
            }); 
        });
        data.p.forEach(p=>{
            if(d.n[p.id]){
                d.n[p.id].t = p.t.v; 
                d.n[p.id].e = [];
                d.n[p.id].e1 = {}; // clear forward edges 
                d.n[p.id].e2 = {}; // clear reverse edges 
            }else{
                d.n[p.id] = {  m:'p', t:p.t.v, e1:{}, e2:{}, e:[], 
                    vis: {
                        pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                        dir: new Vector3(),
                    }}; 
            }
        });
        ['b','i','f','s'].forEach(m=>{
            data[m].forEach(a=>{
                a['p'+m+'2'].forEach(e2=>{ if(e2.t1) d.n[a.id].e2[e2.t1.v] = []; });
                a['p'+m+'2'].forEach(e2=>{ 
                    if(e2.t1){ 
                        //d.n[a.id].edges.push({id:e2.m1.id, t1:e2.t1.v}); 
                        //if(store.p[e2.m1.id]){  
                            d.n[a.id].e2[e2.t1.v].push(e2.m1.id);  // <<<<<<<<< reverse relationship !!!!
                            d.n[a.id].e.push(e2.m1.id);
                        //} 
                        //else{  store[m][a.id].e2[e2.t1.v].push(e2.m1.id);  } // if record not loaded, add id so it can be loaded at the press of a button
                    }
                });
            });
        });
        data.p.forEach(p=>{ 
            ['p','b','i','f','s'].forEach(m=>{
                p['p'+m+'1'].forEach(e1=>{ if(e1.t2) d.n[p.id].e1[e1.t2.v] = []; });
                p['p'+m+'1'].forEach(e1=>{
                    if(e1.t2){
                        //d.n[p.id].edges.push({id:e1.m2.id, t2:e1.t2.v});
                        //if(store[m][e1.m2.id]){  
                            d.n[p.id].e1[e1.t2.v].push(e1.m2.id); // <<<<<<<<< forward relationship !!!!
                            if(!d.n[p.id].e.includes(e1.m2.id)) d.n[p.id].e.push(e1.m2.id); 
                        //} 
                        //else{  store.p[p.id].e1[e1.t2.v].push(e1.m2.id);  }
                    }
                });
            });
            p['pp2'].forEach(e2=>{ if(e2.t1) d.n[p.id].e2[e2.t1.v] = []; });
            p['pp2'].forEach(e2=>{
                if(e2.t1){ 
                    //d.n[p.id].edges.push({id:e2.m1.id, t1:e2.t1.v});
                    //if(store.p[e2.m1.id]){  
                        d.n[p.id].e2[e2.t1.v].push(e2.m1.id);   // <<<<<<<<< reverse relationship !!!!
                        if(!d.n[p.id].e.includes(e2.m1.id)) d.n[p.id].e.push(e2.m1.id);
                    //} 
                    //else{  store.p[p.id].e2[e2.t1.v].push(e2.m1.id);  }
                }
            });
        }); 
    })),
})));