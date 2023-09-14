import {current} from 'immer';
import {Vector3, Matrix4} from 'three';
import * as THREE from 'three';
import {static_url, theme} from '../app.js';
import lodash from 'lodash';
//import { Group } from '../component/part/group.js';
import {Point} from '../component/design/point.js';
import {Curve} from '../component/design/curve.js';
import {Shape} from '../component/design/shape.js';
import {Surface} from '../component/design/surface.js';
import {Sketch} from '../component/design/sketch.js';
import {Transform} from '../component/design/transform.js';
import {Layer} from '../component/design/layer.js';
import {Image} from '../component/design/image.js';

var next_funcs = [];
var next_ids = [];

const subject_tags= [
    'product', 'point', 'curve', 'sketch', 'transform', // 'repeater', 'group', 
    'mixed_curve', 'ellipse', 'surface', 'shape', 'layer', 'image', 'brush', 'stroke',
    'slice', 'post', 'machine',
];
const children_tags = [
    'boundary', 
];
const cat_tags=[ //cat_cast_tags=[ // should call them bool_tags ?!?!?!?!?!
    'public', 'auxiliary', 'top_view', 'side_view', 'face_camera', 'manual_compute', // 'front_view',
    'fill', 'corner',
];
const cast_tags = [...cat_tags, 'base_matrix']; // , 'base_invert'
//const cast_shallow_tags = ['public', 'auxiliary',];
const component = {
    'point':       Point,
    'curve':       Curve,
    'mixed_curve': Curve,
    'shape':       Shape,
    'surface':     Surface,
    'sketch':      Sketch,
    'transform':   Transform,
    'layer':       Layer,
    'image':       Image,
    'ellipse':     Curve,
    'slice':        Curve,
    'post':        Curve,
};
const model_tags    = {'p':'part', 'b':'switch', 'i':'integer', 'f':'decimal', 's':'text'}; 
const cat_map = Object.fromEntries(cat_tags.map(t=>[t,true])); //cat_cast_tags
//const category_tags = ['public', 'auxiliary', ...cat_cast_tags,];
const admin_tags    = ['profile', ...cat_tags]; //category_tags
const float_tags    = [model_tags['f'], // rename to number_tags
    'x', 'y', 'z', 'move_x', 'move_y', 'move_z', 'turn_x', 'turn_y', 'turn_z', 'scale_x', 'scale_y', 'scale_z',
    'radius_a', 'radius_b', 'angle_a', 'angle_b', 'axis_x', 'axis_y', 'axis_z',
    'width', 'height',
    'order', 'current_image',
    'density', 'axes', 'spread_angle', 'layers', 'speed', 'flow', 'cord_radius', 
    'origin_x', 'origin_y', 'origin_z', 'origin_a', 
    'holder_y', 'holder_x1', 'holder_x2', 'holder_x3', 'holder_x4', 'holder_x5',
    'offset_x1', 'offset_x2', 'offset_x3', 'offset_x4', 'offset_x5', 'offset_a',
];
const string_tags = [model_tags['s'], // rename to text_tags
    'name', 'story', 'code', 'data',
    'color_a', 'color_b',
    'material',
]; 
const atom_tags   = Object.values(model_tags).slice(1);


export const create_base_slice = (set,get)=>({
    model_tags:     model_tags,
    float_tags:     float_tags,
    string_tags:    string_tags,
    atom_tags:      atom_tags,
    cat_tags:       cat_tags, //category_tags
    //cast_shallow_tags: cast_shallow_tags,
    cat_map:        cat_map, //category //category_tags
    subject_tags:   subject_tags,
    admin_tags:     admin_tags,
    value_tags:     [...float_tags, ...string_tags],
    children_tags:  [...subject_tags, ...children_tags],
    node_tags:      [...atom_tags, ...subject_tags, ...admin_tags],
    root_tags:      {'viewable':'viewer', 'asset':'owner',},
    cast_tags: cast_tags,
    cast_map: {...cat_map, ...Object.fromEntries(cast_tags.map(t=>[t,true]))},
    cast_shallow_map: Object.fromEntries([ // cast_tags
        'public', 'auxiliary', 'manual_compute',
        'fill',
    ].map(t=>[t,true])),
    cast_end:Object.fromEntries([
        'point', 'mixed_curve', 'surface', 'layer', 'ellipse', // maybe add ellipse here ?!?!?!?!?!
    ].map(t=>[t,true])),
    component:component,
    component_tags:Object.keys(component),
    node_css:{
        'public':         'bi-globe-americas',
        'profile':        'bi-person',
        'switch':         'bi-bezier2', // bi-123 // delete switch
        'integer':        'bi-123',
        'decimal':        'bi-123',
        'text':           'bi-type',
        'point':          'bi-record-circle',
        'curve':          'bi-bezier2',
        'ellipse':        'bi-circle',
        'sketch':         'bi-easel2',
        //'repeater':       'bi-files',
        //'group':          'bi-box-seam',
        'transform':      'bi-arrows-move',
        'mixed_curve':    'bi-bezier',
        'top_view':       'bi-camera-reels',
        'side_view':      'bi-camera-reels',
        'face_camera':    'bi-camera-reels',
        'auxiliary':      'bi-binoculars',
        'manual_compute': 'bi-cpu',
        'product':        'bi-bag',
        'surface':        'bi-map',
        'shape':          'bi-pentagon',
        'layer':          'bi-layers',
        'image':          'bi-image',
        'slice':           'bi-rainbow',
        'fill':           'bi-cloud-fog2-fill',
        'corner':         'bi-triangle',
        'post':           'bi-code',
        'brush':          'bi-brush',
        'stroke':         'bi-slash-lg',
        'machine':        'bi-device-ssd',
    },

    max_click_delta: 7,
    axis_colors: ['#ff3b30', '#27e858', '#4287f5'],
    base_font: static_url+'font/Inter-Medium.ttf',
    point_size: 6,
    easel_size: 400,
    cam_info: {matrix: new Matrix4(), dir: new Vector3()},
    //base_texture: base_texture,
    //rapid_res: 0.5,

    n:    {}, // all nodes stored here by ID 
    t:    {},
    t_id: {},
    cats: {},
    user: 0,
    profile: null,
    //public: null,
    search: {depth:null, ids:null},
    studio: {
        ready: false,
        mode: 'graph',
        panel: {},
        grouping: false, // put this in d.design ?!?!?!?!?!
        cursor: '',
    },

    init(d){
        d.base_texture = new THREE.TextureLoader().load(
            static_url+'texture/uv_grid.jpg'//"https://threejs.org/examples/textures/uv_grid_opengl.jpg"
        );
        d.base_texture.wrapS = d.base_texture.wrapT = THREE.RepeatWrapping;
        d.base_texture.anisotropy = 16;
        
        d.node.init(d);
        //d.make.init(d);
        d.graph.init(d); //d.node.init(d);
    },

    add(array, item){ // static upgrade to do deep compare to find same object ?!?!?!?!
        if(array.indexOf(item) === -1){
            array.push(item);
            return true;
        }
        return false;
    },
    pop(array, item){ // static
        const index = array.indexOf(item);
        if(index !== -1) array.splice(index, 1);
        return index;
    },
    add_nc(array, item){ // item in the form of {n:n, c:c}
        const target = array.find(v=> v.n==item.n);
        if(target) target.c = item.c;
        else array.push(item);
    },
    pop_nc(array, item){
        const target = array.find(v=> v.n==item.n);
        if(target){
            array.splice(array.indexOf(target), 1);
            return true;
        }
        return false;
    },
    for(arg, func){ // need ability to break !!!!!!
        if(arg != undefined){
            if(Array.isArray(arg)){arg.forEach((a,i)=> func(a,i))}
            else                  {func(arg,0)}
        }
    },
    rnd(v, sigfigs=100){
        return Math.round((v + Number.EPSILON) * sigfigs) / sigfigs;
    },
    join_float_32_arrays(arrays){
        const lengths = arrays.map(v=> v.length);
        const result = new Float32Array(lengths.reduce((a,b)=>a+b,0));
        for (let i=0; i<arrays.length; i++){
            let start = lengths.slice(0,i).reduce((a,b)=>a+b,0);
            result.set(arrays[i], start); 
        }
        return result;
    },
    // try(...funcs){
    //     const result = null;
    //     for(var i=0; i<funcs.length; i++){
    //         try{ result = funcs[i](result);
    //         }catch{ break; }
    //     }
    // },

    next(...a){ // static
        const id = a.filter(a=>!Array.isArray(a)).map(a=>String(a)).join('_'); //check if one of a is an object and iterate that to stringify parts //must make sure this is stringifying function args right {key:value}?!?!?!
        if(get().add(next_ids, id)){// add every func and then use set method to make entries unique  //JSON.stringify(a).split('').sort().join()
            //console.log(id);
            //console.log(id, get().n[a[1]] ? get().n[a[1]].t : 'unknown');
            next_funcs.push({a:a, id:id});
        }else{
            if(Array.isArray(a.at(-1))){
                const f = next_funcs.find(f=>(f.id==id));
                if(Array.isArray(f.a.at(-1))){
                    const d = get();
                    a.at(-1).forEach(cumulative=>{
                        d.add(f.a[f.a.length-1], cumulative);
                    });
                }
            }
        }
    },
    continue(d){
        //console.log(current(d).next_funcs);
        const funcs = [...next_funcs];
        next_funcs = [];//d.empty_list;
        next_ids = [];//d.empty_list;
        //console.log(current(d).empty_list);
        //console.log(funcs);
        funcs.forEach(f=>{
            //console.log(current(a));
            lodash.get(d, f.a[0])(d, ...f.a.slice(1));
        });// 0   1
    },


    send(d, patches){ // change to send patches directly to server (filtering for patches that matter)
        //console.log('patches');
        //console.log(patches); // auto merges patches into mutations state slice 
        const edits = {atoms:[[],[],[],[]], b:[], i:[], f:[], s:[], parts:[], t:[], pdel:[],bdel:[],idel:[],fdel:[],sdel:[]};
        const no_edits = JSON.stringify(edits).split('').sort().join();
        //const appends = {};
        const parts = [];
        const atoms = [];
        const deleted_nodes = [];
        patches.forEach(patch=>{ // top level patch.path[0]=='n' ?
            if(patch.path[0]=='n'){
                const n = patch.path[1];
                if(patch.op == 'add'){ 
                    //console.log(n, patch);
                    if(patch.path.length == 2){ // node created  if(patch.path[0]=='n' && patch.path.length < 3){
                        if(d.n[n].m=='p'){
                            d.add(parts,n);
                        }else{
                            //console.log('push atom');
                            //console.log(patch.value.v);
                            //edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                            //edits[d.n[n].m].push(patch.value.v); 
                            atoms.push({n:n, v:patch.value.v});
                        }

                    }else if(patch.path[2] == 'n'){ // this should be removed, always just set the part if it has changed   need to check if already modified this one (merge patches)
                        d.add(parts,n);
                        // //console.log('add '+patch.path[3]+' to '+d.n[n].t);
                        // if(!appends[n]){ appends[n] = {
                        //     part: [[n],        [], [], [], [], [], ['append']],
                        //     tags: [[d.n[n].t], [], [], [], [], []]
                        // }}
                        // var nid = patch.value;
                        // if(Array.isArray(nid)) nid = nid[0]; // could be a single element array if new edge tag
                        // const mi = ['r','p','b','i','f','s'].indexOf(d.n[nid].m);
                        // appends[n].part[mi].push(nid);
                        // appends[n].tags[mi].push(patch.path[3]);
                    }
                }else if(patch.op == 'replace'){ 
                    if(patch.path[2]=='n'){
                        //console.log('remove at',n);
                        d.add(parts,n);
                    }else if(patch.path[2]=='v'){ // atom has changed
                        //edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                        //edits[d.n[n].m].push(patch.value);
                        atoms.push({n:n, v:patch.value});
                    }else if(patch.path[2]=='deleted'){
                        if(patch.value==true){
                            edits[d.n[n].m+'del'].push(n);
                            deleted_nodes.push(n);
                        }else{
                            if(d.n[n].m=='p'){
                                d.add(parts,n);
                            }else{
                                //edits.atoms[['b','i','f','s'].indexOf(d.n[n].m)].push(n); // atom id
                                //edits[d.n[n].m].push(d.n[n].v);
                                atoms.push({n:n, v:d.n[n].v});
                            }
                        }
                    }
                }else if(patch.op == 'remove'){
                    if(patch.path[2]=='n'){
                        //console.log('remove at',n);
                        d.add(parts,n);
                    }
                }
            }
        });
        //function include_part(n){ // don't set if already set!   don't set part if profile?
        parts.forEach(n=>{ // need to test with two profiles working on same asset
            if(d.n[n].t != 'profile' && !deleted_nodes.includes(n)){
                //console.log('send part', n, d.n[n].t);
                const part = [[n],                [], [], [], [], []]; //, ['replace']
                const tags = [[d.t_id[d.n[n].t]], [], [], [], [], []];
                d.node.for_n(d, n, (r,n,t)=>{
                    const mi = ['r','p','b','i','f','s'].indexOf(d.n[n].m);
                    part[mi].push(n);
                    tags[mi].push(d.t_id[t]);
                });
                edits.parts.push(part);
                edits.t.push(tags);
            }
        });
        atoms.forEach(atom=>{
            if(!deleted_nodes.includes(atom.n)){
                edits.atoms[['b','i','f','s'].indexOf(d.n[atom.n].m)].push(atom.n); // atom id
                edits[d.n[atom.n].m].push(atom.v);
            }
        });
        // Object.values(appends).forEach(append=>{ // need add and remove for d.n[n].n for BIG parts like profiles
        //     edits.parts.push(append.part);
        //     edits.t.push(append.tags);
        // });
        if(JSON.stringify(edits).split('').sort().join() != no_edits){ // might not need this check anymore
            console.log('Push Pack - mutate');
            d.push_pack({variables:edits});
        }
    },
    
    receive: (d, data)=>{// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
        //const window_size = (window.innerWidth+window.innerHeight)/4;
        var set_update_graph = false;
        if(data.t){
            d.t = Object.fromEntries(data.t.map(t=> [t.id, t.v]));
            d.t_id = Object.fromEntries(data.t.map(t=> [t.v, t.id]));
        }
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
                            //lvl: 0,
                        },
                        pin: {},
                        design: { vis:true },
                    };
                    d.pick.color(d,n.id);
                }
                //if(n.id == 'tuXEbqsYYX8CdIPM') console.log('public!')
                //if(d.node.be(d,n.id)){ // is this stopping undo delete from other client?!?!?!
                if(d.n[n.id].r){
                    //const edges = []; 
                    d.node.for_rn(d, n.id, (r,n,t)=> d.delete.edge(d,r,n,{t:t})); //, no_update:true
                        //edges.push({r:r, n:n, t:t}); // // , o:o don't know if this is needed ?!?!?!?!,  this will cause reverse edges to be deleted on forward node
                    //});
                    //d.node.delete_edges(d, edges);
                }
                d.n[n.id].r = {}; // might not need this because of delete above
                d.n[n.id].c = {}; // content generated by reckon
                //d.n[n.id].l = {}; // content generated by reckon
                //d.n[n.id].w = {}; // content generated by reckon
                d.n[n.id].ax = {}; // content generated by reckon
                if(m=='p'){
                    d.n[n.id].t = d.t[n.t];
                    if(d.n[n.id].n){
                        //const edges = [];
                        d.node.for_n(d, n.id, (r,n,t)=> d.delete.edge(d,r,n,{t:t})); //, no_update:true
                        //    edges.push({r:r, n:n, t:t}); // , o:o this will cause reverse edges to be deleted on forward node
                        //});
                        //d.node.delete_edges(d, edges);
                    }
                    d.n[n.id].n = {}; // might not need this curve because of delete above  should respective r of other nodes 
                    if(d.n[n.id].t=='profile'){
                        data.ue.forEach(e=>{
                            if(e.r==n.id && e.n==d.user) d.profile = n.id;
                        });
                    }
                    //if(d.n[n.id].t=='public') d.public = n.id;
                    if(d.cat_map[d.n[n.id].t]) d.cats[d.n[n.id].t] = n.id; // optimize with direct lookup ?!?!?!?!
                    //console.log('got part: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<<<<<<<<<<<<< show part update
                }else{  
                    d.n[n.id].t = d.model_tags[d.n[n.id].m];
                    d.node.sv(d, n.id, n.v);//d.n[n.id].v = n.v;  
                    //d.n[n.id].pin = n.v; 
                    //console.log('got atom: '+n.id+' ('+d.n[n.id].t+')'); // <<<<<<<<<<<<< show atom update
                }
                set_update_graph = true;
                d.n[n.id].open = true;
                d.n[n.id].deleted = false;
                if(d.graph.n_vis[d.n[n.id].t]!=undefined) d.n[n.id].graph.vis = d.graph.n_vis[d.n[n.id].t];
                //}
            }); 
        });
        ['pe','be','ie','fe','se'].forEach(m=> data[m].forEach(e=>{  // use d.make.edge here so repeater takes action ?!?!?!?!?!?
            const root_exists = d.node.be(d, e.r);
            if(root_exists){ // change be to ex? (ex for exists)
                if(!d.n[e.r].n[d.t[e.t]]) d.n[e.r].n[d.t[e.t]] = [];  
                //if(d.order_tags.includes(d.t[e.t])){
                  //  d.n[e.r].n[d.t[e.t]].push(e.n); // <<<<<<<<< forward relationship !!!! (nodes) 
                //}else{
                    if(!d.n[e.r].n[d.t[e.t]].includes(e.n)) d.n[e.r].n[d.t[e.t]].push(e.n); // <<<<<<<<< forward relationship !!!! (nodes)
                //}
            }
            if(d.node.be(d, e.n)){
                if(root_exists && e.r==d.profile && d.t[e.t]=='asset') d.n[e.n].asset = true; // should put in base_reckon?! 
                var rt = 'unknown';
                if(d.root_tags[d.t[e.t]]){  rt = d.root_tags[d.t[e.t]];  } 
                else{if(root_exists)      rt = d.n[e.r].t;           }
                if(!d.n[e.n].r[rt]) d.n[e.n].r[rt] = []; 
                //if(d.order_tags.includes(d.t[e.t])){
                    //d.n[e.n].r[rt].push(e.r); 
                //}else{
                    if(!d.n[e.n].r[rt].includes(e.r)) d.n[e.n].r[rt].push(e.r);  // <<<<<<<<< reverse relationship !!!! (root)
                //}
            }
        }));
        data.p.forEach(n=>{
            if(d.node.be(d,n.id)) d.reckon.up(d, n.id); // d.next('reckon.up',n.id); // run lowest level reckon only ?!?!?!?!
        });
        d.studio.ready = true;
        if(set_update_graph) d.next('graph.update'); // only if add/remove or d.n[n].n/d.n[n].r changes
        ['dp','db','di','df','ds'].forEach(m=>{
            if(data[m]) data[m].forEach(n=> d.delete.node(d, n));
        });
    },

    // receive_deleted: (d, data)=>{ 
    //     ['p','b','i','f','s'].forEach(m=>{
    //         //d.delete.node(d, data[m].map(n=>n.id), true);
    //         data[m].forEach(n=>{
    //             d.delete.node(d, n.id); // shallow delete
    //         });
    //     });
    // },

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
        d.close_pack({variables:close_pack});
    },

});



                                //d.node.for_r(d, n, rr=>{
                                //    if(r==rr) dead_edges.push({r:r, n:n, t:t, o:o});
                                //}); // don't have to set to null if set deleted after?

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

// design: {
    //     part:null, candidate:null, 
    //     update: d=>{
    //         if(d.pick.n.length == 1 && design_tags.includes(d.n[d.pick.n[0]].t)){  d.design.candidate = d.pick.n[0];  } 
    //         else{  d.design.candidate = null;  }
    //         if(d.design.part && !d.n[d.design.part].open){ // use exists/available function here?
    //             d.design.part = null;
    //             d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
    //         }
    //     },
    // },

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
//     'Point', 'curve', // geom
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