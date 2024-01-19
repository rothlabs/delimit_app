import {get_snake_case} from 'delimit';

export const schema = {};

schema.root_type = {
    logic(d, root){ 
        const type = d.get_stem({root, term:'type'}); // d.nodes.get(root).terms.get('type')[0];
        if(!d.nodes.has(type)) return true;
        function truths(logic_type){
            let truth_count = 0;
            const stems = d.get_stems({root:type, term:logic_type});
            for(const stem of stems){
                const stem_type = d.get_type_name(lgc);
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

schema.make_root = (d, root, root_type) => {
    for(const term_type of d.get_stems({root:root_type, terms:['make', 'required']})){
        d.schema.make_term(d, root, term_type);
    }
}

schema.make_term = (d, root, term_type) =>{
    const term = get_snake_case(d.get_leaf({root:term_type, term:'name', alt:'no_term'}));
    d.make.edge(d, {root, term});
    for(const stem of d.get_stems({root:term_type, term:'add'})){
        d.make.edge(d, {root, term, stem});
    }
    for(const stem of d.get_stems({root:term_type, term:'make'})){
        d.schema.make_stem(d, {root, term, stem});
    }
}

schema.make_stem = (d, {root, term, stem}) =>{
    if(stem.type){
        d.make.edge(d, {root, term, stem:{...stem}});
        return true;
    }
    const stem_type_name = d.get_leaf({root:stem, term:'name'});
    const stem_type_context = d.get_leaf({root:stem, term:'context'});
    for(const context of d.get.root_context_nodes(d)){ 
        if(stem_type_context == d.get_leaf({root:context, term:'name'})){
            for(const type of d.get_stems({root:context, term:'types'})){
                if(stem_type_name == d.get_leaf({root:type, term:'name'})){ 
                    const stem = d.make.node({type, version:'targeted'});
                    d.make.edge(d, {root, term, stem});
                    return true;
                }
            }
        }
    }
}

