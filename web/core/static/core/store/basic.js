import {produce, produceWithPatches} from 'immer';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, readable, make_id} from '../app.js';

export const model_tags={'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; 
const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};
export const float_tags  = ['decimal', 'x', 'y', 'z'];
export const string_tags = ['text', 'name', 'story'];
export const val_tags = [...float_tags, ...string_tags];
export const design_tags = ['part', 'line', 'sketch']; // part is just a three js group that attempts to render child parts, points, lines, meshes, etc

export const create_basic_slice = (set,get)=>({
    n: {},
    user: 0,
    studio: {mode:'graph'},
    search: {depth:null, ids:null},

    design: {
        part:null, candidate:null, 
        update: d=>{
            if(d.design.part && !d.n[d.design.part].open){
                d.design.part = null;
                d.studio.mode = 'graph';
            }
        },
        make:t=>{
            get().edit(d=>{
                const window_size = (window.innerWidth+window.innerHeight)/4;
                const n = make_id();
                d.n[n] = {
                    m: 'p',
                    t: t,
                    c: {}, // name: 'untitled'
                    r: {},
                    n: {},
                    graph: { // put in d.graph.node.vectors
                        pos: random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                        dir: new Vector3(),
                    },
                };
            });
        }
    },

    inspect: {
        content:{}, asset:{}, placeholder:{}, float_tags:float_tags, string_tags:string_tags, 
        update:d=>{//set(produce(d=>{
            const node_content = d.selected.nodes.map(n=> d.n[n]);
            val_tags.forEach(t=>{
                const nodes = node_content.filter(n=> n.c[t]!=null);
                if(nodes.length){
                    if(nodes.every((n,i,nodes)=> n.c[t]==nodes[0].c[t])){
                        d.inspect.content[t] = nodes[0].c[t];
                        d.inspect.placeholder[t] = '';
                    }else{ 
                        d.inspect.content[t] = '';
                        d.inspect.placeholder[t] = nodes.map(n=>n.c[t]).join(',  ');
                    }
                    d.inspect.asset[t] = nodes.some(n=> n.asset);
                }else{  d.inspect.content[t] = undefined;   }
            })
            Object.entries(model_tags).forEach(([m,t],i)=>{
                const nodes = node_content.filter(n=> n.m==m && n.v!=null);
                if(nodes.length){
                    if(nodes.every((n,i,nodes)=> n.v==nodes[0].v)){
                        d.inspect.content[t] = nodes[0].v;
                        d.inspect.placeholder[t] = '';
                    }else{ 
                        d.inspect.content[t] = '';
                        d.inspect.placeholder[t] = nodes.map(n=>n.v).join(',  ');
                    }
                    d.inspect.asset[t] = nodes.some(n=> n.asset);
                }else{  d.inspect.content[t] = undefined;   }
            });
        },
    },
    set: func=>set(produce(d=>func(d))),  // used to update local state only (d.n[id].graph.pos for example)
    
    close: (d, nodes)=>{
        const close_pack = {p:[], b:[], i:[], f:[], s:[]};
        
        //d.graph.nodes = d.graph.nodes.filter(n=> !nodes.includes(n));
        //d.graph.edges = d.graph.edges.filter(e=> !(nodes.includes(e.r) || nodes.includes(e.n)));
        nodes.forEach(n=>{
            close_pack[d.n[n].m].push(n);
            d.n[n].open=false;
            d.n[n].r = {};
            d.n[n].c = {};
            d.n[n].t = '';
            if(d.n[n].m=='p'){  d.n[n].n = {};  }
            else{  d.n[n].v = null;  }
        });
        d.post_select(d);
        d.design.update(d);
        d.graph.update(d);
        d.close_pack({variables:close_pack});
    },

    // use produceWithPatches so can get the new d
    edit: func=>{//set(d=>produce(d, d=>func(d), patches=> { 
        var d = get();
        const [nextState, patches, inversePatches] = produceWithPatches(d, d=>func(d)); 
        set(d=> nextState);
        d = get();
        console.log('patches');
        console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:[], t:[]};
        patches.forEach(patch=>{
            const n = patch.path[1];
            const node = d.n[n];
            if(patch.op == 'add' && patch.path.length < 3){ // node created
                const part = [[n],      [], [], [], []];
                const tags = [[node.t], [], [], [], []];
                // push ids and tags for root and nodes of part
                edits.parts.push(part);
                edits.t.push(tags);
                edits.instance = ''; // setting blank so this client reads the returned poll_pack on this
            }else if(patch.op == 'replace' && patch.path[2]=='v'){ // atom has changed
                edits.atoms[['b','i','f','s'].indexOf(node.m)].push(n); // atom id
                edits[node.m].push(patch.value);
            }
        });
        console.log('edits');
        console.log(edits);
        d.push_pack({variables:edits});
    },

    merge: data=>{
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
                    d.n[n.id].open = true;
                    d.n[n.id].r = {};
                    d.n[n.id].c = {}; // content generated by edges 
                    if(m=='p'){
                        //d.n[n.id].tag = readable(n.t.v); 
                        d.n[n.id].t = n.t.v;
                        d.n[n.id].n = {};
                        if(n.u.length>0 && n.u[0].id==d.user && n.t.v=='profile') d.n[n.id].profile = true;
                    }else{  
                        d.n[n.id].t = model_tags[d.n[n.id].m];
                        d.n[n.id].v = n.v;  
                    }
                }); 
            });
            ['p','b','i','f','s'].forEach(m=>{
                data[m].forEach(n=>{
                    n.e.forEach(e=>{
                        var t = 'unknown';
                        if(root_tags[e.t.v]){   t = root_tags[e.t.v];
                        }else{ if(d.n[e.r.id])  t = d.n[e.r.id].t; }
                        if(!d.n[n.id].r[t]) d.n[n.id].r[t] = [];
                        d.n[n.id].r[t].push(e.r.id);  // <<<<<<<<< reverse relationship !!!! (root)
                        if(val_tags.includes(e.t.v) && d.n[e.r.id]) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;
                        if(e.t.v=='asset' && d.n[e.r.id].profile) d.n[n.id].asset = true; //t=='profile' && d.n[e.r.id].u.id==user_id
                    });
                });
                data.p.forEach(n=>{ 
                    n[m+'e'].forEach(e=>{
                        if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                        d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!! (nodes)
                        if(val_tags.includes(e.t.v) && d.n[e.n.id]) d.n[n.id].c[e.t.v] = d.n[e.n.id].v;
                        if(e.t.v=='asset' && d.n[n.id].profile && d.n[e.n.id]) d.n[e.n.id].asset = true;
                    });
                }); 
            }); 
        });
        set(d=> nextState);
        if(patches.length>0){       
            set(produce(d=>d.graph.update(d)));  
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