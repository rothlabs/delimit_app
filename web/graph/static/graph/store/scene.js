import {get_draft} from 'delimit/graph';

const make_functions = new Map(Object.entries({
    make_group,
    make_point,
    make_polygon,
    make_mesh,
}));

export function make_scene({source, root, scene, tick, key, draft=get_draft()}){
    if(source) {
        root = draft.get_stem({root:source, term:'scenes'});
        if(!root) return;
        draft.make.node({node:root});
        draft.nodes.get(root).roots.add(source);
        draft.make.edge({root, term:'tick', stem:{value: tick}}); // type:'integer',
        key = '';
    }else{
        const root_root = root;
        root = draft.make.node({node:root+key});
        draft.make.edge({root:root_root, term:'scenes', stem:root});
    }
    draft.make.edge({root, term:'type', stem:{value: scene.type}});    
    draft.make.edge({root, term:'source', stem:{value: scene.source}}); 
    const func_name = 'make_'+scene.type;
    if(make_functions.has(func_name)) make_functions.get(func_name)({root, scene});
    for(const [i, stem_scene] of (scene.scenes ?? []).entries()){
        //console.log('sub scene', stem_scene);
        draft.make_scene({root, scene:stem_scene, key:key+i});
    }
};

function make_group({root, scene, draft=get_draft()}){
    if(scene.position) draft.make.edge({root, term:'position', stem:{value: scene.position}}); 
}

function make_point({root, scene, draft=get_draft()}){
    draft.make.edge({root, term:'x', stem:{value: scene.x ?? scene.source}}); // type:'auto', 
    draft.make.edge({root, term:'y', stem:{value: scene.y ?? scene.source}});
    draft.make.edge({root, term:'z', stem:{value: scene.z ?? scene.source}});
}

function make_polygon({root, scene, draft=get_draft()}){
    if(scene.vectors) draft.make.edge({root, term:'vectors', stem:{value: scene.vectors.flat()}}); 
    if(scene.dashed) draft.make.edge({root, term:'dashed', stem:{value: scene.dashed}}); 
    if(scene.width) draft.make.edge({root, term:'width', stem:{value: scene.width}});
}

function make_mesh({root, scene, draft=get_draft()}){
    if(!scene.mesh) return;
    const {vectors, indices} = scene.mesh;
    if(vectors) draft.make.edge({root, term:'vectors', stem:{value: vectors.flat()}}); 
    if(indices) draft.make.edge({root, term:'indices', stem:{value: indices}}); 
}