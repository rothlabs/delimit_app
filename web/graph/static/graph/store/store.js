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
    query_node({node, draft=get_draft(), query}){
        if(!draft.node_queries.has(query)) return;
        if(!draft.nodes.get(node).queries.has(query)) return;
        return draft.nodes.get(node).queries.get(query)(node);
    }
});



// store.scene = {
//     sources: new Map(),
// };

// store.make_scene = ({source_node, draft=get_draft()}) => {
//     if(!draft.nodes.has(source_node)) return;
//     const scene = draft.nodes.get(source_node).terms.get('scenes')[0];
//     console.log('make_scene!!!', scene);
// };