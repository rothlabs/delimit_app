export const picked = {};

picked.primary = {
    node:    new Set(),
    repo:    new Set(),
    version: new Set(),
};

picked.secondary = {
    node:    new Set(),
    repo:    new Set(),
    version: new Set(),
};

export const picked_context = {};

export const pick = (d, {mode='primary', multi, keep, root, term, ...item}) => {
    if(Object.keys(item).length){
        if(mode == 'secondary'){
            d.unpick(d, {mode:'secondary', repo:'all'});
            d.unpick(d, {mode:'secondary', version:'all'});
        }
        d.picked_context = {root, term};
    }else{
        d.unpick(d, {mode:'secondary', all:'all'});
        d.picked_context = {root, term};
        return;
    }
    const [type, id] = Object.entries(item)[0];
    if(mode == 'secondary' && ['repo', 'version'].includes(type)){
        d.unpick(d, {mode:'secondary', node:'all'});
    }
    const picked = d.picked[mode][type];
    if(multi && !keep && picked.has(id)){
        picked.delete(id);
        return;
    }
    if(!multi && !keep) picked.clear();
    picked.add(id);
    if(type == 'node' && mode == 'primary') d.inspect.open(d, {path:'inspect'+id+'0'});
};

export const unpick = (d, {mode='all', ...item}) => { // item={node:'all'}
    if(!Object.keys(item).length) item = {node:'all'};
    d.picked_context = {root:null, term:null};
    const [type, id] = Object.entries(item)[0];
    function unpick_type(mode_val){
        function unpick_item(type_val){
            if(id == 'all') type_val.clear();
            else            type_val.delete(id);
        }
        if(type == 'all'){
            for(const type_val of Object.values(mode_val)) unpick_item(type_val);
        }else{
            if(mode_val[type]) unpick_item(mode_val[type]);
        }
    }
    if(mode == 'all'){
        for(const mode_val of Object.values(d.picked)) unpick_type(mode_val);
    }else{
        unpick_type(d.picked[mode]);
    }
};

export function pick_back(d, item){
    d.unpick(d, {mode:'primary'});
    for(const node of d.get_iterable(item)){
        for(const [root] of d.get_back_edges({stem:node})) d.pick(d, {node:root, keep:true});
    }
};

export const drag = {
    edge: {},
};