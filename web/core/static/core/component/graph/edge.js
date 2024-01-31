import {createElement as c} from 'react';
import {Vector3} from 'three';
import {Line} from '@react-three/drei/Line';
import {use_store} from 'delimit';

const root_pos = new Vector3();
const stem_pos = new Vector3();
const offset = new Vector3(0, 0, -1);

export function Edge({root, stem}){  
    const color = use_store(d=> d.color.border);
    const rp    = use_store(d=> d.graph.nodes.get(root).pos);
    const sp    = use_store(d=> d.graph.nodes.get(stem).pos);
    root_pos.copy(rp).add(offset);
    stem_pos.copy(sp).add(offset);
    return(
        c(Line, {
            name: 'edge',
            points: [root_pos, stem_pos],
            color,                   
        })
    );
}