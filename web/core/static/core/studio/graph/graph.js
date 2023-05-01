import {createElement as r, useEffect, useState} from 'react';
import {useFrame, useThree} from 'r3f';
import {use_store} from '../studio.js';
import {Part} from './part.js';
import {Atom} from './atom.js';
import {makeVar, useReactiveVar} from 'apollo';
import {Vector3} from 'three';
import {shallow} from 'shallow';

//export const equilibrium_rv = makeVar(false);
export const graph_z = 300;

const repulsion = 100000;
const inward_force = 10; // make dynamic based on how many objects
const part_spring = 0.05;
const tv = new Vector3();

export function Graph(){
    //const pack = useReactiveVar(pack_rv);
    const nodes = use_store(d=> Object.keys(d.n), shallow);
    const mutate = use_store(d=> d.mutate);
    //const edit_nodes = use_store(d=> d.edit_nodes);
    //const iterate_edge_nodes = use_store(store=> store.iterate_edge_nodes);
    const [equilibrium, set_equilibrium] = useState(false);//useReactiveVar(equilibrium_rv);
    useFrame((state, delta)=>{ // not using delta because it could make results unpredictable 
        //console.log(Object.keys(nodes).length);
        if(!equilibrium && nodes.length > 0){
            var equilibrium_reached = true;
            mutate(d=>{
                Object.values(d.n).forEach(n1=>{//pack.all.forEach(n1=>{n1=//Object.entries(pack.all).forEach(([key, n1]) => {
                    n1.dir.copy(n1.pos).normalize().negate().multiplyScalar(inward_force).setZ(0);
                    //iterate_edge_nodes(n1, (n2) => { 
                    //n1.edges.forEach(e=>{ 
                        //n2 = store.nodes(e.id);
                    Object.values(n1.e).forEach(id => {
                        const n2 = d.n[id];//nodes[id];
                        if(n2){
                            var factor = 1;
                            if(n1.m == 'p' && n2.m == 'p') factor = 0.5;
                            n1.dir.add( tv.copy(n2.pos).sub(n1.pos).normalize()
                                .multiplyScalar(part_spring * n1.pos.distanceTo(n2.pos) * factor) );
                        }
                    });
                });
                Object.values(d.n).forEach(n1=>{//edit_nodes(n1=>{//Object.entries(pack.all).forEach(([key, n1]) => {
                    //iterate_nodes(n2=>{//    Object.entries(pack.all).forEach(([key, n2]) => {
                    Object.values(d.n).forEach(n2=>{//Object.values(nodes).forEach(n2 => {
                        if(n1 != n2){
                            n1.dir.add( tv.copy(n1.pos).sub(n2.pos).normalize()
                                .multiplyScalar( repulsion / Math.pow(n1.pos.distanceTo(n2.pos),2) ) );
                        }
                    });
                });
                Object.values(d.n).forEach(n=>{//edit_nodes(o=>{//Object.entries(pack.all).forEach(([key, o]) => {
                    if(n.dir.length() > 1){
                        equilibrium_reached = false;
                        n.pos.add(n.dir).setZ(graph_z);  // o.pos.add(o.dir.multiplyScalar(delta)).setZ(graph_z);
                        n.num += 1;
                        //n.pos = (new Vector3()).copy(n.pos).add(n.dir).setZ(graph_z);
                        //console.log(n.pos);
                        //o.meta().dynamic = true; // will not trigger rerender
                    //}else{
                    //    o.meta().dynamic = false;
                    }
                });
            });
            set_equilibrium(equilibrium_reached); 
        }
    });
    console.log('equilibrium: '+equilibrium);
    const state = use_store.getState();
    return (
        r('group', {name:'graph'}, // ref:graph, dispose:null
			...nodes.map(id=> 
				state.n[id].m=='p' ? r(Part, {id:id}) : null //r(Atom, {atom:n}) //{ref:rf=>sketches.current[i]=rf, source:node}) 
            ),
            //...pack.iterate_atoms(atom=>//...Object.entries(pack.b).map(([key, atom], i)=> 
			//	r(Atom, {atom:atom})
			//),
            // ...Object.entries(pack.i).map(([key, atom], i)=> 
			// 	r(Atom, {atom:atom})
			// ),
            // ...Object.entries(pack.f).map(([key, atom], i)=> 
			// 	r(Atom, {atom:atom})
			// ),
            // ...Object.entries(pack.s).map(([key, atom], i)=> 
			// 	r(Atom, {atom:atom})
			// ),
		)
    )
}

//const {invalidate} = useThree();
// useEffect(()=>{
    //     const request_frame = setInterval(()=> invalidate(), 100);
    //     return ()=> clearInterval(request_frame);
    // },[]);
