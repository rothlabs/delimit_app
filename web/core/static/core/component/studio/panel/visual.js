import {createElement as c, Fragment} from 'react';
import {Form} from 'react-bootstrap';
import {useS, ss, ssp, readable} from '../../../app.js'

export function Visual(){
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const graph_tag_vis = useS(d=> d.graph.tag_vis);
    return(
        show && panel=='visual' && c(Fragment, {},
            //c(Col, {className:'mt-4 ms-2 me-2'},
                ...Object.entries(graph_tag_vis).map(([t,vis], i)=>
                    c(Form.Check, {
                        className:'mb-3', 
                        label: readable(t), 
                        checked: vis, 
                        onChange:e=> ss(d=> d.graph.set_tag_vis(d, t, e.target.checked)),
                    }),
                    // c(Row, {className: 'mt-1'},
                    //     c(Button, {
                    //         id:'make_'+item.value,
                    //         variant:'outline-primary', size:'lg',
                    //         onClick:e=> ssp(d=> d.studio.make(d, item.value)),
                    //     }, item.name)
                    // )
                ),
            //),
        )
    )
}