import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Badge} from 'react-bootstrap';
import {use_store, set_store, draggable, icon, Button} from 'delimit';


export function Leaf_Bar(){
    const panel_mode_drags = [
        {name:'Decimal', stem:{type:'xsd:decimal', value:0}},
        {name:'Integer', stem:{type:'xsd:integer', value:0}},
        {name:'String',  stem:{type:'xsd:string',  value:'new'}},
        {name:'Boolean', stem:{type:'xsd:boolean', value:true}},
    ];
    //console.log('render panel bar');
    return panel_mode_drags.map(({name, stem})=>
        c(Button, {
            id: 'new_leaf_' + name,
            cls: icon.css[stem.type],
            width: 45,
            height: 45,
            //className: icon.css[stem.type] + ' border-0', 
            //type: 'radio', // checkbox
            //variant: 'outline-primary', size: 'lg',
            ...draggable({stem}),
        })
    )
}

// return panel_mode_drags.map(({name, stem})=>
//         c(ToggleButton, {
//             id: 'leaf_bar_'+name,
//             className: icon.css[stem.type] + ' border-0', 
//             type: 'radio', // checkbox
//             variant: 'outline-primary', size: 'lg',
//             ...draggable({stem}),
//         })
//     )

