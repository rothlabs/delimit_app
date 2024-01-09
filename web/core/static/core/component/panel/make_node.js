import {createElement as c} from 'react';
import {use_store, List_View, render_badge_token, render_badge, icons} from 'delimit';

export function Make_Node(){ 
    const items = use_store(d=> d.get.root_context_nodes(d)); 
    return[
        render_badge_token({
            name: 'Empty',
            store_action: d => d.make.node(d, {version:'targeted'}),
        }),
        c(List_View, {
            items, 
            render_item: node => c(Context, {node, path:'contexts'+node}), 
        }),
    ]  
}

function Context({node, path}){
    const contexts = use_store(d=> d.stems(d, node, 'contexts')); 
    const types = use_store(d=> d.stems(d, node, 'types')); 
    return c(List_View, {
        items:[...contexts, ...types], path,
        header: render_badge({node}),
        render_item: (node, index) => {
            if(index < contexts.length) return c(Context, {node, path:path+node+index});
            return c(Make_Button, {node});
        }, 
    });  
}

function Make_Button({node}){
    const icon = use_store(d=> d.value(d, node, 'icon source', icons.css.cls.generic));  //d.get.node.icon(d, node)
    const name = use_store(d=> d.get.node.name(d, node)); // d.value(d, node, 'name', 'Node'));
    return render_badge_token({
        icon, name, 
        store_action: d => d.make.node(d, {type:node, version:'targeted'}),
    });
}