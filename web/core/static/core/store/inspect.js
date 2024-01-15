import {get_draft} from 'delimit';

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

export const set_leaf = ({root, term, index=0, value, draft=get_draft()}) => {
    //console.log(root, term);
    //console.log([...draft.nodes.get(root).terms]);
    const leaf = draft.nodes.get(root).terms.get(term)[index];
    const old_value = leaf.value;
    let coerced = value;
    if(typeof coerced == 'boolean' && leaf.type == 'boolean'){
        leaf.value = coerced;//return coerced;
    }
    if(typeof coerced == 'string'){
        if(leaf.type == 'string'){
            leaf.value = coerced;
            draft.add_or_remove_as_context_node(draft, root);//return coerced;
        }
        if(['', '-'].includes(coerced)){ // coerced = coerced.replace(/^0+/, '');
            leaf.value = 0;//return coerced;
        }
        if(leaf.type == 'integer'){
            coerced = coerced.replace(/\./g, '');
            if(!isNaN(coerced) && Number.isInteger(parseFloat(coerced))){
                leaf.value = parseInt(coerced);//return coerced;
            }
        }else if(leaf.type == 'decimal'){
            if(['.', '-.'].includes(coerced)){
                leaf.value = 0;//return coerced;
            }
            if(!isNaN(coerced)){
                leaf.value = parseFloat(coerced);//return coerced;
            }
        }
    }
    if(leaf.value != old_value){
        draft.scene.increment(draft);
        if(['source', 'language'].includes(term) && draft.get_leaf({root, term:'language'}) == 'javascript'){
            draft.increment_code(draft);
        }
    }
    return coerced;
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
    d.scene.add_or_remove_source(d, {root});
};