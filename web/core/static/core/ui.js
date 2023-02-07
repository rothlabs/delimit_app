import {createElement as rce} from 'react';

export function row(children, id){
    return rce('div', {className: 'row', key:id},
        children,
    );
}

export function col(children, id){
    return rce('div', {className: 'col', key:id},
        children,
    );
}

export function button(name, func){
    return rce('button', {className: 'btn btn-secondary', onClick: func},
        name,
    );
}