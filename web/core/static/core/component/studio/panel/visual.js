import {createElement as c, Fragment} from 'react';
import {Container, Form} from 'react-bootstrap';
import {useS, ss, readable} from '../../../app.js'

export function Visual(){
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const graph_tag_vis = useS(d=> d.graph.tag_vis);
    return(
        show && panel=='visual' && c(Fragment, {},
            c(Container, {className:'mt-3'},
                c('h5', {}, 'Graph Nodes'),
                ...Object.entries(graph_tag_vis).map(([t,vis], i)=>
                    c(Form.Check, {
                        className:'mt-2', 
                        label: readable(t), 
                        checked: vis, 
                        onChange:e=> ss(d=> d.graph.set_tag_vis(d, t, e.target.checked)),
                    }),
                ),
            ),
        )
    )
}