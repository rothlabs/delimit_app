import {produce, produceWithPatches} from 'immer';
import {Vector3} from 'three';
import {graph_z} from '../studio/graph/graph.js';
import {random_vector, readable, make_id} from '../app.js';
import {graph} from './graph.js';
import {inspect, float_tags, string_tags} from './inspect.js';
import {pick} from './pick.js';

export const model_tags={'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; 
const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};

export const val_tags = [...float_tags, ...string_tags];
export const design_tags = ['point', 'part', 'line', 'sketch']; // part is just a three js group that attempts to render child parts, points, lines, meshes, etc


export const create_base_slice = (set,get)=>({
    n: {},
    user: 0,
    profile: null,
    search: {depth:null, ids:null},

    graph:graph,
    inspect:inspect,
    pick:pick,

    studio: {
        ready:false,
        mode:'graph',
        panel: {},
        make: (d, t)=>{
            const window_size = (window.innerWidth+window.innerHeight)/4;
            const n = make_id();
            d.n[n] = {
                m: 'p',
                t: t,
                c: {}, // name: 'untitled'
                r: {},
                n: {},
                open: true,
                asset: true,
                graph: { // put in d.graph.node.vectors
                    pos: new Vector3(-window_size,-window_size,graph_z),//random_vector({min:window_size, max:window_size*1.5, z:graph_z}),
                    dir: new Vector3(),
                },
            };
            if(d.profile){
                if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
                d.n[d.profile].n.asset.push(n);
            }
            d.pick.one(d,n);
            d.consume = d.send;
        }
    },

    design: {
        part:null, candidate:null, 
        update: d=>{
            if(d.design.part && !d.n[d.design.part].open){
                d.design.part = null;
                d.studio.mode = 'graph';
            }
        },
    },

    //set: func=>set(produce(d=>func(d))),  // used to update local state only (d.n[id].graph.pos for example)
    
    //clear_node: (d, n)=>{},
    //deleted: [],

    close: (d, nodes)=>{
        const close_pack = {p:[], b:[], i:[], f:[], s:[]};
        nodes.forEach(n=>{
            close_pack[d.n[n].m].push(n);
            d.n[n].open=false;
            d.n[n].r = {};
            d.n[n].c = {};
            d.n[n].t = '';
            if(d.n[n].m=='p'){  d.n[n].n = {};  }
            else{  d.n[n].v = null;  }
        });
        d.pick.update(d);
        d.design.update(d);
        d.graph.update(d);
        d.close_pack({variables:close_pack});
    },

    // use produceWithPatches so can get the new d
    send: (d, patches)=>{//set(d=>produce(d, d=>func(d), patches=> { 
        //var d = get();
        //const [dd, patches, inversePatches] = produceWithPatches(d, d=>func(d)); 
        //set(nextState);//set(d=> nextState);
        //d = nextState;//get();
        //console.log('patches');
        //console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:[], t:[], pdel:[],bdel:[],idel:[],fdel:[],sdel:[]};
        patches.forEach(patch=>{
            const n = patch.path[1];
            if(patch.op == 'add'){ // node created
                if(patch.path[0]=='n' && patch.path.length < 3){
                    const part = [[n],        [], [], [], [], []];
                    const tags = [[d.n[n].t], [], [], [], [], []];
                    edits.parts.push(part);
                    edits.t.push(tags);
                    //edits.instance = ''; // setting blank so this client reads the returned poll_pack on this
                }else if(patch.path[2]=='deleted'){
                    edits[d.n[n].m+'del'].push(n);
                }
            }else if(patch.op == 'replace' && patch.path[2]=='v'){ // atom has changed
                edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                edits[d.n[n].m].push(patch.value);
            }
        });
        //console.log('edits');
        //console.log(edits);
        d.pick.update(d);
        d.design.update(d);
        d.graph.update(d); // only run graph if something was deleted or added? 
        d.push_pack({variables:edits});
    },

    exists: (d, n)=>{
        if(d.n[n] && !d.n[n].deleted) return true
        return false
    },
    
    receive: (d, data)=>{// must check if this data has been processed already 
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
                if(d.exists(d,n.id)){
                    d.n[n.id].open = true;
                    d.n[n.id].r = {};
                    d.n[n.id].c = {}; // content generated by edges 
                    if(m=='p'){
                        console.log('got part: '+n.id+' ('+n.t.v+')'); // <<<<<<<<<<<<<<<<<<<<<<<< show part update
                        d.n[n.id].t = n.t.v;
                        d.n[n.id].n = {};
                        //if(n.u.length>0 && n.u[0].id==d.user && n.t.v=='profile') d.n[n.id].profile = true;
                        if(n.u.length>0 && n.u[0].id==d.user && n.t.v=='profile') d.profile = n.id;
                    }else{  
                        d.n[n.id].t = model_tags[d.n[n.id].m];
                        console.log('got atom: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<< show atom update
                        d.n[n.id].v = n.v;  
                    }
                }
            }); 
        });
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{if(d.exists(d,n.id)){
                n.e.forEach(e=>{
                    var t = 'unknown';
                    if(root_tags[e.t.v]){   t = root_tags[e.t.v];
                    }else{ if(d.exists(d,e.r.id))  t = d.n[e.r.id].t; }//}else{ if(d.n[e.r.id])  t = d.n[e.r.id].t; }
                    if(!d.n[n.id].r[t]) d.n[n.id].r[t] = [];
                    d.n[n.id].r[t].push(e.r.id);  // <<<<<<<<< reverse relationship !!!! (root)
                    if(val_tags.includes(e.t.v) && d.exists(d,e.r.id)) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;//if(val_tags.includes(e.t.v) && d.n[e.r.id]) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;
                    //if(e.t.v=='asset' && d.n[e.r.id].profile) d.n[n.id].asset = true; //t=='profile' && d.n[e.r.id].u.id==user_id
                    if(e.t.v=='asset' && e.r.id==d.profile) d.n[n.id].asset = true;
                });
            }});
            data.p.forEach(n=>{if(d.exists(d,n.id)){
                n[m+'e'].forEach(e=>{
                    if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                    d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!! (nodes)
                    if(val_tags.includes(e.t.v) && d.exists(d,e.n.id)) d.n[n.id].c[e.t.v] = d.n[e.n.id].v; //if(val_tags.includes(e.t.v) && d.n[e.n.id]) d.n[n.id].c[e.t.v] = d.n[e.n.id].v;
                    //if(e.t.v=='asset' && d.n[n.id].profile && d.n[e.n.id]) d.n[e.n.id].asset = true;
                    if(e.t.v=='asset' && n.id==d.profile && d.exists(d,e.n.id)) d.n[e.n.id].asset = true; //if(e.t.v=='asset' && n.id==d.profile && d.n[e.n.id]) d.n[e.n.id].asset = true;
                });
            }}); 
        }); 
        d.consume=(d, patches)=>{
            if(patches.length>0 && !(patches.length==1 && patches[0].path[0]=='consume')){    
                console.log('recieve patches: '+patches);     
                d.graph.update(d); 
                d.studio.ready = true;
            }
        }
    },

    receive_deleted: (d, data)=>{
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                d.n[n.id].open = false;
                d.n[n.id].deleted = true;
            });
        });
        d.consume=(d, patches)=>{
            if(patches.length>0 && !(patches.length==1 && patches[0].path[0]=='consume')){
                console.log('recieve_deleted patches: '+patches);       
                d.pick.update(d);
                d.design.update(d);
                d.graph.update(d);
            }
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