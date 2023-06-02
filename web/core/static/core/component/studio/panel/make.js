import {createElement as c, Fragment} from 'react';
import {Row, Col, Button} from 'react-bootstrap';
import {useS, ss} from '../../../app.js'

export function Make(){
    const show = useS(d=> d.studio.panel.show);
    const panel = useS(d=> d.studio.panel.name);
    const items = [
        {name:' Part',      icon:'bi-box',      value:'part'},
        {name:' Line',      icon:'bi-bezier2',  value:'line'},
        {name:' Sketch',    icon:'bi-easel',    value:'sketch'},
    ];
    return(
        show && panel=='make' && c(Fragment, {},
            c(Col, {className:'mt-4 ms-2 me-2'},
                ...items.map((item, i)=>
                    c(Row, {className: 'mt-1 text-left'},
                        c(Button, {
                            id:'make_'+item.value,
                            className: 'border-white text-start '+item.icon,
                            variant:'outline-primary', size:'lg',
                            onClick:e=> ss(d=> d.studio.make(d, item.value)),
                        }, c('span',{style:{fontSize:'18px'}}, item.name))
                    )
                ),
            ),
        )
    )
}