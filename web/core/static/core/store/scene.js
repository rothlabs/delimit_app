import {is_formal_node_id} from 'delimit';

export const scene = {    
    sources: new Map(), // TODO: rename to source_ticks?
    tick: 0,
}

scene.increment = d => {
    d.scene.tick++;
    if(d.studio.mode == 'scene') d.scene.increment_sources(d);
}

scene.increment_sources = d => {
    for(const [root] of d.scene.sources){
        d.scene.sources.set(root, d.scene.tick);
    }
}

scene.make_sources = (d, {...items}) => {
    d.get_iterable(items).map(root => {
        d.drop.edge(d, {root, term:'scenes'}); // drop_scene_source(d, root);
        const scene = d.make.node({node:root+'scene'});
        d.make.edge(d, {root:scene, term:'tick', stem:{type:'integer', value:0}}); 
        d.make.edge(d, {root, term:'scenes', stem:scene}); 
    });
}

scene.drop_sources = (d, {...items}) => {
    d.get_iterable(items).map(root => d.drop.edge(d, {root, term:'scenes'})); // drop_scene_source(d, root)
}

scene.add_or_remove_source = (d, {root, given}) => {
    const scene = d.get_stem({root, term:'scenes'});
    if(is_formal_node_id(root) && scene) { // d.get_term_case(d, root, 'scenes')
        if(given && !d.nodes.has(scene)) d.scene.make_sources(d, {root});
        if(!d.scene.sources.has(root)) d.scene.sources.set(root, 0); // query tick
    }else{
        d.scene.sources.delete(root);
    }
}

scene.get_sources = d => [...d.scene.sources.keys()];

scene.get_scenes = (d, root) => d.get_stems({root, term:'scenes'});

scene.query_status = d => ({
    loading: [...d.scene.sources].some(([root, query_tick]) => {
        const scene_tick = d.get_leaf({root, terms:'scenes tick', alt:0});
        return query_tick > scene_tick;
    }), 
    error: d.graph_app.error,
});


// function drop_scene_source(d, root){
//     const scene = d.get_stems(d, {root, term:'scenes'}); 
//     //d.drop.node(d, {node:scene, deep:true});
//     d.drop.edge(d, {root, term:'scenes'});
// }

// scene.update_from_graph_app = (d, {patches}) => {
//     console.log('scene.update_from_graph_app', patches);
//     d.loading.scenes = false;
// };

//scene.get_type_name = (d, root) => d.get_leaf(d, {root, term:'scene_type', alt:''});




// scene.get_scenes = (d, {...ids}) =>
//     d.get_iterable(ids).map(id => 
//         d.get_stems(d, id, 'scenes'))
//             .flat().filter(id => id);

// function get_scene_nodes(d, id){
//     if(is_scene_node(d, id)) return d.get_stems(d, id, 'scenes');//d.nodes.get(id).terms.get('scenes');
//     if(d.scene.sources.has(id)) return get_scene_nodes(d, id);//d.scene.sources.get(id);
// }

// function is_scene_node(d, id){
//     return d.get_leaf(d, id, 'scene_type') != null
// }

// function make_scene_of_type_group(d){
//     const root = d.make.node(d, {});
//     d.make.edge(d, {root, term:'scene_type', stem:{type:'string', value:'group'}});
//     d.make.edge(d, {root, term:'scenes'});
//     return root;
// }





// export const design = {
//     mode: '', // make, drop, move
// };

// design.move = {
//     mode: '',
// };

// export const create_design_slice = (set,get)=>({design:{ 
//     //tags: ['curve', 'mixed_curve', 'sketch'],
//     n: [],
//     mode: '', // make this draw mode and make seperate delete mode (erase)
//     part: null, 
//     candidate: null, 
//     matrix: new Matrix4(), // not following wrapper rule!!!
//     //pin_matrix: new Matrix4(),
//     //moving: false,
//     //painting: false,
//     act: null,
//     move_mode: '', 
//     mover: {pos: new Vector3(), rot: new Euler(), active_axes:[true, true, false], show:false}, //, rot: new Vector3()
//     ray_data(d,e){
//         d.camera.getWorldDirection(v1);
//         e.intersections[0].object.getWorldDirection(v2);
//         if(v1.dot(v2) > 0) v2.negate(); 
//         const p = e.intersections[0].point.add(v2.multiplyScalar(d.point_size / d.camera.zoom));
//         return {
//             //n1: e.intersections[0].object.parent?.__r3f.memoizedProps.pickable,
//             //n3: e.intersections[0].object.parent?.parent?.parent?.__r3f.memoizedProps.pickable,
//             pos: p//v3.set(d.rnd(p.x), d.rnd(p.y), d.rnd(p.z)), // should be able to remove rnd function #1
//         }; 
//     },
//     paint(d, n, e){ // on image
//         const ray = d.design.ray_data(d,e);
//         //const n = ray.n1;
//         //if(!n) return;
//         var canvas = d.n[n].c.canvas;
//         var cctx = canvas.getContext('2d');
//         var width = d.n[d.n[n].n.width[0]].v;//canvas.width = d.n[d.n[n].n.width[0]].v; //d.graph.get(d, n, 'width')[0];
//         var height = d.n[d.n[n].n.height[0]].v;//canvas.height = d.n[d.n[n].n.height[0]].v;
//         if(d.n[n].ax.invert) ray.pos.applyMatrix4(d.n[n].ax.invert);
//         if(d.n[n].c.invert) ray.pos.applyMatrix4(d.n[n].c.invert);
//         var x = Math.round(( ray.pos.x + d.easel_size/2) / d.easel_size * width);
//         var y = Math.round((-ray.pos.y + d.easel_size/2) / d.easel_size * height);
//         const grd = cctx.createRadialGradient(x, y, 5, x, y, brush_radius);
//         if(d.design.act == 'painting'){
//             grd.addColorStop(0, 'rgba(0, 0, 0, 1)');//'rgba(214, 51, 132, 1)');
//             grd.addColorStop(1, 'rgba(0, 0, 0, 0)');//'rgba(214, 51, 132, 0)');//"rgba(32, 201, 178, 0)");
//         }else{
//             grd.addColorStop(0, 'rgba(255, 255, 255, 1)');//'rgba(32, 201, 178, 1)');
//             grd.addColorStop(1, 'rgba(255, 255, 255, 0)');//'rgba(32, 201, 178, 0)');//"rgba(32, 201, 178, 0)");
//         }
//         cctx.fillStyle = grd;
//         cctx.fillRect(x-brush_radius, y-brush_radius, brush_radius*2, brush_radius*2);
//         d.n[n].c.texture.needsUpdate = true;
//         //d.graph.set(d, n, {data:d.n[n].c.data}); //canvas.toDataURL()
//     },
//     end_paint(d, n){
//         d.design.act = null;
//         d.graph.set(d, n, {data:d.n[n].c.canvas.toDataURL()});
//         d.studio.gizmo_active = false; // this might not be needed? #1
//     },
//     fill(d, n){
//         var canvas = d.n[n].c.canvas;
//         var cctx = canvas.getContext("2d");
//         var width = d.n[d.n[n].n.width[0]].v;
//         var height = d.n[d.n[n].n.height[0]].v;
//         cctx.fillStyle = 'white';//'#d63384';
//         cctx.fillRect(0, 0, width, height);
//         d.graph.set(d, n, {data:d.n[n].c.canvas.toDataURL()});
//     },
//     pin_move(d){ // make drag slice?
//         //d.design.pin_matrix.copy(d.design.matrix).invert();
//         d.pick.n.forEach(n => d.graph.pin_pos(d, n, d.design.matrix)); //d.design.matrix
//     },
//     move(d, matrix){ //offset
//         d.design.matrix = matrix;
//         d.pick.n.forEach(n=>{ // must check if point or position contents!!!!
//             if(d.n[n].pin.pos){ //if(d.n[n].pin.pos){
//                 v1.copy(d.n[n].pin.pos).applyMatrix4(matrix); // v1.copy(d.n[n].pin.pos).applyMatrix4(d.design.pin_matrix).applyMatrix4(matrix);
//                 d.graph.set_pos(d, n, v1);
//             }
//         });
//     },
//     make_point:(d, n, e)=>{
//         const ray = d.design.ray_data(d,e);
//         //if(!ray.n3) return;
//         var r = d.pick.get_if_one(d, ['curve']); //, {one_tag:true}
//         if(!r){
//             r = d.make.node(d, {spec:'curve', r:n}); // r = d.make.part(d, 'curve', {r:n});//{r:ray.n3}); // d.design.part
//             d.pick.one(d, r);
//             d.next('design.insert_point', r, ray.pos); // wait until next so matrix can cast to curve
//         }else{
//             d.design.insert_point(d, r, ray.pos);
//         }        
//     },
//     insert_point(d, r, pos){ // in between points for a curve
//         var o = undefined;
//         if(d.n[r].p && d.n[r].p.design=='curve' && d.n[r].n.point && d.n[r].n.point.length > 2){ // check for d.n[r].ax.curve ?!?!?!?!
//             const test_pos = d.n[r].p.points(200);//d.n[r].ax.curve.getPoints(200);//new CatmullRomCurve3(d.n[r].n.point.map(n=>d.n[n].ax.pos)).getPoints(200); //spaced points ?!?!?!?!   //d.n[r].c.pts.map(p=> p.pos)
//             const tests = [];
//             var o = 0;
//             var prev_dist = 0;
//             for (var i = 0; i < test_pos.length; i++) {
//                 //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
//                 const dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].p); //d.n[r].c.pts[o].pos
//                 if(dist > prev_dist){
//                     //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
//                     for (var k = o+1; k < d.n[r].n.point.length; k++) {
//                         //let prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[k]].ax.pos);
//                         if(d.n[d.n[r].n.point[o]].p.distanceTo(d.n[d.n[r].n.point[k]].p) > 1){
//                         //if(dist < prev_dist){
//                             o = k;
//                             prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].p);
//                             //prev_dist = base_dist;
//                             break;
//                         }
//                         //v1.copy(d.n[d.n[r].n.point[k]].ax.pos);
//                     }
//                     // o++;
//                     // prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos
//                     // for (var k = i+1; i=k < test_pos.length; k++) {
//                     //     if(prev_dist  test_pos[k].distanceTo(d.n[d.n[r].n.point[o]].ax.pos)){
//                     //         i = k;
//                     //         break;
//                     //     }
//                     //     tests.push({o:o, dist:test_pos[k].distanceTo(pos)});
//                     // }
//                 }else{ prev_dist = dist }
//                 tests.push({o:o, dist:test_pos[i].distanceTo(pos)});
//             }
//             prev_dist = Infinity;
//             for (var i = 0; i < tests.length; i++) { // use .sort here ?!?!?!?!
//                 if(tests[i].dist < prev_dist){
//                     o = tests[i].o;
//                     prev_dist = tests[i].dist;
//                     if(i == test_pos.length-1) o++;
//                 }
//             }
//         }
//         const n = d.make.node(d, {spec:'point', r:r, o:o}); // const n = d.make.part(d, 'point', {r:r, o:o}); //d.make.point(d, {pos:pos, r:r, o:o}); // must have insertion index. For now, using -1 for last
//         d.graph.set_pos(d, n, pos);
//         d.pick.one(d, n, {t:true});
//     },
//     update(d){
//         //console.log('update design');
//         //console.trace();
//         d.design.candidate = d.pick.get_if_one(d);//d.design.candidate = d.pick.get_if_one(d, d.component_tags);
//         if(!d.n[d.design.candidate]?.n) d.design.candidate = null;
//         if(!d.graph.ex(d, d.design.part)){ // use exists/available function here?  d.design.part && !d.n[d.design.part].open
//             d.design.part = null;
//             if(d.studio.mode == 'design') d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
//         }
//         d.design.mover.pos.set(0,0,0);
//         d.design.mover.active_axes = [true, true, false];
//         var count = 0;
//         d.pick.n.forEach(n=>{
//             if(d.n[n]?.p?.isVector3){
//                 d.design.mover.pos.add(d.n[n].p);
//                 count++;
//             }
//             // if(d.n[n].ax.matrix){
//             //     d.design.mover.rot.setFromRotationMatrix(d.n[n].ax.matrix);
//             // }
//             if(d.n[n].c.top_view) d.design.mover.active_axes = [true, false, true];
//             if(d.n[n].c.side_view) d.design.mover.active_axes = [false, true, true];
//         });
//         if(count > 0){ 
//             d.design.mover = {
//                 pos: d.design.mover.pos.divideScalar(count),//.applyMatrix4(tm.copy(d.design.matrix).invert()),
//             };
//         }
//         //}else{  d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};  }
//         //if(d.pick.n.length===0) d.design.matrix.identity();
//         if(d.studio.mode=='design' && d.design.move_mode=='move' && count > 0){ 
//             //d.design.show_mover = true;
//             d.design.mover = {...d.design.mover,
//                 show:true,
//                 pos: d.design.mover.pos.divideScalar(count),//.applyMatrix4(tm.copy(d.design.matrix).invert()),
//             };
//         }else{
//             d.design.mover = {...d.design.mover, show:false};
//             //d.design.show_mover = false;
//             //d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};
//             d.design.matrix.identity();
//         }
//     },
//     show(d){ // rename to make_scene ?! update_scene ?! #1
//         if(d.design.part){
//             d.design.scene = {n:d.design.part, scenes:[]};
//             const collected = [];
//             let root_scenes = [d.design.scene];
//             while(root_scenes.length){
//                 let stem_scenes = [];
//                 for(const root_scene of root_scenes){
//                     d.graph.for_stem(d, root_scene.n, (r,s)=>{
//                         if(d.add(collected, s)){
//                             let scene = {n:s, scenes:[]};
//                             stem_scenes.push(scene);
//                             root_scene.scenes.push(scene);
//                         }
//                     });
//                 }
//                 root_scenes = stem_scenes;
//             }
//         }else{
//             d.design.scene = null;
//         }
//     }
// }});














// show(d){ // rename to make_scene ?! update_scene ?! #1
//     if(d.design.part){
//         const collected = [];
//         const scene = n=>{
//             const stems = [];
//             d.graph.for_stem(d, n, (r,s)=>{
//                 if(d.add(collected, s)) stems.push(s);
//             });
//             return{
//                 n:n,
//                 scenes: stems.map(n=> scene(n)),
//             }
//         };
//         d.design.scene = scene(d.design.part);
//     }else{
//         d.design.scene = null;//[];
//     }
// }

// d.design.scene = {
            //     n: d.design.part,
            //     stems: d.graph.stem(d, d.design.part).map(n=> scene_node(n)),
            // };
            //d.design.scene = [d.design.part, ...d.graph.stem(d, d.design.part, {deep:true})];
            //d.design.n = [d.design.part, ...d.graph.stem(d, d.design.part, {deep:true})].filter(n=> d.nodes[d.n[n].t].design);
            //d.design.n = d.graph.stem(d, d.design.part, {deep:true, include_roots:true});



// //console.log('show');
//         //console.trace();
//         if(d.design.part){
//             d.design.n = [d.design.part, ...d.graph.stem(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t] && d.n[n].design.vis);
//             // d.design.n = Array.from( // use unique flag instead of set for performance ?!?!?!
//             //     new Set([d.design.part, ...d.graph.stem(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t]))
//             // );
//         }else{
//             d.design.n = [];
//         }




// paint(d, e){ // on image
//     const ray = d.design.ray_data(d,e);
//     const n = ray.n1;
//     if(!n) return;
    
//     var canvas = d.n[n].c.canvas;
//     var cctx = canvas.getContext("2d");
//     var width = d.n[d.n[n].n.width[0]].v;//canvas.width = d.n[d.n[n].n.width[0]].v; //d.graph.get(d, n, 'width')[0];
//     var height = d.n[d.n[n].n.height[0]].v;//canvas.height = d.n[d.n[n].n.height[0]].v;

//     if(d.n[n].ax.invert) ray.pos.applyMatrix4(d.n[n].ax.invert);
//     if(d.n[n].c.invert) ray.pos.applyMatrix4(d.n[n].c.invert);
//     var x = Math.round(( ray.pos.x + 200) / 400 * width);
//     var y = Math.round((-ray.pos.y + 200) / 400 * height);


//     //img.onload = function() {
//         //cctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//         const grd = cctx.createRadialGradient(x, y, 5, x, y, brush_radius);
//         grd.addColorStop(0, "red");
//         grd.addColorStop(1, "rgba(255, 0, 0, 0)");
//         cctx.fillStyle = grd;
//         cctx.fillRect(x-brush_radius, y-brush_radius, brush_radius*2, brush_radius*2);
//         d.graph.set(d, n, {data:'live'}); //canvas.toDataURL()
//         //console.log('new image load!');
//         //rs(d=>{
            
//             //console.log('saved to data!');
//         //});
//     //};
//     //img.src = d.n[n].c.data;
//     //console.log('paint!!!', d.n[n].t);
// },



// img.onload = function() {
//     cctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     const grd = cctx.createRadialGradient(x, y, 5, x, y, brush_radius);
//     grd.addColorStop(0, "red");
//     grd.addColorStop(1, "rgba(255, 0, 0, 0)");
//     cctx.fillStyle = grd;
//     cctx.fillRect(x-brush_radius, y-brush_radius, brush_radius*2, brush_radius*2);
//     console.log('new image load!');
//     rs(d=>{
//         d.graph.set(d, n, {data:canvas.toDataURL()});
//         console.log('saved to data!');
//     });
// };
// img.src = d.n[n].c.data;





// o++;
// prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos


// const pts = curve.getPoints(100).sort((a,b)=> (a.distanceTo(pos) < b.distanceTo(pos))?-1:1);
            // d.n[r].c.pts.forEach(p=>{});

// if(d.n[r].c.pts && d.n[r].c.pts.length > 1){ // upgrade to sample curve to find true closest creation and pick control points on either side of it
//     const sorted = d.n[r].c.pts.map((p,i)=>({i:i, d:tv.copy(p.pos).distanceTo(pos)})).sort((a,b)=>(a.d>=b.d?1:-1));
//     var ad1 = sorted[0], ad2 = sorted[0];
//     if(sorted[0].i-1 >= 0)            ad1 = {i:sorted[0].i-1, d:tv.copy(d.n[r].c.pts[sorted[0].i-1].pos).distanceTo(pos)};
//     if(sorted[0].i+1 < sorted.length) ad2 = {i:sorted[0].i+1, d:tv.copy(d.n[r].c.pts[sorted[0].i+1].pos).distanceTo(pos)};
//     o = Math.ceil((sorted[0].i + (ad1.d<ad2.d?ad1.i:ad2.i)) / 2); // ceil
//     if(sorted[0].i == sorted.length-1) o+=2;
// }

//if(d.pick.n.length == 1 && d.design.tags.includes(d.n[d.pick.n[0]].t)){  d.design.candidate = d.pick.n[0];  } 
        //else{  d.design.candidate = null;  }




//const mdi = sorted[0].i;
            //sorted.sort((a,b)=>(Math.abs(a.i-mdi)>Math.abs(a.i-mdi)));

// var md1={i:-1, d:Infinity}, md2={i:-1, d:Infinity};
            // d.n[r].n.point.forEach((n,i)=>{
            //     const dist = tv.copy(d.n[n].w.pos).distanceTo(pos);
            //     if(dist < md1.d){  md2.i=md1.i; md2.d=md1.d;  md1.i=i; md1.d=dist;   }
            // });


//end_move(d){
    //    console.log('end drag');
    //    d.design.move(d, d.design.matrix, tv2.set(.01, .01, 0));// must set some send-flag instead of doing offset workaround  //d.pick.n.forEach(n => d.graph.set(d, n, {x}));
    //},


//pointers: 0,
    //pin_pos: new Vector3(),
    //dragging: false,

// stop_dragging:(d)=>{
    //     if(d.board.dragging){
    //         d.board.dragging = false;
    //         //d.pick.n.forEach(n=>{
    //         //    d.nodes.delta(d, d.graph.get(d,n,'x'), 0.0001); // change to send flag
    //         //    d.nodes.delta(d, d.graph.get(d,n,'y'), 0.0001);
    //         //    d.nodes.delta(d, d.graph.get(d,n,'z'), 0.0001);
    //         //});
    //     }
    // },
    // drag: (d, pos)=>{
    //     delta.copy(pos).sub(d.board.pin_pos);
    //     if(d.board.pointers == 1){ 
    //         if(!d.board.dragging && delta.length() > 4){
    //             d.board.dragging = true;
    //             d.pick.n.forEach(n => {
    //                 d.nodes.pin(d, d.graph.get(d,n,'x'));
    //                 d.nodes.pin(d, d.graph.get(d,n,'y'));
    //                 d.nodes.pin(d, d.graph.get(d,n,'z'));
    //             });
    //         }
    //     }else{
    //         d.board.stop_dragging(d);
    //     }
    //     if(d.board.dragging){
    //         //console.log('drag', d.board.pointers, tv);
    //         d.pick.n.forEach(n=>{
    //             //console.log(current(d.graph.get(d,n,'x')));
    //             d.nodes.delta(d, d.graph.get(d,n,'x'), delta.x);
    //             d.nodes.delta(d, d.graph.get(d,n,'y'), delta.y);
    //             d.nodes.delta(d, d.graph.get(d,n,'z'), delta.z);
    //         });
    //     }
    // },

