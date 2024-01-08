import {createElement as c} from 'react';
import {ToggleButton} from 'react-bootstrap';
import {useS, ss} from '../../app.js'

export function Visible(){
    const visible = useS(d=> d.pick.visible);
    return(
        c(ToggleButton, {
            id:'toggle_design_vis',
            type: 'checkbox',
            className:'bi-eye border-white',
            variant:'outline-primary', size: 'lg',
            checked: visible,
            onChange:e=> ss(d=>{
                d.pick.n.forEach(n=>{
                    d.n[n].design.vis = !visible;
                });
                d.pick.visible = !visible;
            }),
        })
    )
}

