import {produce, enablePatches} from 'immer';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, uppercase} from '../app.js';

enablePatches();
const default_tag={'p':'Part', 'b':'Switch', 'i':'Integer', 'f':'Decimal', 's':'Text'}; 
const root_tag={
    'view':  'viewer',
    'asset': 'owner',
};

//export const use_d = create(subscribeWithSelector((set,get) => ({ 
export const create_base_slice = (set,get)=>({
    n: {},
    selection: [],
    search: {depth:null, ids:null},
    mutations: [],
    name: id=> {
        const n = get().n;
        return n[id].m=='p' && n[id].n.name ? n[n[id].n.name[0]].v : null;
    },
    tag: id=> {
        const n = get().n;
        return n[id].m=='p' && n[id].t ? uppercase(n[id].t) : default_tag[n[id].m];
    },
    select: (id, selected)=>set(produce(d=>{
        if(selected){ 
            const i = d.selection.indexOf(id);
            if (i < 0) d.selection.push(id); 
        } 
        else{ 
            const i = d.selection.indexOf(id);
            if (i !== -1) d.selection.splice(i, 1);
        } 
    })),
    set: func=>set(produce(d=>func(d))),
    mutate: func=>set(d=>produce(d, d=>func(d),
        patches=> set(d=> ({mutations: patches})) // auto merges patches into mutations state slice 
    )),
    merge: data=>set(produce(d=>{
        const window_size = (window.innerWidth+window.innerHeight)/4;
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                if(!d.n[n.id]){
                    d.n[n.id] = {
                        m: m,
                        vis: {
                            pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                            dir: new Vector3(),
                        }
                    };
                }
                d.n[n.id].e = []; // replace with function to get all edges
                d.n[n.id].r = {};
                if(m=='p'){
                    d.n[n.id].t = n.t.v;
                    d.n[n.id].n = {};
                }else{  d.n[n.id].v = n.v;  }
            }); 
        });
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                n.e.forEach(e=>{
                    var t = 'unknown';
                    if(root_tag[e.t.v]){   t = root_tag[e.t.v];
                    }else{ if(d.n[e.r.id]) t = d.n[e.r.id].t;   }
                    if(!d.n[n.id].r[t]) d.n[n.id].r[t] = [];
                    d.n[n.id].r[t].push(e.r.id);  // <<<<<<<<< reverse relationship !!!!
                    if(!d.n[n.id].e.includes(e.r.id)) d.n[n.id].e.push(e.r.id);
                });
            });
            data.p.forEach(n=>{ 
                n[m+'e'].forEach(e=>{
                    if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                    d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!!
                    if(!d.n[n.id].e.includes(e.n.id)) d.n[n.id].e.push(e.n.id); 
                });
            }); 
        }); 
    })),
});