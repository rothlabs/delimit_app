import {current} from 'immer';
import {Vector3} from 'three';
import {random_vector, theme} from '../app.js';
import lodash from 'lodash';

export const model_tags={'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; // make seperate atoms tag list?
export const root_tags={
    'view':  'viewer',
    'asset': 'owner',
};
export const float_tags  = ['decimal', 'x', 'y', 'z']; //edge tags
export const string_tags = ['text', 'name', 'story'];  //edge tags
export const val_tags = [...float_tags, ...string_tags];
//export const design_tags = ['part', 'line', 'sketch']; // part is just a three js group that attempts to render child parts, points, lines, meshes, etc
export const node_tags = [
    ...Object.values(model_tags),
    'profile', 'public',
    'point', 'line', 'sketch', 'part',
];
export const ordered_tags = ['point'];

//const empty_list = [];
var next_funcs = [];
var next_ids = [];

export const create_base_slice = (set,get)=>({
    atom_tags: ['switch','integer','decimal','text'],

    add:(array,item)=>{ // static
        if(array.indexOf(item) === -1){
            array.push(item);
            return true;
        }
        return false;
    },
    pop:(array, item)=>{ // static
        const index = array.indexOf(item);
        if(index !== -1) array.splice(index, 1);
    },
    //empty_list: [],

    //next_funcs: [],
    //next_ids: [],
    next(...a){ // static
        const id = a.map(a=> String(a)).join('_');
        if(get().add(next_ids, id)){// add every func and then use set method to make entries unique  //JSON.stringify(a).split('').sort().join()
            //console.log(id, get().n[a[1]] ? get().n[a[1]].t : 'unknown');
            next_funcs.push(a);
        }
    },
    run_next(d){
        //console.log(current(d).next_funcs);
        const funcs = [...next_funcs];
        next_funcs = [];//d.empty_list;
        next_ids = [];//d.empty_list;
        //console.log(current(d).empty_list);
        //console.log(funcs);
        funcs.forEach(a=>{
            //console.log(current(a));
            lodash.get(d, a[0])(d, ...a.slice(1));
        });// 0   1
    },


    //produce_number: 0,
    n: {},
    t: {},
    user: 0,
    profile: null,
    search: {depth:null, ids:null},
    send: true,

    studio: {
        ready:false,
        mode:'graph',
        panel: {},
        make: (d, t)=>{
            const n = d.make.part(d, t);
            d.pick.one(d, n);
        }
    },

    // design: {
    //     part:null, candidate:null, 
    //     update: d=>{
    //         if(d.pick.nodes.length == 1 && design_tags.includes(d.n[d.pick.nodes[0]].t)){  d.design.candidate = d.pick.nodes[0];  } 
    //         else{  d.design.candidate = null;  }
    //         if(d.design.part && !d.n[d.design.part].open){ // use exists/available function here?
    //             d.design.part = null;
    //             d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
    //         }
    //     },
    // },

    send: (d, patches)=>{ // change to send patches directly to server (filtering for patches that matter)
        //console.log('patches');
        //console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:[], t:[], pdel:[],bdel:[],idel:[],fdel:[],sdel:[]};
        const no_edits = JSON.stringify(edits).split('').sort().join();
        const appends = {};
        function set_part(n){ // don't set part if profile?
            //console.log('set entire part: '+d.n[n].t);
            const part = [[n],        [], [], [], [], [], ['replace']];
            const tags = [[d.n[n].t], [], [], [], [], []];
            d.node.for_n(d, n, (nn,t)=>{
                const mi = ['r','p','b','i','f','s'].indexOf(d.n[nn].m);
                part[mi].push(nn);
                tags[mi].push(t);
            });
            edits.parts.push(part);
            edits.t.push(tags);
        }
        patches.forEach(patch=>{ // top level patch.path[0]=='n' ?
            if(patch.path[0]=='n'){
                const n = patch.path[1];
                if(patch.op == 'add'){ 
                    //console.log(n, patch);
                    if(patch.path.length == 2){ // node created  if(patch.path[0]=='n' && patch.path.length < 3){
                        if(d.n[n].m=='p'){
                            set_part(n);
                        }else{
                            console.log('push atom');
                            console.log(patch.value.v);
                            edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                            edits[d.n[n].m].push(patch.value.v); 
                        }
                    }else if(patch.path[2] == 'n'){ // need to check if already modified this one (merge patches)
                        //console.log('add '+patch.path[3]+' to '+d.n[n].t);
                        if(!appends[n]){ appends[n] = {
                            part: [[n],        [], [], [], [], [], ['append']],
                            tags: [[d.n[n].t], [], [], [], [], []]
                        }}
                        var nid = patch.value;
                        if(Array.isArray(nid)) nid = nid[0]; // could be a single element array if new edge tag
                        const mi = ['r','p','b','i','f','s'].indexOf(d.n[nid].m);
                        appends[n].part[mi].push(nid);
                        appends[n].tags[mi].push(patch.path[3]);
                    //}else if(patch.path[2]=='deleted'){
                        //edits[d.n[n].m+'del'].push(n);
                    }
                }else if(patch.op == 'replace'){ 
                    if(patch.path[2]=='n'){
                        set_part(n); 
                    }else if(patch.path[2]=='v'){ // atom has changed
                        edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                        edits[d.n[n].m].push(patch.value);
                    }else if(patch.path[2]=='deleted'){
                        if(patch.value==true){
                            edits[d.n[n].m+'del'].push(n);
                        }else{
                            if(d.n[n].m=='p'){
                                set_part(n);
                            }else{
                                edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                                edits[d.n[n].m].push(d.n[n].v);
                            }
                        }
                    }
                //}else if(patch.op == 'remove'){ 
                    //if(patch.path[0]=='n' && patch.path.length==2) edits[d.n[n].m+'del'].push(n);
                    //if(patch.path[0]=='n' && patch.path.length==3 && patch.path[2]=='deleted') set_part(n);
                }
            }
        });
        Object.values(appends).forEach(append=>{
            edits.parts.push(append.part);
            edits.t.push(append.tags);
        });
        //const to_del = edits.parts.filter(p=> edits.pdel.includes(p[0][0]));
        //console.log('to_del');
        //console.log(to_del);
        //edits.parts.forEach(p=>{

        //});

        //console.log('edits');
        //console.log(edits);
        //d.pick.update(d);
        //d.design.update(d);
        //d.graph.update(d); // only run graph if something was deleted or added? 
        //d.inspect.update(d); // might not need this
        if(JSON.stringify(edits).split('').sort().join() != no_edits){
            console.log('push_pack');
            d.push_pack({variables:edits});
        }
    },
    
    receive: (d, data)=>{// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
        //const window_size = (window.innerWidth+window.innerHeight)/4;
        if(data.t) d.t = Object.fromEntries(data.t.map(t=> [t.id, t.v]));
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                if(!d.n[n.id]){
                    d.n[n.id] = {
                        m: m,
                        pick: {pick:false, hover:false},
                        graph: { // put in d.graph.node.vectors
                            pos: new Vector3(), //random_vector({min:window_size, max:window_size*1.5, z:0}),
                            //dir: new Vector3(),
                            vis: true,
                            lvl: 0,
                        },
                        pin: {},
                    };
                    d.pick.color(d,n.id);
                }
                if(d.node.be(d,n.id)){
                    d.n[n.id].open = true;
                    d.n[n.id].deleted = false;
                    d.n[n.id].r = {};
                    d.n[n.id].c = {}; // content generated by reckon
                    if(m=='p'){
                        d.n[n.id].t = d.t[n.t];
                        d.n[n.id].n = {};
                        if(d.n[n.id].t=='profile'){
                            data.ue.forEach(e=>{
                                if(e.r==n.id && e.n==d.user) d.profile = n.id;
                            });
                        }
                        //console.log('got part: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<<<<<<<<<<<<< show part update
                    }else{  
                        d.n[n.id].t = model_tags[d.n[n.id].m];
                        d.node.sv(d, n.id, n.v);//d.n[n.id].v = n.v;  
                        //d.n[n.id].pin = n.v; 
                        //console.log('got atom: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<< show atom update
                    }
                    if(d.graph.tag_vis[d.n[n.id].t]!=undefined) d.n[n.id].graph.vis = d.graph.tag_vis[d.n[n.id].t];
                }
            }); 
        });
        ['pe','be','ie','fe','se'].forEach(m=> data[m].forEach(e=>{    
            const root_exists = d.node.be(d, e.r);
            if(root_exists){ // change be to ex? (ex for exists)
                if(!d.n[e.r].n[d.t[e.t]]) d.n[e.r].n[d.t[e.t]] = []; 
                if(!d.n[e.r].n[d.t[e.t]].includes(e.n)) d.n[e.r].n[d.t[e.t]].push(e.n); // <<<<<<<<< forward relationship !!!! (nodes)
            }
            if(d.node.be(d, e.n)){
                if(root_exists && e.r==d.profile && d.t[e.t]=='asset') d.n[e.n].asset = true; // should put in base_reckon?! 
                var rt = 'unknown';
                if(root_tags[d.t[e.t]]){  rt = root_tags[d.t[e.t]];  } 
                else{if(root_exists)      rt = d.n[e.r].t;           }
                if(!d.n[e.n].r[rt]) d.n[e.n].r[rt] = [];
                if(!d.n[e.n].r[rt].includes(e.r)) d.n[e.n].r[rt].push(e.r);  // <<<<<<<<< reverse relationship !!!! (root)
            }
        }));
        data.p.forEach(n=>{
            if(d.node.be(d,n.id)) d.reckon.node(d, n.id); // need to track if reckon was already called due to branch (so not running same calc)
        });
        d.studio.ready = true;
        d.next('graph.update');
    },

    receive_deleted: (d, data)=>{
        ['p','b','i','f','s'].forEach(m=>{
            data[m].forEach(n=>{
                d.node.delete(d, n.id, true); // shallow delete
            });
        });
    },

    close: (d, nodes)=>{ /// need to integrate into post update system!!!! (broken, will not work right)
        const close_pack = {p:[], b:[], i:[], f:[], s:[]};
        nodes.forEach(n=>{
            d.node.close(d, n);
            close_pack[d.n[n].m].push(n);
            // d.n[n].open=false;
            // d.n[n].r = {};
            // d.n[n].c = {};
            // d.n[n].t = '';
            // if(d.n[n].m=='p'){  d.n[n].n = {};  }
            // else{  d.n[n].v = null;  }
        });
        //d.pick.update(d);
        //d.design.update(d);
        //d.graph.update(d);
        d.close_pack({variables:close_pack});
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