import {is_formal_node_id} from 'delimit';

export const closed = {
    version: new Set(),
    repo:    new Set(),
    node:    new Set(),
};

export const dropped = {
    version: new Set(),
    repo:    new Set(),
    node:    new Set(),
};

export const close = {};
export const drop = {};

close.node = (d, {drop, given, deep, ...ids})=>{  // shut by version
    //nodes = nodes ?? node;
    //console.log('close nodes', nodes.size);
    let targets = new Set();
    for(const id of d.get_iterable(ids)){
        if(d.nodes.has(id)) targets.add(id);
    }
    if(deep){
        function get_all_stems(nodes){
            const next_nodes = new Set();
            for(const node of nodes){
                for(const [term, stem] of d.get_edges({root:node, exclude_leaves:true})){ // d.flat(d.nodes.get(node).terms)
                    if(!d.nodes.has(stem)) continue;
                    if([...d.nodes.get(stem).roots].every(root=> targets.has(root))){//if(d.nodes.get(stem).back.values().every(([root])=> drops.has(root))){ // root should always exist here, if not use: drops.has(root) || !d.nodes.has(root) 
                        targets.add(stem);
                        next_nodes.add(stem);
                    }
                }
            }
            if(next_nodes.size) get_all_stems(next_nodes);
        };
        get_all_stems(targets);
    }
    if(drop && !given) targets = d.writable(d, targets);
    for(const node of targets){
        if(!d.nodes.has(node)) continue;
        d.drop.edge(d, {root:node});
        if(drop){
            d.drop.edge(d, {stem:node});
            d.dropped.node.add(node);
        }else{
            d.closed.node.add(node);
        }
        if(!d.nodes.has(node)) return; // drop.edge might have delete this early 
        const version = d.nodes.get(node).version;
        if(d.versions.has(version)) d.versions.get(version).nodes.delete(node);
        d.unpick(d, {node});
        d.nodes.delete(node);
    }
    if(targets.length){
        d.graph.increment(d);
        d.scene.increment(d);
    }
};
drop.node = (d, args) => close.node(d, {...args, drop:true});

close.version = (d, {drop, given, ...item}) => { 
    for(const version of d.get_iterable(item)){
        if(!d.versions.has(version)) continue;
        const version_obj = d.versions.get(version);
        const repo_obj = d.repos.get(version_obj.repo);
        if(drop && !given){
            if(version_obj.committed) continue;
            if(!repo_obj.writable && !version_obj.writable) continue;
        }
        let target_next_version = false;
        if(version == d.get.targeted.version(d)) target_next_version = true;
        repo_obj.versions.delete(version);
        d.close.node(d, {nodes:version_obj.nodes, drop, given});
        d.unpick(d, {version});
        if(drop) d.dropped.version.add(version);
        else d.closed.version.add(version);
        d.versions.delete(version);
        if(target_next_version) d.pick(d, {version:d.versions.keys().next().value});
        //console.log('drop version', drop, given, version);
    }
};
drop.version = (d, args) => close.version(d, {...args, drop:true});

close.repo = (d, {repo, drop, given}) => {
    if(!d.repos.has(repo)) return;
    const repo_obj = d.repos.get(repo);
    if(drop && !given && !repo_obj.writable) return;
    const versions = repo_obj.versions;
    d.close.version(d, {versions, drop, given});
    d.unpick(d, {repo});
    if(drop) d.dropped.repo.add(repo);
    else d.closed.repo.add(repo);
    d.repos.delete(repo);
};
drop.repo = (d, args) => close.repo(d, {...args, drop:true});


drop.edge = (d, a={}) => {
    //console.log('drop edge');
    let drops = []; 
    function forward_edge(func){
        if(!d.nodes.has(a.root)) return {};
        for(const [term, stem, index] of d.get_edges({root:a.root})){ // d.flat(d.nodes.get(a.root).terms)
            func({root:a.root, term, stem, index});
        }
    }
    if(a.root && a.term && a.stem && a.index != null){ // should drop all if no index specified
        drops.push({root:a.root, term:a.term, stem:a.stem, index:a.index}); //drops.push({root:a.root, term:a.term, stem:a.stem, index:a.index ?? 0});
    }else if(a.root && a.term && a.stem){
        forward_edge(edge=> edge.term==a.term && edge.stem==a.stem && drops.push(edge));
    }else if(a.root && a.term && !a.stem){
        const terms = d.nodes.get(a.root).terms;
        if(terms.has(a.term) && !terms.get(a.term).length){
            terms.delete(a.term); // d.scene.add_or_remove_source(d, {root:a.root, given:a.given});
            d.scene.increment(d);
            return;
        }
        forward_edge(edge=> edge.term==a.term && drops.push(edge));
    }else if(a.root && a.stem){
        forward_edge(edge=> edge.stem==a.stem && drops.push(edge));
    }else if(a.root){  
        forward_edge(edge=> drops.push(edge));
    }else if(a.stem){
        if(!d.nodes.has(a.stem)) return;
        for(const [root, term, index] of d.get_back_edges({stem:a.stem})){ //for(const [root, term, index] of d.nodes.get(a.stem).back.values()){
            drops.push({root, term, stem:a.stem, index});
        }
    }
    if(!a.given) drops = drops.filter(drp=> d.writable(d, drp.root));
    drops.sort((a, b)=> b.index - a.index);
    let increment = false;
    for(const {root, term, stem, index} of drops){
        if(!d.nodes.has(root)) continue;
        const terms = d.nodes.get(root).terms;
        if(!terms.has(term)) continue;
        const stems = terms.get(term);
        if(index >= stems.length) continue;
        //if(term=='type' && stem.value=='Context') d.context_nodes.delete(root);
        stems.splice(index, 1);
        d.add_or_remove_as_context_node(d, root);
        d.scene.add_or_remove_source(d, {root, given:a.given});
        increment = true;
        // if(!stems.length){
        //     if(a.placeholder){
        //         const empty = d.make.node(d, {});
        //         d.make.edge(d, {...drp, stem:empty});
        //     }else{
        //         terms.delete(drp.term);
        //     }
        // }
    }
    
    for(const drp of drops){
        if(!d.nodes.has(drp.stem)) continue;
        //increment_graph = true;
        let drop_back = true;
        for(const [_, stem] of d.get_edges({root:drp.root, exclude_leaves:true})){
            if(stem == drp.stem) drop_back = false;
        }
        if(drop_back){
            const stem = d.nodes.get(drp.stem);
            stem.roots.delete(drp.root); // (drp.root+':'+drp.term+':'+drp.index);
            increment = true;
            //if(!a.given && stem.back.size < 1 && stem.terms.size < 1) d.drop.node(d, {nodes:drp.stem});
            if(is_formal_node_id(drp.root) && !is_formal_node_id(drp.stem)){
                d.drop.node(d, {node:drp.stem, deep:true});
            }
        }
    }
    if(increment){
        d.graph.increment(d);
        d.scene.increment(d);
    }
};