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
    //console.log('set_queries!!!', queries);
    set_store(draft => {
        //const node = get_current_node();
        if(!draft.nodes.has(node)) return;
        //if(!draft.nodes.has(node).queries)  
        draft.nodes.get(node).queriers = new Map();
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

        const result = query(args);
        // if(callers.has(caller)){
        //     callers.get(caller) = 'idle';
        // }
        return result;
    };
    return {execute};
}

export function query({name, args={}, draft=get_draft(), ...target}){
    return draft.query({name, args, ...target});
}

export function get_shape_scenes({node, model}){
    const shapes = axiom.get_shapes({model, count:10});
    return [
        ...shapes.polylines.map((polyline, key) => ({
            type: 'Polyline',
            key,
            source: node,
            vector: polyline,
        })),
        ...shapes.meshes.map((mesh, key) => ({
            type: 'Mesh',
            key,
            source: node,
            ...mesh,
        })),
        ...shapes.points.map((position, key) => ({
            type: 'Point',
            key,
            source: node,
            position,
        })),
    ];
}

export function get_placement_stem_model({node, draft=get_draft()}){
    const [position_stem, position] = get_stem_model({root:node, term:'placement position', alt:[0, 0, 0]}); 
    const [rotation_stem, rotation] = get_stem_model({root:node, term:'placement rotation', alt:[0, 0, 0]});
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
        position: draft.get_stem({root:node, term:'placement position'}),
        rotation: draft.get_stem({root:node, term:'placement rotation'}),
    }
}

export function get_type_name({node, draft=get_draft()}){
    return draft.get_type_name(node);
}

export function get_stem({root, alt, draft=get_draft(), ...term_paths}){ 
    return draft.get_stem({root, alt, ...term_paths});
}

export function get_stems({root, draft=get_draft(), ...term_paths}){ 
    return draft.get_stems({root, ...term_paths});
}

export function get_leaf({root, alt, draft=get_draft(), ...term_paths}){ 
    return draft.get_leaf({root, alt, ...term_paths});
}

export function get_leaves({root, terms, draft=get_draft()}){ 
    return draft.get_leaves({root, terms});
}

export function get_stem_model({root, alt, draft=get_draft(), ...term_paths}){
    const stem = draft.get_stem({root, ...term_paths})
    if(!stem) return [null, alt];
    const {model} = query({stem, name:'get_case'});
    if(model) return [stem, model];
    return [null, alt];
}

export function get_stems_and_models({root, alt, draft=get_draft(), ...term_paths}){
    const stems = draft.get_stems({root, ...term_paths})
    const models = [];
    for(const stem of stems){
        models.push(query({stem, name:'get_case'}).model);
    }
    return [stems, models];
}