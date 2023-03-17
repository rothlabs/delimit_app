import {createElement as r, useState, Fragment, useEffect} from 'react';
import {Row, Col, Button, ButtonGroup, Container, Dropdown, DropdownButton, Form, InputGroup} from 'boot';
import {use_mutation} from '../app.js';

export function File_Tool(p){
    const [show, set_show] = useState(false);
    const [disabled, set_disabled] = useState(true);
    const [save_disabled, set_save_disabled] = useState(true);
    const [name, set_name] = useState(p.product.name);
    const [story, set_story] = useState(p.product.story);
    const [is_public, set_is_public] = useState(p.product.public);
    //const [blob, set_blob] = useState(new Blob(['Empty Product File'], { type: 'text/plain' }));
    const [save_product, data, alt, reset] = use_mutation([
        ['saveProduct response product{name}', 
            ['Boolean! asCopy', false], 
            ['String! id', p.product.id], 
            ['String! name', name], 
            ['String story', story],
            ['Boolean! public', is_public],
            ['Upload blob', new Blob(['Empty Product File'], { type: 'text/plain' })],
        ]
    ], 'GetProducts GetProduct');
    useEffect(()=>{ if(!show) reset(); },[show]);
    useEffect(()=>{ 
        set_disabled(true);
        set_save_disabled(true);
        if(p.user && p.user.id == p.product.owner.id) {
            set_disabled(false);
            set_save_disabled(false);
        }else{ if(p.user && is_public) set_disabled(false); }
    },[p.user]);
    if(data && data.saveProduct.product) setTimeout(()=>{reset(); set_show(false)}, 1500);
    function save(as_copy){
        p.board.current.export_glb((blob)=>{
            save_product({variables:{blob:blob, asCopy:as_copy}});
        });
    }
    return(
        r(DropdownButton, {title:'File', variant:'outline-primary', show:show, onToggle:(s)=>set_show(s)},
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
                        r(ButtonGroup, {},
                            r(Button,{onClick:()=>save(false), variant:'outline-primary', disabled:save_disabled}, 
                                r('i',{className:'bi-disc-fill'}),' Save'),
                            r(Button,{onClick:()=>save(true), variant:'outline-primary', disabled:disabled}, 
                                r('i',{className:'bi-files'}), ' Save Copy'),
                        ),
                        //r(Button,{onClick:save_with_file, className:'ms-3', variant:'outline-primary'}, 
                        //        r('i',{className:'bi-disc'}), ' Test Save with File'),
                    )
        )
    )
}


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