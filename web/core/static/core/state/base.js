import {produce, produceWithPatches} from 'immer';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, readable} from '../app.js';

const model_tags={'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; 
const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};
//const atom_tags = ['switch', 'integer', 'decimal', 'text'];
const float_tags  = ['decimal', 'x', 'y', 'z'];
const string_tags = ['text', 'name', 'story'];
const val_tags = [...float_tags, ...string_tags];

export const create_base_slice = (set,get)=>({
    n: {},
    selected: {
        nodes: [],
        edit_val: (t,v)=>{ 
            get().edit(d=>{
                d.inspect.c[t] = v;
                if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
                if(Object.values(model_tags).includes(t)){
                    d.selected.nodes.forEach(n => {
                        if(model_tags[d.n[n].m] == t) {
                            d.n[n].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }else{
                    d.selected.nodes.forEach(n => {
                        if(d.n[n].m=='p' && d.n[n].n[t]) {
                            d.n[d.n[n].n[t][0]].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }
            });
        },
    }, 
    search: {depth:null, ids:null},
    inspect: {c:{}, asset:{}, float_tags:float_tags, string_tags:string_tags},
    
    select: (id, selected)=>set(produce(d=>{  // make hover action and hovering store so the same node is highlighted for different occurances
        d.n[id].selected = selected;
        d.selected.nodes = Object.keys(d.n).filter(n=> d.n[n].selected); 
        val_tags.forEach(t=>{
            d.inspect.c[t] = d.selected.nodes.map(n=> d.n[n].c[t]).find((v,i)=> v!=null);
            //d.inspect.asset[t] = 
        })
        Object.entries(model_tags).forEach(([m,model],i)=>{
            d.inspect.c[model] = d.selected.nodes.filter(n=> d.n[n].m==m).map(n=> d.n[n].v).find(v=> v!=null);
        });
    })),

    set: func=>set(produce(d=>func(d))),  // used to update local state only (d.n[id].graph.pos for example)

    //mutation: {nids:null, b:null, i:null, f:null, s:null, pids:null, t:null},//{nids:[[]], b:[], i:[], f:[], s:[], pids:[[[]]], t:[[[]]]},
    edit: func=>set(d=>produce(d, d=>func(d), patches=> { // must use set function in here to set derivitives  ???
        //console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:null, t:null};
        //const edits = {atoms:null, b:null, i:null, f:null, s:null, parts:null, t:null};
        patches.forEach(patch=>{
            if(patch.path[2]=='v'){ // atom has changed
                const n = patch.path[1];
                edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                edits[d.n[n].m].push(patch.value);
            }
        });
        //console.log(edits);
        d.mutate({variables:edits});
    })),

    merge: data=>{
        //const d = get();
        const [nextState, patches, inversePatches] = produceWithPatches(get(), d=>{ // must use set function in here to set derivitives ???
            const window_size = (window.innerWidth+window.innerHeight)/4;
            ['p','b','i','f','s'].forEach(m=>{
                data[m].forEach(n=>{
                    if(!d.n[n.id]){
                        d.n[n.id] = {
                            m: m,
                            graph: { // put in d.graph.node.vectors
                                pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                                dir: new Vector3(),
                            }
                        };
                    }
                    d.n[n.id].r = {};
                    d.n[n.id].c = {}; // content generated by edges 
                    if(m=='p'){
                        d.n[n.id].tag = readable(n.t.v); 
                        d.n[n.id].t = n.t.v;
                        d.n[n.id].n = {};
                    }else{  
                        d.n[n.id].tag = model_tags[d.n[n.id].m];
                        d.n[n.id].v = n.v;  
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
                        if(val_tags.includes(e.t.v) && d.n[e.r.id]) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;
                    });
                });
                data.p.forEach(n=>{ 
                    n[m+'e'].forEach(e=>{
                        if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                        d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!!
                        if(val_tags.includes(e.t.v) && d.n[e.n.id]) d.n[n.id].c[e.t.v] = d.n[e.n.id].v;
                    });
                }); 
            }); 
            //d.graph.update(d); // check to make sure there are actual changes before running update
        });//,patches=>{
        //    if(patches.length>0){       
        //        get().graph.update();  
        //    }
        //});
        set(d=> nextState);
        if(patches.length>0){       
            get().graph.update();  
        }
    },

});

//if(atom_tags.includes(t)){  d.inspect.c[t] = d.selected.nodes.filter(n=> d.n[n].m==t).map(n=> d.n[n].v).find(v=> v!=null);  }
            //else{  d.inspect.c[t] = d.selected.nodes.map(n=> d.n[n].c[t]).find(v=> v!=null);  }

//delete d.inspect[t];
            //const vals = d.selected.nodes.map(n=> d.n[n].c[t]);
            //if(vals) d.inspect[t] = vals.find(val=> val!=null);


// export const node_tag = [ // make it so this reads from server
//     'Profile', 'Public', // admin
//     'Point', 'Line', // geom
//     ...Object.values(atom_tags), 
// ];

// d.selected.nodes = [];
        // Object.entries(d.n).forEach(([id,n],i)=>{if(n.selected){ // use filter than forEach for optimization?
        //     d.selected.nodes.push({id:id, name:n.c.name});
        // }});
        //d.selected.names = d.selected.nodes.map(n=> d.n[n].c.name);

//xyz:(pos)=>[pos.x, pos.y, pos.z],

// if(selected){ 
//     const i = d.selection.indexOf(id);
//     if (i < 0) d.selection.push(id); 
// }else{ 
//     const i = d.selection.indexOf(id);
//     if (i !== -1) d.selection.splice(i, 1);
// }

// select: (id, selected)=>set(produce(d=>{  // make hover action and hovering store so the same node is highlighted for different occurances
//     if(selected){ 
//         const i = d.selection.indexOf(id);
//         if (i < 0){
//             d.selection.push(id); 
//             //d.n[id].gen.selected = true;
//         }
//     } 
//     else{ 
//         const i = d.selection.indexOf(id);
//         if (i !== -1){
//             d.selection.splice(i, 1);
//             //d.n[id].gen.selected = false;
//         }
//     } 
// })),



// name: id=> {
//     const n = get().n;
//     return n[id].m=='p' && n[id].n.name && n[n[id].n.name[0]] ? n[n[id].n.name[0]].v : null;
// },

// tag: id=> {
    //     const n = get().n;
    //     return n[id].m=='p' && n[id].t ? uppercase(n[id].t) : atom_tags[n[id].m];
    // },