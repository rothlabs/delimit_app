//import { make_id } from '../app.js';
//import {current} from 'immer';

export const make = {};

make.id = (length=16)=>{
    let result = '';
    Array.from({length}).some(() => {
        result += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
      return result.length >= length;
    });
    return result;
};

make.node = (d, a={})=>{ 
    const node = a.node ?? d.make.id();
    if(!(a.given || d.write_access(d, node))) return;
    const repo = a.repo ?? d.target.repo;
    d.drop.edge(d, {root:node}); 
    d.node.set(node, {
        forw: new Map(), // key:term,            value:[stem or leaf_obj]
        back: new Set(), // key:root+term+indx,  value:[root, term, indx]
        repo,
    });
    if(d.repo.has(repo)) d.repo.get(repo).node.add(node);
    d.graph.increment(d);
    return node;
};

make.edge = (d, root, term, stem, a={})=>{ // if somehow this is called without permission, the server should kick back with failed 
    if(!(d.node.has(root) && (stem.type || d.node.has(stem)))) return;
    if(!(a.given || d.write_access(d, root))) return;
    const forw = d.node.get(root).forw;
    const length = forw.get(term)?.length ?? 0;
    if(!length) forw.set(term, []); 
    const indx = a.indx ?? length;
    if(indx > length || length >= a.max_length) return; 
    forw.get(term).splice(indx, 0, stem); 
    //if(!stem.type) d.node.get(stem).back.set(root+':'+term+':'+indx, [root, term, indx]);
    if(!stem.type) d.node.get(stem).back.add(root);
    d.graph.increment(d);
};



// function List_Map(){
//     const map = new Map();
//     //map[Symbol.iterator] = ()=>{
//     map.flat = ()=>{
//         const entries = map.entries();
//         let {value, done} = entries.next();
//         let indx = -1;
//         return{
//             next(){
//                 indx++;
//                 if(indx < value[1].length){
//                     return {value:[value[0], value[1][indx], indx]};	
//                 }
//                 ({value, done} = entries.next());
//                 if(done) return {done};
//                 indx = 0;
//                 return {value:[value[0], value[1][indx], indx]};	
//             }
//         };
//     };
//     return map;
// }



//const term = a.term ?? 'stem';


// atom(d, cls, v, a={}){ // just check v to figure if b, i, f, or s
//     if(v == null){
//         if(cls == 'boolean') v = false;
//         if(cls == 'integer' || cls == 'decimal') v = 0;
//         if(cls == 'string') v = '';
//     }
//     //console.log('come on!', current(a.r));
//     if(a.single && a.r && a.r.length){
//         //let r = Array.isArray(a.r) ? a.r : [a.r];
//         if(d.as_array(a.r).every(r=> d.n[r].n[a.t])) return;
//     }
//     //console.log('come on! 2');
//     const n = d.make.node(d, cls, a); //{r:r, t:t}
//     d.n[n].v = v; 
//     return n;
// },
// part(d, cls, a){ // a.r should be array 
//     let stem = {};
//     if(d.node[cls]){
//         for(const [t, s] of Object.entries(d.node[cls].stem)){
//             if(d.terminal_classes[s.class[0]] && s.default != null){
//                 stem[t] = d.make.atom(d, s.class[0], s.default);
//             }
//         }
//     }
//     return d.make.node(d, cls, {...a, stem:stem});
// },



// d.next('reckon.up', r);
// d.next('graph.update');
// d.next('pick.update');
// d.next('design.show'); 



// export const create_make_slice = (set,get)=>({make:{
//     // init(d){
//     //     d.make.buttons = d.subject
//     // },
//     edge(d, r, n, a={}){ // check existance of r and n here ?!?!?!?!?!
//         if(!d.graph.ex(d,r) || !d.graph.ex(d,n)) return;
//         //console.log('make edge 1', r, a.t, n);
//         if(d.n[r].asset || a.received){  // if(d.n[r].asset || r==d.user || a.received){     // if(d.n[r].asset || r==d.profile || (d.cats[d.n[r].t] && d.n[n].asset)){ // || (r==d.profile && a.t=='asset') || (r==d.cat.public && a.t=='viewable')
//             //console.log('make edge 2', r, a.t, n);
//             if(a.single && d.n[r].n[a.t]) return;

//             /////var t = d.n[n].t;
//             //if(d.n[r].t == 'group')  t = 'group'; 
//             let t = a.t ?? d.n[n].t;//////////if(a.t != undefined) t = a.t;
//             //if(d.n[r].t == 'public') t = 'viewable';
//             // // // if(r == d.user && t == 'asset'){// t!='view'){
//             // // //     //t = 'asset';
//             // // //     d.n[n].asset = true;
//             // // // }
//             if(!d.n[r].n[t]) d.n[r].n[t] = [];
//             /////////////////////d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
//             //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 
//             if(!d.n[r].n[t].includes(n)){
//                 var o = a.o;
//                 if(a.o==undefined) o = d.n[r].n[t].length;
//                 d.n[r].n[t].splice(o, 0, n); //d.n[r].n[t].splice(a.o, 0, n);
//                 //console.log('make edge o', d.n[r].t, d.n[n].t, t, o);
//                 //if(a.o!=undefined){d.n[r].n[t].splice(a.o, 0, n)}
//                 //else              {d.n[r].n[t].push(n)}
//                 var rt = d.n[r].t;
//                 if(d.root_tags[t]) rt=d.root_tags[t];
//                 if(!d.n[n].r[rt]) d.n[n].r[rt] = [];
//                 d.n[n].r[rt].push(r); // reverse relationship 
//                 // // // if(d.studio.grouping && d.n[n].n){ // need to make is_part function?!?!?! (or is_atom)   
//                 // // //     d.graph.root(d,r).filter(r=> d.n[r].t=='group').forEach(r=>{ // deep?  //d.graph.root_edge(d,r).filter(e=> d.n[e.r].t=='group')
//                 // // //         d.make.edge(d, r, n, {src:a.src}); //, e.r 
//                 // // //     });
//                 // // // }


//                 // if(!d.cast_end[d.n[r].t]){
//                 //     const content_packs = [{c:d.n[r].c,t:'c'},{c:d.n[r].ax,t:'ax'}];
//                 //     content_packs.forEach(cp=>{
//                 //         Object.entries(cp.c).forEach(([t,cc])=>{
//                 //             if((d.cast_map[t] || t=='matrix_list' ) && !d.cast_shallow_map[t]) {
//                 //                 d.n[n][cp.t][t] = cc; 
//                 //                 if(t=='matrix_list') d.reckon.matrix(d, n, cp.t);
//                 //             }
//                 //         });
//                 //     });
//                 // }


//                 ////d.action.node(d, r, {act:'make.edge', src:a.src, r:r, n:n, t:t, o:o});
//                 d.next('reckon.up', r);///////, ['make.edge', t]); 
//                 d.next('graph.update');
//                 d.next('pick.update');
//                 d.next('design.show');

//                 //console.log('make edge final', r, t, n);
//             }
//         }
//     },
//     node(d, cls, a={}){ // might want to use this on reception of nodes so can't set consume here? or can I since it will be overwritten?
//         //const window_size = (window.innerWidth+window.innerHeight)/4;
//         const n = make_id(cls);
//         d.n[n] = d.node_template(d, cls);
//         d.n[n].asset = true;
//         //d.n[n].drop = false;

//         // d.n[n] = {cls:cls, t:cls, r:{}, c:{}, open:true, asset:true, drop:false, // ax:{} c:a.c?a.c:{} // l:{}, w:{},
//         //     pick: {pick:false, hover:false},
//         //     graph: { 
//         //         pos: new Vector3(), 
//         //         vis: d.graph.n_vis[t]!=undefined ? d.graph.n_vis[t] : true,
//         //     },
//         //     pin: {},
//         //     design:{ vis:true },
//         // };
//         d.pick.color(d, n);
//         if(!d.terminal_classes[cls]) d.n[n].n={}; 
//         ///////d.make.edge(d, d.user, n, {t:'asset'}); // need to make temp profile for anonymous users!!!!

//         //if(a.r) d.make.edge(d, a.r, n, a); // a.r should be list?
//         d.for(a.r, r=> d.make.edge(d, r, n, a));

//         if(a.stem) Object.entries(a.stem).forEach(([t,nn],i)=>{
//             d.for(nn, nn=> d.make.edge(d, n, nn, {t:t}));
//         });
//         //{
//         //    if(Array.isArray(a.r)){   a.r.forEach(r=> d.make.edge(d, r, n, a))   }
//         //    else{   d.make.edge(d, a.r, n, a);  }
//         //}
//         //d.consume = d.send; // make add to a consume list? so async ops work? idk

//         // // if(d.graph.ex(d,a.r) && !d.cast_end[d.n[a.r].t]){
//         // //     const content_packs = [{c:d.n[a.r].c,t:'c'},{c:d.n[a.r].ax,t:'ax'}];
//         // //     content_packs.forEach(cp=>{
//         // //         Object.entries(cp.c).forEach(([t,cc])=>{
//         // //             if((d.cast_map[t] || t=='matrix_list' ) && !d.cast_shallow_map[t]) {
//         // //                 d.n[n][cp.t][t] = cc; 
//         // //                 if(t=='matrix_list') d.reckon.matrix(d, n, cp.t);
//         // //             }
//         // //         });
//         // //     });
//         // // }

//         //d.next('reckon.up', n, ['make.node']); will this ever be needed ?!?!?!?!
//         d.next('graph.update'); // check if in graph_tags 
//         return n;
//     },
//     atom(d, cls, v, a={}){ // just check v to figure if b, i, f, or s
//         if(v == null){
//             if(cls == 'boolean') v = false;
//             if(cls == 'integer' || cls == 'decimal') v = 0;
//             if(cls == 'string') v = '';
//         }
//         //console.log('come on!', current(a.r));
//         if(a.single && a.r && a.r.length){
//             //let r = Array.isArray(a.r) ? a.r : [a.r];
//             if(d.as_array(a.r).every(r=> d.n[r].n[a.t])) return;
//         }
//         //console.log('come on! 2');
//         const n = d.make.node(d, cls, a); //{r:r, t:t}
//         d.n[n].v = v; 
//         return n;
//     },
//     part(d, cls, a){ // a.r should be array 
//         let stem = {};
//         if(d.node[cls]){
//             for(const [t, s] of Object.entries(d.node[cls].stem)){
//                 if(d.terminal_classes[s.class[0]] && s.default != null){
//                     stem[t] = d.make.atom(d, s.class[0], s.default);
//                 }
//             }
//         }
//         return d.make.node(d, cls, {...a, stem:stem});
//     },
// }});





// if(d.node[cls].bool) Object.entries(d.node[cls].bool).forEach(([prop, val])=>{
//     stems[prop] = d.make.atom(d, 'b', val);
// });
// if(d.node[cls].int) Object.entries(d.node[cls].int).forEach(([prop, val])=>{
//     stems[prop] = d.make.atom(d, 'i', val);
// });
// if(d.node[cls].float) Object.entries(d.node[cls].float).forEach(([prop, val])=>{
//     stems[prop] = d.make.atom(d, 'f', val);
// });
// if(d.node[cls].string) Object.entries(d.node[cls].string).forEach(([prop, val])=>{
//     stems[prop] = d.make.atom(d, 's', val);
// });

//return d.make.node(d, 'p', t, {...a, atoms});
//}else{
//    return d.make.node(d, 'p', t, a);

// point(d, a={}){ //pos, r, o
//     if(a.pos == undefined) a.pos = new Vector3();
//     if(a.r){
//         //if(d.n[a.r].c.invert) a.pos.applyMatrix4(d.n[a.r].c.invert);
//         //if(d.n[a.r].ax.invert) a.pos.applyMatrix4(d.n[a.r].ax.invert);
//         a.pos.setX(d.rnd(a.pos.x));
//         a.pos.setY(d.rnd(a.pos.y));
//         a.pos.setZ(d.rnd(a.pos.z));
//     }
//     return d.make.node(d,'p','point', {...a, n:{ //r:a.r, o:a.o,
//         x: d.make.atom(d,'f', a.pos.x),
//         y: d.make.atom(d,'f', a.pos.y),
//         z: d.make.atom(d,'f', a.pos.z),
//     }});
// },
// transform(d, a={}){
//     return d.make.node(d,'p','transform', {...a, n:{
//         //matrix: d.make.part(d,'matrix'),
//         move_x:  d.make.atom(d,'f', 0),
//         move_y:  d.make.atom(d,'f', 0),
//         move_z:  d.make.atom(d,'f', 0),
//         turn_x:  d.make.atom(d,'f', 0),
//         turn_y:  d.make.atom(d,'f', 0),
//         turn_z:  d.make.atom(d,'f', 0),
//         scale_x: d.make.atom(d,'f', 1),
//         scale_y: d.make.atom(d,'f', 1),
//         scale_z: d.make.atom(d,'f', 1),
//     }});
// },
// ellipse(d, a={}){
//     return d.make.node(d,'p','ellipse', {...a, n:{
//         x: d.make.atom(d,'f', 0),
//         y: d.make.atom(d,'f', 0),
//         z: d.make.atom(d,'f', 0),
//         axis_x: d.make.atom(d,'f', 0),
//         axis_y: d.make.atom(d,'f', 1),
//         axis_z: d.make.atom(d,'f', 0),
//         radius_a: d.make.atom(d,'f', 10),
//         radius_b: d.make.atom(d,'f', 10),
//         angle_a: d.make.atom(d,'f', 90),
//         angle_b: d.make.atom(d,'f', 270),
//     }});
// },
// surface(d, a={}){
//     return d.make.node(d,'p','surface', {...a, n:{
//         order:         d.make.atom(d,'i', 0),
//         current_image: d.make.atom(d,'i', 0), 
//     }});
// },
// image(d, a={}){
//     var size = 1024;
//     var canvas = document.createElement("canvas");
//     canvas.width = size;
//     canvas.height = size;
//     var cctx = canvas.getContext("2d");
//     cctx.fillStyle = 'white';//'#d63384';
//     cctx.fillRect(0, 0, size, size);
//     return d.make.node(d,'p','image', {...a, n:{
//         //turn_z: d.make.atom(d,'f', 90),
//         width:  d.make.atom(d,'f', size),
//         height: d.make.atom(d,'f', size),
//         data:   d.make.atom(d,'s', canvas.toDataURL()),
//         order:  d.make.atom(d,'i', 0),
//     }});
// },
// brush(d, a={}){
//     return d.make.node(d,'p','brush', {...a, n:{
//         color_a:  d.make.atom(d,'s', 'rgba(0, 0, 0, 1)'),
//         color_b:  d.make.atom(d,'s', 'rgba(0, 0, 0, 0)'), 
//         radius_a: d.make.atom(d,'f', 4),
//         radius_b: d.make.atom(d,'f', 8),   
//     }});
// },
// slice(d, a={}){ // add manual_compute !!!!!!!!!
//     var n = d.make.node(d,'p','slice', {...a, n:{
//         coil:         d.make.atom(d,'b', false),
//         axial:        d.make.atom(d,'b', false),
//         material:     d.make.atom(d,'s', 'H2O'),
//         axis_x:       d.make.atom(d,'f', 0),
//         axis_y:       d.make.atom(d,'f', -1),
//         axis_z:       d.make.atom(d,'f', 0),
//         offset:       d.make.atom(d,'f', 0),
//         density:      d.make.atom(d,'f', 0.1),
//         cord_radius:  d.make.atom(d,'f', 0.5),
//         speed:        d.make.atom(d,'f', 50),
//         flow:         d.make.atom(d,'f', 1),
//         layers:       d.make.atom(d,'i', 1),
//         axes:         d.make.atom(d,'i', 1),
//         spread_angle: d.make.atom(d,'f', 20),
//         layer_height: d.make.atom(d,'f', 0.8),
//     }});
//     d.make.edge(d, d.cats['manual_compute'], n);
//     return n;
// },
// machine(d, a={}){
//     return d.make.node(d,'p','machine', {...a, n:{ 
//         origin_x:  d.make.atom(d,'f', 0),
//         origin_y:  d.make.atom(d,'f', 0),
//         origin_z:  d.make.atom(d,'f', 0),
//         origin_a:  d.make.atom(d,'f', 0),
//         holder_y:  d.make.atom(d,'f', 0),
//         holder_x1: d.make.atom(d,'f', 0),
//         holder_x2: d.make.atom(d,'f', 0),
//         holder_x3: d.make.atom(d,'f', 0),
//         holder_x4: d.make.atom(d,'f', 0),
//         holder_x5: d.make.atom(d,'f', 0),
//         offset_x1: d.make.atom(d,'f', 0),
//         offset_x2: d.make.atom(d,'f', 0),
//         offset_x3: d.make.atom(d,'f', 0),
//         offset_x4: d.make.atom(d,'f', 0),
//         offset_x5: d.make.atom(d,'f', 0),
//         pva_x:     d.make.atom(d,'f', 0),
//         pva_y:     d.make.atom(d,'f', 0),
//         //offset_a:  d.make.atom(d,'f', 0),
//     }});
// },
// // matrix(d, a={}){
// //     if(a.matrix == undefined) a.matrix = new Matrix4();
// //     return d.make.node(d,'p','matrix', {...a, n:{
// //         element: a.matrix.elements.map(v=> d.make.atom(d,'f', v)),
// //     }});
// // },


// if(a.r && !d.cast_end[d.n[a.r].t]){  // just reckon a.r directly ?!?!?!?!?! 
//     d.cast_tags.forEach(tt=>{
//         if(!d.cast_shallow_map[tt]){ // must use matrix list !?!?!?!?!?!
//             if(tt=='base_matrix'){
//                 cc = {...cc, o:cc.o+1};
//                 if(cp.t=='c') c.base_matrix = cc;
//                 else          ax.base_matrix = cc;
//                 d.reckon.matrix(d, n, cp.t, d.add_nc,  cc);
//             }else{
//                 if(d.n[a.r].c[tt]) d.n[n].c[tt] = d.n[a.r].c[tt];
//                 if(d.n[a.r].ax[tt]) d.n[n].ax[tt] = d.n[a.r].ax[tt];
//             }
//         }
//     });
// }

// if(d.n[a.r].c.matrix){
//     d.n[n].c.matrix = d.n[a.r].c.matrix;
//     d.n[n].c.inverse = d.n[a.r].c.inverse;
// }
// if(d.n[a.r].ax.matrix){
//     d.n[n].ax.matrix = d.n[a.r].ax.matrix;
//     d.n[n].ax.inverse = d.n[a.r].ax.inverse;
// }


//if(a.v == undefined){d.n[n].v = {'b':true, 'i':0, 'f':0, 's':''}[m]}
//else                {d.n[n].v = a.v}  
//const tags = ['d11','d21','d31','d41','d12','d22','d32','d42','d13','d23','d33','d43','d14','d24','d34','d44'];
//n: Object.fromEntries(tags.map((t,i)=>['d', 
//    d.make.atom(d,'f',{v:a.matrix.elements[i]})
//])),

// d11: d.make.atom(d,'f', {v:el[0]}),
// d21: d.make.atom(d,'f'),
// d31: d.make.atom(d,'f'),
// d41: d.make.atom(d,'f'),
// d12: d.make.atom(d,'f'),
// d22: d.make.atom(d,'f'),
// d32: d.make.atom(d,'f'),
// d42: d.make.atom(d,'f'),
// d13: d.make.atom(d,'f'),
// d23: d.make.atom(d,'f'),
// d33: d.make.atom(d,'f'),
// d43: d.make.atom(d,'f'),
// d14: d.make.atom(d,'f'),
// d24: d.make.atom(d,'f'),
// d34: d.make.atom(d,'f'),
// d44: d.make.atom(d,'f'),

//const x = d.make.atom(d, 'f', pos.x); //, n, 'x' // d, v, root_id, edge_tag
//const y = d.make.atom(d, 'f', pos.y); //, n, 'y' 
//const z = d.make.atom(d, 'f', pos.z); //, n, 'z'

// if(d.profile){
//     if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
//     d.n[d.profile].n.asset.push(n);
// }

