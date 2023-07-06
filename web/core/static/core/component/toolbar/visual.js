import {createElement as c} from 'react';
import {ButtonGroup, ToggleButton, } from 'react-bootstrap';
import {useS, ss} from '../../app.js'

export function Visual(){
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    return(
        //c(ButtonGroup, {},
        c(ToggleButton, {
            id:'open_visual_panel',
            type: 'checkbox',
            className:'bi bi-eye border-white',
            variant:'outline-primary', size: 'lg',
            checked: show && panel=='visual',
            onChange:(e)=> { 
                if(e.currentTarget.checked){  ss(d=> d.studio.panel={name:'visual', show:true});   }
                else{                         ss(d=> d.studio.panel.show=false);                   }
            }
        })
        //)
    )
}

