import {createElement as c} from 'react';
import {
    use_store, set_store, get_upper_snake_case, 
    pick_drag_n_droppable, // draggable, droppable, pickable, 
    Scene_Transform,
} from 'delimit';

const Scene_Components = new Map(Object.entries({
    Point,
}));

export function Scene_Root(){
    const roots = use_store(d=> d.scene.get_sources(d)); 
    return c('group', {name:'root_scene'},
        roots.map(node=> c(Scenes, {node, key:node})),
    )
}

function Scenes({node}){ 
    const scenes = use_store(d=> d.scene.get_scenes(d, node));  
    return scenes.map(node => c(Scene_Case, {node}));
}

function Scene_Case({node}){
    const type_name = use_store(d => get_upper_snake_case(d.get.node.type_name(d, node))); 
    if(Scene_Components.has(type_name)) 
        return c(Scene_Components.get(type_name), {node});
}

function Point({node}){
    // notice that source nodes are captured in a leaf to prevent cycles!
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    const material  = use_store(d=> d.get.node.material.primary(d, source));
    const size = use_store(d=> d.point_size);
    return c(Scene_Transform, { 
        size, 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c('mesh', {
            material,
        },
            c('sphereGeometry'), // c('meshBasicMaterial', {color:'red', toneMapped:false}),       
        ),
        // c(Scenes, {node}), points will probably never have stems
    )
}



        //...draggable({stem:source, position}),
        //...droppable({root:source}),
        //...pickable({node:source}),


// function Scene_Querier(){
//     use_store(d=> d.scene.tick); 
//     set_store(d=> d.scene.layout(d));
// }

// pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));
    // pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));
    // pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));