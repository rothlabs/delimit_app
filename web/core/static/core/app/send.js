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

handle.nodes = (d, {op, path, id, make_nodes, drop_nodes}) => {
    if(d.nodes.has(id)){
        make_nodes.set(id, Object.fromEntries(d.nodes.get(id).terms)); 
    }else if(d.dropped.node.has(id) || (op=='remove' && !d.closed.node.has(id) && path.length == 2)){ 
        drop_nodes.add(id);
    }
}

handle.repos = (d, {op, path, id}) => {
    if(['name', 'story'].includes(path[2])){
        d.server.edit_repo({variables:{
            id,
            name:   d.repos.get(id).name,
            story:  d.repos.get(id).story,
        }});
    }else if(op=='remove' && !d.closed.repo.has(id) && path.length == 2){
        d.server.drop_repo({variables:{id}});
    }
}

handle.versions = (d, {op, path, id, drop_versions}) => {
    if(['name', 'story'].includes(path[2])){
        d.server.edit_version({variables:{
            id,
            name:  d.versions.get(id).name,
            story: d.versions.get(id).story,
        }});
    }else if(op=='remove' && !d.closed.version.has(id) && path.length == 2){
        drop_versions.add(id);
    }
}