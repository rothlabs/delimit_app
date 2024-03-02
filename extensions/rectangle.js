import {add_queries, axiom, get_leaf, get_stem_model} from 'delimit'; 

export const initialize = node => 
    add_queries({node, get_model, get_scene});

function get_model({node}){
    return get_variant(node).model
}

function get_scene({node}){
    const {model, min_stem, max_stem} = get_variant(node);
    return {
        type:  'Polyline',
        source: node,
        vector: axiom.get_polyline({model}),
        scenes: [
            {
                type: 'Point',
                source: node,
                position: min_stem,
            },
            {
                type: 'Point',
                source: node,
                position: max_stem,
            }
        ],
    }
}

function get_variant(root){
    const radius = get_leaf({root, term:'radius', alt:0});
    const [min_stem, min] = get_stem_model({root, term:'min', alt:{Vector:[0, 0]}});
    const [max_stem, max] = get_stem_model({root, term:'max', alt:{Vector:[0, 0]}});
    return {
        model: {Rectangle:{min, max, radius}},
        min_stem,
        max_stem,
    };
}  


    // const length_x = size_x - radius * 2;
    // const length_y = size_y - radius * 2;
    // const turn_arc = {TurnArc: {angle:90, radius}};
    // // const actions = [
    // //     {Position: [-length_x/2, -size_y/2, 0]},
    // //     {Forward: length_x},
    // //     turn_arc,
    // //     {Forward: length_y},
    // //     turn_arc,
    // //     {Forward: length_x},
    // //     turn_arc,
    // //     {Forward: length_y},
    // //     turn_arc,
    // // ];
    // const actions = [
    //     {Begin: [-length_x/2, -size_y/2]},
    //     {LineTo: [length_x/2, -size_y/2]},
    //     //turn_arc,
    //     {LineTo: [size_x/2, length_y/2]},
    //     //turn_arc,
    //     {LineTo: [-length_x/2, size_y/2]},
    //     //turn_arc,
    //     //{LineTo: [-size_x/2, -length_y/2]},
    //     //turn_arc,
    //     {End:true},
    //     {Rectangle:{min:[0,0], max:[size_x, size_y], radius}},
    // ];