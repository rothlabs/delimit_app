import {get_draft, is_formal_node_id} from 'delimit/graph';

export const make = {};

make.node = ({node, draft=get_draft()})=>{
    if(is_formal_node_id(node)) return;
    node = node ?? draft.get_new_id();
    draft.drop.edge({root:node}); 
    let roots = new Set();
    if(draft.nodes.has(node)) roots = draft.nodes.get(node).roots;
    draft.nodes.set(node, {
        terms: new Map(),
        roots,          
    });
    return node;
};

make.edge = ({root, term, stem, index, single, draft=get_draft()}) => { 
    if(!term) return;
    if(is_formal_node_id(root)) return;
    if(!draft.nodes.has(root)) return; 
    const terms = draft.nodes.get(root).terms;
    let stems = terms.get(term);
    let length = stems?.length ?? 0;
    if(stem == null){
        if(!length) terms.set(term, []); 
        return;
    }
    if(draft.will_cycle({root, stem})){
        console.log('Error: Cannot make edge because it would make a cyclic graph.');
        return;
    }
    if(!length) terms.set(term, []); 
    if(single && terms.get(term).includes(stem)) return;
    index = index ?? length; // TODO: place this before creating empty term?
    if(index > length) return;
    terms.get(term).splice(index, 0, stem); 
    if(draft.nodes.has(stem)){
        draft.nodes.get(stem).roots.add(root);
    }
    return true;
};