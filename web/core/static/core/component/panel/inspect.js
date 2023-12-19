import {createElement as c, useEffect, useState} from 'react';
import {Form} from 'react-bootstrap';
import {use_store, commit_store, List_View, drag_drop,
    readable, droppable, pickable, Badge, icons, Token} from 'delimit';

export function Inspect(){ 
    const items = use_store(d=> [...d.picked.primary.node]); 
    return c(List_View, {items, 
        render_item: node => c(Node_Case, {node, path:'inspect'}), 
    })  
}

function Node_Case({root, term, node, index, show_term, path}){
    const node_case = use_store(d=> d.node_case(d, node));
    const edge = {root, term, stem:node, index};
    const dnd = drag_drop(edge);
    if(node_case.name == 'leaf'){
        term = term ?? 'leaf';
        const proxy = root ? edge : null;
        return c(Leaf, {root:node, ...node_case.leaf, proxy, show_term:term, show_icon:true}); 
    }else if(node_case == 'missing'){
        return Token({node, ...dnd, ...pickable({node, mode:'secondary'}),
            content:[
                show_term && readable(term), 
                c(Badge, {node}),
            ],
        })
    }
    return c(Node, {dnd, term, node, index, show_term, path});
}

function Node({dnd, term='', node, index=0, show_term, path}){
    path = path + term + node + index;
    const items = use_store(d=> [...d.node.get(node).forw.keys()]); 
    const header = [
        show_term && readable(term),
        c(Badge, {node}), 
    ];
    const header_props = {node, ...dnd, ...pickable({node, mode:'secondary'})};
    return c(List_View, {items, path, header_props, header,
        render_item: term => c(Term_Case, {root:node, term, path}), // key:term
    });
}

function Term_Case({root, term, path}){
    const term_case = use_store(d=> d.term_case(d, root, term));
    if(!term_case) return;
    if(term_case == 'empty'){
        return Token({...drag_drop({root, term}),
            content:[
                readable(term),
                c('div', {className:'text-body'}, 'emtpy'), 
            ],
        })
    }else if(term_case.name == 'node'){
        return c(Node_Case, {root, term, node:term_case.node, show_term:true, path});
    }else if(term_case.name == 'leaf'){
        return c(Leaf, {root, term, ...term_case.leaf, show_term:true});
    }
    return c(Term, {root, term, path});
}

function Term({root, term, path}){
    const pth = path + term;
    const items = use_store(d=> d.node.get(root).forw.get(term));
    return(
        c(List_View, {items, path:pth,
            header_props: droppable({root, term}), 
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
    const content = () => [
        show_term && c('div', dnd, readable((typeof show_term==='string') ? show_term : term)),
        show_icon && c('div', {className:icons.css.cls.generic + ' text-body', ...dnd}),
        type == 'xsd:boolean' ? 
            c(Form.Check, {
                className:'flex-grow-1 ms-2 mt-2 shadow-none', //4 mt-2 me-4 //style: {transform:'scale(1.8);'},
                type: 'switch',
                checked: value, 
                onChange(e){
                    commit_store(d=> d.mutate.leaf(d, root, term, index, e.target.checked));
                }, 
                ...dnd,
            }) : 
            c('input', {
                className: 'form-control',
                style: {height:28, background:'transparent'},
                value: input_value, 
                onFocus: ()=> set_sync_input(false),
                onBlur(e){
                    set_sync_input(true);
                    if(type != 'xsd:string'){
                        if(value == '') value = '0';
                        set_input_value(''+parseFloat(value));
                    }
                },
                onChange(e){
                    commit_store(d=>{
                        const coerced = d.mutate.leaf(d, root, term, index, e.target.value);
                        if(coerced != null) set_input_value(coerced); 
                    });
                }, 
            }),
        c('div', {className:icons.css.cls[type], ...dnd}),
    ];
    return Token({content, button:true});
}
