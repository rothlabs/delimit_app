import * as ui from 'core/ui.js';

export function Toolbar(base, product){
    base.ui.render(React.createElement(
        'div',
        {className: 'position-absolute start-0 end-0 bottom-0'},
        React.createElement(
            'div',
            {className: 'container-fluid text-center bottom-0 pt-2 pb-2 bg-body'},
            ui.row([
                ui.button('Undo', product.undo),
                ui.button('Redo', product.redo),
                ].map(ui.col)),
        )
    ));
}
