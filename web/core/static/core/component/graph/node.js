import {createElement as c, memo} from 'react';
import {Svg} from '@react-three/drei/Svg';
import {Text} from '@react-three/drei/Text';
import {use_store, get_store, Sized_Scene_Transform, pick_drag_n_droppable} from 'delimit'; 

export const Node = memo(({node})=>{ 
    const {icon, name, type_name} = use_store(d=> d.get.node.primary(d, node));
    const color     = use_store(d=> d.get.node.color.primary(d, node));
    const material  = use_store(d=> d.get.node.material.primary(d, node));
    const position  = use_store(d=> d.graph.nodes.get(node).pos);
    const d = get_store();
    const material_props = {color, toneMapped:false};    
    return(
        c(Sized_Scene_Transform, {
            ...pick_drag_n_droppable({node}),
            name: 'node',
            size: 13, 
            position,
        },
            c('mesh', {
                geometry: d.geometry.circle,
                material: d.material.body_bg,
            }),
            c(Text, {
                text: name,
                font: d.font.body, 
                //fontStyle: font_style,
                outlineColor: d.color.body_bg,
                material,
                fontSize: 1, //letterSpacing: 0, lineHeight: 1, 
                position: [1.6, .6, 2],
                outlineWidth: '40%',
                anchorX: 'left',
                anchorY: 'middle',
            }),
            c(Svg, {
                src: 'data:image/svg+xml;utf8,' + icon,
                fillMaterial: material_props,
                strokeMaterial: material_props,
                scale: 0.13,
                position: [-1, 1, 1],
            }),
            c(Text, {
                text: type_name,
                font: d.font.body, 
                outlineColor: d.color.body_bg,
                material,
                fontSize: 1, //letterSpacing: 0, lineHeight: 1, 
                position: [1.6, -.6, 2],
                outlineWidth: '40%',
                anchorX: 'left',
                anchorY: 'middle',
            }),
        )
    );
});