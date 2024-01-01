
export const closed = {
    commit: new Set(),
    repo:   new Set(),
    node:   new Set(),
};

export const dropped = {
    commit: new Set(),
    repo:   new Set(),
    node:   new Set(),
};

export const close = {};
export const drop = {};

close.nodes = (d, {nodes, given, drop, deep})=>{  // shut by commit
    let targets = new Set();
    for(const node of d.iterable(nodes)){
        if(d.node.has(node)) targets.add(node);
    }
    if(deep){
        function get_stems(nodes){
            const next_nodes = new Set();
            for(const node of nodes){
                for(const [term, stem] of d.terms(d, node)){ // d.flat(d.node.get(node).terms)
                    if(!d.node.has(stem)) continue;
                    if([...d.node.get(stem).back].every(root=> targets.has(root))){//if(d.node.get(stem).back.values().every(([root])=> drops.has(root))){ // root should always exist here, if not use: drops.has(root) || !d.node.has(root) 
                        targets.add(stem);
                        next_nodes.add(stem);
                    }
                }
            }
            if(next_nodes.size) get_stems(next_nodes);
        };
        get_stems(targets);
    }
    if(!given && drop) targets = d.writable(d, [...targets]);
    for(const node of targets){
        if(!d.node.has(node)) continue;
        d.drop.edge(d, {root:node});
        const commit = d.node.get(node).commit;
        if(drop){
            d.drop.edge(d, {stem:node});
            d.dropped.node.add(node);
        }else{
            d.closed.node.add(node);
        }
        d.commit.get(commit).nodes.delete(node);
        d.unpick(d, {node});
        d.node.delete(node);
    }
    if(targets.length) d.graph.increment(d);
};
drop.nodes = (d, args) => close.nodes(d, {...args, drop:true});

close.commits = (d, {commits, drop}) => { 
    for(const commit of d.iterable(commits)){
        if(!d.commit.has(commit)) continue;
        const commit_obj = d.commit.get(commit);
        if(!commit_obj.writable) continue;
        d.repo.get(commit_obj.repo).commits.delete(commit);
        d.close.nodes(d, {nodes:commit_obj.nodes, drop});
        d.unpick(d, {commit});
        if(drop) d.dropped.commit.add(commit);
        else d.closed.commit.add(commit);
        d.commit.delete(commit);
    }
};
drop.commits = (draft, args) => close.commits(draft, {...args, drop:true});

close.repo = (d, {repo, drop}) => {
    if(!d.repo.has(repo)) return;
    const repo_obj = d.repo.get(repo);
    if(!repo_obj.writable) return;
    const commits = repo_obj.commits;
    d.close.commits(d, {commits, drop});
    d.unpick(d, {repo});
    if(drop) d.dropped.repo.add(repo);
    else d.closed.repo.add(repo);
    d.repo.delete(repo);
};
drop.repo = (draft, args) => close.repo(draft, {...args, drop:true});


drop.edge = (d, a={})=>{
    //console.log('drop edge');
    let drops = []; 
    function forward_edge(func){
        if(!d.node.has(a.root)) return {};
        for(const [term, stem, index] of d.terms(d, a.root, {leaf:true})){ // d.flat(d.node.get(a.root).terms)
            func({root:a.root, term, stem, index});
        }
    }
    if(a.root && a.term && a.stem && a.index != null){ // should drop all if no index specified
        drops.push({root:a.root, term:a.term, stem:a.stem, index:a.index}); //drops.push({root:a.root, term:a.term, stem:a.stem, index:a.index ?? 0});
    }else if(a.root && a.term && a.stem){
        forward_edge(edge=> edge.term==a.term && edge.stem==a.stem && drops.push(edge));
    }else if(a.root && a.term && !a.stem){
        const terms = d.node.get(a.root).terms;
        if(terms.has(a.term) && !terms.get(a.term).length) terms.delete(a.term);
        return;
    }else if(a.root && a.stem){
        forward_edge(edge=> edge.stem==a.stem && drops.push(edge));
    }else if(a.root){  
        forward_edge(edge=> drops.push(edge));
    }else if(a.stem){
        if(!d.node.has(a.stem)) return;
        for(const [root, term, index] of d.back(d, a.stem)){ //for(const [root, term, index] of d.node.get(a.stem).back.values()){
            drops.push({root, term, stem:a.stem, index});
        }
    }
    if(!a.given) drops = drops.filter(drp=> d.writable(d, drp.root));
    drops.sort((a, b)=> b.index - a.index);
    for(const drp of drops){
        if(!d.node.has(drp.root)) continue;
        const terms = d.node.get(drp.root).terms;
        if(!terms.has(drp.term)) continue;
        const stems = terms.get(drp.term);
        if(drp.index >= stems.length) continue;
        stems.splice(drp.index, 1);
        // if(!stems.length){
        //     if(a.placeholder){
        //         const empty = d.make.node(d, {});
        //         d.make.edge(d, {...drp, stem:empty});
        //     }else{
        //         terms.delete(drp.term);
        //     }
        // }
    }
    let increment_graph = false;
    for(const drp of drops){
        if(!d.node.has(drp.stem)) continue;
        increment_graph = true;
        let drop_back = true;
        for(const [term, stem] of d.terms(d, drp.root)){
            if(stem == drp.stem) drop_back = false;
        }
        if(drop_back){
            const stem_obj = d.node.get(drp.stem);
            stem_obj.back.delete(drp.root); // (drp.root+':'+drp.term+':'+drp.index);
            if(!a.given && stem_obj.back.size < 1 && stem_obj.terms.size < 1) d.drop.nodes(d, {nodes:drp.stem});
        }
    }
    if(increment_graph) d.graph.increment(d);
};