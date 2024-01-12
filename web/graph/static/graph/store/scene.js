import {get_draft} from 'delimit/graph';

export const make_scene = ({source_node, draft=get_draft()}) => {
    const root = draft.get_stem({root:source_node, term:'scenes'});
    if(!root) return;
    const data = draft.query_node({node:source_node, query:'get_scene'});
    console.log('make_scene!!!', root, data);
};

//if(!draft.nodes.has(source_node)) return;
    //const scene = draft.nodes.get(source_node).terms.get('scenes')[0];