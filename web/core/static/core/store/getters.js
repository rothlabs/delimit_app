import {readable, icons} from 'delimit';
import isSvg from 'is-svg';

export const node = {};
node.icon = (d, root) => {
    if(!root) return icons.svg.generic;
    if(root.type) return icons.svg[root.type];
    const icon_string = d.get_leaf({root,  terms:['type icon source', 'icon source'], alt:icons.svg.generic});
    return isSvg(icon_string) ? icon_string : icons.svg.generic;
};
node.name = (d, root) => {
    if(!root) return 'none';
    if(root.type) return (''+root.value).trim().substring(0, 24);
    if(!d.nodes.has(root)) return root;
    if(d.nodes.get(root).terms.size < 1) return 'empty';
    return (''+d.get_leaf({root, terms:['name', 'leaf'], alt:''})).trim().substring(0, 24);
};
node.title = (d, root) => { 
    const type_name = d.get_type_name(root);
    return d.get.node.name(d, root) + (type_name ? ' ('+readable(type_name)+')' : '');
};
node.primary = (d, node)=>({
    icon:       d.get.node.icon(d, node),
    name:       d.get.node.name(d, node), 
    type_name:  d.get_type_name(node), 
});
node.version = (d, node) => {
    if(!d.nodes.has(node)) return;
    return d.nodes.get(node).version;
};


const get_color = (d, node, both, primary, secondary, alt) => {
    const pmry_pick = d.picked.primary.node.has(node);
    const scnd_pick = d.picked.secondary.node.has(node);
    if(pmry_pick && scnd_pick) return both;
    if(pmry_pick) return primary;
    if(scnd_pick) return secondary;
    return alt;
}
node.color = {
    primary:(d, node) => get_color(d, node, d.color.body_fg, d.color.primary, d.color.secondary, d.color.info),
};
node.material = {
    primary:(d, node) => get_color(d, node, d.material.body_fg, d.material.primary, d.material.secondary, d.material.info),
    shaded:(d, node) => get_color(d, node, d.shaded.gray, d.shaded.primary, d.shaded.secondary, d.shaded.info),
};


export const repo = {};
repo.name = (d, repo) => {
    if(!d.repos.has(repo)) return repo;
    return d.repos.get(repo).name;
};
repo.story = (d, repo) => {
    if(!d.repos.has(repo)) return '';
    return d.repos.get(repo).story;
};
repo.isPublic = (d, repo) => {
    if(!d.repos.has(repo)) return false;
    return d.repos.get(repo).isPublic;
};
repo.writable = (d, repo) => {
    if(!d.repos.has(repo)) return false;
    return d.repos.get(repo).writable;
};
repo.versions = (d, repo) => {
    if(!d.repos.has(repo)) return [];
    return [...d.repos.get(repo).versions];
};
repo.main_version = (d, repo) => {
    const result = d.get.repo.versions(d, repo).find(version => {
        return (d.versions.get(version).name == 'Main')
    });
    if(result) return result;
    return 'missing';
};

export const version = {};
version.name = (d, version) => {
    if(!d.versions.has(version)) return version;
    return d.versions.get(version).name;
};
version.story = (d, version) => {
    if(!d.versions.has(version)) return '';
    return d.versions.get(version).story;
};
version.isPublic = (d, version) => {
    if(!d.versions.has(version)) return false;
    return d.versions.get(version).isPublic;
};
version.writable = (d, version) => {
    if(!d.versions.has(version)) return false;
    return d.versions.get(version).writable;
};
version.repo = (d, version) => {
    if(!d.versions.has(version)) return;
    return d.versions.get(version).repo;
};

export const targeted = {};
targeted.version = d => {
    const version = d.picked.primary.version.keys().next().value;
    if(d.versions.has(version)) return version;
};

export const picked_context = d => {
    const {root, term} = d.picked_context;
    if(!d.nodes.has(root)) return {};
    if(!d.nodes.get(root).terms.has(term)) return {};
    return {root, term};
};

export const root_context_nodes = d => {
    const result = new Set();
    for(const node of d.context_nodes){
        let is_root_context = true;
        for(const [root, term] of d.get_back_edges({stem:node})){
            if(term == 'contexts' && d.get_type_name(root) == 'Context'){
                is_root_context = false;
            }
        }
        if(is_root_context) result.add(node);
    }
    return [...result];
}

export const blog_post = d => {
    for(const node of d.context_nodes){
        for(const [term, stem] of d.get_edges({root:node})){
            if(term == 'blog_post') return stem;
        }
    }
}