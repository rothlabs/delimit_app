import {set_queries, query, axiom} from 'delimit'; 

// delimit calls 'initialize' immediately
export function initialize(node_id){
    // 'set_queries' attaches functions to this node
    set_queries({
        node_id,
        get_scene, // delimit calls 'get_scene' for rendering on demand 
        get_model,
        // add references to custom functions here
    });
} 

// 'get_scene' must return an object describing the visual and interactive qualities
function get_scene({node_id, draft}){
    const {control_ids, controls} = get_controls({node_id, draft});
    return {
        type: 'polygon',
        node_id, 
        vectors: get_polygon_vectors({node_id}), //: test.basis.flat().map(v => v * 125),
        width: 3,
        scenes: [
            {
                type: 'polygon',
                node_id,
                vectors: controls.map(v => v.Vector),
                dashed: true,
                width: 1,
            },
            ...control_ids.map(node_id => query({node_id, get_scene:{}})),
        ],
    }
}

function get_polygon_vectors({node_id}){
    return axiom.get_polygon({
        model: query({node_id, get_model:{}}), 
        count: 80,
    });
}

function get_model({node_id, draft}){
    const {controls} = get_controls({node_id, draft});
    return {Nurbs:{controls, order:3}};
}

function get_controls({node_id, draft}){
    const control_ids = draft.get_stems({root:node_id, term:'parts'});
    const controls = control_ids.map(node_id => 
        query({node_id, get_model:{}})
    ).filter(p => p);
    return {control_ids, controls};
}