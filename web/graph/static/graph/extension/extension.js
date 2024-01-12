import {set_store, get_node} from 'delimit/graph';

export const set_queries = queries => {
    console.log('set_queries!!!', queries);
    set_store(draft => {
        const node = get_node();
        if(!draft.nodes.get(node)) return;
        draft.node_queries.set(node, );
    });
};