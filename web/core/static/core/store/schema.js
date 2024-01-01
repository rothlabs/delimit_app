import {snake_case} from 'delimit';

export const schema = {};

schema.root_type = {
    logic(d, root){ 
        const type = d.stem(d, root, 'type'); // d.node.get(root).terms.get('type')[0];
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
    for(const term_type of d.stems(d, root_type, ['make', 'required'])){
        d.build.term(d, root, term_type);
    }
}

build.term = (d, root, term_type) =>{
    const term = snake_case(d.value(d, term_type, 'name'));
    d.make.edge(d, {root, term});
    for(const stem of d.stems(d, term_type, 'add')){
        d.make.edge(d, {root, term, stem});
    }
    for(const stem of d.stems(d, term_type, 'make')){
        d.build.stem(d, {root, term, stem});
    }
}

build.stem = (d, {root, term, stem}) =>{
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
                    const stem = d.make.node(d, {type, commit:'target'});
                    d.make.edge(d, {root, term, stem});
                    return true;
                }
            }
        }
    }
}