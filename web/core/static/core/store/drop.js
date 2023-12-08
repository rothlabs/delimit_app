export const dropped = {
    repo: new Set(),
    node: new Map(),
};

export const closed = {
    repo: new Set(),
    node: new Map(),
};

export const shut = {};
shut.node = (d, {node, given, drop, deep})=>{ 
    let targets = new Set();
    for(const n of d.iterable(node)){
        if(d.node.has(n)) targets.add(n);
    }
    if(deep){
        function get_stems(nodes){
            const next_nodes = new Set();
            for(const node of nodes){
                for(const [term, stem] of d.forw(d, node)){ // d.flat(d.node.get(node).forw)
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
    if(!given && drop) targets = d.write_access(d, [...targets]);
    for(const node of targets){
        d.drop.edge(d, {root:node});
        const repo = d.node.get(node).repo;
        if(drop){
            d.drop.edge(d, {stem:node});
            d.dropped.node.set(node, repo);
        }else{
            d.closed.node.set(node, repo);
        }
        d.repo.get(repo).node.delete(node);
        d.unpick.node(d, node, {target:true});
        d.node.delete(node);
    }
    if(targets.length) d.graph.increment(d);
};
shut.repo = (d, {repo, drop}) => {
    d.shut.node(d, {node:d.repo.get(repo).node, drop});
    d.unpick.repo(d, repo, {target:true});
    if(drop){
        d.dropped.repo.add(repo);
    }else{
        d.closed.repo.add(repo);
    }
    d.repo.delete(repo);
};


export const drop = {};
drop.edge = (d, a={})=>{
    //console.log('drop edge');
    let drops = []; 
    function forward_edge(func){
        if(!d.node.has(a.root)) return {};
        for(const [term, stem, index] of d.forw(d, a.root, {leaf:true})){ // d.flat(d.node.get(a.root).forw)
            func({root:a.root, term, stem, index});
        }
    }
    if(a.root && a.term && a.stem){ 
        drops.push({root:a.root, term:a.term, stem:a.stem, index:a.index ?? 0});
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
    if(!a.given) drops = drops.filter(drp=> d.write_access(d, drp.root));
    drops.sort((a, b)=> b.index - a.index);
    for(const drp of drops){
        if(!d.node.has(drp.root)) continue;
        const forw = d.node.get(drp.root).forw;
        if(!forw.has(drp.term)) continue;
        const stems = forw.get(drp.term);
        if(drp.index >= stems.length) continue;
        stems.splice(drp.index, 1);
        if(!stems.length){
            if(a.placeholder){
                const empty = d.make.node(d, {});
                d.make.edge(d, {...drp, stem:empty});
            }else{
                forw.delete(drp.term);
            }
        }
    }
    let increment_graph = false;
    for(const drp of drops){
        if(!d.node.has(drp.stem)) continue;
        increment_graph = true;
        let drop_back = true;
        for(const [term, stem] of d.forw(d, drp.root)){
            if(stem == drp.stem) drop_back = false;
        }
        if(drop_back){
            const stem_obj = d.node.get(drp.stem);
            stem_obj.back.delete(drp.root); // (drp.root+':'+drp.term+':'+drp.index);
            if(!a.given && stem_obj.back.size < 1 && stem_obj.forw.size < 1) d.shut.node(d, {node:drp.stem, drop:true});
        }
    }
    if(increment_graph) d.graph.increment(d);
};


// // drop.node = (d, nodes, arg={}) => {
// //     d.close.node(d, nodes, {...arg, drop:true});
// // };
// drop.repo = (d, repo) => {
//     d.close.repo(d, repo, {drop:true});
//     // d.drop.node(d, d.repo.get(repo).node, {});
//     // d.unpick.repo(d, repo, {target:true});
//     // d.dropped.repo.add(repo);
//     // d.repo.delete(repo);
// };






//const repo_obj = d.repo.get(repo);
    //d.mutation.drop_repo({variables:{team:repo_obj.team, repo}});



    // edge_or_node(d,r,n,a){
    //     if(d.graph.asset_root(d,n).length > 1){
    //         d.delete.edge(d,r,n,a);
    //     }else{
    //         d.delete.node(d,n);
    //     }
    // },




        //d.next('reckon.up', r);
        //d.next('graph.update');
        //d.next('pick.update');
        //d.next('design.show');



// var t = d.n[n].t;
//         if(a.t != undefined) t = a.t;
//         if(d.n[r].asset && d.n[r].n[t]){ // if((d.n[r].asset || d.cats[d.n[r].t]) && d.n[r].n[t]){ // d.n[r].n[t] remove d.n[r].n[t] ?!?!?!?!
//             const re = d.graph.root_edge(d, n).find(re=> re.r==r);
//             if(re){
//                 d.pop(d.n[n].r[re.t], re.r); //d.n[n].r[re.t].splice(re.o, 1);
//                 if(d.n[n].r[re.t].length==0) delete d.n[n].r[re.t];
//                 if(!d.n[n].n && d.graph.asset_root(d,n).length==0) d.delete.node(d,n); // delete unused atoms
//             }
//             const o = d.pop(d.n[r].n[t], n); //d.n[r].n[t].splice(e.o, 1);
//             //console.log('delete edge', o);
//             if(o > -1){
//                 if(d.n[r].n[t].length==0) delete d.n[r].n[t];
//                 d.next('reckon.up', r);
//                 d.next('graph.update');
//                 d.next('pick.update');
//                 d.next('design.show');
//             }
//         }



//console.log('delete edge', r, n, t);

            ////////////////////////////// special case that needs generalized ?!?!?!?!?
            //var reckon_nodes = null;
            //if(d.n[r].t=='transform') reckon_nodes = d.graph.stem_of_tag(d,n,'point');
            //if(d.n[r].t=='transform') 
            //d.clear.down(d,r,n);
            //////////////////////////////
            


/////////////////////d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
            //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 

