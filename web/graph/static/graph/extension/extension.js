import {set_store, get_node} from 'delimit/graph';

export const set_queries = queries => {
    console.log('set_queries!!!', queries);
    set_store(draft => {
        const node = get_node();
        if(!draft.nodes.has(node)) return;
        //if(!draft.nodes.has(node).queries) 
        draft.nodes.get(node).queries = new Map();
        for(const [key, query] of Object.entries(queries)){
            draft.nodes.get(node).queries.set(key, 
                get_new_querier(query)
            );
        }
    });
};

function get_new_querier(query){
    const execute = ({node, ...args}) => {
        query({node, ...args});
    };
    return {execute};
}