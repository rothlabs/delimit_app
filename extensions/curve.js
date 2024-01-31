import {set_queries, query, get_stems, get_leaf, axiom} from 'delimit'; 

// delimit calls 'initialize' immediately
export function initialize(node){
    // 'set_queries' attaches functions to this node
    set_queries({
        node,
        get_scene, // delimit calls 'get_scene' for rendering on demand 
        get_model,
        // add references to custom functions here
    });
} 

// 'get_scene' must return an object describing the visual and interactive qualities
function get_scene({node}){
    const {model, stems} = get_variant(node);
    const scenes = query({stems, name:'get_scene'}); 
    if(model.Nurbs) scenes.push({
        type: 'Polyline',
        key: 'control',
        source: node,
        vector: model.Nurbs.controls.map(v => v.Vector).flat(), 
        dashed: true,
        width: 1,
    });
    return {
        type: 'Polyline',
        source: node, 
        vector: axiom.get_polyline({model, count:80}), 
        scenes,
    }
}

function get_model({node}){
    return get_variant(node).model
}

function get_variant(root){

    // Nurbs
    let stems = get_stems({root, term:'controls'});
    if(stems.length){
        const controls = query({stems, name:'get_model'}); 
        const order = get_leaf({root, term:'order', alt:2});
        return {stems, model:{Nurbs:{controls, order}}};
    }

    // Slice
    stems = get_stems({root, term:'slice'});
    if(stems.length){
        const models = query({stems, name:'get_model'}); 
        let t = get_leaf({root, term:'u'});
        if(t != null) return {stems, model:{Slice:{models, t:{U:t}}}};
        t = get_leaf({root, term:'v'});
        if(t != null) return {stems, model:{Slice:{models, t:{V:t}}}};
    }

}