import {createElement as c} from 'react';
import {use_store, List_View, render_badge_token, render_badge, icons} from 'delimit';

export function Make_Node(){ 
    const items = use_store(d=> d.get.root_context_nodes(d)); 
    return[
        render_badge_token({
            name: 'Empty',
            store_action: d => d.make.node({version:'targeted'}),
        }),
        c(List_View, {
            items, 
            render_item: node => c(Context, {node, path:'roots'+node}), 
        }),
    ]  
}

function Context({node, path}){
    const contexts = use_store(d=> d.get_stems({root:node, term:'contexts'})); 
    const types = use_store(d=> d.get_stems({root:node, term:'roots'})); 
    return c(List_View, {
        items:[...contexts, ...types], path,
        header: render_badge({node}),
        render_item: (node, index) => {
            if(index < contexts.length) return c(Context, {node, path:path+node+index});
            return c(Make_Button, {type:node});
        }, 
    });  
}

function Make_Button({type}){
    const icon = use_store(d=> d.get_leaf({root:type, terms:'icon source', alt:icons.css.cls.generic})); 
    const name = use_store(d=> d.get.node.name(d, type)); 
    return render_badge_token({
        icon, name, 
        store_action: d => {
            const node = d.make.node({type, version:'targeted'});
            d.pick(d, {node});
            if(d.studio.mode == 'scene') d.scene.make_sources(d, {node});
        },
    });
}