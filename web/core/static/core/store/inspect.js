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
    for(path of d.as_iterator(paths)){
        d.inspected.add(path);
    }
};

export const set_leaf = (d, root, term, index, value) => {
    //console.log(root, term);
    //console.log([...d.node.get(root).terms]);
    const leaf = d.node.get(root).terms.get(term)[index];
    let coerced = value;
    if(typeof coerced == 'boolean' && leaf.type == 'boolean'){
        leaf.value = coerced;
        return coerced;
    }
    if(typeof coerced == 'string'){
        if(leaf.type == 'string'){
            leaf.value = coerced;
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