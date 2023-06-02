import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {ss, useS} from '../../../app.js';

export function Draw(){
    const studio_mode = useS(d=> d.studio.mode);
    const design_mode = useS(d=> d.design.mode);
    const buttons = [
        {name:'Draw',  icon:'bi-pencil', value:'draw'},
        {name:'Erase', icon:'bi-eraser', value:'erase'},
        //{name:'Move', icon:'bi-arrows-move', value:'move'},
    ];
    return(
        studio_mode=='design' && c(ButtonToolbar, {}, 
            ...buttons.map((button,i)=>
                c(ToggleButton,{
                    id: 'design_mode_'+i,
                    type: 'checkbox',
                    variant: 'outline-primary', size: 'lg',
                    value: button.value,
                    checked: design_mode == button.value,
                    className: button.icon + ' border-white',
                    onChange:e=> ss(d=>{
                        //console.log(e.currentTarget.value, e.currentTarget.checked);
                        if(d.design.mode == e.currentTarget.value){
                            d.design.mode = '';
                        }else{
                            d.design.mode = e.currentTarget.value;
                        }
                        if(d.design.mode=='erase') d.pick.mode = '';
                        //if(['draw','erase'].includes(d.design.mode)) d.pick.mode = '';
                    }),
                })
            ),
        )
    )
}