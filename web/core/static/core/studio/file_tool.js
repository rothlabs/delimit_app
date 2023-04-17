import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Dropdown, Form, InputGroup} from 'boot';
import {use_mutation} from '../app.js';
import {show_login} from '../login.js';
import {useNavigate, useLocation} from 'rrd';
import {useReactiveVar} from 'apollo';
import {product_rv, editor_rv, no_edit_rv} from './editor.js';
import {show_copy_product} from './crud.js';

export function File_Tool(p){
    const navigate = useNavigate();
    //const location = useLocation();
    //const product = useReactiveVar(product_rv);
    const no_edit = useReactiveVar(no_edit_rv);
    const editor = useReactiveVar(editor_rv);
    const [show, set_show] = useState(false);
    //const [disabled, set_disabled] = useState(true);
    //const [save_disabled, set_save_disabled] = useState(true);
    const [name, set_name] = useState(editor.product.name);
    const [story, set_story] = useState(editor.product.story);
    const [is_public, set_is_public] = useState(editor.product.public);
    const [edit_product, data, alt, reset] = use_mutation([
        ['saveProduct response product{name, id}', 
            ['Boolean! toNew', false], 
            ['String! id', editor.product.id], 
            ['String! name', name], 
            ['Boolean! public', is_public],
            ['String story', 't'+story],   /// 't' is present so the server knows story is being provided even if the user inputs nothing
            //['Upload blob', new Blob(['Empty Product File'], { type: 'text/plain' })],
            //['[ID [ID] [ID] [ID]] parts', ['t',[7,9],[5,0],[1,1]]], // if map returns empty it might be like ['t',] which causes graphql error! 
        ]
    ], 'GetProducts'); //GetProduct
    //useEffect(()=>{ if(!show) reset(); },[show]);
    //useEffect(()=>{ 
    //    disabled(true);
        //set_save_disabled(true);
    //    if(editor.user && editor.user.id == editor.product.owner.id) {
    //        disabled(false);
            //set_save_disabled(false);
    //    }//else{ if(editor.user && is_public) set_disabled(false); }
    //},[editor.user]);
    //useEffect(()=>{ 
    //    if(data && data.saveProduct.product){
    //        setTimeout(()=>{ reset(); set_show(false); }, 1200);
            //navigate('/studio/'+data.saveProduct.product.id);
    //    }
    //},[data]);
    //function save(to_new){
        //save_product({variables:{blob:blob, toNew:to_new}});
        //product.export_glb((blob)=>{
            //save_product({variables:{blob:blob, toNew:to_new}});
        //});
    //}
    return(
        //r(DropdownButton, {title:'', className:'bi-card-heading', variant:p.button_variant, show:show, onToggle:(s)=>set_show(s)},
        r(Dropdown, {show:show, onToggle:(s)=>set_show(s)},
            r(Dropdown.Toggle, {className:'bi-card-heading', variant:p.button_variant}, ' '),
            r(Dropdown.Menu, {},
                //alt ? r(alt) :
                    //data && data.saveProduct.product ? r('p',{}, data.saveProduct.response) :
                        r(Fragment,{},
                            r('p', {}, data ? data.saveProduct.response : '...'),
                            //r('p',{}, 'Original: '+editor.product.name),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Name'),
                                r(Form.Control, {maxLength:64, value:name, disabled:no_edit, onChange:(e)=>{
                                    set_name(e.target.value);
                                    edit_product({variables:{name:e.target.value}});
                                }}),
                            ),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Story'),
                                r(Form.Control, {as:'textarea', maxLength:512, value:story, disabled:no_edit, onChange:(e)=>{
                                    set_story(e.target.value);
                                    edit_product({variables:{story:'t'+e.target.value}});
                                }}),
                            ),
                            r(Form.Check, {className:'mb-3', label:'Public', checked:is_public, disabled:no_edit, onChange:(e)=>{
                                set_is_public(e.target.checked);
                                edit_product({variables:{public:e.target.checked}});
                            }}),
                            r(Row,{className:'row-cols-auto'},
                                r(Col,{}, r(ButtonGroup, {},
                                    r(Button,{onClick:()=>show_copy_product(editor.product), variant:'outline-primary', disabled:no_edit, className:'bi-stack'}, ' Copy'), //r('i',{className:'bi-disc'}),
                                    r(Button,{onClick:()=>show_copy_product(editor.product), variant:'outline-primary', disabled:no_edit, className:'bi-layers'}, ' Shallow Copy'), //r('i',{className:'bi-files'}),
                                )),
                                no_edit && r(Col,{}, r(Button,{onClick:()=>show_login(true), variant:'outline-primary'}, 
                                        r('i',{className:'bi-box-arrow-in-right'}), ' Sign In')),
                            )
                        )
            )
        )
    )
}


//r(Container, {fluid:true},
                //r(Row,{},
                    //r(Col,{},

    //const [copy_func, copy_data, copy_alt, copy_reset] = use_mutation([
    //    ['copyProduct product{name}', ['String! id', p.product.id], ['String! name', name], ['String story', story]],
    //], 'GetProducts');

        //if(copy_data && copy_data.copyProduct.product) {
    //    setTimeout(()=>{copy_reset(); set_show(false)}, 1500);
    //}

//r(Dropdown, {}, 
            //r(Dropdown.Toggle,{variant:'outline-primary'}, ' File'), 
            //r(Dropdown.Menu, {}, //className:'d-dropdown-menu'

//r(DropdownButton, {title:'File', className:'dropdown-menu-3'}, //className:'gap-3'

//r(Dropdown.Toggle,{}, ' File'), 

//r(Button,{onClick:()=>console.log('save'), className:'dropdown-item'}, r('i',{className:'bi-disc-fill'}), ' Save'),

//, variant:'outline-primary', className:'dropdown-item'