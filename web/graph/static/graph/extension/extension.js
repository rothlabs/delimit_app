import {set_store, static_url, get_draft} from 'delimit/graph';
import initialize_axiom, {get_polygon, get_mesh} from 'delimit/axiom';

initialize_axiom(static_url+'delimit_axiom_bg.wasm').then(() => {
    //console.log(test_enum({Nurbs:{controls:[[0,0,0], [5,6,8.8]]}}));
});

export const axiom = {
    get_polygon,
    get_mesh,
};

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
    const model = query({stem, name:'get_model'});
    if(model) return [stem, model];
    return [null, alt];
}


// export function query({name, args={}, draft=get_draft(), ...target}){
//     const [_, node] = Object.entries(target)[0];
//     if(typeof node === 'string'){
//         return execute_querier({node, name, args});
//     } 
//     return draft.get_iterable(target).map(node => execute_querier({node, name, args})).filter(v => v);
// }
// function execute_querier({node, name, args, draft=get_draft()}){
//     const code = draft.get_stem({root:node, terms:'type code'});
//     const querier = draft.nodes.get(code)?.queriers?.get(name);
//     if(querier) return querier.execute({node, ...args}); // , caller:'local'
// }

// export function get_stem({root, alt, draft=get_draft(), ...term_paths}){
//     return draft.get_stem({root, alt, ...term_paths})
// }








// export function query({node_id, draft=get_draft(), ...query_selection}){
//     const [query_name, args] = Object.entries(query_selection)[0];
//     const code = draft.get_stem({root:node_id, terms:'type code'});
//     const querier = draft.nodes.get(code)?.queriers?.get(query_name);
//     if(querier) return querier.execute({node_id, draft, ...args}); // , caller:'local'
// }


// let query = {
//     field1: new Map(),
//     field2: [[5,6],[4,5]],
//     field3: [1, 2, 3, 9],
// };
// query.field1.set('hey now', 'here');
// query = calc_something(query);
// query.field1.set('hey again', 'even more crap');
// query.field2.push([500,1000]);
// const result = calc_something(query);
// console.log(result);



// (async () => {
//     axiom = await initialize_geometry(static_url+'delimit_axiom_bg.wasm'); 

//     const crap = new Set();
//     crap.add('wow', 5, 'cool', 7, 'please');
//     const result = axiom.count_strings_in_set(crap);

//     // let wow = axiom.count_strings_in_set(500, 600);
//     // console.log(wow);
//     // // Get the example object from wasm.
//     // let query = axiom.send_example_to_js();
//     // console.log(query);
//     // // Add another "Vec" element to the end of the "Vec<Vec<f32>>"
//     // query.field2.push([5, 6]);

//     // // Send the example object back to wasm.
//     // //const result = axiom.execute(query);

//     console.log(result);
// })();

//const result = axiom.get_vectors({field2:[[42,88],[24,98]]});

