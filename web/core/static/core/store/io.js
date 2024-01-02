export const receive_data = (d, data) => {// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
    //console.log(JSON.stringify(data));
    Object.entries(data.repos).map(([repo, {metadata:{name, story}, writable}])=>{ // writable
        d.repo.set(repo, {name, story, writable, commits:new Set()});
        d.dropped.repo.delete(repo);
        d.closed.repo.delete(repo);
    });
    Object.entries(data.commits).map(([commit, {top, repo, metadata:{name, story}, writable}])=>{
        d.commit.set(commit, {repo, name, story, writable, nodes:new Set()});
        d.repo.get(repo).commits.add(commit);
        d.dropped.commit.delete(commit);
        d.closed.commit.delete(commit);
        if(top) d.target.commit(d, commit);
    });
    const nodes = Object.entries(data.nodes);
    nodes.map(([node])=>{
        const commit = node.slice(0, 16);
        d.make.node(d, {node, commit, given:true});
    });
    nodes.map(([node, terms])=>{
        for(const [term, stems] of Object.entries(terms)){
            if(!stems.length) d.make.edge(d, {root:node, term, given:true}); // making empty term
            for(const stem of stems){
                d.make.edge(d, {root:node, term, stem, given:true});
                if(term == 'delimit_app'){
                    d.make.edge(d, {root:d.entry, term:'app', stem:node, given:true, single:true});
                }
            }
        }
    });
    d.graph.increment(d);
};

export const send_data = (d, patches) => { 
    const make_nodes = new Map();
    const close_nodes = new Set();
    const drop_nodes = new Set();
    function handle_node({path, op}){
        const node = path[1];
        if(d.node.has(node)){
            make_nodes.set(node, Object.fromEntries(d.node.get(node).terms)); 
        }else if(d.closed.node.has(node)){
            close_nodes.add(node);
        }else if(d.dropped.node.has(node) || path.length == 2){
            drop_nodes.add(node);
        }
    }
    // function handle_repo({path}){
    //     const repoId = path[1];
    //     if(d.dropped.repo.has(repoId)){
    //         d.server.drop_repo({variables:{repoId}});
    //     }
    // }
    for(const patch of patches){ 
        if(patch.path[0] == 'node' && patch.path[2] != 'back') handle_node(patch);
        //if(patch.path[0] == 'repo') handle_repo(patch);
    }
    if(make_nodes.size){
        const nodes = JSON.stringify(Object.fromEntries(make_nodes));
        //console.log('push node', nodes);
        d.server.make_nodes({variables:{nodes}}); 
    }
    if(close_nodes.size){
        //console.log('shut node', close_nodes);
        d.server.close_nodes({variables:{nodes:[...close_nodes]}});
    }
    if(drop_nodes.size){
        //console.log('drop node', drop_nodes);
        d.server.drop_nodes({variables:{nodes:[...drop_nodes]}});
    }
};


// if(op == 'add' || op == 'replace'){
//     if(d.node.has(node)){
//         make_nodes.set(node, Object.fromEntries(d.node.get(node).terms)); // push_node(d.node.get(node));
//     }
//     // }else if(path.length == 2){
//     //     console.log('undo send push node');
//     //     console.log(value);
//     //     //push_nodes.set(node, Object.fromEntries(value)); // push_node(value);
//     // }
// }else if(op == 'remove'){
//     if(d.closed.node.has(node)){
//         console.log('send close node');
//         close_nodes.add(node);
//     }else if(d.dropped.node.has(node) || path.length == 2){
//         console.log('send drop node');
//         drop_nodes.add(node);
//     }
// }