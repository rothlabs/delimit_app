export function row(children, id){
    return React.createElement(
        'div',
        {className: 'row', key:id},
        children,
    );
}

export function col(children, id){
    return React.createElement(
        'div',
        {className: 'col', key:id},
        children,
    );
}

export function button(name, func){
    return React.createElement(
        'button',
        {className: 'btn btn-secondary', onClick: func},
        name,
    );
}