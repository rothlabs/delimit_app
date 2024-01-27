import {createElement as c} from 'react';
import {use_store, List_View, render_badge_token, render_badge, icons, pickable} from 'delimit';

export function Term_List(){ 
    const items = use_store(d=> d.get.root_context_nodes(d)); 
    return c(List_View, {
        items, 
        render_item: node => c(Context, {node, path:'terms'+node}), 
    })
}

function Context({node, path}){
    const contexts = use_store(d=> d.get_stems({root:node, term:'contexts'})); 
    const types = use_store(d=> d.get_stems({root:node, term:'terms'})); 
    return c(List_View, {
        items:[...contexts, ...types], path,
        header: render_badge({node}),
        render_item: (node, index) => {
            if(index < contexts.length) return c(Context, {node, path:path+node+index});
            return c(Term_Button, {node});
        }, 
    });  
}

function Term_Button({node}){
    const icon = use_store(d=> d.get_leaf({root:node, terms:'icon source', alt:icons.css.cls.generic})); 
    const name = use_store(d=> d.get.node.name(d, node)); 
    return render_badge_token({
        icon, name, 
        ...pickable({node}),
    });
}