import {get_draft, is_formal_node_id} from 'delimit/graph';
//import {is_formal_node_id} from 'delimit/common';

export const make = {};

// console.log('graph app make node', draft.nodes.get(node).roots.keys().next().value);

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

make.edge = ({root, term, stem, index, draft=get_draft()}) => { 
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
    index = index ?? length; // TODO: place this before creating empty term?
    if(index > length) return;
    if(stem.type == 'auto') stem.type = get_real_type(stem);
    terms.get(term).splice(index, 0, stem); 
    if(draft.nodes.has(stem)){
        draft.nodes.get(stem).roots.add(root);
    }
    return true;
};

function get_real_type({value}){
    let type = 'boolean';
    if(typeof value === 'string') type = 'string';
    else if(typeof value === 'number'){
        type = 'decimal';
        if(Number.isInteger(value)) type = 'integer';
    }
    return type;
}