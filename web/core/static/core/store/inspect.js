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

inspect.open = (d, {path}) => {
    d.inspected.add(path);
};