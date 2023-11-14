
import {createElement as c} from 'react';
import {ButtonGroup, ToggleButton, } from 'react-bootstrap';
import {useS, ss} from '../../app.js'

export function Make(){
    //const ready = useS(d=> d.studio.ready);
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    return(
        //c(ButtonGroup, {},
            c(ToggleButton, {
                id:'open_make_panel',
                type: 'checkbox',
                className:'bi bi-plus-lg border-white',
                variant:'outline-primary', size: 'lg',
                //disabled:!ready,
                checked: show && panel=='make',
                onChange:(e)=> { 
                    if(e.currentTarget.checked){ 
                        
                        ss(d=> d.studio.panel={name:'make', show:true});
                    }else{ ss(d=> d.studio.panel.show=false); }
                }
            })
        //)
    )
}
