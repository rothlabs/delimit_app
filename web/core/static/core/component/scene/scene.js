import {createElement as c, useRef, memo} from 'react';
import {
    use_store, get_store, get_draft, get_upper_snake_case, 
    pick_drag_n_droppable, // draggable, droppable, pickable, 
    Scene_Transform, Sized_Scene_Transform,
} from 'delimit';
import {Line} from '@react-three/drei/Line';
import {useThree} from '@react-three/fiber';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';
import {BufferGeometry, Float32BufferAttribute} from 'three';

const Group = memo(({node}) => {// notice that source nodes are captured in a leaf to prevent cycles!
    //console.log('render group');
    const position = use_store(d=> d.get_leaf({root:node, term:'position', alt:[0,0,0]}));
    const rotation = use_store(d=> d.get_leaf({root:node, term:'rotation', alt:[0,0,0]}));
    return c('group', {
        position,
        rotation,
    },
        c(Scenes, {node}), 
    )
});

const Point = memo(({node}) => {// notice that source nodes are captured in a leaf to prevent cycles!
    //console.log('render point');
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    const material  = use_store(d=> d.get.node.material.primary(d, source));
    const size = use_store(d=> d.get_leaf({root:node, term:'size', alt:d.point_size}));
    return c(Scene_Transform, { 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c(Sized_Scene_Transform, {size},
            c('mesh', {material},
                c('sphereGeometry'), // c('meshBasicMaterial', {color:'red', toneMapped:false}),       
            ),
        ),
        c(Scenes, {node}), 
    )
});

const Polyline = memo(({node}) => {
    //console.log('render Polyline');
    const ref = useRef();
    const root = node;
    const source = use_store(d=> d.get_leaf({root, term:'source'}));
    const color  = use_store(d=> d.get.node.color.primary(d, source));
    const dashed = use_store(d=> d.get_leaf({root, term:'dashed'}));
    const width = use_store(d=> d.get_leaf({root, term:'width', alt:3}));
    const {invalidate} = useThree();
    use_store(d => 
        d.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0]})
    ,{subscribe(vector){
        if(ref.current && vector){
            ref.current.geometry = new LineGeometry(); 
            ref.current.geometry.setPositions(vector); // new LineGeometry(); // ref.current.geometry.needsUpdate = true;
            invalidate();
        }
    }});
    const points = get_store().get_leaf({root, term:'vector', alt:[0,0,0, 0,0,0]});
    return c(Scene_Transform, { 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c(Line, {
            ref, points, color, dashed,
            lineWidth: width,
        }),
        c(Scenes, {node}), 
    )
});

const Mesh = memo(({node}) => {
    //console.log('render mesh');
    const ref = useRef();
    const root = node;
    const source = use_store(d=> d.get_leaf({root, term:'source'}));
    const material  = use_store(d=> d.get.node.material.shaded(d, source));
    const {invalidate} = useThree();
    use_store(d => [ // make one flat vector with first number as split point
        d.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0, 0,0,0, 0,0,0]}),
        d.get_leaf({root:node, term:'triangles', alt:[0, 1, 2]}),
    ],{subscribe([vector, triangles]){
        if(ref.current && vector){
            ref.current.geometry = new BufferGeometry(); 
            ref.current.geometry.setIndex(triangles);
            ref.current.geometry.setAttribute('position', new Float32BufferAttribute(vector, 3));
            ref.current.geometry.computeVertexNormals();
            invalidate();
        }
    }});
    return c(Scene_Transform, { //c('group', {},
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c('mesh', {
            ref, material,
        }),
        c(Scenes, {node}), 
    )
});

const Scene_Components = new Map(Object.entries({
    Group,
    Point,
    Polyline,
    Mesh,
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
    if(Scene_Components.has(type_name)) 
        return c(Scene_Components.get(type_name), {node});
}





//const points = use_store(d => d.get_leaf({root, term:'vectors', alt:[0,0,0, 0,0,0]}));
//const [points, set_points] = useState([0,0,0, 0,0,0]);




















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