import {get_draft} from 'delimit/graph';

const make_functions = new Map(Object.entries({
    make_point,
}));

export function make_scene({node, scene, tick, draft=get_draft()}){
    const root = draft.get_stem({root:node, term:'scenes'});
    if(!root) return;
    draft.make.node({node:root});
    draft.nodes.get(root).roots.add(node);
    draft.make.edge({root, term:'tick', stem:{type:'integer',  value:tick}});
    draft.make.edge({root, term:'type', stem:{type:'string',   value:scene.type}});
    draft.make.edge({root, term:'source', stem:{type:'string', value:scene.node_id}});
    const func_name = 'make_'+scene.type;
    if(make_functions.has(func_name)) make_functions.get(func_name)({root, scene});
};

function make_point({root, scene, draft=get_draft()}){
    draft.make.edge({root, term:'x', stem:{type:'auto', value: scene.x ?? scene.node_id}});
    draft.make.edge({root, term:'y', stem:{type:'auto', value: scene.y ?? scene.node_id}});
    draft.make.edge({root, term:'z', stem:{type:'auto', value: scene.z ?? scene.node_id}});
}