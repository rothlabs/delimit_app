import {createElement as c, Fragment} from 'react';
import {Row, Col, Container, ToggleButton, ButtonGroup, Badge} from 'react-bootstrap';
import {use_store, set_store, draggable, icon, Button} from 'delimit';


const buttons = [
    {name:'Delete', css_cls:'bi-x-lg', action:(d, node) => d.shut.node(d, {node, drop:true})},
];

export function Secondary_Action(){
    //console.log('render panel bar');
    return buttons.map(({name, css_cls, action})=>
        c(Button, {
            id: 'secondary_action_' + name,
            css_cls,
            commit: d => action(d, d.picked.secondary.node),
        })
    )
}