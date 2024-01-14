import {createElement as c, useEffect, useState} from 'react';
import {
    use_store, draggable, List_View, drag_drop,
    readable, droppable, pickable, render_badge, icons, render_token
} from 'delimit';

export function Node_Editor(){ 
    const items = use_store(d=> [...d.picked.primary.node.keys()]); 
    return c(List_View, {items,
        render_item: node => c(Node_Case, {root:node, node, path:'inspect'}), 
    })
}

function Node_Case({root, term, node, index, show_term, path}){
    const get_node_case = use_store(d=> d.get_node_case(d, node));
    const edge = {root, term, stem:node, index};
    let dnd = drag_drop(edge);
    if(root == node) dnd = {...droppable({root}), ...draggable({stem:node})};
    if(get_node_case.name == 'leaf'){
        term = term ?? 'leaf';
        const proxy = root ? edge : null; // const proxy = (root && root!=node) ? edge : null;
        return c(Leaf, {root:node, ...get_node_case.leaf, proxy, show_term:term, show_icon:true}); 
    }else if(get_node_case == 'missing'){
        return render_token({...dnd, ...pickable({node, mode:'secondary', root, term}),
            content:[
                show_term && readable(term), 
                render_badge({node}),
            ],
        })
    }
    return c(Node, {dnd, root, term, node, index, show_term, path});
}

function Node({dnd, root, term='', node, index=0, show_term, path}){
    path = path + term + node + index;
    const items = use_store(d=> [...d.nodes.get(node).terms.keys()]); 
    const header = [
        show_term && readable(term),
        render_badge({node}), 
    ];
    const header_props = {...dnd, ...pickable({node, root, term})}; // mode:'secondary'
    return c(List_View, {items, path, header_props, header,
        render_item: term => c(Term_Case,{root:node, term, path}), // key:term
    });
}

function Term_Case({root, term, path}){
    const get_term_case = use_store(d=> d.get_term_case(d, root, term));
    if(!get_term_case) return;
    if(get_term_case == 'empty'){
        return render_token({...drag_drop({root, term}),
            content:[
                readable(term),
                c('div', {className:'text-body'}, 'emtpy'), 
            ],
        })
    }else if(get_term_case.name == 'node'){
        return c(Node_Case, {root, term, node:get_term_case.node, show_term:true, path});
    }else if(get_term_case.name == 'leaf'){
        return c(Leaf, {root, term, ...get_term_case.leaf, show_term:true});
    }
    return c(Term, {root, term, path});
}

function Term({root, term, path}){
    const pth = path + term;
    const items = use_store(d=> d.nodes.get(root).terms.get(term));
    return(
        c(List_View, {items, path:pth,
            header_props:{...droppable({root, term}), ...pickable({root, term})}, // mode:'secondary',  
            header: readable(term),
            render_item(stem, index){
                if(stem.type) return c(Leaf, {root, term, ...stem, index}); // key:index
                return c(Node_Case, {root, term, node:stem, index, path}); // key:index,
            }
        })
    )
}

function Leaf({root, term='leaf', index=0, type, value, proxy, show_term, show_icon}){ // ...droppable({node, term})
    const [input_value, set_input_value] = useState(value);
    const [sync_input, set_sync_input] = useState(true);
    useEffect(()=>{
        if(sync_input) set_input_value(value);
    },[value]);
    const dnd = drag_drop(proxy ?? {root, term, stem:{type, value}, index});
    const name = readable((typeof show_term==='string') ? show_term : term);
    const content = ({render_switch, render_input}) => [
        show_term && c('div', dnd, name), // render_name({props}),
        show_icon && c('div', {className:icons.css.cls.generic + ' text-body', ...dnd}),
        type == 'boolean' ? 
            render_switch({ //...dnd,
                checked: value, 
                store_action(d, e){
                    d.set_leaf({root, term, index, value:e.target.checked});
                }, 
            }) : 
            render_input({
                value: input_value, 
                onFocus: ()=> set_sync_input(false),
                onBlur(){
                    set_sync_input(true);
                    if(type != 'string'){
                        if(value == '') value = '0';
                        set_input_value(''+parseFloat(value));
                    }
                },
                store_action(d, e){
                    const coerced = d.set_leaf({root, term, index, value:e.target.value});
                    if(coerced != null) set_input_value(coerced); 
                }, 
            }),
        c('div', {className:icons.css.cls[type], ...dnd}),
    ];
    const pick_meta = proxy ? {root:proxy.root, term:proxy.term} : {root, term};
    return render_token({
        name,
        content,
        ...pickable({mode:'secondary', ...pick_meta}),
    });
}
