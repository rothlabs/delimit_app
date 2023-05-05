import {createElement as r, useEffect, useState} from 'react';
import {useD, useDS} from '../../app.js';
import {useFrame, useThree} from 'r3f';
//import {use_d, shallow} from '../../state/state.js';
import {Part} from './part.js';
import {Atom} from './atom.js';
import {Vector3} from 'three';

export const graph_z = 300;

const repulsion = 100000;
const inward_force = 10; // make dynamic based on how many objects
const part_spring = 0.05;
const tv = new Vector3();

export function Graph(){
    const d = useD.getState();
    const nodes = useDS(d=> d.graph.nodes());  // Object.keys(d.n)
    const [equilibrium, set_equilibrium] = useState(false);
    useEffect(()=>{
        console.log('graph nodes changed');
        set_equilibrium(false);
    },[nodes]);
    useFrame((state, delta)=>{ // not using delta because it could make results unpredictable 
        if(!equilibrium && nodes.length > 0){
            var equilibrium_reached = true;
            d.set(d=>{
                nodes.forEach(id=>{const n1=d.n[id];//Object.values(d.n).forEach(n1=>{
                    n1.vis.dir.copy(n1.vis.pos).normalize().negate().multiplyScalar(inward_force).setZ(0);
                    Object.values(n1.e).forEach(id=>{const n2 = d.n[id];
                        if(n2 && nodes.includes(id)){
                            var factor = 1;
                            if(n1.m == 'p' && n2.m == 'p') factor = 0.5;
                            n1.vis.dir.add( tv.copy(n2.vis.pos).sub(n1.vis.pos).normalize()
                                .multiplyScalar(part_spring * n1.vis.pos.distanceTo(n2.vis.pos) * factor) );
                        }
                    });
                });
                nodes.forEach(id=> {const n1=d.n[id];//Object.values(d.n).forEach(n1=>{
                    nodes.forEach(id=> {const n2=d.n[id];//Object.values(d.n).forEach(n2=>{
                        if(n1 != n2){
                            n1.vis.dir.add( tv.copy(n1.vis.pos).sub(n2.vis.pos).normalize()
                                .multiplyScalar( repulsion / Math.pow(n1.vis.pos.distanceTo(n2.vis.pos),2) ) );
                        }
                    });
                });
                nodes.forEach(id=> {const n=d.n[id];//Object.values(d.n).forEach(n=>{
                    if(n.vis.dir.length() > 1){
                        equilibrium_reached = false;
                        n.vis = {pos: n.vis.pos.add(n.vis.dir).setZ(graph_z), dir:n.vis.dir};  // trigger events
                    }
                });
            });
            set_equilibrium(equilibrium_reached); 
        }
    });
    //console.log('render graph');
    return (
        r('group', {name:'graph'}, // ref:graph, dispose:null
			...nodes.map(id=> 
				d.n[id].m=='p' ? r(Part,{id:id, key:id}) : r(Atom, {id:id, key:id}) 
            ),
		)
    )
}

//const {invalidate} = useThree();
// useEffect(()=>{
    //     const request_frame = setInterval(()=> invalidate(), 100);
    //     return ()=> clearInterval(request_frame);
    // },[]);
