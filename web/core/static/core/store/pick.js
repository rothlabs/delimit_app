import {current} from 'immer';

export const picked = {};
picked.primary = {
    commit: new Set(),
    repo:   new Set(),
    node:   new Set(),
};
picked.secondary = {
    commit: new Set(),
    repo:   new Set(),
    node:   new Set(),
};

export const drag = {
    edge: {},
};

export const pick = (d, {node, repo, commit, multi, weak, mode='primary'}) => {
    let item = node;
    let type = 'node';
    if(repo){
        item = repo;
        type = 'repo';
    }else if(commit){
        item = commit;
        type = 'commit';
    }
    const picked = d.picked[mode][type];
    if(multi && picked.has(item)){
        picked.delete(item);
        return;
    }
    if(!multi) picked.clear();
    if(!(weak && picked.size)){
        picked.add(item);
        if(type == 'node' && mode == 'primary'){
            d.inspect.open(d, {path:'inspect'+item+'0'});
        }
    }
};

export const unpick = (d, {node, repo, commit, mode='all', type='all'}) => {
    let item = 'all';
    if(node){
        item = node;
        type = 'node';
    }else if(repo){
        item = repo;
        type = 'repo';
    }else if(commit){
        item = commit;
        type = 'commit';
    }
    function unpick_type(mode_obj){
        function unpick_item(picked){
            if(item == 'all') picked.clear();
            else              picked.delete(item);
        }
        if(type == 'all'){
            for(const picked of Object.values(mode_obj)) unpick_item(picked);
        }else{
            if(mode_obj[type]) unpick_item(mode_obj[type]);
        }
    }
    if(mode == 'all'){
        for(const mode_obj of Object.values(d.picked)) unpick_type(mode_obj);
    }else{
        unpick_type(d.picked[mode]);
    }
};

export const targeted = {
    commit: null,
};

export const target = {};
target.commit = (d, commit) => {
    d.targeted.commit = commit;
}

export function pick_back(d, {node}){
    d.unpick(d, {mode:'primary'});
    for(const n of d.iterable(node)){
        for(const [root] of d.back(d, n)) d.pick(d, {node:root, multi:true});
    }
};


// for(const mode_obj of Object.keys(d.picked)){
//     for(const picked of Object.keys(mode_obj)){
//         picked.delete(item);
//     }
// }

// export const picked = {
//     repo: new Set(),
//     node: new Set(),
//     aux: {
//         repo: new Set(),
//         node: new Set(),
//     }
// };

// pick.target = {
//     // node(d, node){
//     //     d.target.node = node;
//     // },
//     repo(d, repo, a={}){
//         if(a.weak && d.target.repo) return;
//         d.target.repo = repo;
//     },
// };


// export const pick = {
//     deep: false,
//     multi: false,
//     box: false,
//     node(d, {item, mode='primary', type='node', multi}){
//         const picked = d.picked.get(mode).get(type);
//         if(multi && picked.has(item)){
//             picked.delete(item);
//             return;
//         }
//         if(!multi) picked.clear();
//         picked.add(item);
//     },
//     // repo(d, repo, a={}){
//     //     if(a.multi && d.picked.repo.has(repo)){
//     //         d.picked.repo.delete(repo);
//     //         return;
//     //     }
//     //     if(!a.multi) d.picked.repo.clear();
//     //     d.picked.repo.add(repo);
//     // },
// };



// export const pickable = node => {
//     return () => {
//         const events = {};
//         events.onClick = e => { 
//             //e.stopPropagation();
//             set_store(d=> d.pick.node(d, node, {multi:e.ctrlKey}));
//         }
//         events.onPointerEnter = e => {
//             document.body.style.cursor = 'pointer';
//         };
//         events.onPointerLeave = e => { 
//             document.body.style.cursor = 'auto';
//         };
//         return events;
//     }
// };


    //start: new Vector2(),


// export const draggable = (node) => {
//     return () => {
//         //const delta = new Vector2();
//         const events = {};
//         //event.onMouseDown = ( {event} ) => event.stopPropagation();
//         //event.onPointerMove = e => e.stopPropagation();
//         events.onPointerDown = e => {
//             //event.stopPropagation();
//             //console.log('onPointerDown', );
//             pointer.dragging = true;
//             set_store(d=>{
//                 //console.log('onPointerDown', d.value(d, node, 'name'));
//                 d.drag.staged = node;
//                 pointer.start.set(e.clientX, e.clientY);
//                 //d.drag.start.set(e.clientX, e.clientY);
//             });
//             // set_store(d=> d.drag.face = {
//             //     name: d.value(d, node, 'name', ''), 
//             //     type: d.value(d, node, 'type', ''),
//             // });
//         };

//         // events.onPointerEnter = e => {
//         //     document.body.style.cursor = 'move';
//         // };
//         // events.onPointerLeave = e => { 
//         //     document.body.style.cursor = 'auto';
//         // };

//         // events.onDrag = ({xy:[x, y], movement:[mx, my]}) => {  // args:[name, type, icon], 
//         //     set_transient(d=>{
//         //         d.drag.pos = {x:x+5, y:y+5};
//         //         d.drag.delta = delta.set(mx, my);
//         //     });
//         // };
//         // events.onDragEnd = ({event}) => {
//         //     //console.log(event);
//         //     //event.stopPropagation();
//         //     set_store(d=> d.drag.node = null);
//         // };
//         // events.onHover = (e) => {
//         //     const d = get_store();
//         //     console.log('event', d.value(d, node, 'name'))
//         // };
//         //events.onMouseUp = (event) => event.stopPropagation();
//         return events;
//     }
// };


// export const draggable = (node) => {
//     const delta = new Vector2();
//     const events = {};
//     //event.onMouseDown = ( {event} ) => event.stopPropagation();
//     //event.onPointerMove = e => e.stopPropagation();
//     events.onDragStart = ({event}) => {
//         //event.stopPropagation();
//         set_store(d=> d.drag.node = node);
//         // set_store(d=> d.drag.face = {
//         //     name: d.value(d, node, 'name', ''), 
//         //     type: d.value(d, node, 'type', ''),
//         // });
//     };
//     events.onDrag = ({xy:[x, y], movement:[mx, my]}) => {  // args:[name, type, icon], 
//         set_transient(d=>{
//             d.drag.pos = {x:x+5, y:y+5};
//             d.drag.delta = delta.set(mx, my);
//         });
//     };
//     events.onDragEnd = ({event}) => {
//         //console.log(event);
//         //event.stopPropagation();
//         set_store(d=> d.drag.node = null);
//     };
//     // events.onHover = (e) => {
//     //     const d = get_store();
//     //     console.log('event', d.value(d, node, 'name'))
//     // };
//     //events.onMouseUp = (event) => event.stopPropagation();
//     return useGesture(events); // , {drag:{threshold:10, preventDefault:true,}}
// };

// export const draggable = (node) => {
//     const delta = new Vector2();
//     //const event_handlers = {};
//     //event.onMouseDown = ( {event} ) => event.stopPropagation();
//     //event.onPointerMove = e => e.stopPropagation();
    
//     onDragStart = e => {
//         event.stopPropagation();
//         set_store(d=> d.drag.face = {
//             name: d.value(d, node, 'name', ''), 
//             type: d.value(d, node, 'type', ''),
//         });
//     };
//     onDrag = e => {  // args:[name, type, icon], 
//         set_transient(d=>{
//             d.drag.pos = {x, y};
//             d.drag.delta = delta.set(mx, my);
//         });
//     };
//     onDragEnd = e => set_store(d=> d.drag.face = null);




//     return {
//         onmousedown
//         onmousemove
//     }; 
// };







// // export const create_pick_slice = (set,get)=>({pick:{
// //     //reckon_tags: ['point'], // swap name with reckon_tags ?
// //     //color_tags: ['line'],
// //     n: [], // rename to n ? // make null if empty?
// //     group: null,
// //     target: null,
// //     //mode: '', 
// //     deep: false,
// //     multi: false,
// //     box: false,
// //     limited: false, // rename to remakeable
// //     terminal: false,
// //     addable: false,
// //     removable: false,
// //     mergeable: false,
// //     splittable: false,
// //     deletable: false,
// //     transformable: false,
// //     reckonable: false,
// //     visible: false,
// //     set(d, n, v, a={}){
// //         //if(a.deep) d.graph.for_stem(d, n, (r,n)= d.pick.set(d,n,true,a));
// //         var nodes = n; // this and the next two lines are common so make d.graph.for_stem with inclusive flag?!?!?!?!?
// //         if(!Array.isArray(nodes)) nodes = [nodes];
// //         if(a.deep) nodes = nodes.concat(d.graph.stem(d, n, a).filter(n=> d.n[n].m=='p'));
// //         nodes.forEach(n=>{
// //             d.n[n].pick.pick = v;
// //             if(v){ d.add(d.pick.n, n)}
// //             else{  d.pop(d.pick.n, n)}
// //             d.pick.color(d,n);
// //         });
// //         d.pick.update(d); // d.next('pick.update');
// //     },
// //     one(d, n, a={}){
// //         d.pick.none(d, a.t ? d.n[n].t : null);
// //         d.pick.set(d, n, true, a);
// //         if(d.n[n].pick.pick) console.log(n, current(d).n[n]);
// //     },
// //     update(d){
// //         //d.pick.n = d.pick.n.filter(n=> d.graph.ex(d,n));
// //         d.pick.target = null;
// //         d.pick.limited = !d.pick.n.length; // rename to access and specify no write if foreign db has no write by this user #1   //(!d.pick.n.length || d.graph.admin(d, d.pick.n));
// //         d.pick.terminal = d.pick.n.some(n=> d.terminal_classes[d.n[n].t]);
// //         d.pick.addable = false;
// //         d.pick.removable = false;
// //         d.pick.mergeable = false;
// //         d.pick.splittable = false;
// //         d.pick.deletable = d.pick.n.some(n=> d.n[n].asset);
// //         d.pick.transformable = d.pick.n.some(n=> d.n[n].c.base_matrix);
// //         d.pick.reckonable = d.pick.n.some(n=> (d.n[n].c.autocalc == false));
// //         d.pick.visible = !d.pick.n.some(n=> !d.n[n].design.vis);
// //         if(d.pick.n.length > 1){
// //             d.pick.group = d.pick.n.slice(0,-1);
// //             d.pick.target = d.pick.n.at(-1); // only set target if length > 1?
// //             const target_nodes = d.graph.stem(d,d.pick.target);
// //             const group_in_target = d.pick.group.some(n=> target_nodes.includes(n));
// //             d.pick.addable = d.n[d.pick.target].asset 
// //                 && !d.graph.stem(d,d.pick.group,{deep:true}).includes(d.pick.target) 
// //                 && d.pick.group.some(n=> !target_nodes.includes(n));
// //             d.pick.removable = d.n[d.pick.target].asset && group_in_target;//d.graph.stem(d,d.pick.target).some(n=> d.pick.group.includes(n));
// //             d.pick.mergeable = d.n[d.pick.target].asset && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);
// //             d.pick.splittable = d.n[d.pick.target].asset && group_in_target;  //d.pick.group.every(n=> (d.n[n].asset && d.graph.stem(d,n).includes(d.pick.target))); 
// //         }else{
// //             d.pick.group = d.pick.n; // copy with spread ?
// //         }
// //         d.pick.n.forEach(n=> d.pick.color(d,n));
// //         d.next('design.update');
// //         d.next('inspect.update');
// //     },
// //     get_if_one(d, t){ // add option to also check absolute length==1 before filtering?
// //         var nodes = d.pick.n;
// //         if(t!=undefined) nodes = d.pick.n.filter(n=> t.includes(d.n[n].t));
// //         if(nodes.length == 1) return nodes[0];
// //         return null;
// //     },
// //     sv(d, t, v){ // change to set_v
// //         d.inspect.content[t] = v;
// //         if([...d.decimal_tags, 'decimal'].includes(t)){ v=parseFloat(v); if(isNaN(v)) v=0; } // check model of each atom instead?
// //         if([...d.integer_tags, 'integer'].includes(t)){ v=parseInt(v);   if(isNaN(v)) v=0; } // check model of each atom instead?
// //         if(d.terminal_classes[t]){//if(t!='part' && Object.values(d.model_tags).includes(t)){ // is atom?   # updated to use terminal_classes! #1
// //             d.pick.n.forEach(n => {
// //                 if(d.n[n].t == t) d.graph.sv(d, n, v);//d.n[n].v = v;
// //             });
// //         }else{
// //             d.pick.n.forEach(n => {
// //                 d.graph.set(d, n, {[t]:v});
// //                 //if(!d.terminal_classes.includes(d.n[n].t)) d.graph.set(d, n, {[t]:v}); // if(d.n[n].m=='p' && d.n[n].n[t]) d.graph.sv(d, d.n[n].n[t][0], v); // d.graph.set(d, n, {t:v})             //d.n[d.n[n].n[t][0]].v = v; 
// //             });
// //         }
// //     },
// //     // pin_children(d, t){
// //     //     if(d.pick.n.length > 1) return;
// //     //     let n = d.pick.n[0];
// //     //     if(!d.n[n].pin.n) d.n[n].pin.n = {};
// //     //     d.n[n].pin.n[t] = [...d.n[n].n[t]];
// //     // },
// //     // flip_children_pin(d, t){
// //     //     if(d.pick.n.length > 1) return;
// //     //     let n = d.pick.n[0];
// //     //     let current_children = d.n[n].n[t];
// //     //     d.n[n].n[t] = d.n[n].pin.n[t];
// //     //     d.n[n].pin.n[t] = current_children;
// //     // },
// //     // set_children_from_pin(d, t){
// //     //     if(d.pick.n.length > 1) return;
// //     //     let n = d.pick.n[0];
// //     //     d.n[n].n[t] = [...d.n[n].pin.n[t]]; // new array to be reflected in patches
// //     //     d.inspect.update(d);
// //     //     d.reckon.up(d, n);
// //     // },
// //     // set_child_order(d, t, src_idx, new_idx){ // set_children_order
// //     //     if(d.pick.n.length > 1) return;
// //     //     let n = d.pick.n[0];
// //     //     let moved_node = d.n[n].n[t][src_idx];
// //     //     d.n[n].n[t].splice(src_idx, 1);
// //     //     d.n[n].n[t].splice(new_idx, 0, moved_node);
// //     //     d.n[n].n[t] = [...d.n[n].n[t]]; // new array to be reflected in patches
// //     //     d.inspect.update(d);//d.next('inspect.update');
// //     // },
// //     reorder_stem(d, t1, i1, t2, i2){
// //         if(d.pick.n.length > 1) return;
// //         let n = d.pick.n[0];
// //         let stem = d.n[n].n[t1][i1];
// //         d.n[n].n[t1].splice(i1, 1);
// //         d.n[n].n[t2] = d.n[n].n[t2] ?? [];
// //         d.n[n].n[t2].splice(i2, 0, stem);
// //         d.n[n].n[t1] = [...d.n[n].n[t1]]; // new array to be reflected in patches
// //         d.n[n].n[t2] = [...d.n[n].n[t2]]; // new array to be reflected in patches
// //         //d.graph.update(d);   // these should be triggered by hook in react component #1
// //         d.reckon.up(d, n);
// //         d.next('inspect.update'); // these should be triggered by hook in react component #1
// //     },
// //     hover(d, n, hover){
// //         if(d.n[n].pick.hover != hover){
// //             d.n[n].pick.hover = hover;
// //             d.pick.color(d,n);
// //         }
// //     },
// //     none(d, t){
// //         var nodes = [...d.pick.n];
// //         if(t) nodes = nodes.filter(n=> d.n[n].t==t);
// //         d.pick.set(d, nodes, false); //nodes.forEach(n=> d.pick.set(d, n, false)); //d.n[n].pick.pick=false   Object.values(d.n).forEach(n=> n.pick.pick=false);
// //     },
// //     colors: [[theme.primary, theme.primary_l, theme.primary], [theme.info, theme.info_l, 'info']],
// //     color(d,n){
// //         const selector = d.n[n].pick.pick || d.n[n].pick.hover;
// //         const target = (n == d.pick.target ? 1 : 0); // d.pick.n.length > 1 && 
// //         d.n[n].pick.color = [
// //             selector ? d.pick.colors[target][0] : theme.secondary,
// //             selector ? d.pick.colors[target][0] : theme.light,
// //             selector ? theme.light : theme.primary,
// //             selector ? d.pick.colors[target][1] : theme.secondary_l,
// //             selector ? d.pick.colors[target][2] : theme.secondary,
// //         ];
// //         //if(d.studio.mode=='design' && d.pick.reckon_tags.includes(d.n[n].t)) d.next('reckon.up', n, 'color'); // only call if color changes !?!?!?!?
// //     },
// // }});















// get_if_same(d){
    //     if(d.pick.n.length>1 && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) return d.pick.n;
    //     return null;
    // },

//d.pick.same = d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);

// d.graph.for_stem(d, d.pick.n, (r,n)=>{
        //     if(d.n[n].asset && n == d.pick.n.at(-1)) d.pick.splittable = true;
        // });

//if(d.pick.n.length>1 && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) d.pick.same = d.pick.n;
        //d.pick.all_asset = d.pick.n.every(n=> d.n[n].asset);

//mod: (d, n, pick)=>{
    //    d.n[n].pick.pick = pick;
        //d.pick.update(d);
    //},

    // update: d=>{ // rename as update
    //     Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
    //         if(!d.n[n].open) d.n[n].pick.pick=false;
    //         d.pick.color(d,n);
    //     }); 
    //     d.pick.n = Object.keys(d.n).filter(n=> d.n[n].pick.pick); // make this a common function (iterate all nodes with filter and func 
    //     d.pick.n.forEach(n=>{
    //         if(pick_reckon_tags.includes(d.n[n].t)) d.reckon.up(d,n);
    //     });
    //     d.design.update(d);
    //     d.inspect.update(d);
    // },