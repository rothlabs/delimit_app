export const remake = {};

export const replace = {};
replace.node = (d, {source, ...item}) => {
    for(const root of d.get_iterable(item)) replace_node(d, {root, source});
}

export const copy = {};
copy.node = (d, {deep, ...item}) => {
    for(const node of d.get_iterable(item)) copy_node(d, {node, deep});
}


function replace_node(d, {root, source}){
    d.drop.edge(d, {root});
    d.nodes.get(root).terms = new Map();
    for(const [term, stem] of d.get_edges({root:source})){
        d.make.edge(d, {root, term, stem});
    }
}

function copy_node(d, {node, deep}){
    const root = d.make.node({version:'targeted'});
    for(const [term, stem] of d.get_edges({root:node})){
        d.make.edge(d, {root, term, stem});
    }
};