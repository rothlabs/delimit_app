import {createElement as c, useState} from 'react';
import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';
import {use_store, Token, List_View, Badge, readable, snake_case} from 'delimit';

const logic_terms = ['required', 'optional', 'pick_one', 'one_or_more'];
const stem_type_terms = ['context', 'minimum', 'maximum'];

export function Schema(){ 
    const items = use_store(d=> [...d.picked.primary.node].filter(node=> d.node.has(d.stem(d, node, 'type')))); 
    return c(List_View, {items, 
        render_item: node => c(Node, {node, target:node, path:'schema'}), 
    })  
}

function Node_Case({term, node, index, target, target_term, show_term, path}){
    const node_case = use_store(d=> d.node_case(d, node));
    if(node_case == 'missing'){
        return Token({node,
            content:[
                show_term && readable(term), 
                c(Badge, {node}),
            ],
        })
    }
    if(node_case.name == 'leaf') return Leaf({term, ...node_case.leaf, show_term}); 
    return c(Node, {term, node, index, target, target_term, show_term, path});
}

function Node({term='', node, index, target, target_term, show_term, path}){ // , is_target, accordion_node
    path = path + term + node + index;
    const targeted = (node == target);
    const name       = use_store(d=> d.value(d, node, 'name', '')); // d.face.name(d, node)
    const type       = use_store(d=> d.stem(d, node, 'type'));
    const type_name  = use_store(d=> d.type_name(d, node)); // change from face.type to type_name
    let root = node;
    let terms = [];
    if(targeted){
        root = type;
        terms = logic_terms;
    }else if(['Root', 'Term'].includes(type_name)){
        if(type_name == 'Term') target_term = snake_case(name);
        terms = logic_terms;
    }else if(type_name == 'Stem'){
        terms = stem_type_terms;
    }
    const items = use_store(d=> [...d.node.get(root).forw.keys()].filter(term=> terms.includes(term)));
    const header = [
        show_term && readable(term),
        c(Badge, {node}),
    ];
    const header_addon = !targeted && {
        icon:'bi-plus-square', 
        commit(d){
            if(type_name == 'Root'){
                d.build.root(d, target, node);
            }else if(type_name == 'Term'){
                d.build.term(d, target, node);
            }else if(type_name == 'Stem'){ 
                d.build.stem(d, {root:target, term:target_term, stem:node});
            }
        }
    };
    return c(List_View, {items, path, header, header_addon,
        render_item: term => c(Term_Case, {root, term, target, target_term, path}), // key:term
    });
}

function Term_Case({root, term, target, target_term, path}){
    const term_case = use_store(d=> d.term_case(d, root, term));
    if(!term_case) return;
    if(term_case.name == 'node'){
        return c(Node_Case, {term, node:term_case.node, target, target_term, show_term:true, path});
    }else if(term_case.name == 'leaf'){
        return Leaf({term, ...term_case.leaf, show_term:true});
    }
    return c(Term, {root, term, target, target_term, path});
}

function Term({root, term, target, target_term, path}){
    const pth = path + term;
    const items = use_store(d=> d.node.get(root).forw.get(term));
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
    return Token({content:[
        show_term && readable(term),
        c('div', {className:'text-body'} ,''+value),
    ]});
}