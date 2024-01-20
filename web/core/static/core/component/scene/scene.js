import {createElement as c, useRef} from 'react';
import {
    use_store, set_store, get_upper_snake_case, 
    pick_drag_n_droppable, // draggable, droppable, pickable, 
    Scene_Transform,
} from 'delimit';
import {Line} from '@react-three/drei/Line';
import {useThree} from '@react-three/fiber';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';

const Scene_Components = new Map(Object.entries({
    Point,
    Polygon,
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
    const type_name = use_store(d => get_upper_snake_case(d.get_type_name(node)));
    //console.log('Scene_Case', node, type_name); 
    if(Scene_Components.has(type_name)) 
        return c(Scene_Components.get(type_name), {node});
}

function Point({node}){// notice that source nodes are captured in a leaf to prevent cycles!
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    const material  = use_store(d=> d.get.node.material.primary(d, source));
    const size = use_store(d=> d.point_size);
    return c(Scene_Transform, { 
        size, 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c('mesh', {material},
            c('sphereGeometry'), // c('meshBasicMaterial', {color:'red', toneMapped:false}),       
        ),
    )
}

function Polygon({node}){
    //const ref = useRef();
    const root = node;
    const source = use_store(d=> d.get_leaf({root, term:'source'}));
    const color  = use_store(d=> d.get.node.color.primary(d, source));
    const points = use_store(d => d.get_leaf({root, term:'vectors', alt:[0,0,0, 0,0,0]}));
    const dashed = use_store(d=> d.get_leaf({root, term:'dashed'}));
    const width = use_store(d=> d.get_leaf({root, term:'width', alt:2}));
    return c('group', {},
        c(Line, {
        //ref,
        ...pick_drag_n_droppable({node:source}),
        points, //: [0,0,0, 0,0,0], // segs_geo.pts,//curve.points(res).map(p=> [p.x, p.y, p.z]),
        lineWidth: width,
        color,
        dashed,
    }),
        c(Scenes, {node}), 
    )
}


    // const {invalidate} = useThree();
    // use_store(d => 
    //     d.get_leaf({root:node, term:'vectors', alt:[0,0,0, 0,0,0]})
    // ,{subscribe(vectors){
    //     if(ref.current && vectors){
    //         //console.log('set vectors', vectors);
    //         ref.current.geometry = new LineGeometry(); // TODO: find way to not create new geometry each time
    //         ref.current.geometry.setPositions(vectors); 
    //         invalidate();
    //     }
    // }});

















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