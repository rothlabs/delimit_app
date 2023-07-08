import {createElement as c} from 'react';
import {Button, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../app.js';

export function Remake(){ //Transmute or Recast
    const addable = useS(d=> d.pick.addable);
    const removable = useS(d=> d.pick.removable);
    const mergeable = useS(d=> d.pick.mergeable);
    const splittable = useS(d=> d.pick.splittable);
    var buttons = [
        {name:'Deep Copy',   icon:'bi-file-earmark-fill', func(d){
            const r = (d.studio.mode == 'design' ? d.design.part : d.pick.target);
            d.pick.group.forEach(n=> d.remake.copy(d, n, {r:r, deep:true}));
        }},
        {name:'Shallow Copy',  icon:'bi-file-earmark', func(d){
            const r = (d.studio.mode == 'design' ? d.design.part : d.pick.target);
            d.pick.group.forEach(n=> d.remake.copy(d, n, {r:r}));
        }},
        {name:'Add',  icon:'bi-box-arrow-in-up-right', disabled:!addable, func(d){ // put button definitions like this in store ?
            d.pick.group.forEach(n=>{ 
                if(!d.node.n(d, n, {deep:true}).includes(d.pick.target)) d.make.edge(d, d.pick.target, n); // automatically figure out what it is mostly being used as and set tag from that. Could provide options to user as well
            }); 
        }},
        {name:'Remove',  icon:'bi-box-arrow-up-right', disabled:!removable, func(d){ 
            d.node.for_n(d, d.pick.target, (r,n,t)=>{
                if(d.pick.group.includes(n)) d.delete.edge(d,r,n,{t:t});
            })
        }},
        {name:'Merge',  icon:'bi-arrows-angle-contract', disabled:!mergeable, func(d){ // put button definitions like this in store
            d.remake.merge(d, d.pick.group, d.pick.target);//d.pick.merge(d);
        }},
        {name:'Split',  icon:'bi-arrows-angle-expand', disabled:!splittable, func(d){ // disabled: if nodes don't have any splittable r 
            d.remake.split(d, d.pick.group, d.pick.target);
        }},
    ];
    return(
        c(ButtonToolbar, {}, ...buttons.map((button,i)=>
            c(Button, {
                variant: 'outline-primary', size: 'lg',
                className: 'border-white ' + button.icon, 
                disabled: button.disabled,
                onClick:e=> ss(d=> button.func(d)),
            }),
        ))
    )
}

//bi-sign-merge-left

// if(all_asset){
    //     buttons.push(
    //         {name:'Merge',  icon:'bi-arrows-angle-contract', disabled:!same, func(d){ // put button definitions like this in store
    //             d.remake.merge(d, d.pick.group,  d.pick.target);//d.pick.merge(d);
    //         }},
    //     );
    // }