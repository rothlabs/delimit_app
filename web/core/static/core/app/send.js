import {is_formal_node_id} from 'delimit';

const handle = {};

export const send_updates_to_server = (d, patches) => { 
    const pack = {make_nodes:new Map(), drop_nodes:new Set(), drop_versions:new Set(), settings:{includeCodeKeys:false}};
    patches.map(patch => handle.patch(d, patch, pack));
    if(pack.make_nodes.size){
        const nodes = JSON.stringify(Object.fromEntries(pack.make_nodes));
        const {includeCodeKeys} = pack.settings;
        d.server.make_nodes({variables:{nodes, includeCodeKeys}}); 
    }
    if(pack.drop_nodes.size)    
        d.server.drop_nodes({variables:{ids:[...pack.drop_nodes]}});
    if(pack.drop_versions.size) 
        d.server.drop_versions({variables:{ids:[...pack.drop_versions]}});
};

handle.patch = (d, patch, pack) => { // TODO: remove arg mutations
    const {path} = patch;
    if(['roots', 'versions'].includes(path[2])) return;
    const id = path[1];
    if(handle[path[0]]) handle[path[0]](d, {patch, ...pack, id});
}

handle.nodes = (d, {patch, id, make_nodes, drop_nodes, settings}) => {
    if(!is_formal_node_id(id)) return;
    const {op, path} = patch;
    if(d.nodes.has(id)){
        if(extension_changed(d, {id, patch})) settings.includeCodeKeys = true;
        make_nodes.set(id, Object.fromEntries(d.nodes.get(id).terms)); 
    }else if(d.dropped.node.has(id) || (op=='remove' && !d.closed.node.has(id) && path.length == 2)){ 
        drop_nodes.add(id);
    }
}

handle.repos = (d, {patch:{op, path}, id}) => {
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

handle.versions = (d, {patch:{op, path}, id, drop_versions}) => {
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

function extension_changed(d, {id, patch}){
    if(d.get_leaf({root:id, term:'language'}) != 'javascript') return;
    if(!d.leaf_changed({root:id, terms:['source', 'language'], patch})) return;
    return true;
}