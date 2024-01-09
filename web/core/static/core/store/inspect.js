import {current} from 'immer';

export const inspected = new Set();

export const inspect = {};

inspect.toggle = (d, {path}) => {
    if(d.inspected.has(path)){
        d.inspected.delete(path);
        return false;
    }else{
        d.inspected.add(path);
        return true;
    }
};

inspect.open = (d, {path, paths}) => {
    paths = paths ?? path;
    for(path of d.get_iterable(paths)){
        d.inspected.add(path);
    }
};

export const set_leaf = (d, {root, term, index=0, value}) => {
    //console.log(root, term);
    //console.log([...d.nodes.get(root).terms]);
    const leaf = d.nodes.get(root).terms.get(term)[index];
    let coerced = value;
    if(typeof coerced == 'boolean' && leaf.type == 'boolean'){
        leaf.value = coerced;
        return coerced;
    }
    if(typeof coerced == 'string'){
        if(leaf.type == 'string'){
            leaf.value = coerced;
            d.add_or_remove_as_context_node(d, root);
            return coerced;
        }
        //coerced = coerced.replace(/^0+/, '');
        if(['', '-'].includes(coerced)){
            leaf.value = 0;
            return coerced;
        }
        if(leaf.type == 'integer'){
            coerced = coerced.replace(/\./g, '');
            if(!isNaN(coerced) && Number.isInteger(parseFloat(coerced))){
                leaf.value = parseInt(coerced);
                return coerced;
            }
        }else if(leaf.type == 'decimal'){
            if(['.', '-.'].includes(coerced)){
                leaf.value = 0;
                return coerced;
            }
            if(!isNaN(coerced)){
                leaf.value = parseFloat(coerced);
                return coerced;
            }
        }
    }
};

export const set_term = (d, {root, term, new_term}) => {
    if(new_term.length < 1) return;
    if(term == new_term) return;
    if(!d.nodes.has(root)) return;
    const terms = d.nodes.get(root).terms;
    if(!terms.has(term)) return;
    terms.set(new_term, terms.get(term));
    terms.delete(term);
    d.picked_context = {root, term:new_term};
    d.add_or_remove_as_context_node(d, root);
    // if(new_term=='type' && d.value(d, root, new_term)=='Context') d.context_nodes.add(root);
    // else d.context_nodes.delete(root);
};