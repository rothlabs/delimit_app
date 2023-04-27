import {createElement as r, useState} from 'react';
import {useFrame} from 'r3f';
import {pack_rv, graph_z} from '../studio.js';
import {Part} from './part.js';
import {Atom} from './atom.js';
import {makeVar, useReactiveVar} from 'apollo';

const repulsion = 100000;
const inward_force = 10; // make dynamic based on how many objects
const part_spring = 0.05;

export function Graph(){
    const pack = useReactiveVar(pack_rv);
    const [equilibrium, set_equilibrium] = useState(false);
    useFrame(()=>{
        if(!equilibrium && Object.entries(pack.all).length > 0){
            var equilibrium_reached = true;
            Object.entries(pack.all).forEach(([key, o1]) => {
                //if(o1.all_e.length == 0){
                    o1.dir.copy(o1.pos).normalize().negate().multiplyScalar(inward_force).setZ(0);
                //}else{
                //    o1.dir.set(0,0,0);
                //}
                o1.all_e.forEach((o2) => { 
                    var factor = 1;
                    if(o1.m == 'p' && o2.m == 'p') factor = 0.5;
                    o1.dir.add( o2.pos.clone().sub(o1.pos).normalize()
                        .multiplyScalar(part_spring * o1.pos.distanceTo(o2.pos) * factor) );
                });
            });
            Object.entries(pack.all).forEach(([key, o1]) => {
                Object.entries(pack.all).forEach(([key, o2]) => {
                    if(o1 != o2){
                        o1.dir.add( o1.pos.clone().sub(o2.pos).normalize()
                            .multiplyScalar( repulsion / Math.pow(o1.pos.distanceTo(o2.pos),2) ) );
                    }
                });
            });
            Object.entries(pack.all).forEach(([key, o]) => {
                if(o.dir.length() > 1){
                    equilibrium_reached = false;
                    o.pos.add(o.dir).setZ(graph_z);
                }
            });
            set_equilibrium(equilibrium_reached); 
        }
    });
    //console.log('equilibrium: '+equilibrium);
    return (
        r('group', {name:'graph'}, // ref:graph, dispose:null
			...Object.entries(pack.p).map(([key, part], i)=> 
				r(Part, {part:part})//{ref:rf=>sketches.current[i]=rf, source:node}) 
			),
            ...Object.entries(pack.b).map(([key, atom], i)=> 
				r(Atom, {atom:atom})
			),
            ...Object.entries(pack.i).map(([key, atom], i)=> 
				r(Atom, {atom:atom})
			),
            ...Object.entries(pack.f).map(([key, atom], i)=> 
				r(Atom, {atom:atom})
			),
            ...Object.entries(pack.s).map(([key, atom], i)=> 
				r(Atom, {atom:atom})
			),
		)
    )
}

