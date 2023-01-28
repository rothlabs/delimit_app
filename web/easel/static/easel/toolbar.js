export function Toolbar(base, product){
    base.ui.render(React.createElement(
        'button',
        {className: 'btn btn-secondary', onClick: product.undo},
        'Undo',
    ));
}