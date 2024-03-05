import {set_queries, query, get_leaf, get_stems, get_stem_model} from 'delimit'; 
import {Matrix4, Vector3, Euler} from 'three';

export const initialize = node => 
    set_queries({node, get_scene, get_model});

function get_scene({node}){
    const {model, stems, rotations} = get_variant(node);
    return {
        type: 'Point',
        source: node,
        size: 10,
        scenes: rotations.map((rotation, key) => ({
            type: 'Group',
            key,
            rotation,
            scenes: query({stems, name:'get_scene'}),
        })),
    }
}

function get_model({node}){
    return get_variant(node).model
}

function get_variant(root){
    const stems = get_stems({root, term:'parts'});
    const parts = query({stems, name:'get_model'}); 
    const count = get_leaf({root, term:'count', alt:2});
    const [axis_stem, axis] = get_stem_model({root, term:'axis', alt:{Vector:[0, 0, 1]}});
    const groups = [];
    const rotations = [];
    const vector3_axis = new Vector3().fromArray(axis.Vector);
    for(let i = 0; i < count; i++){
        let angle = i / count * Math.PI * 2; 
        groups.push({Group:{parts, axis, angle}});
        let matrix = new Matrix4().makeRotationAxis(vector3_axis, angle);
        rotations.push(new Euler().setFromRotationMatrix(matrix).toArray().slice(0, 3));
    }
    return {
        model: {Group:{parts:groups, axis:{Vector:[0,0,1]}}},
        rotations,
        stems,
    };
}  