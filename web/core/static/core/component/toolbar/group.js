import {createElement as c} from 'react';
import {ToggleButton} from 'react-bootstrap';
import {useS, ss} from '../../app.js'

export function Group(){
    const grouping = useS(d=> d.studio.grouping);
    return(
        c(ToggleButton, {
            id:'toggle_auto_add_to_group',
            type: 'checkbox',
            className:'bi-box-seam border-white',
            variant:'outline-primary', size: 'lg',
            checked: grouping,
            onChange:e=> ss(d=> d.studio.grouping = !d.studio.grouping),
        })
    )
}

