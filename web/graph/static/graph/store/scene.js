import {get_draft} from 'delimit/graph';

export const scene_signatures = new Map();

export function make_scene({source, root, scene, tick, key, transform='', root_source, draft=get_draft()}){
    if(source) {
        //console.log(scene);
        root_source = source;
        draft.scene_signatures.set(source, new Set());
        root = draft.get_stem({root:source, term:'scenes'});
        if(!root) return;
        draft.make.node({node:root});
        draft.nodes.get(root).roots.add(source);
        draft.make.edge({root, term:'tick', stem:{value: tick}}); // type:'integer',
        key = '';
    }else{
        let signature = []; 
        let new_transforms = [];
        for(const [term, value] of Object.entries(scene)){
            if(term == 'scenes') continue;
            const string_value = JSON.stringify(value);
            signature.push(term + string_value);
            if(term == 'position') new_transforms.push('pos'+string_value);
            if(term == 'z') new_transforms.push('x'+string_value);
            if(term == 'y') new_transforms.push('y'+string_value);
            if(term == 'z') new_transforms.push('z'+string_value);
        }
        transform += new_transforms.sort().join();
        signature = signature.sort().join() + transform;
        if(draft.scene_signatures.get(root_source).has(signature)) return;
        draft.scene_signatures.get(root_source).add(signature);

        const root_root = root;
        root = draft.make.node({node:root+key});
        draft.make.edge({root:root_root, term:'scenes', stem:root});
    }

    for(const [term, value] of Object.entries(scene)){
        if(term == 'scenes' || value == null) continue;
        draft.make.edge({root, term, stem:{value}}); 
    }

    for(const [i, stem_scene] of (scene.scenes ?? []).entries()){
        //console.log('sub scene', stem_scene);
        draft.make_scene({root, scene:stem_scene, key:key+i, transform, root_source});
    }
};


    // draft.make.edge({root, term:'type', stem:{value: scene.type}});    
    // draft.make.edge({root, term:'source', stem:{value: scene.source}}); 
    // const func_name = 'make_'+scene.type;
    // if(make_functions.has(func_name)) make_functions.get(func_name)({root, scene});


// const make_functions = new Map(Object.entries({
//     make_group,
//     make_point,
//     make_polygon,
//     make_mesh,
// }));



// function make_group({root, scene, draft=get_draft()}){
//     if(scene.position) draft.make.edge({root, term:'position', stem:{value: scene.position}}); 
// }

// function make_point({root, scene, draft=get_draft()}){
//     draft.make.edge({root, term:'x', stem:{value: scene.x ?? scene.source}}); // type:'auto', 
//     draft.make.edge({root, term:'y', stem:{value: scene.y ?? scene.source}});
//     draft.make.edge({root, term:'z', stem:{value: scene.z ?? scene.source}});
// }

// function make_polygon({root, scene, draft=get_draft()}){
//     if(scene.vectors) draft.make.edge({root, term:'vectors', stem:{value: scene.vectors.flat()}}); 
//     if(scene.dashed) draft.make.edge({root, term:'dashed', stem:{value: scene.dashed}}); 
//     if(scene.width) draft.make.edge({root, term:'width', stem:{value: scene.width}});
// }

// function make_mesh({root, scene, draft=get_draft()}){
//     if(!scene.mesh) return;
//     const {vectors, indices} = scene.mesh;
//     if(vectors) draft.make.edge({root, term:'vectors', stem:{value: vectors.flat()}}); 
//     if(indices) draft.make.edge({root, term:'indices', stem:{value: indices}}); 
// }