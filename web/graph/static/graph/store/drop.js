import {get_draft, is_formal_node_id} from 'delimit/graph';
//import {is_formal_node_id} from 'delimit/common';

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
    targets = targets.filter(target => !is_formal_node_id(target));
    for(const node of targets){
        if(!draft.nodes.has(node)) continue;
        draft.drop.edge({root:node});
        draft.drop.edge({stem:node});
        draft.nodes.delete(node);
    }
};

drop.edge = ({root, term, stem, index, draft=get_draft()}) => {
    //console.log('graph app drop edge');
    let drops = []; 
    function forward_edge(func){
        if(!draft.nodes.has(root)) return {};
        for(const [term, stem, index] of draft.get_edges({root})){ // draft.flat(draft.nodes.get(root).terms)
            func({root, term, stem, index});
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
        for(const [root, term, index] of draft.get_back_edges({stem})){ 
            drops.push({root, term, stem, index});
        }
    }
    drops = drops.filter(({root}) => !is_formal_node_id(root)); 
    drops.sort((a, b)=> b.index - a.index);
    for(const {root, term, stem, index} of drops){
        if(!draft.nodes.has(root)) continue;
        const terms = draft.nodes.get(root).terms;
        if(!terms.has(term)) continue;
        const stems = terms.get(term);
        if(index >= stems.length) continue;
        stems.splice(index, 1);
    }
    for(const drp of drops){
        if(!draft.nodes.has(drp.stem)) continue;
        let drop_back = true;
        for(const [_, stem] of draft.get_edges({root:drp.root, exclude_leaves:true})){
            if(stem == drp.stem) drop_back = false;
        }
        if(drop_back){
            const stem = draft.nodes.get(drp.stem);
            stem.roots.delete(drp.root); 
        }
    }
};