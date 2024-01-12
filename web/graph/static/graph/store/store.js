//import {get_draft} from 'delimit/graph';
import * as scene from './scene.js';
import {make_common_slice} from '../../common/store/store.js';

export const make_store = get_draft => ({
    ...make_common_slice(get_draft),
    nodes: new Map(),
    //node_queries: new Map(),
    static_url: document.body.getAttribute('data-static-url') + 'graph/',
    scene:{
        sources: new Map(),
    },
    ...scene,
    query_node({node, draft=get_draft(), ...query_args}){
        const [query, args] = Object.entries(query_args)[0];
        const code = draft.get_stem({root:node, terms:'type code'})
        const querier = draft.nodes.get(code)?.queries?.get(query);
        if(!querier) return;
        return querier.execute({node, ...args});
    }
});

// if(!draft.nodes.get(type_node).queries.has(query)) return;
//         if(!draft.nodes.get(type_node).queries.has(query)) return;

// store.scene = {
//     sources: new Map(),
// };

// store.make_scene = ({source_node, draft=get_draft()}) => {
//     if(!draft.nodes.has(source_node)) return;
//     const scene = draft.nodes.get(source_node).terms.get('scenes')[0];
//     console.log('make_scene!!!', scene);
// };