import {get_draft} from 'delimit/graph';

export const scene_signatures = new Map();

export function make_scene({source, root, scene, tick, key, transform='', root_source, draft=get_draft()}){
    //console.log('make_scene');
    let remake_node = true;
    if(source) {
        root_source = source;
        draft.scene_signatures.set(source, new Set());
        root = draft.get_stem({root:source, term:'scenes'});
        if(!root) return;
        draft.make.node({node:root});
        draft.nodes.get(root).roots.add(source);
        draft.make.edge({root, term:'tick', stem:{value: tick}}); 
        key = '';
    }else{
        const root_root = root;
        root = root+key;
        if(draft.nodes.has(root)) remake_node = false;
        let signature = []; 
        let new_transforms = [];
        //const start = Date.now();
        for(const [term, value] of Object.entries(scene)){
            if(!remake_node && term == 'digest') {
                const current_value = draft.get_leaf({root, term});
                if(value !== current_value) remake_node = true;
            }
            if(['type', 'source', 'key'].includes(term)){
                signature.push(term + value);
            }
            if(['position', 'x', 'y', 'z', 'rotation'].includes(term)){
                new_transforms.push(term + JSON.stringify(value));
            }
        }
        //console.log('delta', Date.now()-start);
        transform += new_transforms.sort().join();
        signature = signature.sort().join() + transform;
        if(draft.scene_signatures.get(root_source).has(signature)) return;
        draft.scene_signatures.get(root_source).add(signature);
        if(remake_node){
            draft.make.node({node:root});
        }else{
            draft.drop.edge({root, term:'scenes'});
        }
        draft.make.edge({root:root_root, term:'scenes', stem:root});
    }

    if(remake_node){
        for(const [term, value] of Object.entries(scene)){
            if(term == 'scenes' || value == null) continue;
            draft.make.edge({root, term, stem:{value}}); 
        }
    }

    for(const [i, stem_scene] of (scene.scenes ?? []).entries()){
        draft.make_scene({root, scene:stem_scene, key:key+i, transform, root_source});
    }
};


// if(!remake_node && term != 'scenes'){
            //     const current_value = draft.get_leaf({root, term});
            //     if(Array.isArray(value) && (Array.isArray(current_value)) && value.length === current_value.length){
                    
            //         for(let i = 0; i < value.length; i++) { // TODO: just check key at start of array
            //             if(value[i] !== current_value[i]) remake_node = true;
            //         }
                    
            //     }else{
            //         if(value !== current_value) remake_node = true; // !Object.is(value, current_value)
            //     }
            // }