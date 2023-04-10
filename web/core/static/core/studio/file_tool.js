import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Dropdown, Form, InputGroup} from 'boot';
import {use_mutation} from '../app.js';
import {show_login} from '../login.js';
import {useNavigate, useLocation} from 'rrd';
import {useReactiveVar} from 'apollo';
import {product_rv, editor_qr_rv} from './editor.js';

// 'Save' works except it reverts back to original in the buffer!! You need to go away and come back to the page for it to show the new model!!!

export function File_Tool(p){
    const navigate = useNavigate();
    //const location = useLocation();
    const product = useReactiveVar(product_rv);
    const editor_qr = useReactiveVar(editor_qr_rv);
    const [show, set_show] = useState(false);
    const [disabled, set_disabled] = useState(true);
    const [save_disabled, set_save_disabled] = useState(true);
    const [name, set_name] = useState(editor_qr.product.name);
    const [story, set_story] = useState(editor_qr.product.story);
    const [is_public, set_is_public] = useState(editor_qr.product.public);
    const [save_product, data, alt, reset] = use_mutation([
        ['saveProduct response product{name, id}', 
            ['Boolean! asCopy', false], 
            ['String! id', editor_qr.product.id], 
            ['String! name', name], 
            ['String story', 't'+story],   /// 't' is present so the server knows story is being provided even if the user inputs nothing
            ['Boolean! public', is_public],
            ['Upload blob', new Blob(['Empty Product File'], { type: 'text/plain' })],
        ]
    ], 'GetProducts GetProduct');
    useEffect(()=>{ if(!show) reset(); },[show]);
    useEffect(()=>{ 
        set_disabled(true);
        set_save_disabled(true);
        if(editor_qr.user && editor_qr.user.id == editor_qr.product.owner.id) {
            set_disabled(false);
            set_save_disabled(false);
        }else{ if(editor_qr.user && is_public) set_disabled(false); }
    },[editor_qr.user]);
    useEffect(()=>{ 
        if(data && data.saveProduct.product){
            setTimeout(()=>{ reset(); set_show(false); }, 1200);
            navigate('/studio/'+data.saveProduct.product.id);
        }
    },[data]);
    function save(as_copy){
        product.export_glb((blob)=>{
            save_product({variables:{blob:blob, asCopy:as_copy}});
        });
    }
    return(
        //r(DropdownButton, {title:'', className:'bi-card-heading', variant:p.button_variant, show:show, onToggle:(s)=>set_show(s)},
        r(Dropdown, {show:show, onToggle:(s)=>set_show(s)},
            r(Dropdown.Toggle, {className:'bi-card-heading', variant:p.button_variant}, ' '),
            r(Dropdown.Menu, {},
                alt ? r(alt) :
                    data && data.saveProduct.product ? r('p',{}, data.saveProduct.response) :
                        r(Fragment,{},
                            data && r('p', {}, data.saveProduct.response),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Name'),
                                r(Form.Control, {maxLength:64, value:name, onChange:(e)=>set_name(e.target.value), disabled:disabled}),
                            ),
                            r(InputGroup, {className:'mb-3'}, 
                                r(InputGroup.Text, {}, 'Story'),
                                r(Form.Control, {as:'textarea', maxLength:512, value:story, onChange:(e)=>set_story(e.target.value), disabled:disabled}),
                            ),
                            r(Form.Check, {className:'mb-3', label:'Public', checked:is_public, onChange:(e)=>set_is_public(e.target.checked), disabled:disabled}),
                            r(Row,{className:'row-cols-auto'},
                                r(Col,{}, r(ButtonGroup, {},
                                    r(Button,{onClick:()=>save(false), variant:'outline-primary', disabled:save_disabled}, 
                                        r('i',{className:'bi-disc'}),' Save'),
                                    r(Button,{onClick:()=>save(true), variant:'outline-primary', disabled:disabled}, 
                                        r('i',{className:'bi-files'}), ' Save Copy'),
                                )),
                                disabled && save_disabled && r(Col,{}, r(Button,{onClick:()=>show_login(true), variant:'outline-primary'}, 
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