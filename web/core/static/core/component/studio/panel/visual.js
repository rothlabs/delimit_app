import {createElement as c, Fragment} from 'react';
import {Container, Form, Row, Col} from 'react-bootstrap';
import {useS, ss, readable} from '../../../app.js'

export function Visual(){
    const panel = useS(d=> d.studio.panel.name);
    const show = useS(d=> d.studio.panel.show);
    const graph_tag_vis = useS(d=> d.graph.n_vis);
    const graph_edge_vis = useS(d=> d.graph.e_vis);
    return(
        show && panel=='visual' && c(Fragment, {},
            c(Row, {className:'mt-3 mb-3'},
                c(Col, {}, 
                    c('h5',{className:'text-secondary bi-diagram-3'}, ' Node'), // c('h5', {className:'mb-3'}, 'Nodes'),
                    ...Object.entries(graph_tag_vis).map(([t,vis], i)=>
                        c(Form.Check, {
                            className:'mt-2', 
                            label: readable(t), 
                            checked: vis, 
                            onChange:e=> ss(d=> d.graph.set_node_vis(d, t, e.target.checked)),
                        }),
                    ),
                ),
                c(Col, {}, 
                    c('h5',{className:'text-secondary bi-slash-lg'}, ' Edge'), // c('h5', {className:'mb-3'}, 'Edges'),
                    ...Object.entries(graph_edge_vis).map(([t,vis], i)=>
                        c(Form.Check, {
                            className:'mt-2', 
                            label: readable(t), 
                            checked: vis, 
                            onChange:e=> ss(d=> d.graph.set_edge_vis(d, t, e.target.checked)),
                        }),
                    ),
                ),
            ),
        )
    )
}