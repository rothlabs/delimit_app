import {add_queries, axiom, get_leaf, get_stem_model} from 'delimit'; 

export const initialize = node => 
    add_queries({node, get_scene, get_model});

function get_scene({node}){
    const {model, center_stem} = get_variant(node);
    return {
        type:  'Polyline',
        source: node,
        vector: axiom.get_polyline({model}),
        scenes: [
            {
                type: 'Point',
                source: node,
                position: center_stem,
            }
        ]
    }
}

function get_model({node}){
    return get_variant(node).model
}

function get_variant(root){
    const radius = get_leaf({root, term:'radius', alt:0});
    const [center_stem, center] = get_stem_model({
        root, 
        term: 'position', 
        alt:  {Vector:[0, 0]},
    });
    return {
        model: {Circle:{center, radius}},
        center_stem,
    };
} 