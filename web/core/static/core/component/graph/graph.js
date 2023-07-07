import {createElement as c, useEffect, useState, memo} from 'react';
import {ss, gs, useS, useSS, make_id} from '../../app.js';
import {useFrame, useThree} from '@react-three/fiber';
//import {use_d, shallow} from '../../state/state.js';
import {Part} from './part.js';
import {Atom} from './atom.js';
import {Vector3} from 'three';
import {Edge} from './edge.js';
//import {Bounds} from '@react-three/drei/Bounds';

//export const graph_z = 300;

const repulsion = 100000;
const inward_force = 1; // make dynamic based on how many objects
const part_spring = 0.05;
const tv = new Vector3();


export const Graph = memo(()=>{
    //const ready = useS(d=> d.graph.ready);
    //console.log('render graph')
    // use_effect([nodes, controls],()=>{ // appears to always run once but first time loading the editor the project bounds aren't there yet
	// 	//console.log(project.current);
	// 	bounds.setFromObject( project.current );
	// 	const zoom_x = camera.right / (bounds.max.x - bounds.min.x);
	// 	const zoom_y = camera.top / (bounds.max.y - bounds.min.y);
	// 	if(zoom_x <= zoom_y) controls.zoomTo(zoom_x * 1.75);
	// 	if(zoom_x >  zoom_y) controls.zoomTo(zoom_y * 1.75);
	// 	camera.updateProjectionMatrix();
	// 	action_rv({name:'record', init:true}); 
	// 	sketches_rv({get:id=> sketches.current.find(sketch=> {if(sketch) return sketch.id==id})});
	// });
    //console.log('render graph');
    return(
        //ready && c(Bounds, {fit:true, clip:true, observe:true, damping:6, margin:1.2},
        c('group', {name:'graph'},
            c(Nodes),
            c(Edges),
            //c(Arrange),
        )
        //)
    )
});

const Nodes = memo(()=>{
    const nodes = useS(d=> d.graph.n);   // doesn't need to be ss?
    const d = gs();
    //console.log('render graph nodes');
    return (
        c('group', {name:'nodes'}, // ref:graph, dispose:null
			...nodes.map(n=> 
				d.n[n].m=='p' ? c(Part,{n:n, key:n}) : c(Atom, {n:n, key:n})  // is key screwing things up? , key:n
            ),
		)
    )
});

const Edges = memo(()=>{
    const edges = useS(d=> d.graph.e);  // rerendering every time the client polls for update!! 
    //const edges = useDS(d=> d.graph.edge_roots);
    //const tags = useDS(d=> d.graph.edge_tags);
    //const nodes = useDS(d=> d.graph.edge_nodes);
    //const d = useD.getState();
    //console.log('render graph edges');
    return (
        c('group', {name:'edges'}, // ref:graph, dispose:null
			...edges.map(e=> 
				c(Edge, {r:e.r, t:e.t, n:e.n, key:e.r+e.n+e.t}) // , key:e.r+e.t+e.n  //make_id()
            ),
		)
    )
});



// function Arrange(){
//     const arrange = useS(d=> d.graph.arrange);  
//     const nodes = useS(d=> d.graph.n);
//     const edges = useS(d=> d.graph.e);
//     useFrame((state, delta)=>{ // not using delta because it could make results unpredictable 
//         if(arrange && nodes.length > 0){
//             var moving = false;
//             ss(d=>{
//                 nodes.forEach(id=>{const n1=d.n[id];//Object.values(d.n).forEach(n1=>{
//                     n1.graph.dir.copy(n1.graph.pos).normalize().negate().multiplyScalar(inward_force).setZ(0);
//                 });
//                 //edge_roots.forEach((id,i)=>{const n1=d.n[id]; const n2=d.n[edge_nodes[i]];
//                 edges.forEach(edge=>{const n1=d.n[edge.r]; const n2=d.n[edge.n];
//                     //if(nodes.includes(edge_nodes[i])){
//                     var factor = 1;
//                     n1.graph.dir.add( tv.copy(n2.graph.pos).sub(n1.graph.pos).normalize()
//                         .multiplyScalar(part_spring * n1.graph.pos.distanceTo(n2.graph.pos) * factor) );
//                     n2.graph.dir.add( tv.copy(n1.graph.pos).sub(n2.graph.pos).normalize()
//                         .multiplyScalar(part_spring * n2.graph.pos.distanceTo(n1.graph.pos) * factor) );
//                     //}
//                 });
//                 nodes.forEach(id=> {const n1=d.n[id];//Object.values(d.n).forEach(n1=>{
//                     nodes.forEach(id=> {const n2=d.n[id];//Object.values(d.n).forEach(n2=>{
//                         if(n1 != n2){
//                             n1.graph.dir.add( tv.copy(n1.graph.pos).sub(n2.graph.pos).normalize()
//                                 .multiplyScalar( repulsion / Math.pow(n1.graph.pos.distanceTo(n2.graph.pos),2) ) );
//                         }
//                     });
//                 });
//                 nodes.forEach(id=> {const n=d.n[id];//Object.values(d.n).forEach(n=>{
//                     if(n.graph.dir.length() > 0.5){
//                         moving = true;
//                         n.graph = {...n.graph, pos:n.graph.pos.add(n.graph.dir).setZ(0)};
//                         //n.graph = {pos: n.graph.pos.add(n.graph.dir).setZ(0), dir:n.graph.dir, vis:n.graph.vis};  // trigger events   .setZ(graph_z)
//                     }
//                 });
//                 d.graph.arrange = moving;
//             });
//         }
//     });
//     //console.log('render graph arrange: '+arrange);
//     return null; // does this need to be there?
// }




//const edge_roots = useDS(d=> d.graph.edge_roots); //const edge_roots = useDS(d=> d.graph.e().map(e=> e.r));
    //const edge_nodes = useDS(d=> d.graph.edge_nodes); //const edge_nodes = useDS(d=> d.graph.e().map(e=> e.n));
    //console.log(edge_roots);
    //const [equilibrium, set_equilibrium] = useState(false); // put this in the store as a derivitive that gets switch true when when something changes?
    //useEffect(()=>{
    //    console.log('graph nodes changed');
    //    set_equilibrium(false);
    //},[nodes, edges]);





//if(n1.m == 'p' && n2.m == 'p') factor = 0.5;

// Object.values(n1.e).forEach(id=>{const n2 = d.n[id];
                    //     if(n2 && nodes.includes(id)){
                    //         var factor = 1;
                    //         if(n1.m == 'p' && n2.m == 'p') factor = 0.5;
                    //         n1.graph.dir.add( tv.copy(n2.graph.pos).sub(n1.graph.pos).normalize()
                    //             .multiplyScalar(part_spring * n1.graph.pos.distanceTo(n2.graph.pos) * factor) );
                    //     }
                    // });

//const {invalidate} = useThree();
// useEffect(()=>{
    //     const request_frame = setInterval(()=> invalidate(), 100);
    //     return ()=> clearInterval(request_frame);
    // },[]);
