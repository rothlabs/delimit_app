import {set_store} from 'delimit/graph';

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

