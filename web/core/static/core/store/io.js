export const receive_data = (d, data) => {// change to receive patches directly from server    must check if this data has been processed already, use d.make.part, d.make.edge, etc!!!!!!
    Object.entries(data.repos).map(entry => d.make.repo(d, entry));
    Object.entries(data.versions).map(entry => d.make.version(d, entry));
    const nodes = Object.entries(data.nodes);
    nodes.map(([node]) => {
        const version = node.slice(0, 16);
        d.make.node(d, {node, version, given:true});
    });
    nodes.map(([node, terms]) => {
        for(const [term, stems] of Object.entries(terms)){
            if(!stems.length) d.make.edge(d, {root:node, term, given:true}); 
            stems.map(stem => d.make.edge(d, {root:node, term, stem, given:true}));
        }
    });
    d.graph.increment(d);
};

const handle = {};

export const send_changes_to_server = (d, patches) => { 
    const maps = {make_nodes:new Map(), drop_nodes:new Set(), drop_versions:new Set()};
    patches.map(patch => handle.patch(d, patch, maps));
    if(maps.make_nodes.size){
        const nodes = JSON.stringify(Object.fromEntries(maps.make_nodes));
        d.server.make_nodes({variables:{nodes}}); 
    }
    if(maps.drop_nodes.size)    
        d.server.drop_nodes({variables:{ids:[...maps.drop_nodes]}});
    if(maps.drop_versions.size) 
        d.server.drop_versions({variables:{ids:[...maps.drop_versions]}});
};

handle.patch = (d, patch, maps) => {
    const {path} = patch;
    if(['back', 'versions'].includes(path[2])) return;
    const id = path[1];
    if(handle[path[0]]) handle[path[0]](d, {...patch, ...maps, id});
}

handle.node = (d, {op, path, id, make_nodes, drop_nodes}) => {
    if(d.node.has(id)){
        make_nodes.set(id, Object.fromEntries(d.node.get(id).terms)); 
    }else if(d.dropped.node.has(id) || (op=='remove' && !d.closed.node.has(id) && path.length == 2)){ 
        drop_nodes.add(id);
    }
}

handle.repo = (d, {op, path, id}) => {
    if(['name', 'story'].includes(path[2])){
        d.server.edit_repo({variables:{
            id,
            name:   d.repo.get(id).name,
            story:  d.repo.get(id).story,
        }});
    }else if(op=='remove' && !d.closed.repo.has(id) && path.length == 2){
        d.server.drop_repo({variables:{id}});
    }
}

handle.version = (d, {op, path, id, drop_versions}) => {
    if(['name', 'story'].includes(path[2])){
        d.server.edit_version({variables:{
            id,
            name:  d.version.get(id).name,
            story: d.version.get(id).story,
        }});
    }else if(op=='remove' && !d.closed.version.has(id) && path.length == 2){
        drop_versions.add(id);
    }
}







    // for(const node of context_nodes){
    //     for(const [term, stem] of d.terms(d, node, {leaf:true})){
    //         if(!(term=='root' && stem.type=='boolean' && stem.value===true)) continue;
    //         d.make.edge(d, {root:d.entry, term:'contexts', stem:node, given:true, single:true});
    //     }
    // }


// if(term == 'delimit_app'){
//     d.make.edge(d, {root:d.entry, term:'app', stem:node, given:true, single:true});
// }



// handlers.repo = ({path}) => {
//     if(path.length < 3 || path[2] == 'versions') return;
//     if(!['name', 'story'].includes(path[2])) return;
//     const repo = path[1];
//     d.server.edit_repo({variables:{
//         id: repo,
//         name:   d.repo.get(repo).name,
//         story:  d.repo.get(repo).story,
//     }});
// }
// handlers.version = ({path}) => {
//     if(path.length < 3 || path[2] == 'nodes') return;
//     if(!['name', 'story'].includes(path[2])) return;
//     const version = path[1];
//     d.server.edit_version({variables:{
//         id:    version,
//         name:  d.version.get(version).name,
//         story: d.version.get(version).story,
//     }});
// }


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