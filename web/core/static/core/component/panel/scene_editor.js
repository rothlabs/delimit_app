import {createElement as c} from 'react';
import {use_store, List_View, render_token, render_badge, pickable, row_height} from 'delimit';

export function Scene_Editor(){ 
    const items = use_store(d=> d.scene.get_sources(d)); 
    return c(List_View, {
        items, 
        render_item: node => c(Node, {node}), 
    })  
}

function Node({node}){ 
    return c('div', {className:'d-flex'},
        render_token({
            icon:'bi-x-lg', 
            height: row_height,
            store_action: d => d.scene.drop_sources(d, {node}),
        }),
        render_token({
            content: render_badge({node}),
            ...pickable({node}),
        })
    )
}



// function Node({node}){ 
//     const items = use_store(d=> d.scene.get_scenes(d, {node})); 
//     const path = 'scene' + node;
//     const header_addon = {
//         icon:'bi-x-lg', 
//         store_action: d => d.scene.drop_sources(d, {node}),
//     };
//     return c(List_View, {
//         items, path, header_addon,
//         header: render_badge({node}),
//         header_props: pickable({node}),
//         render_item: node => c(Scene, {node, path:path+node}),
//     });  
// }

// function Scene({node, path}){
//     const items = use_store(d=> d.scene.get_scenes(d, {node}));
//     return c(List_View, {
//         items, path,
//         header: render_badge({node}),
//         render_item: node => c(Scene, {node, path:path+node}),
//     });  
// }