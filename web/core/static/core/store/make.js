import {make_id} from 'delimit';

export const make = {};

make.node = (d, {node, commit='none', given, type})=>{
    if(commit == 'targeted') commit = d.targeted.commit; 
    node = node ?? commit + make_id();
    if(!(given || d.writable(d, node))) return;
    d.drop.edge(d, {root:node, given}); 
    let back = new Set();
    if(d.node.has(node)) back = d.node.get(node).back;
    d.node.set(node, {
        commit,
        terms: new Map(),
        back,            
    });
    if(d.commit.has(commit)) d.commit.get(commit).nodes.add(node);
    if(type) build(d, node, type);
    d.dropped.node.delete(node);
    d.closed.node.delete(node);
    d.graph.increment(d);
    return node;
};

make.edge = (d, {root, term='stem', stem, index, given, single})=>{ // make named args //  if somehow this is called without permission, the server should kick back with failed 
    if(!d.node.has(root)) return; //  && (stem.type || d.node.has(stem)))
    if(!(given || d.writable(d, root))) return;
    const terms = d.node.get(root).terms;
    let stems = terms.get(term);
    let length = stems?.length ?? 0;
    if(stem == null){
        if(!length) terms.set(term, []); 
        return;
    }
    function cycle(node){
        if(node == root) return true;
        if(!d.node.has(node)) return;
        for(const [term, stem] of d.terms(d, node)){
            if(stem == root){
                return true;
            }else{
                if(cycle(stem)) return true;
            }
        }
    }
    if(cycle(stem)){
        console.log('Error: Cannot make edge because it would cause a cycle in the graph.');
        console.log({root:d.face.title(d, root), term, stem:d.face.title(d, stem)});
        return;
    }
    if(!length) terms.set(term, []); 
    if(single && terms.get(term).includes(stem)) return;
    index = index ?? length; 
    if(index > length) return; //  || length >= a.max_length 
    terms.get(term).splice(index, 0, stem); 
    if(d.node.has(stem)){
        d.node.get(stem).back.add(root); //if(!stem.type) d.node.get(stem).back.add(root);
        d.graph.increment(d);
    }
    return true;
};


function build(d, root, type){
    ////////if(d.target.node) d.make.edge(d, d.target.node, 'stem', root);
    d.make.edge(d, {root, term:'type', stem:type});
    if(d.type_name(d, root) == 'Root'){ //if(d.value(d, type, 'name') == 'Root'){//if(d.value(d, type, 'tag') == 'Type'){
        for(const context of d.stems(d, d.entry, 'app contexts')){
            if(d.node.get(context).commit == d.targeted.commit){ // if(d.node.get(context).repo == d.target.repo){
                d.make.edge(d, {root:context, term:'types', stem:root});
            }
        }
    }
    d.build.root(d, root, type);
};



// if(stem == null & !length){
//     terms.set(term, []); 
//     return;
// }

// if(!given && length == 1 && stem != stems[0] && d.node.has(stems[0]) && d.node.get(stems[0]).terms.size == 0){
//     d.drop.edge(d, {root, term, stem:stems[0]}); //d.shut.node(d, {node:stems[0], drop:true});
//     length = 0;
// }





//term = snake_case(term);//term.toLowerCase().replace(/ /g,'_');



// function build(d, node, type){
//     if(d.target.node) d.make.edge(d, d.target.node, 'stem', node);
//     d.make.edge(d, node, 'type', type);
//     //const type_forw = d.node.get(type).terms;
//     function add_or_make_stems(root){
//         // const logics = (d.node.get(root).get('required') ?? []).concat(
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
//                     for(const to_be_made of d.stems(d, logic, 'make')){ // d.node.get(logic).terms.get('make')
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
//             if(d.node.get(delimit).repo == d.target.repo){
//                 d.make.edge(d, delimit, 'types', node);
//             }
//         }
//     }
// };