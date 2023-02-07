import {createElement as rce} from 'react';
import * as ui from 'core/ui.js';

export function Toolbar(props){
    return(
        rce('div', {className: 'position-absolute start-0 end-0 bottom-0'},
            rce('div', {className: 'container-fluid text-center bottom-0 pt-2 pb-2 bg-body'},
                ui.row([
                    ui.button('Undo', ()=>props.set_action({name:'undo'})),
                    ui.button('Redo', ()=>props.set_action({name:'redo'})),
                    ui.button('Greenware', ()=>props.set_action({name:'greenware'}))
                ].map(ui.col)),
            )
        )
    )
}
