import {createElement as c} from 'react';
import {use_store, render_token, List_View, render_badge, readable, get_snake_case} from 'delimit';

const logic_terms = ['required', 'optional', 'pick_one', 'one_or_more'];
const stem_type_terms = ['context', 'minimum', 'maximum'];

export function Schema_Inspector(){ 
    const items = use_store(d=> [...d.picked.primary.node].filter(root=> d.nodes.has(d.get_stem({root, term:'type'})))); 
    return c(List_View, {items, 
        render_item: node => c(Node, {node, target:node, path:'schema'}), 
    })  
}

function Node_Case({term, node, index, target, target_term, show_term, path}){
    const get_node_case = use_store(d=> d.get_node_case(d, node));
    if(get_node_case == 'missing'){
        return render_token({node,
            content:[
                show_term && readable(term), 
                render_badge({node}),
            ],
        })
    }
    if(get_node_case.name == 'leaf') return Leaf({term, ...get_node_case.leaf, show_term}); 
    return c(Node, {term, node, index, target, target_term, show_term, path});
}

function Node({term='', node, index, target, target_term, show_term, path}){ // , is_target, accordion_node
    path = path + term + node + index;
    const targeted = (node == target);
    let root = node;
    const name       = use_store(d=> d.get_leaf({root, term:'name', alt:''})); // d.face.name(d, node)
    const type       = use_store(d=> d.get_stem({root, term:'type'}));
    const type_name  = use_store(d=> d.get.node.type_name(d, node)); // change from face.type to type_name
    let terms = [];
    if(targeted){
        root = type;
        terms = logic_terms;
    }else if(['Root', 'Term'].includes(type_name)){
        if(type_name == 'Term') target_term = get_snake_case(name);
        terms = logic_terms;
    }else if(type_name == 'Stem'){
        terms = stem_type_terms;
    }
    const items = use_store(d=> [...d.nodes.get(root).terms.keys()].filter(term=> terms.includes(term)));
    const header = [
        show_term && readable(term),
        render_badge({node}),
    ];
    const header_addon = !targeted && {
        icon:'bi-plus-square', 
        store_action(d){
            if(type_name == 'Root'){
                d.schema.make_root(d, target, node);
            }else if(type_name == 'Term'){
                d.schema.make_term(d, target, node);
            }else if(type_name == 'Stem'){ 
                d.schema.make_stem(d, {root:target, term:target_term, stem:node});
            }
        }
    };
    return c(List_View, {items, path, header, header_addon,
        render_item: term => c(Term_Case, {root, term, target, target_term, path}), // key:term
    });
}

function Term_Case({root, term, target, target_term, path}){
    const get_term_case = use_store(d=> d.get_term_case(d, root, term));
    if(!get_term_case) return;
    if(get_term_case.name == 'node'){
        return c(Node_Case, {term, node:get_term_case.node, target, target_term, show_term:true, path});
    }else if(get_term_case.name == 'leaf'){
        return Leaf({term, ...get_term_case.leaf, show_term:true});
    }
    return c(Term, {root, term, target, target_term, path});
}

function Term({root, term, target, target_term, path}){
    const pth = path + term;
    const items = use_store(d=> d.nodes.get(root).terms.get(term));
    return(
        c(List_View, {items, path:pth,
            header: readable(term),
            render_item(stem, index){
                if(stem.type) return Leaf({term, ...stem}); // key:index
                return c(Node_Case, {term, node:stem, target, target_term, index, path}); // key:index,
            }
        })
    )
}

function Leaf({term, type, value, show_term}){ // need MAKE button for leaf?! #1 
    return render_token({content:[
        show_term && readable(term),
        c('div', {className:'text-body'} ,''+value),
    ]});
}


// import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';