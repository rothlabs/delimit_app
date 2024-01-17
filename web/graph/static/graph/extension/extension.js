import {set_store, static_url} from 'delimit/graph';
import initialize_geometry, {calc_something} from 'delimit/axiom';

export const set_queries = ({node_id, ...queries}) => {
    //console.log('set_queries!!!', queries);
    set_store(draft => {
        //const node = get_current_node();
        if(!draft.nodes.has(node_id)) return;
        //if(!draft.nodes.has(node).queries) 
        draft.nodes.get(node_id).queries = new Map();
        for(const [key, query] of Object.entries(queries)){
            // const name = draft.get_leaf({root:node, term:'name'});
            // console.log('setting querier on', name, query.name);
            draft.nodes.get(node_id).queries.set(key, get_new_querier(query));
        }
    });
};

function get_new_querier(query){
    const execute = ({node, ...args}) => {
        return query({node, ...args});
    };
    return {execute};
}

export let axiom = null;
initialize_geometry(static_url+'delimit_axiom_bg.wasm').then(() => {
    let query = {
        field1: new Map(),
        field2: [[5,6],[4,5]],
        field3: [1, 2, 3, 9],
    };
    query.field1.set('hey now', 'here');
    query = calc_something(query);
    query.field1.set('hey again', 'even more crap');
    query.field2.push([500,1000]);
    const result = calc_something(query);
    
    // console.log(axiom.take_number_slice_by_shared_ref(new Float32Array(100)));
    // console.log(axiom.return_boxed_js_value_slice());
    // let crap = new Set();
    // crap.add('wow');
    // crap.add('nice');
    // crap.add('cool');
    // console.log([...crap.keys()]);
    // let result = axiom.count_strings_in_set(crap);
    console.log(result);
});
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

