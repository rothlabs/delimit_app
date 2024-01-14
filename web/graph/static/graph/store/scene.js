import {get_draft} from 'delimit/graph';

export const make_scene = ({node, tree, tick, draft=get_draft()}) => {
    const root = draft.get_stem({root:node, term:'scenes'});
    if(!root) return;
    console.log('make_scene!!!', root, tree, tick);
    draft.make.node({node:root});
    draft.make.edge({root, term:'tick', stem:{type:'integer', value:tick}})
};

//if(!draft.nodes.has(source_node)) return;
    //const scene = draft.nodes.get(source_node).terms.get('scenes')[0];

    // draft.set_leaf({root, term:'tick', value:tick});
    // draft.set_leaf({root, term:'type', value:tree.type});