import {get_draft, get_snake_case} from 'delimit';

export const make = {};

make.repo = (d, [repo, {metadata:{name, story}, writable}]) => {
    let versions = new Set()
    if(d.repos.has(repo)) versions = d.repos.get(repo).versions;
    d.repos.set(repo, {name, story, writable, versions});
    d.dropped.repo.delete(repo);
    d.closed.repo.delete(repo);
}

make.version = (d, [version, {top, repo, metadata:{name, story}, writable, committed}]) => {
    let nodes = new Set()
    if(d.versions.has(version)) nodes = d.versions.get(version).nodes;
    d.versions.set(version, {repo, name, story, writable, committed, nodes});
    d.repos.get(repo).versions.add(version);
    d.dropped.version.delete(version);
    d.closed.version.delete(version);
    if(top) d.pick(d, {version});
}

make.node = ({node, version, given, type, draft=get_draft()}) => {
    if(version == 'targeted') version = draft.get.targeted.version(draft); 
    node = node ?? version + draft.get_new_id(); // (version ? (version+make_id()) : make_id(16));
    if(!(given || draft.writable(draft, node))) return;
    draft.drop.edge(draft, {root:node, given}); 
    let roots = new Set();
    if(draft.nodes.has(node)) roots = draft.nodes.get(node).roots;
    draft.nodes.set(node, {
        version,
        terms: new Map(),
        roots,            
    });
    if(draft.versions.has(version)) draft.versions.get(version).nodes.add(node);
    if(type){
        build_node_from_type(draft, node, type);
    }
    draft.dropped.node.delete(node);
    draft.closed.node.delete(node);
    draft.graph.increment(draft);
    draft.scene.increment(draft);
    return node;
};

make.edge = (d, {root, term, stem, index, given, single, scene}) => { // make named args //  if somehow this is called without permission, the server should kick back with failed 
    if(!d.nodes.has(root)) return; 
    if(!(given || d.writable(d, root))) return;
    const terms = d.nodes.get(root).terms;

    if(term == null) [term, index] = get_auto_edge({root, stem, scene});
    if(term == null) return;

    let stems = terms.get(term);
    let length = stems?.length ?? 0;
    if(stem == null){
        if(!length) terms.set(term, []); 
        d.scene.add_or_remove_source(d, {root, given});
        return;
    }
    if(d.will_cycle({root, stem, draft:d})){ 
        console.log('Error: Cannot make edge because it would cause cyclic evaluation.');
        return;
    }
    if(!length) terms.set(term, []); 
    if(single && terms.get(term).includes(stem)) return;
    index = index ?? length;  // TODO: place this before creating empty term?
    if(index > length) return; 
    terms.get(term).splice(index, 0, stem); 
    d.add_or_remove_as_context_node(d, root);
    d.scene.add_or_remove_source(d, {root, given});
    if(d.nodes.has(stem)){
        d.nodes.get(stem).roots.add(root); 
        d.graph.increment(d);
    }
    d.scene.increment(d);
    return true;
};


function build_node_from_type(d, node, type){
    d.make.edge(d, {root:node, term:'type', stem:type});
    const type_name = d.get_leaf({root:type, term:'name'});
    if(type_name == 'Root'){
        for(const root of d.get.root_context_nodes(d)){
            if(d.get.node.version(d, root) == d.get.targeted.version(d)){
                d.make.edge(d, {root, term:'roots', stem:node});
            }
        }
    }
    if(type_name == 'Term'){
        for(const root of d.get.root_context_nodes(d)){
            if(d.get.node.version(d, root) == d.get.targeted.version(d)){
                d.make.edge(d, {root, term:'terms', stem:node});
            }
        }
    }
    d.schema.make_root(d, node, type);
};

function get_auto_edge({root, stem, scene, draft=get_draft()}){
    let default_term = draft.get_leaf({root, terms:['type default_term', 'default_term']}); //draft.get_default_term({root});
    if(!default_term) return ['stem', null];
    default_term = get_snake_case(default_term);
    if(!scene) return [default_term, null];
    draft.pattern_match = {
        key: draft.get_new_id(),
        root,
        term: default_term,
        stem,
    };
    return [null, null];
}