import {createElement as c} from 'react';
import {use_store, List_View, render_token, render_badge, pickable} from 'delimit';

export function Scene_Editor(){ 
    const items = use_store(d=> d.get_scene_nodes(d)); 
    return c(List_View, {items, 
        render_item: node => c(Node, {node}), 
    })  
}

function Node({node}){ 
    const items = use_store(d=> d.get_scenes(d, {node})); 
    const path = 'scene' + node;
    const header_addon = {
        icon:'bi-x-lg', 
        store_action: d => d.scene.remove_nodes(d, {node}),
    };
    return c(List_View, {
        items, path, header_addon,
        header: render_badge({node}),
        header_props: pickable({item:{node}}),
        render_item: (scene, index) => c(Scene, {scene, path:path+index}),
    });  
}

function Scene({scene, path}){
    const items = use_store(d=> d.get_scenes(d, {scene})); 
    return c(List_View, {
        items, path,
        header: [scene.type],
        render_item: (scene, index) => c(Scene, {scene, path:path+index}),
    });  
}