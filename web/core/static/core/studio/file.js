import {createElement as r, useState} from 'react';
import {Row, Col, Button, ButtonGroup, Container, Dropdown, DropdownButton, Form, InputGroup} from 'boot';
//import {Dropdown} from '../dropdown.js';

export function File_Tool(p){
    const [name, set_name] = useState(p.product.name);
    const [story, set_story] = useState(p.product.description);
    const key_press=(target)=> {if(target.charCode==13) console.log('set name')}; 
    return(
        r(Dropdown, {}, 
            r(Dropdown.Toggle,{}, ' File'), 
            r(Dropdown.Menu, {className:'dropdown-menu-300'},
                    r(InputGroup, {className:'mb-2'}, 
                        r(InputGroup.Text, {}, 'Name'),
                        r(Form.Control, {type:'text', maxLength:64, value:name, onChange:(e)=>set_name(e.target.value), onKeyPress:key_press}),
                    ),
                    r(InputGroup, {className:'mb-2'}, 
                        r(InputGroup.Text, {}, 'Story'),
                        r(Form.Control, {type:'text', maxLength:64, value:story, onChange:(e)=>set_story(e.target.value), onKeyPress:key_press}),
                    ),
                    r(Button,{onClick:()=>console.log('save'), variant:'outline-primary'}, r('i',{className:'bi-disc-fill'}), ' Save'),
                    r(Button,{onClick:()=>console.log('save as'), variant:'outline-primary'}, r('i',{className:'bi-disc-fill'}), ' Save As...'),
            )
        )
    )
}

//r(DropdownButton, {title:'File', className:'dropdown-menu-3'}, //className:'gap-3'

//r(Dropdown.Toggle,{}, ' File'), 

//r(Button,{onClick:()=>console.log('save'), className:'dropdown-item'}, r('i',{className:'bi-disc-fill'}), ' Save'),

//, variant:'outline-primary', className:'dropdown-item'