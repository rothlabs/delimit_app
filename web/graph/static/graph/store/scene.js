import {get_draft} from 'delimit/graph';

export const make_scene = ({source_node, scene_tree, draft=get_draft()}) => {
    const root = draft.get_stem({root:source_node, term:'scenes'});
    if(!root) return;
    console.log('make_scene!!!', source_node, scene_tree);
};

//if(!draft.nodes.has(source_node)) return;
    //const scene = draft.nodes.get(source_node).terms.get('scenes')[0];