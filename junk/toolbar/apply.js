import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS} from '../../app.js';

export function Apply(){ 
    const transformable = useS(d=> d.pick.transformable);
    const buttons = [
        {name:'Apply Transform', icon:'bi-arrows-move bi-check-lg', func(d){
            d.pick.n.forEach(r=>{
                if(d.n[r].c.base_matrix){
                    d.graph.for_stem_of_tag(d, r, 'point', n=>{
                        const pos = d.n[n].c.xyz.applyMatrix4(d.n[r].c.base_matrix.c);
                        d.graph.set(d, n, {x:pos.x, y:pos.y, z:pos.z});
                    });
                    ['move_x','move_y','move_z','turn_x','turn_y','turn_z','scale_x','scale_y','scale_z'].forEach(t=>{
                        d.graph.get(d,r,t).forEach(n=>{
                            d.delete.edge_or_node(d,r,n,{t:t});
                        });
                    });
                }
            });
        }},
    ];
    const d = gs();
    return(
        transformable && c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-primary', size: 'lg',
                className: 'border-white ' + button.icon, 
                onClick:e=>ss(d=> button.func(d)),
            }),
        ))
    )
}