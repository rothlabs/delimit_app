import {createElement as c} from 'react';
import {ToggleButton, ButtonToolbar} from 'react-bootstrap';
import {set_store, use_store} from 'delimit';

export function Draw(){
    const studio_mode = use_store(d=> d.studio.mode);
    const design_mode = use_store(d=> d.design.mode);
    const buttons = [
        {name:'Pen',  icon:'bi bi-vector-pen', value:'pen'},
        {name:'Brush', icon:'bi bi-brush', value:'brush'},
        {name:'Fill',  icon:'bi bi-paint-bucket', value:'fill'},
        {name:'Eraser', icon:'bi bi-eraser', value:'erase'},
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
                    onChange:e=> set_store(d=>{
                        if(d.design.mode == e.currentTarget.value){
                            d.design.mode = '';
                            //d.studio.cursor = '';
                        }else{
                            d.design.mode = e.currentTarget.value;
                            //d.studio.cursor = 'penIcon';
                        }
                    }),
                })
            ),
        )
    )
}


//if(d.design.mode=='erase') d.pick.mode = '';
                        //if(['pen','erase'].includes(d.design.mode)) d.pick.mode = '';