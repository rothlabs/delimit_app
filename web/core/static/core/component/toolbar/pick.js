import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {set_store, use_store} from 'delimit';

export function Pick(){
    const deep = use_store(d=> d.pick.deep);
    const multi = use_store(d=> d.pick.multi);
    const box = use_store(d=> d.pick.box);
    const buttons = [
        {name:'Deep', icon:'bi-cursor-fill', checked:deep, func(d){
            d.pick.deep = !d.pick.deep;
        }},
        {name:'Multi', icon:'bi-cursor', checked:multi, func(d){
            d.pick.multi = !d.pick.multi;
        }},
        {name:'Box', icon:'bi-bounding-box-circles', checked:box, func(d){
            d.pick.box = !d.pick.box;
        }},
    ];
    return(
        c(ButtonToolbar, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'pick_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    checked: button.checked,
                    className: button.icon + ' border-0',
                    onChange:e=> set_store(d=>{
                        button.func(d);
                        if(d.design.mode == 'erase') d.design.mode = '';
                    }),
                })
            ),
        )
    )
}



// onChange:e=> ss(d=>{ 
                    //     if(d.pick.mode == e.currentTarget.value){
                    //         d.pick.mode = '';
                    //     }else{
                    //         d.pick.mode = e.currentTarget.value;
                    //     }
                    //     if(d.design.mode == 'erase') d.design.mode = '';
                    // }), 

//if(['pen','erase'].includes(d.design.mode)) d.design.mode = '';