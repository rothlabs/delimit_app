import {current} from 'immer';
import {Vector3} from 'three';
import {random_vector, theme} from '../app.js';

export const model_tags={'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; 
export const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};
export const float_tags  = ['decimal', 'x', 'y', 'z']; //edge tags
export const string_tags = ['text', 'name', 'story'];  //edge tags
export const val_tags = [...float_tags, ...string_tags];
export const design_tags = ['part', 'line', 'sketch']; // part is just a three js group that attempts to render child parts, points, lines, meshes, etc
export const node_tags = [
    ...Object.values(model_tags),
    'profile', 'public',
    'point', 'line', 'sketch',
];

export const create_base_slice = (set,get)=>({
    n: {},
    user: 0,
    profile: null,
    search: {depth:null, ids:null},

    studio: {
        ready:false,
        mode:'graph',
        panel: {},
        make: (d, t)=>{
            const n = d.make.part(d, t);
            d.pick.one(d, n);
        }
    },

    design: {
        part:null, candidate:null, 
        update: d=>{
            if(d.pick.nodes.length == 1 && design_tags.includes(d.n[d.pick.nodes[0]].t)){  d.design.candidate = d.pick.nodes[0];  } 
            else{  d.design.candidate = null;  }
            if(d.design.part && !d.n[d.design.part].open){ // use exists/available function here?
                d.design.part = null;
                d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
            }
        },
    },

    // close: (d, nodes)=>{
    //     const close_pack = {p:[], b:[], i:[], f:[], s:[]};
    //     nodes.forEach(n=>{
    //         close_pack[d.n[n].m].push(n);
    //         d.n[n].open=false;
    //         d.n[n].r = {};
    //         d.n[n].c = {};
    //         d.n[n].t = '';
    //         if(d.n[n].m=='p'){  d.n[n].n = {};  }
    //         else{  d.n[n].v = null;  }
    //     });
    //     d.pick.update(d);
    //     d.design.update(d);
    //     d.graph.update(d);
    //     d.close_pack({variables:close_pack});
    // },

    send: (d, patches)=>{
        //console.log('patches');
        //console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:[], t:[], pdel:[],bdel:[],idel:[],fdel:[],sdel:[]};
        const appends = {};
        patches.forEach(patch=>{
            const n = patch.path[1];
            if(patch.op == 'add'){ 
                if(patch.path[0]=='n' && patch.path.length < 3){ // node created
                    if(d.n[n].m=='p'){
                        const part = [[n],        [], [], [], [], [], ['replace']];
                        const tags = [[d.n[n].t], [], [], [], [], []];
                        d.node.for_n(d, n, (nn,t)=>{
                            const mi = ['r','p','b','i','f','s'].indexOf(d.n[nn].m);
                            part[mi].push(nn);
                            tags[mi].push(t);
                        });
                        edits.parts.push(part);
                        edits.t.push(tags);
                    }else{
                        edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                        edits[d.n[n].m].push(patch.value.v);
                    }
                }else if(patch.path[2]=='n'){ // need to check if already modified this one (merge patches)
                    console.log('add to part: '+patch.path[3]);
                    if(!appends[n]){ appends[n] = {
                        part: [[n],        [], [], [], [], [], ['append']],
                        tags: [[d.n[n].t], [], [], [], [], []]
                    }}
                    var nid = patch.value;
                    console.log(nid);
                    if(Array.isArray(nid)) nid = nid[0]; // could be a single element array if new edge tag
                    console.log(nid);
                    const mi = ['r','p','b','i','f','s'].indexOf(d.n[nid].m);
                    appends[n].part[mi].push(nid);
                    appends[n].tags[mi].push(patch.path[3]);
                }else if(patch.path[2]=='deleted'){
                    edits[d.n[n].m+'del'].push(n);
                }
            }else if(patch.op == 'replace' && patch.path[2]=='v'){ // atom has changed
                edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                edits[d.n[n].m].push(patch.value);
            }
        });
        Object.values(appends).forEach(append=>{
            edits.parts.push(append.part);
            edits.t.push(append.tags);
        });
        //console.log('edits');
        //console.log(edits);
        d.pick.update(d);
        d.design.update(d);
        d.graph.update(d); // only run graph if something was deleted or added? 
        //d.inspect.update(d); // might not need this
        d.push_pack({variables:edits});
    },
    
    receive: (d, data)=>{// must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
        const window_size = (window.innerWidth+window.innerHeight)/4;
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                if(!d.n[n.id]){
                    d.n[n.id] = {
                        m: m,
                        pick: {},
                        graph: { // put in d.graph.node.vectors
                            pos: random_vector({min:window_size, max:window_size*1.5, z:0}),
                            dir: new Vector3(),
                            vis: true,
                        },
                    };
                    d.pick.color(d,n.id);
                }
                if(d.node.be(d,n.id)){
                    d.n[n.id].open = true;
                    d.n[n.id].r = {};
                    d.n[n.id].c = {}; // content generated by reckon
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
                    if(d.graph.tag_vis[d.n[n.id].t]!=undefined) d.n[n.id].graph.vis = d.graph.tag_vis[d.n[n.id].t];
                }
            }); 
        });
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{if(d.node.be(d,n.id)){
                n.e.forEach(e=>{
                    var t = 'unknown';
                    if(root_tags[e.t.v]){   t = root_tags[e.t.v];
                    }else{ if(d.node.be(d,e.r.id))  t = d.n[e.r.id].t; }
                    if(!d.n[n.id].r[t]) d.n[n.id].r[t] = [];
                    d.n[n.id].r[t].push(e.r.id);  // <<<<<<<<< reverse relationship !!!! (root)
                    //if(val_tags.includes(e.t.v) && d.node.be(d,e.r.id)) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;  //if(val_tags.includes(e.t.v) && d.n[e.r.id]) d.n[e.r.id].c[e.t.v] = d.n[n.id].v;
                    if(e.t.v=='asset' && e.r.id==d.profile) d.n[n.id].asset = true; // should put in base_reckon?!
                });
            }});
            data.p.forEach(n=>{if(d.node.be(d,n.id)){
                n[m+'e'].forEach(e=>{
                    if(!d.n[n.id].n[e.t.v]) d.n[n.id].n[e.t.v] = []; 
                    d.n[n.id].n[e.t.v].push(e.n.id); // <<<<<<<<< forward relationship !!!! (nodes)
                    //if(val_tags.includes(e.t.v) && d.node.be(d,e.n.id)) d.n[n.id].c[e.t.v] = d.n[e.n.id].v;  //if(val_tags.includes(e.t.v) && d.n[e.n.id]) d.n[n.id].c[e.t.v] = d.n[e.n.id].v;
                    if(e.t.v=='asset' && n.id==d.profile && d.node.be(d,e.n.id)) d.n[e.n.id].asset = true; // should put in base_reckon?!  //if(e.t.v=='asset' && n.id==d.profile && d.n[e.n.id]) d.n[e.n.id].asset = true;
                });
            }}); 
            data.p.forEach(n=>{if(d.node.be(d,n.id)){
                d.node.reckon(d, n.id);
            }});
        }); 
        d.consume=(d, patches)=>{
            if(patches.length>0 && !(patches.length==1 && patches[0].path[0]=='consume')){    
                //console.log('recieve patches: '+patches);     
                d.graph.update(d); 
                d.studio.ready = true;
            }
        }
    },

    receive_deleted: (d, data)=>{
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                d.node.delete(d, n.id, true); // shallow delete
                //d.n[n.id].open = false;
                //d.n[n.id].deleted = true;
            });
            // data.p.forEach(n=>{
            //     d.node.reckon(d, n.id);
            // });
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


// if(update_funcs[d.n[n.id].t]){
//     d.n[n.id].update = update_funcs[d.n[n.id].t](n.id);
// }else{
//     d.n[n.id].update = update_funcs['default'](n.id);
// }


                    //const part = [[n],        [], [], [], [], [], ['add']];
                    //const tags = [[d.n[n].t], [], [], [], [], []];
                //     const et = patch.path[3];
                //     const m = ['r','p','b','i','f','s'].indexOf(d.n[d.n[n].n[et][0]].m);
                //     if(patch.path.length > 4){
                //         part[m].push(d.n[n].n[et][patch.path[4]]);
                //         tags[m].push(et);
                //     }
                    //edits.parts.push(part);
                    //edits.t.push(tags);


//const mi = 6; // unknown model because this node is not loaded on client. Do not clear on server
                                //if(et!='unknown') mi = ['r','p','b','i','f','s'].indexOf(d.n[nid].m);

//if(e.t.v=='asset' && d.n[e.r.id].profile) d.n[n.id].asset = true; //t=='profile' && d.n[e.r.id].u.id==user_id
//if(e.t.v=='asset' && d.n[n.id].profile && d.n[e.n.id]) d.n[e.n.id].asset = true;

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