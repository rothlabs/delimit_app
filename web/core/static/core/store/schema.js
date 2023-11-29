export const schema = {};

schema.root_type = {
    logic(d, root){ 
        const type = d.stem(d, root, 'type'); // d.node.get(root).forw.get('type')[0];
        if(!d.node.has(type)) return true;
        function truths(logic_type){
            let truth_count = 0;
            const stems = d.stems(d, type, logic_type);
            for(const stem of stems){
                const stem_type = d.face.type(d, lgc);
                if(stem_type == 'root' && d.root_type.logic(d, stem)) truth_count++;
                if(stem_type == 'term' && d.term_type.logic(d, stem)) truth_count++;
            }
            return [stems.length, truth_count];
        }
        [stem_count, truth_count] = truths('required');
        if(stem_count > truth_count) return;
        [stem_count, truth_count] = truths('exactly_one');
        if(stem_count > 0 && truth_count != 1) return;
        [stem_count, truth_count] = truths('one_or_more');
        if(stem_count > 0 && truth_count < 1) return;
        return true;
    },
};