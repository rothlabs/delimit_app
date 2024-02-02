import {is_formal_node_id, get_draft} from 'delimit';
import {Vector3} from 'three';

export const scene = {    
    sources: new Map(), // TODO: rename to source_ticks?
    tick: 0,
}

scene.increment = d => {
    d.scene.tick++;
    if(d.studio.mode == 'scene') d.scene.increment_sources(d);
}

scene.increment_sources = d => {
    for(const [root] of d.scene.sources){
        d.scene.sources.set(root, d.scene.tick);
    }
}

scene.make_sources = (d, {...items}) => {
    d.get_iterable(items).map(root => {
        d.drop.edge(d, {root, term:'scenes'}); // drop_scene_source(d, root);
        const scene = d.make.node({node:root+'scene'});
        d.make.edge(d, {root:scene, term:'tick', stem:{type:'integer', value:0}}); 
        d.make.edge(d, {root, term:'scenes', stem:scene}); 
    });
}

scene.drop_sources = (d, {...items}) => {
    d.get_iterable(items).map(root => {
        d.drop.edge(d, {root, term:'scenes'});
        d.drop.edge(d, {root, term:'scenes'}); // drop twice to remove empty term
    }); // drop_scene_source(d, root)
}

scene.add_or_remove_source = (d, {root, given}) => {
    const scene = d.get_stem({root, term:'scenes'});
    if(is_formal_node_id(root) && scene) { // d.get_term_case(d, root, 'scenes')
        if(given && !d.nodes.has(scene)) d.scene.make_sources(d, {root});
        if(!d.scene.sources.has(root)) d.scene.sources.set(root, 0); // query tick
    }else{
        d.scene.sources.delete(root);
    }
}

scene.get_sources = d => [...d.scene.sources.keys()];

scene.get_scenes = (d, root) => d.get_stems({root, term:'scenes'});

scene.query_status = d => ({
    loading: [...d.scene.sources].some(([root, query_tick]) => {
        const scene_tick = d.get_leaf({root, terms:'scenes tick', alt:0});
        return query_tick > scene_tick;
    }), 
    error: null, // d.graph_app.error,
});

scene.get_vector3 = ({scene, term, draft=get_draft()}) => {
    let conversion = 1;
    if(term == 'rotation') conversion = Math.PI/180;
    const vector = draft.get_leaf({root:scene, term, draft});
    if(vector){
        return [ // new Vector3().fromArray(
            draft.get_leaf({root:vector, term:'x', alt:typeof vector[0] === 'number' ? vector[0] : 0, draft}) * conversion,
            draft.get_leaf({root:vector, term:'y', alt:typeof vector[1] === 'number' ? vector[1] : 0, draft}) * conversion,
            draft.get_leaf({root:vector, term:'z', alt:typeof vector[2] === 'number' ? vector[2] : 0, draft}) * conversion,
        ];
    }
    const x = draft.get_leaf({root:scene, term:'x', draft});
    const y = draft.get_leaf({root:scene, term:'y', draft});
    const z = draft.get_leaf({root:scene, term:'z', draft});
    return [ // new Vector3().fromArray(
        draft.get_leaf({root:x, term:'x', alt:typeof x === 'number' ? x : 0, draft}) * conversion,
        draft.get_leaf({root:y, term:'y', alt:typeof y === 'number' ? y : 0, draft}) * conversion,
        draft.get_leaf({root:z, term:'z', alt:typeof z === 'number' ? z : 0, draft}) * conversion,
    ];
};

scene.set_source_position = ({scene, position, draft=get_draft()}) => {
    const pos = position.toArray();
    const root = draft.get_leaf({root:scene, term:'position'});
    if(draft.nodes.has(root)){
        for(const [i, cmp] of ['x', 'y', 'z'].entries()){
            draft.set_leaf({root, term:cmp, value:pos[i]});
        }
        return
    }
    for(const [i, cmp] of ['x', 'y', 'z'].entries()){
        const root = draft.get_leaf({root:scene, term:cmp});
        if(draft.nodes.has(root)){
            draft.set_leaf({root, term:cmp, value:pos[i]});
        }
    }
}