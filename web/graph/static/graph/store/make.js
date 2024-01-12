export const make = {};

make.node = (d, {node, version, given, type})=>{
    node = node ?? (version ? (version+make_id()) : make_id(15));
    //if(node.length == 15) console.log(node);
    if(!(given || d.writable(d, node))) return;
    d.drop.edge(d, {root:node, given}); 
    //let back = new Set();
    //if(d.nodes.has(node)) back = d.nodes.get(node).back;
    d.nodes.set(node, {
        version,
        terms: new Map(),
        back: new Set(),            
    });
    if(d.versions.has(version)) d.versions.get(version).nodes.add(node);
    if(type) build_node_from_type(d, node, type);
    d.dropped.node.delete(node);
    d.closed.node.delete(node);
    d.graph.increment(d);
    d.scene.increment(d);
    return node;
};

make.edge = (d, {root, term='stem', stem, index, given, single})=>{ // make named args //  if somehow this is called without permission, the server should kick back with failed 
    if(!d.nodes.has(root)) return; //  && (stem.type || d.nodes.has(stem)))
    if(!(given || d.writable(d, root))) return;
    const terms = d.nodes.get(root).terms;
    let stems = terms.get(term);
    let length = stems?.length ?? 0;
    if(stem == null){
        if(!length) terms.set(term, []); 
        d.scene.add_or_remove_source(d, {root, given});
        return;
    }
    const has_cycle = node => {
        if(root == node) return true;
        if(!d.nodes.has(node)) return;
        for(const [_, stem] of d.get_edges(d, node)){
            if(root == stem) return true;
            else return has_cycle(stem);
        }
    }
    if(has_cycle(stem)){
        console.log('Error: Cannot make edge because it would cause a cycle in the graph.');
        return;
    }
    if(!length) terms.set(term, []); 
    if(single && terms.get(term).includes(stem)) return;
    index = index ?? length; 
    if(index > length) return; //  || length >= a.max_length 
    terms.get(term).splice(index, 0, stem); 
    d.add_or_remove_as_context_node(d, root); //if(term=='type' && stem.value=='Context') d.context_nodes.add(root);
    d.scene.add_or_remove_source(d, {root, given});
    if(d.nodes.has(stem)){
        d.nodes.get(stem).back.add(root); //if(!stem.type) d.nodes.get(stem).back.add(root);
        d.graph.increment(d);
    }
    d.scene.increment(d);
    return true;
};