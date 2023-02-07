import {createElement as rce} from 'react';
import * as ui from 'core/ui.js';

export function Toolbar(){
    return(
        rce('div', {className: 'position-absolute start-0 end-0 bottom-0'},
            rce('div', {className: 'container-fluid text-center bottom-0 pt-2 pb-2 bg-body'},
                ui.row([
                    ui.button('Undo', ()=>console.log('Undo')),
                    ui.button('Redo', ()=>console.log('Redo')),
                    ui.button('Greenware', ()=>console.log('Greenware'))
                ].map(ui.col)),
            )
        )
    )
}
