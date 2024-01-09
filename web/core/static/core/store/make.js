import {make_id} from 'delimit';

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
    if(top) d.pick(d, {item:{version}});
}

make.node = (d, {node, version='none', given, type})=>{
    if(version == 'targeted') version = d.get.targeted.version(d); 
    node = node ?? version + make_id();
    if(!(given || d.writable(d, node))) return;
    d.drop.edge(d, {root:node, given}); 
    let back = new Set();
    if(d.nodes.has(node)) back = d.nodes.get(node).back;
    d.nodes.set(node, {
        version,
        terms: new Map(),
        back,            
    });
    if(d.versions.has(version)) d.versions.get(version).nodes.add(node);
    if(type) build_node_from_type(d, node, type);
    d.dropped.node.delete(node);
    d.closed.node.delete(node);
    d.graph.increment(d);
    return node;
};

make.edge = (d, {root, term='stem', stem, index, given, single})=>{ // make named args //  if somehow this is called without permission, the server should kick back with failed 
    if(!d.nodes.has(root)) return; //  && (stem.type || d.nodes.has(stem)))
    if(!(given || d.writable(d, root))) return;
    const terms = d.nodes.get(root).terms;
    let stems = terms.get(term);
    let length = stems?.length ?? 0;
    if(stem == null){
        if(!length) terms.set(term, []); 
        return;
    }
    const has_cycle = node => {
        if(root == node) return true;
        if(!d.nodes.has(node)) return;
        for(const [_, stem] of d.terms(d, node)){
            if(root == stem) return true;
            else return has_cycle(stem);
        }
    }
    if(has_cycle(stem)){
        console.log('Error: Cannot make edge because it would cause a cycle in the graph.');
        return;
    }
    if(!length) terms.set(term, []); 
    if(single && terms.get(term).includes(stem)) return;
    index = index ?? length; 
    if(index > length) return; //  || length >= a.max_length 
    terms.get(term).splice(index, 0, stem); 
    d.add_or_remove_as_context_node(d, root); //if(term=='type' && stem.value=='Context') d.context_nodes.add(root);
    if(d.nodes.has(stem)){
        d.nodes.get(stem).back.add(root); //if(!stem.type) d.nodes.get(stem).back.add(root);
        d.graph.increment(d);
    }
    return true;
};

function build_node_from_type(d, node, type){
    d.make.edge(d, {root:node, term:'type', stem:type});
    //const type_name = d.get.node.type_name(d, type)
    if(d.value(d, type, 'name') == 'Root'){//if(type_name == 'Root'){ /// || (type_name=='' && d.value(d, type, 'name') == 'Root')
        for(const [root] of d.back(d, type)){
            if(d.get.node.type_name(d, root) == 'Context'){
                d.make.edge(d, {root, term:'types', stem:node});
            }
        }
    }
    d.build.root(d, node, type);
};



// if(stem == null & !length){
//     terms.set(term, []); 
//     return;
// }

// if(!given && length == 1 && stem != stems[0] && d.nodes.has(stems[0]) && d.nodes.get(stems[0]).terms.size == 0){
//     d.drop.edge(d, {root, term, stem:stems[0]}); //d.shut.node(d, {node:stems[0], drop:true});
//     length = 0;
// }





//term = snake_case(term);//term.toLowerCase().replace(/ /g,'_');



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
//         const logics = d.stems(d, root, ['required', 'optional', 'pick_one', 'one_or_more']);
//         for(const logic of logics){ // needs to be recursive
//             //try{
//                 const logic_type = d.face.type(d, logic);
//                 if(logic_type == 'Root'){
//                     add_or_make_stems(logic);
//                 }else if(logic_type == 'Term'){
//                     const term = d.value(d, logic, 'name', '');//.toLowerCase().replace(/ /g,'_'); //stem_obj.terms('term')[0].value.toLowerCase().replace(/ /g,'_');
//                     if(!term.length) continue;
//                     for(const to_be_made of d.stems(d, logic, 'make')){ // d.nodes.get(logic).terms.get('make')
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
//                     for(const stem of d.stems(d, logic, 'add')){
//                         if(!stem.type) d.make.edge(d, node, term, stem);
//                     }
//                 }
//             //}catch{}
//         }
//     }
//     add_or_make_stems(type);
//     if(d.face.type(d, node) == 'Root'){ //if(d.value(d, type, 'name') == 'Root'){//if(d.value(d, type, 'tag') == 'Type'){
//         for(const delimit of d.stems(d, d.entry, 'delimit')){
//             if(d.nodes.get(delimit).repo == d.target.repo){
//                 d.make.edge(d, delimit, 'types', node);
//             }
//         }
//     }
// };