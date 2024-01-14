import {get_draft, is_formal_node_id} from 'delimit/graph';

export const drop = {};

drop.node = ({deep, draft=get_draft(), ...ids})=>{  
    let targets = new Set();
    for(const id of draft.get_iterable(ids)){
        if(draft.nodes.has(id)) targets.add(id);
    }
    if(deep){
        function get_stems(nodes){
            const next_nodes = new Set();
            for(const node of nodes){
                for(const [_, stem] of draft.get_edges({root:node, exclude_leaves:true})){ 
                    if(!draft.nodes.has(stem)) continue;
                    if([...draft.nodes.get(stem).roots].every(root=> targets.has(root))){
                        targets.add(stem);
                        next_nodes.add(stem);
                    }
                }
            }
            if(next_nodes.size) get_stems(next_nodes);
        };
        get_stems(targets);
    }
    targets = targets.filter(target => is_formal_node_id(target));
    for(const node of targets){
        if(!draft.nodes.has(node)) continue;
        draft.drop.edge({root:node});
        draft.drop.edge({stem:node});
        draft.nodes.delete(node);
    }
};


drop.edge = ({root, term, stem, index, draft=get_draft()}) => {
    //console.log('drop edge');
    let drops = []; 
    function forward_edge(func){
        if(!draft.nodes.has(a.root)) return {};
        for(const [term, stem, index] of draft.get_edges({root:a.root})){ // draft.flat(draft.nodes.get(a.root).terms)
            func({root:a.root, term, stem, index});
        }
    }
    if(root && term && stem && index != null){
        drops.push({root, term, stem, index}); 
    }else if(root && term && stem){
        forward_edge(edge=> edge.term==term && edge.stem==stem && drops.push(edge));
    }else if(root && term && !stem){
        const terms = draft.nodes.get(root).terms;
        if(terms.has(term) && !terms.get(term).length){
            terms.delete(term); 
            return;
        }
        forward_edge(edge=> edge.term==term && drops.push(edge));
    }else if(root && stem){
        forward_edge(edge=> edge.stem==stem && drops.push(edge));
    }else if(root){  
        forward_edge(edge=> drops.push(edge));
    }else if(stem){
        if(!draft.nodes.has(stem)) return;
        for(const [root, term, index] of draft.get_back_edges(draft, stem)){ 
            drops.push({root, term, stem, index});
        }
    }
    if(!a.given) drops = drops.filter(drp=> draft.writable(draft, drp.root));
    drops.sort((a, b)=> b.index - a.index);
    let increment = false;
    for(const {root, term, stem, index} of drops){
        if(!draft.nodes.has(root)) continue;
        const terms = draft.nodes.get(root).terms;
        if(!terms.has(term)) continue;
        const stems = terms.get(term);
        if(index >= stems.length) continue;
        //if(term=='type' && stem.value=='Context') draft.context_nodes.delete(root);
        stems.splice(index, 1);
        draft.add_or_remove_as_context_node(draft, root);
        draft.scene.add_or_remove_source(draft, {root, given:a.given});
        increment = true;
        // if(!stems.length){
        //     if(a.placeholder){
        //         const empty = draft.make.node(draft, {});
        //         draft.make.edge(draft, {...drp, stem:empty});
        //     }else{
        //         terms.delete(drp.term);
        //     }
        // }
    }
    
    for(const drp of drops){
        if(!draft.nodes.has(drp.stem)) continue;
        let drop_back = true;
        for(const [_, stem] of draft.get_edges({root:drp.root, exclude_leaves:true})){
            if(stem == drp.stem) drop_back = false;
        }
        if(drop_back){
            const stem = draft.nodes.get(drp.stem);
            stem.roots.delete(drp.root); // (drp.root+':'+drp.term+':'+drp.index);
            increment = true;
            //if(!a.given && stem.back.size < 1 && stem.terms.size < 1) draft.drop.node(draft, {nodes:drp.stem});
            if(is_formal_node_id(drp.root) && !is_formal_node_id(drp.stem)) draft.drop.node(draft, {nodes:drp.stem});
        }
    }
};