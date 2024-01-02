import {createElement as c} from 'react';
import {use_store, List_View, render_token, Badge} from 'delimit';

export function Make_Node(){ 
    const items = use_store(d=> d.stems(d, d.entry, 'app contexts')); 
    return c(List_View, {items, 
        render_item: node => c(Context, {node, path:'make'}), 
    })  
}

function Context({node, path}){
    const contexts = use_store(d=> d.stems(d, node, 'contexts')); 
    const types = use_store(d=> d.stems(d, node, 'types')); 
    return c(List_View, {items:[...contexts, ...types], path,
        header: c(Badge, {node}),
        render_item: (node, index) => {
            if(index < contexts.length) return c(Context, {node, path:path+node});
            return c(Make_Button, {node});
        }, 
    });  
}

function Make_Button({node}){
    const icon = use_store(d=> d.face.icon(d, node)); // d.value(d, node, 'icon code', icons.css.cls.generic));
    const name = use_store(d=> d.face.name(d, node)); // d.value(d, node, 'name', 'Node'));
    return render_token({icon, name, content:'badge',
        commit: d => d.make.node(d, {type:node, commit:'targeted'}),
    });
}