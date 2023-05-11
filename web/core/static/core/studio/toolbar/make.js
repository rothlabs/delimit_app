import {createElement as c} from 'react';
import {Dropdown, Button, Row} from 'boot';
import {useD} from '../../app.js'

export function Make(){
    const items = [
        {name:' Part',      icon:'bi-box',      value:'part'},
        {name:' Line',      icon:'bi-bezier2',  value:'line'},
        {name:' Sketch',    icon:'bi-easel',    value:'sketch'},
    ];
    return(
        c(Dropdown, {},
            c(Dropdown.Toggle, {className:'bi-plus-lg', variant:'outline-primary', size: 'lg',}, ' '), //fs-4 font size to increase icon size but need to reduce padding too
            c(Dropdown.Menu, {},
                ...items.map((item, i)=>
                    c(Dropdown.Item, {
                        className: item.icon,
                        onClick:e=>useD.getState().set(d=>{
                            d.design.make(item.value);
                        }),
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
