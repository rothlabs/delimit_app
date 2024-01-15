export const make_common_slice = get_draft => ({
    will_cycle({root, stem, draft=get_draft()}){
        if(root == stem) return true;
        if(!draft.nodes.has(stem)) return;
        for(const [_, next_stem] of draft.get_edges({root:stem, exclude_leaves:true})){
            if(root == next_stem) return true;
            else return draft.will_cycle({root, stem:next_stem});
        }
    },
    get_edges: function* ({root, exclude_leaves, draft=get_draft()}){ 
        for(const [term, stems] of draft.nodes.get(root).terms){
            for(let index = 0; index < stems.length; index++){
                const stem = stems[index];
                if(!(exclude_leaves && stem.type)) yield [term, stem, index];
            }
        }
    },
    get_back_edges: function* ({stem, draft=get_draft()}){
        for(const root of draft.nodes.get(stem).roots){
            for(const [term, stems] of draft.nodes.get(root).terms){
                for(let index = 0; index < stems.length; index++){
                    if(stems[index] == stem) yield [root, term, index];
                }
            }
        }
    },
    get_stem({root, draft=get_draft(), ...term_paths}){
        for(const term_path of draft.get_iterable(term_paths)){ // term_paths.term ?? term_paths.terms
            try{
                for(const term of term_path.split(' ')){
                    root = draft.nodes.get(root).terms.get(term)[0];
                }
                return root;
            }catch{}
        }
    },
    get_leaf({root, alt, draft=get_draft(), ...term_paths}){  // get_leaf(d, {root, alt, ...term_paths}){ 
        const stem = draft.get_leaf_box({root, ...term_paths});
        if(stem) return stem.value;
        return alt;
    },
    get_leaf_box({root, draft=get_draft(), ...term_paths}){
        for(const term_path of draft.get_iterable(term_paths)){
            let item = root;
            try{
                for(const term of term_path.split(' ')){
                    item = draft.nodes.get(item).terms.get(term)[0];
                }
                if(item.type) return item; 
                item = draft.nodes.get(item).terms.get('leaf')[0];
                if(item.type) return item; 
            }catch{}
        }
    },
    leaf_changed({root, patch:{op, path}, draft=get_draft(), ...term_paths}){
        for(const term_path of draft.get_iterable(term_paths)){
            for(const term of term_path.split(' ')){
                if(!draft.get_leaf({root, term})) continue;
                if(path[0] != 'nodes' || path[1] != root) continue;
                if(path.length === 2 && op == 'add') return true;
                if(path[3] == term) return true;
            }
        }
    },
    get_new_id,
    get_iterable,
});

function get_new_id(length=16){
    let result = '';
    Array.from({length}).some(() => {
        result += Math.random().toString(36).slice(2); // always hear that Math.random is not good for id generation
        return result.length >= length;
    });
    return result.substring(0, length);
};

function get_iterable(i){
    i = i.id ?? i.ids ?? i.node ?? i.nodes ?? i.root ?? i.roots ?? i.term ?? i.terms
        ?? i.repo ?? i.repos ?? i.version ?? i.versions ?? i.scene ?? i.scenes ?? i;
    if(i == null) return [];
    if(typeof i === 'string') return [i];
    if(typeof i[Symbol.iterator] === 'function') return i;
    return [i];
}



    // set_leaf({root, term, value, draft=get_draft()}){
    //     if(!draft.nodes.get(root)) return;
    //     let stem = draft.get_leaf_box({root, term}) // const leaf = draft.nodes.get(root).terms.get(term)[index];
    //     if(stem) stem.value = value;
    //     else stem = {type:'', value}; 
    //     if(typeof value === 'string') stem.type = 'string';
    //     else if(typeof value === 'boolean') stem.type = 'boolean';
    //     else if(typeof value === 'number' && !(stem.type == 'integer' || stem.type == 'decimal')){
    //         stem.type = 'decimal';
    //         if(Number.isInteger(value)) stem.type = 'integer'
    //     }
    //     draft.make.edge({root, term, stem});
    // },


// get_leaf({root, alt, draft=get_draft(), ...term_paths}){  // get_leaf(d, {root, alt, ...term_paths}){ 
//     for(const terms of draft.get_iterable(term_paths)){
//         try{
//             const leaf = get_leaf_box({root, terms});
//             if(leaf.type) return leaf.value;
//         }catch{}
//     }
//     return alt;
// },

    // exclude_leaves
    // get_edges_without_leaves: function* ({root, leaf, draft=get_draft()}){
    //     for(const [term, stems] of draft.nodes.get(root).terms){
    //         for(let index = 0; index < stems.length; index++){
    //             const stem = stems[index];
    //             if(!stem.type || leaf) yield [term, stem, index];
    //         }
    //     }
    // },

// function* get_edges_base({root, draft}){
//     for(const [term, stems] of draft.nodes.get(root).terms){
//         for(let index = 0; index < stems.length; index++){
//             const stem = stems[index];
//             if(!stem.type || leaf) yield [term, stem, index];
//         }
//     }
// }