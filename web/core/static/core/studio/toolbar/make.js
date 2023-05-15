import {createElement as c} from 'react';
import {Dropdown, Button, Row} from 'react-bootstrap';
import {useS, ss, ssp} from '../../app.js'

export function Make(){
    const ready = useS(d=> d.studio.ready);
    const items = [
        {name:' Part',      icon:'bi-box',      value:'part'},
        {name:' Line',      icon:'bi-bezier2',  value:'line'},
        {name:' Sketch',    icon:'bi-easel',    value:'sketch'},
    ];
    function toggled(s){
        if(s) ss(d=> d.studio.menu='make');
    }
    return(
        c(Dropdown, {onToggle:s=>toggled(s)},
            c(Dropdown.Toggle, {
                id:'new_node_dropdown',
                className:'bi-plus-lg',
                variant:'outline-primary', 
                size: 'lg',
                disabled:!ready,
            }, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                ...items.map((item, i)=>
                    c(Dropdown.Item, {
                        id:'new_'+item.value,
                        className: item.icon,
                        onClick:e=> ssp(d=> d.studio.make(d,item.value)),
                    }, item.name)
                ),
            )
        )
    )
}


                    // c(Row, {className:'mt-3 mb-3 ms-2 me-2'},
                    //     c(Button, {
                    //         className: button.icon,
                    //         variant: 'outline-primary', size: 'lg',
                    //         onClick:e=>useD.getState().set(d=>{ 
                    //             //d.design.part = design_candidate;
                    //             //d.studio.mode = 'design'; 
                    //         }),
                    //     }, button.name)
                    // )
