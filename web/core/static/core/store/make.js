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

// d.get.root_context_nodes(d)

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


// function get_auto_edge({root, stem, scene, draft=get_draft()}){
//     const default_term = draft.get_leaf({root, terms:['type default_term', 'default_term']}); //draft.get_default_term({root});
//     if(default_term) return [get_snake_case(default_term), null];
//     const stem_type_name = draft.get_type_name(stem);
//     for(const [term, stem, index] of draft.get_edges({root, exclude_leaves:true})){
//         if(draft.get_type_name(stem) != stem_type_name) continue;
//         if(scene){
//             const mono_vector = draft.scene.get_mono_vector({scene});
//         }
//         return [term, index];
//     }
//     return ['stem', null];
// }














// function build_node_from_type(d, node, type){
//     d.make.edge(d, {root:node, term:'type', stem:type});
//     if(d.get_leaf({root:type, term:'name'}) == 'Root'){
//         for(const [root] of d.get_back_edges({stem:type})){
//             if(d.get_type_name(root) == 'Context'){
//                 d.make.edge(d, {root, term:'types', stem:node});
//             }
//         }
//     }
//     d.schema.make_root(d, node, type);
// };






    // const has_cycle = node => {
    //     if(root == node) return true;
    //     if(!d.nodes.has(node)) return;
    //     for(const [_, stem] of d.get_edges(d, node)){
    //         if(root == stem) return true;
    //         else return has_cycle(stem);
    //     }
    // }




// if(stem == null & !length){
//     terms.set(term, []); 
//     return;
// }

// if(!given && length == 1 && stem != stems[0] && d.nodes.has(stems[0]) && d.nodes.get(stems[0]).terms.size == 0){
//     d.drop.edge(d, {root, term, stem:stems[0]}); //d.shut.node(d, {node:stems[0], drop:true});
//     length = 0;
// }





//term = get_snake_case(term);//term.toLowerCase().replace(/ /g,'_');



// function build(d, node, type){
//     if(d.target.node) d.make.edge(d, d.target.node, 'stem', node);
//     d.make.edge(d, node, 'type', type);
//     //const type_forw = d.nodes.get(type).terms;
//     function add_or_make_stems(root){
//         // const logics = (d.nodes.get(root).get('required') ?? []).concat(
//         //     type_forw.get('optional') ?? [], 
//         //     type_forw.get('pick_one') ?? [],
//         //     type_forw.get('one_or_more') ?? [],
//         // );
//         const logics = d.get_stems(d, root, ['required', 'optional', 'pick_one', 'one_or_more']);
//         for(const logic of logics){ // needs to be recursive
//             //try{
//                 const logic_type = d.face.type(d, logic);
//                 if(logic_type == 'Root'){
//                     add_or_make_stems(logic);
//                 }else if(logic_type == 'Term'){
//                     const term = d.get_leaf(d, logic, 'name', '');//.toLowerCase().replace(/ /g,'_'); //stem_obj.terms('term')[0].value.toLowerCase().replace(/ /g,'_');
//                     if(!term.length) continue;
//                     for(const to_be_made of d.get_stems(d, logic, 'make')){ // d.nodes.get(logic).terms.get('make')
//                         //console.log('trying to make stem', term);
//                         if(to_be_made.type){
//                             d.make.edge(d, node, term, {...to_be_made});
//                         }else if(d.face.type(d, to_be_made) == 'Stem'){
//                             console.log('find type of same name in same namespace, make instance, make edge');
//                             // find type of same name in same namespace, make instance, make edge
//                         }else{
//                             const stem = d.make.node(d, {type:to_be_made});
//                             d.make.edge(d, node, term, stem);   
//                         }
//                     }
//                     for(const stem of d.get_stems(d, logic, 'add')){
//                         if(!stem.type) d.make.edge(d, node, term, stem);
//                     }
//                 }
//             //}catch{}
//         }
//     }
//     add_or_make_stems(type);
//     if(d.face.type(d, node) == 'Root'){ //if(d.get_leaf(d, type, 'name') == 'Root'){//if(d.get_leaf(d, type, 'tag') == 'Type'){
//         for(const delimit of d.get_stems(d, d.entry, 'delimit')){
//             if(d.nodes.get(delimit).repo == d.target.repo){
//                 d.make.edge(d, delimit, 'types', node);
//             }
//         }
//     }
// };