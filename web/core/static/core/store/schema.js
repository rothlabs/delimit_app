import {snake_case} from 'delimit';

export const schema = {};

schema.root_type = {
    logic(d, root){ 
        const type = d.stem(d, root, 'type'); // d.node.get(root).forw.get('type')[0];
        if(!d.node.has(type)) return true;
        function truths(logic_type){
            let truth_count = 0;
            const stems = d.stems(d, type, logic_type);
            for(const stem of stems){
                const stem_type = d.type_name(d, lgc);
                if(stem_type == 'root' && d.root_type.logic(d, stem)) truth_count++;
                if(stem_type == 'term' && d.term_type.logic(d, stem)) truth_count++;
            }
            return [stems.length, truth_count];
        }
        [stem_count, truth_count] = truths('required');
        if(stem_count > truth_count) return;
        [stem_count, truth_count] = truths('pick_one');
        if(stem_count > 0 && truth_count != 1) return;
        [stem_count, truth_count] = truths('one_or_more');
        if(stem_count > 0 && truth_count < 1) return;
        return true;
    },
};

export const build = {};

build.root = (d, root, root_type) =>{
    //console.log('build root', root, root_type);
    for(const term_type of d.stems(d, root_type, ['make', 'required'])){
        d.build.term(d, root, term_type);
    }
}

build.term = (d, root, term_type) =>{
    const term = snake_case(d.value(d, term_type, 'name'));
    //console.log('build term', root, term);
    let empty = true;
    for(const stem of d.stems(d, term_type, 'add')){
        if(d.make.edge(d, {root, term, stem})) empty = false;
    }
    for(const stem of d.stems(d, term_type, 'make')){
        if(d.build.stem(d, {root, term, stem})) empty = false;
    }
    if(empty){
        const empty = d.make.node(d, {});
        d.make.edge(d, {root, term, stem:empty});
    }
}

build.stem = (d, {root, term, stem}) =>{
    //term = snake_case(term);
    //console.log('build stem', root, term, stem);
    if(stem.type){
        d.make.edge(d, {root, term, stem:{...stem}});
        return true;
    }
    const stem_type_name = d.value(d, stem, 'name');
    const stem_type_context = d.value(d, stem, 'context');
    for(const context of d.stems(d, d.entry, 'app contexts')){
        if(stem_type_context == d.value(d, context, 'name')){
            for(const type of d.stems(d, context, 'types')){
                if(stem_type_name == d.value(d, type, 'name')){ // d.face.name(d, type)
                    const stem = d.make.node(d, {type});
                    d.make.edge(d, {root, term, stem});
                    return true;
                }
            }
        }
    }
    // console.log(a.type_name, a.context);
    // if(a.type_name){
    //     for(const type of d.stems(d, d.entry, 'delimit types')){
    //         if(d.face.type(d, type) != 'Root') continue;
    //         if(d.value(d, type, 'name') != a.type_name) continue;
    //         if(d.value(d, type, 'context') != a.context) continue;
    //         a.type = type;
    //         break;
    //     }
    //     if(!a.type) return;
    // }
}



// function add_or_make_stems(root){
//     const logics = d.stems(d, root, ['required', 'optional', 'pick_one', 'one_or_more']);
//     for(const logic of logics){ // needs to be recursive
//         //try{
//             const logic_type = d.face.type(d, logic);
//             if(logic_type == 'Root'){
//                 add_or_make_stems(logic);
//             }else if(logic_type == 'Term'){
//                 const term = d.value(d, logic, 'name', '');//.toLowerCase().replace(/ /g,'_'); //stem_obj.forw('term')[0].value.toLowerCase().replace(/ /g,'_');
//                 if(!term.length) continue;
//                 for(const to_be_made of d.stems(d, logic, 'make')){ // d.node.get(logic).forw.get('make')
//                     //console.log('trying to make stem', term);
//                     if(to_be_made.type){
//                         d.make.edge(d, target, term, {...to_be_made});
//                     }else if(d.face.type(d, to_be_made) == 'Stem'){
//                         console.log('find type of same name in same namespace, make instance, make edge');
//                         // find type of same name in same namespace, make instance, make edge
//                     }else{
//                         const stem = d.make.node(d, {type:to_be_made});
//                         d.make.edge(d, target, term, stem);   
//                     }
//                 }
//                 for(const stem of d.stems(d, logic, 'add')){
//                     if(!stem.type) d.make.edge(d, target, term, stem);
//                 }
//             }
//         //}catch{}
//     }
// }
// add_or_make_stems(type);