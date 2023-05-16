import {createElement as c, useEffect, useState, Fragment} from 'react';
import {Row, Col, Dropdown, Container, Form, ButtonGroup, Button, ToggleButton} from 'react-bootstrap';
import {ss, ssp, gs, useS, use_window_size} from '../../app.js';
import {Badge} from '../../node/basic.js'
import {String} from '../../node/input/string.js';
import {Float} from '../../node/input/float.js';


export function Inspect(){ 
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const string_tags = useS(d=> d.inspect.string_tags);
    const float_tags = useS(d=> d.inspect.float_tags);
    const nodes = useS(d=> d.pick.nodes); 
    const d = gs();
    //console.log('render inspector');
    return (
        show && (panel=='inspect__design' || panel=='inspect__nodes') && c(Fragment, {},
            c(Row, {className:'row-cols-auto gap-2 mb-3'},
                ...nodes.map(n=>
                    c(Col,{}, // might need to add key to keep things straight 
                        c(Badge, {n:n})
                    ) 
                ),
            ),
            ...string_tags.map(t=>
                c(String, {t:t})
            ),
            ...float_tags.map(t=>
                c(Float, {t:t})
            ),
            nodes.filter(n=>d.n[n].asset).length ? c('div', {className:''},
                c(Button, {
                    variant: 'outline-secondary',
                    onClick:e=>ssp(d=>{  // select function does not work inside produce because it has it's own produce 
                        d.pick.delete(d);
                    }),
                }, 'Delete'),
            ) : null,
        )
    )
}


