import {createElement as c, useState} from 'react';
import {Row, Col, ButtonToolbar, Button, Form, Accordion, InputGroup} from 'react-bootstrap';
import {use_store, set_store, get_store, Svg, readable, snake_case} from 'delimit';

const logic_terms = ['required', 'optional', 'pick_one', 'one_or_more'];
const stem_type_terms = ['context', 'minimum', 'maximum'];

export function Schema(){ // bi-check-square // bi-x-square // acting as root logic
    const nodes = use_store(d=> [...d.picked.node].filter(root=> d.node.has(d.stem(d, root, 'type'))));
    return(
        c(Accordion, { // onSelect(keys){}
            className:'ms-2 mt-2 me-1', 
            key: nodes[0],
            defaultActiveKey: ['schema'+nodes[0]], 
            alwaysOpen:true,
        },
            nodes.map(root=> c(Node, {root, target:root, is_target:true, key:root, accordion_root:'schema'})), 
        )
    )
}

function Node_Joint({root, label, target, target_term, accordion_root}){
    const node_joint = use_store(d=> d.node_joint(d, root));
    if(!node_joint) return;
    if(node_joint == 'leaf') return c(Leaf, {root, term:'leaf', label}); 
    return c(Node, {root, label, target, target_term, accordion_root});
}

function Node({root, label, target, target_term, is_target, accordion_root}){
    const name       = use_store(d=> d.value(d, root, 'name', '')); // d.face.name(d, root)
    const type       = use_store(d=> d.stem(d, root, 'type'));
    const type_name  = use_store(d=> d.type_name(d, root)); // change from face.type to type_name
    const icon       = use_store(d=> d.face.icon(d, root));
    const root_terms = use_store(d=> [...d.node.get(root).forw.keys()]);
    const terms      = use_store(d=> is_target ? [...d.node.get(type).forw.keys()] : root_terms);
    let outlet_root = root;
    let outlet_terms = [];
    if(is_target){
        outlet_root = type;
        outlet_terms = logic_terms;
    }else if(['Root', 'Term'].includes(type_name)){
        if(type_name == 'Term') target_term = snake_case(name);
        outlet_terms = logic_terms;
    }else if(type_name == 'Stem'){
        outlet_terms = stem_type_terms;
    }
    if(!terms.some(term => outlet_terms.includes(term))){
        return c(InputGroup, {}, node_header(root, label, icon, name, target, target_term, is_target, type_name));
    }
    return(
        c(Accordion.Item, {eventKey:accordion_root+root},  
            c(Accordion.Header, {className:'pe-2'}, 
                node_header(root, label, icon, name, target, target_term, is_target, type_name)
            ),
            c(Accordion.Body, {className:'ps-4'}, 
                outlet_terms.map(term=> c(Term_Joint, {root:outlet_root, term, target, target_term, key:outlet_root+term}))
            )
        )
    )
}

function node_header(root, label, icon, name, target, target_term, is_target, type_name){
    return[
        !is_target && c(Button, {variant:'outline-primary', className:'bi-plus-square border-0',
            onClick(e){
                e.stopPropagation();
                set_store(d=>{
                    if(type_name == 'Root'){
                        d.build.root(d, target, root);
                    }else if(type_name == 'Term'){
                        d.build.term(d, target, root);
                    }else if(type_name == 'Stem'){ 
                        d.build.stem(d, {root:target, term:target_term, stem:root});
                    }
                });
            }
        }),
        label  && c(InputGroup.Text, {}, readable(label)), 
        c(InputGroup.Text, {className:'text-body'}, 
            c(Svg, {svg:icon, className:'me-1'}), 
            name + ' ('+type_name+')',
        ),
    ]
}

function Term_Joint({root, term, target, target_term}){
    const term_joint = use_store(d=> d.term_joint(d, root, term));
    if(!term_joint) return;
    if(term_joint.name == 'node'){
        return c(Node_Joint, {root:term_joint.node, label:term, target, target_term, accordion_root:root});
    }else if(term_joint == 'leaf'){
        return c(Leaf, {root, term, label:term});
    }
    return c(Term, {root, term, target, target_term});
}

function Term({root, term, target, target_term}){
    const stems = use_store(d=> d.node.get(root).forw.get(term));
    return(
        c(Accordion.Item, {eventKey:root+term},
            c(Accordion.Header, {className:'pe-2'}, 
                c(InputGroup.Text, {}, readable(term)),
            ),
            c(Accordion.Body, {className:'ps-4'}, 
                stems.map((stem, index)=>{
                    const key = term + stem;
                    if(stem.type) return c(Leaf, {root, term, index, key});
                    return c(Node_Joint, {root:stem, target, target_term, accordion_root:root, key,});
                }),
            ),
        )
    )
}

function Leaf({root, term, index, label}){ // need MAKE button for leaf?! #1 
    if(term == 'leaf' || label) index = 0;
    const leaf = use_store(d=> d.node.get(root).forw.get(term)[index]);
    return(
        c(InputGroup, {}, //className:'mb-2' 
            label  && c(InputGroup.Text, {}, readable(label)), 
            term == 'leaf' && c(InputGroup.Text, {className:'bi-box text-body'}, ''),
            leaf.type == 'xsd:boolean' ?
                c(Form.Check, {
                    className:'flex-grow-1 ms-2 mt-2',
                    type:     'switch',
                    checked:  leaf.value, 
                }) :  
                c(Form.Control, {
                    value: leaf.value, 
                }),
            ///c(Buttons, {t:t}),
        )
    )
}


//node_content(root, target, target_term, is_target, type_name), // c(Node_Content_Joint, {target, type_name}),

// function node_content(root, target, target_term, is_target, type_name){
//     if(is_target) return c(Target_Content, {root, target});
//     if(['Root', 'Term'].includes(type_name)){
//         return logic_terms.map(term=> c(Term_Joint, {root, term, target, target_term, key:root+term}));
//     }else if(type_name == 'Stem'){
//         return stem_type_terms.map(term=> c(Term_Joint, {root, term, key:root+term})); //return c(Stem_Type_Content, {root});
//     }
// }
// function Target_Content({root, target}){
//     const type  = use_store(d=> d.stem(d, root, 'type'));
//     return logic_terms.map(term=> c(Term_Joint, {root:type, term, target, key:type+term}));
// }


//function Stem_Type_Content({root}){
    //const terms = use_store(d=> [...d.node.get(root).forw.keys()]); 
    //return terms.map(term=> c(Term_Joint, {root, term, key:root+term}));
//}