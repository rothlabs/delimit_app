import {createElement as c} from 'react';
import {
    use_store, set_store, get_upper_snake_case, draggable,
    View_Transform,
} from 'delimit';

const Scene_Components = new Map(Object.entries({
    Point,
}));

export function Scene_Root(){
    console.log('render scene root');
    //console.log('render top scene');
    const roots = use_store(d=> d.scene.get_sources(d)); 
    return [
        //c(Scene_Querier),
        c('group', {name:'root_scene'},
            roots.map(node=> c(Scenes, {node, key:node})),
        )
    ]
}

// function Scene_Querier(){
//     use_store(d=> d.scene.tick); 
//     set_store(d=> d.scene.layout(d));
// }

function Scenes({node}){ 
    const scenes = use_store(d=> d.scene.get_scenes(d, node));  
    return scenes.map(node => c(Scene_Case, {node}));
}

function Scene_Case({node}){
    const type_name = use_store(d => 
        get_upper_snake_case(d.get.node.type_name(d, node)));  
    if(Scene_Components.has(type_name)) 
        return c(Scene_Components.get(type_name), {node});
}

function Point({node}){
    console.log('render point');
    // notice that source nodes are captured in a leaf value to prevent cycles!
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    const position = use_store(d=> d.get_values(d, {root:node, terms:{x:0, y:0, z:0}}));
    const size = use_store(d=> d.point_size);
    return c(View_Transform, { 
        name: 'point',
        size, //:  pick ? size*1.2 : size, 
        ...draggable({root:source, position})
    },
        c('mesh', {},
            c('sphereGeometry'),
            c('meshBasicMaterial', {color:'red', toneMapped:false}),       
        ),
        c(Scenes, {node}),
    )
}

// pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));
    // pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));
    // pos.x = use_store(d=> d.get_leaf(d, {root:pos.x, term:'x', alt:pos.x}));