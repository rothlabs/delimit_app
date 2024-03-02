import {set_store, static_url, get_draft} from 'delimit/graph';
import { memoize } from 'delimit/graph';
import initialize_axiom, {enable_panic_messages} from 'delimit/axiom';
import * as axiom_funcs from 'delimit/axiom';

initialize_axiom(static_url+'delimit_axiom_bg.wasm').then(() => {
    enable_panic_messages();
});

const tolerance = 0.01;



export const axiom = {};
//const draft = get_draft();
//set_store(d => {
    for(const [name, func] of Object.entries(axiom_funcs)){
        //console.log('axiom func name: ', name);
        //if(name == 'get_shapes'){
            //axiom[name] = memoize(args => func({tolerance, ...args}));
        //}else{
            axiom[name] = memoize(func);//d.memoize({func}); // TODO: use Object.hasOwn(object1, 'prop') here to ensure prototype functions don't get in ?!
        //}
    }
//});

//export const axiom = () => get_draft().axiom;

export const set_queries = ({node, ...queries}) => {
    add_queries({node, drop:true, ...queries});
}

export const add_queries = ({node, drop, ...queries}) => {
    //console.log('add_queries!!!', queries);
    set_store(draft => {
        //const node = get_current_node();
        if(!draft.nodes.has(node)) return;
        //if(!draft.nodes.has(node).queries)  
        if(drop || !draft.nodes.get(node).queriers) draft.nodes.get(node).queriers = new Map();
        for(const [key, query] of Object.entries(queries)){
            // const name = draft.get_leaf({root:node, term:'name'});
            // console.log('setting querier on', name, query.name);
            draft.nodes.get(node).queriers.set(key, make_querier(query));
        }
    });
};
function make_querier(query){
    //const queue = new Map();
    //queue.set('host', 'empty');
    const execute = args => { // {node, ...args} ({caller, ...args})
        //console.log('execute', args);
        const node = get_node_obj(args.node);
        //console.log('node switched', {...args, node});
        const result = query({...args, node});
        // if(callers.has(caller)){
        //     callers.get(caller) = 'idle';
        // }
        return result;
    };
    return {execute};
}

function get_node_obj(node){
    return {
        id: node,
        get_leaf: ({alt, ...term_paths}) => get_leaf({root:node, alt, ...term_paths}),
        get_leaves: ({terms}) => get_leaves({root:node, terms}),
        get_stem: ({alt, ...term_paths}) => get_stem({root:node, alt, ...term_paths}),
        get_stems: ({...term_paths}) => get_stems({root:node, ...term_paths}),
        get_type_name: () => get_type_name({node}),
        get_model: () => query({node, name:'get_model'}),
        get_stem_model: ({alt, ...term_paths}) => get_stem_model({root:node, alt, ...term_paths})[1], 
        get_stem_models: ({...term_paths}) => get_stems_and_models({root:node, ...term_paths})[0],
        //get_model_and_stem: ({alt, ...term_paths}) => get_stem_model({root:node, alt, ...term_paths}),
        get_scene: () => query({node, name:'get_scene'}),
        get_model_scene: (args={}) => get_model_scene({node, ...args}),
        get_curve_scene: (args={}) => get_curve_scene({node, ...args}),
        get_facet_scene: (args={}) => get_facet_scene({node, ...args}),
    }
}

export function query({name, args={}, draft=get_draft(), ...target}){
    return draft.query({name, args, ...target});
}

export function get_model_scene({node}){
    const model = query({node, name:'get_model'});
    return {
        Group: {
            ...get_placement({node}),
            scenes: get_shape_scenes({node, model}),
        }
    };
}

export function get_curve_scene({node}){
    const model = query({node, name:'get_model'});
    const polylines = axiom.get_curve_scene({model, count:8});
    return {
        Group: {
            ...get_placement({node}),
            scenes: get_polyline_scenes({node, polylines}),
        }
    };
}

export function get_facet_scene({node}){
    const model = query({node, name:'get_model'});
    const mesh = axiom.get_facet_scene({model, count:8});
    return {Mesh:{
        source: node,
        ...get_placement({node}),
        ...mesh,
    }};
}

export function get_shape_scenes({node, model}){
    const {points, polylines, meshes} = axiom.get_scene({model, count:8});
    return [
        ...get_polyline_scenes({node, polylines}),
        ...meshes.map((mesh, key) => ({
            Mesh:{
                key,
                source: node,
                ...mesh,
            }
        })),
        ...points.map((position, key) => ({
            Point:{
                key,
                source: node,
                position,
            }
        })),
    ];
}

function get_polyline_scenes({node, polylines}) {
    return polylines.map((polyline, key) => ({
        Polyline:{
            key,
            source: node,
            ...polyline,
        }
    }))
}

export function get_placement_stem_model({node, draft=get_draft()}){
    const [position_stem, position] = get_stem_model({root:node, term:'transform position', alt:[0, 0, 0]}); 
    const [rotation_stem, rotation] = get_stem_model({root:node, term:'transform rotation', alt:[0, 0, 0]});
    rotation[0] = rotation[0] * Math.PI / 180;
    rotation[1] = rotation[1] * Math.PI / 180;
    rotation[2] = rotation[2] * Math.PI / 180;
    return [
        position_stem, 
        rotation_stem, 
        position,
        rotation,
    ]
}

export function get_placement({node, draft=get_draft()}){
    return {
        position: draft.get_stem({root:node, term:'transform position'}),
        rotation: draft.get_stem({root:node, term:'transform rotation'}),
    }
}

export function get_type_name({node, draft=get_draft()}){
    return draft.get_type_name(node);
}

export function get_stem({root, alt, draft=get_draft(), ...term_paths}){ 
    return get_node_obj(draft.get_stem({root, alt, ...term_paths}));
}

export function get_stems({root, draft=get_draft(), ...term_paths}){ 
    return draft.get_stems({root, ...term_paths}).map(stem => get_node_obj(stem));
}

export function get_leaf({root, alt, draft=get_draft(), ...term_paths}){ 
    return draft.get_leaf({root, alt, ...term_paths});
}

export function get_leaves({root, terms, draft=get_draft()}){ 
    return draft.get_leaves({root, terms});
}

// export function get_model({root, alt, draft=get_draft(), ...term_paths}){
//     const stem = draft.get_stem({root, ...term_paths})
//     if(!stem) return alt;
//     const {model} = query({stem, name:'get_model'});
//     if(model) return model;
//     return alt;
// }

export function get_stem_model({root, alt, draft=get_draft(), ...term_paths}){
    const stem = draft.get_stem({root, ...term_paths}); // , alt:root
    if(!stem) return [null, alt];
    const model = query({stem, name:'get_model'});
    if(model) return [get_node_obj(stem), model];
    return [null, alt];
}

export function get_stems_and_models({root, alt, draft=get_draft(), ...term_paths}){
    const stems = draft.get_stems({root, ...term_paths})
    const models = [];
    for(const stem of stems){
        models.push(query({stem, name:'get_model'}));
    }
    return [models, stems];
}