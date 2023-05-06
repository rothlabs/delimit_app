import {produce} from 'immer';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, readable} from '../app.js';

const atom_tags={'p':'Part', 'b':'Switch', 'i':'Integer', 'f':'Decimal', 's':'Text'}; 
const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};
// export const node_tag = [ // make it so this reads from server
//     'Profile', 'Public', // admin
//     'Point', 'Line', // geom
//     ...Object.values(atom_tags), 
// ];

export const create_base_slice = (set,get)=>({
    n: {},
    selection: [],
    search: {depth:null, ids:null},
    mutation: {nids:null, b:null, i:null, f:null, s:null, pids:null, t:null},//{nids:[[]], b:[], i:[], f:[], s:[], pids:[[[]]], t:[[[]]]},
    xyz:(pos)=>[pos.x, pos.y, pos.z],
    select: (id, selected)=>set(produce(d=>{  // make hover action and hovering store so the same node is highlighted for different occurances
        if(selected){ 
            const i = d.selection.indexOf(id);
            if (i < 0){
                d.selection.push(id); 
                d.n[id].gen.selected = true;
            }
        } 
        else{ 
            const i = d.selection.indexOf(id);
            if (i !== -1){
                d.selection.splice(i, 1);
                d.n[id].gen.selected = false;
            }
        } 
    })),

    set: func=>set(produce(d=>func(d))),  // used to update local state only (d.n[id].graph.pos for example)
    mutate: func=>set(d=>produce(d, d=>func(d), patches=> { // must use set function in here to set derivitives  ???
        console.log(patches); // auto merges patches into mutations state slice 
    })),

    merge: data=>set(produce(d=>{ // must use set function in here to set derivitives ???
        const window_size = (window.innerWidth+window.innerHeight)/4;
        //const edge_roots = [];
        //const edge_roots = [];
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                // node = d.n[n.id];
                if(!d.n[n.id]){
                    d.n[n.id] = {
                        m: m,
                        graph: {
                            pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                            dir: new Vector3(),
                        }
                    };
                }
                d.n[n.id].r = {};
                d.graph.edge.remove(n.id);
                d.n[n.id].gen = {name:null, selected:false}; // might be able to leave this empty 
                if(m=='p'){
                    d.n[n.id].t = n.t.v;
                    d.n[n.id].n = {};
                    d.n[n.id].gen.tag = readable(n.t.v); 
                }else{  
                    d.n[n.id].v = n.v;  
                    d.n[n.id].gen.tag = atom_tags[d.n[n.id].m];
                }
            }); 
        });
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                n.e.forEach(e=>{
                    var t = 'unknown';
                    if(root_tags[e.t.v]){   t = root_tags[e.t.v];
                    }else{ if(d.n[e.r.id]) t = d.n[e.r.id].t;   }
                    if(!d.n[n.id].r[t]) d.n[n.id].r[t] = [];
                    d.n[n.id].r[t].push(e.r.id);  // <<<<<<<<< reverse relationship !!!!
                    d.graph.edge.add(id);
                    //if(!d.n[n.id].e.includes(e.r.id)) d.n[n.id].e.push(e.r.id);
                });
            });
            data.p.forEach(n=>{ 
                n[m+'e'].forEach(e=>{
                    if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                    d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!!
                    //if(!d.n[n.id].e.includes(e.n.id)) d.n[n.id].e.push(e.n.id); 
                    if(e.t.v=='name' && d.n[e.n.id]) d.n[n.id].gen.name = d.n[e.n.id].v;
                });
            }); 
        }); 
        d.graph.nodes = Object.keys(d.n);
    })),

});




// name: id=> {
//     const n = get().n;
//     return n[id].m=='p' && n[id].n.name && n[n[id].n.name[0]] ? n[n[id].n.name[0]].v : null;
// },

// tag: id=> {
    //     const n = get().n;
    //     return n[id].m=='p' && n[id].t ? uppercase(n[id].t) : atom_tags[n[id].m];
    // },