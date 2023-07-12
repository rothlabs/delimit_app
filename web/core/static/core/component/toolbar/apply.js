import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, gs, useS} from '../../app.js';

export function Apply(){ 
    const transformable = useS(d=> d.pick.transformable);
    const buttons = [
        {name:'Apply Transform', icon:'bi-arrows-move bi-check-lg', func(d){
            //const axc = ['ax','c'];
            //['ax','c'].forEach(c=>{
                //const r = d.pick.n.filter(n=> d.n[n].c.base_matrix);
                d.pick.n.forEach(r=>{
                    if(d.n[r].c.base_matrix){
                        d.node.for_nt(d, r, 'point', n=>{
                            const pos = d.n[n].c.xyz.applyMatrix4(d.n[r].c.base_matrix.c);
                            d.node.set(d, n, {x:pos.x, y:pos.y, z:pos.z});
                        });
                        ['move_x','move_y','move_z','turn_x','turn_y','turn_z','scale_x','scale_y','scale_z'].forEach(t=>{
                            d.node.get(d,r,t).forEach(n=>{
                                d.delete.edge_or_node(d,r,n,{t:t});
                            });
                        });
                    }
                });
            //});
            //const nodes = [...d.pick.n, ...d.node.n(d, d.pick.n, {deep:true})];
            //d.close(d, nodes); // need patch adjust in app.js to open_pack on undo ?!?!?!?!
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