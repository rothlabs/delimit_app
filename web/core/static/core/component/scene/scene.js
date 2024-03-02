import {createElement as c, useRef, memo} from 'react';
import {
    use_store, get_store, get_upper_snake_case, 
    pick_drag_n_droppable, 
    Scene_Transform, Sized_Transform,
    get_draft,
} from 'delimit';
import {Line} from '@react-three/drei/Line';
import {useThree} from '@react-three/fiber';
import {LineGeometry} from 'LineGeometry';
//import {EdgeSplitModifier} from 'three/EdgeSplitModifier';
//import * as BufferGeometryUtils from 'three/BufferGeometryUtils';
import {BufferGeometry, Float32BufferAttribute} from 'three';
//import {Edges} from '@react-three/drei/Edges';
//import {Outlines} from '@react-three/drei/Outlines';

// const Group = memo(({node}) => {
//     const position = use_store(d=> d.get_leaf({root:node, term:'position', alt:[0,0,0]}));
//     const rotation = use_store(d=> d.get_leaf({root:node, term:'rotation', alt:[0,0,0]})); // d.scene.get_vector3({scene:node, term:'rotation'}));//
//     return c('group', {
//         position,
//         rotation,
//     },
//         c(Scenes, {node}), 
//     )
// });

const Group = memo(({node}) => {
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    return c(Scene_Transform, { 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c(Scenes, {node}), 
    )
});

const Point = memo(({node}) => {
    const source = use_store(d=> d.get_leaf({root:node, term:'source'}));
    const material  = use_store(d=> d.get.node.material.primary(d, source));
    const size = use_store(d=> d.get_leaf({root:node, term:'size', alt:d.point_size}));
    return c(Scene_Transform, { 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c(Sized_Transform, {size},
            c('mesh', {material},
                c('sphereGeometry'),      
            ),
        ),
        c(Scenes, {node}), 
    )
});

const Polyline = memo(({node}) => {
    //console.log('render line!');
    const ref = useRef();
    const root = node;
    const source = use_store(d=> d.get_leaf({root, term:'source'}));
    const color  = use_store(d=> d.get.node.color.primary(d, source));
    const dashed = use_store(d=> d.get_leaf({root, term:'dashed'}));
    const width = use_store(d=> d.get_leaf({root, term:'width', alt:3}));
    const {invalidate} = useThree();
    use_store(d => 
        //d.get_leaf({root:node, term:'digest', alt:0}) 
        d.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0]})
    ,{subscribe(vector){
        //console.log('polyline update!');
        if(!ref.current) return;
        //const draft = get_draft();
        //const vector = draft.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0]});
        //if(ref.current && vector && vector.length >= 6){
            ref.current.geometry = new LineGeometry(); 
            ref.current.geometry.setPositions(vector); // new LineGeometry(); // ref.current.geometry.needsUpdate = true;
            invalidate();
        //}
    }});
    let points = get_store().get_leaf({root, term:'vector', alt:[0,0,0, 0,0,0]});
    if(points.length < 6) points = [0,0,0, 0,0,0];
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

const Polyline_Fixed = memo(({node}) => {
    //console.log('render line!');
    const ref = useRef();
    const root = node;
    // const source = use_store(d=> d.get_leaf({root, term:'source'}));
    // const color  = use_store(d=> d.get.node.color.primary(d, source));
    // const dashed = use_store(d=> d.get_leaf({root, term:'dashed'}));
    // const width = use_store(d=> d.get_leaf({root, term:'width', alt:3}));
    // const {invalidate} = useThree();
    // use_store(d => 
    //     d.get_leaf({root:node, term:'digest', alt:0}) //d.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0]})
    // ,{subscribe(digest){
    //     //console.log('polyline update!');
    //     if(!ref.current) return;
    //     const draft = get_draft();
    //     const vector = draft.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0]});
    //     //if(ref.current && vector && vector.length >= 6){
    //         ref.current.geometry = new LineGeometry(); 
    //         ref.current.geometry.setPositions(vector); // new LineGeometry(); // ref.current.geometry.needsUpdate = true;
    //         invalidate();
    //     //}
    // }});
    let points = get_draft().get_leaf({root, term:'vector', alt:[0,0,0, 0,0,0]});
    //if(points.length < 6) points = [0,0,0, 0,0,0];
    return c(Line, {
        ref, points, //color, dashed,
        //lineWidth: width,
    });
    
});

//const modifier = new EdgeSplitModifier();

const Mesh = memo(({node}) => {
    const ref = useRef();
    const root = node;
    const source = use_store(d=> d.get_leaf({root, term:'source'}));
    const material  = use_store(d=> d.get.node.material.shaded(d, source));
    const {invalidate} = useThree();
    use_store(d =>  // make one flat vector with first number as split point
        d.get_leaf({root:node, term:'digest', alt:0})
    ,{subscribe(digest){ // [vector, trivec]
        if(!ref.current) return;
        const draft = get_draft();
        const vector = draft.get_leaf({root:node, term:'vector', alt:[0,0,0, 0,0,0, 0,0,0]});
        const trivec = draft.get_leaf({root:node, term:'trivec', alt:[0, 1, 2]});
        //if(vector.length >= 9 && trivec.length >= 3){
            //console.log('new facet geom');
            ref.current.geometry = new BufferGeometry(); 
            ref.current.geometry.setIndex(trivec);
            ref.current.geometry.setAttribute('position', new Float32BufferAttribute(vector, 3));
            //ref.current.geometry = BufferGeometryUtils.mergeVertices(ref.current.geometry, 0.01);
            // try{
            //     ref.current.geometry = modifier.modify(
            //         ref.current.geometry,
            //         30 * Math.PI / 180, // cutOffAngle * Math.PI / 180,
            //         false, // tryKeepNormals
            //     );
            // }catch{
            //     console.log('edge split failed');
            // }
            ref.current.geometry.computeVertexNormals();
            invalidate();
        //}
    }});
    return c(Scene_Transform, { 
        ...pick_drag_n_droppable({node:source, scene:node}),
    },
        c('mesh', {ref, material,},
            //c(Outlines, {thickness: 0.05, color:'hotpink'}),
            // c(Edges, {
            //     scale: 1.1,
            //     threshold: 15,
            //     //color
            // }),
        ),
        c(Scenes, {node}), 
    )
});

const Scene_Components = new Map(Object.entries({
    Group,
    Point,
    Polyline,
    Polyline_Fixed,
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