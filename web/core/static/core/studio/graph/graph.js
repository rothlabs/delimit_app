import {createElement as r, useEffect, useState} from 'react';
import {useFrame, useThree} from 'r3f';
import {use_d, shallow} from '../../state/state.js';
import {Part} from './part.js';
import {Atom} from './atom.js';
import {Vector3} from 'three';

export const graph_z = 300;

const repulsion = 100000;
const inward_force = 10; // make dynamic based on how many objects
const part_spring = 0.05;
const tv = new Vector3();

export function Graph(){
    const d = use_d.getState();
    const nodes = use_d(d=> Object.keys(d.n), shallow);
    const [equilibrium, set_equilibrium] = useState(false);
    useFrame((state, delta)=>{ // not using delta because it could make results unpredictable 
        if(!equilibrium && nodes.length > 0){
            var equilibrium_reached = true;
            d.mutate(d=>{
                Object.values(d.n).forEach(n1=>{//pack.all.forEach(n1=>{n1=//Object.entries(pack.all).forEach(([key, n1]) => {
                    n1.dir.copy(n1.pos).normalize().negate().multiplyScalar(inward_force).setZ(0);
                    Object.values(n1.e).forEach(id => {
                        const n2 = d.n[id];
                        if(n2){
                            var factor = 1;
                            if(n1.m == 'p' && n2.m == 'p') factor = 0.5;
                            n1.dir.add( tv.copy(n2.pos).sub(n1.pos).normalize()
                                .multiplyScalar(part_spring * n1.pos.distanceTo(n2.pos) * factor) );
                        }
                    });
                });
                Object.values(d.n).forEach(n1=>{
                    Object.values(d.n).forEach(n2=>{
                        if(n1 != n2){
                            n1.dir.add( tv.copy(n1.pos).sub(n2.pos).normalize()
                                .multiplyScalar( repulsion / Math.pow(n1.pos.distanceTo(n2.pos),2) ) );
                        }
                    });
                });
                Object.values(d.n).forEach(n=>{
                    if(n.dir.length() > 1){
                        equilibrium_reached = false;
                        n.pos.add(n.dir).setZ(graph_z); 
                        n.num += 1;
                    }
                });
            });
            set_equilibrium(equilibrium_reached); 
        }
    });
    return (
        r('group', {name:'graph'}, // ref:graph, dispose:null
			...nodes.map(id=> 
				d.n[id].m=='p' ? r(Part, {id:id}) : r(Atom, {id:id}) 
            ),
		)
    )
}

//const {invalidate} = useThree();
// useEffect(()=>{
    //     const request_frame = setInterval(()=> invalidate(), 100);
    //     return ()=> clearInterval(request_frame);
    // },[]);
