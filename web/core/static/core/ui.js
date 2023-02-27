import {createElement as r} from 'react';


export function Row(p){
    return r('div', {className: 'row'}, p.children);
}

export function Col(p){ 
    return r('div', {className: 'col'}, p.children); 
}

export function Button(p){ 
    return r('button', {className:'btn btn-secondary', onClick:p.func}, p.text);
}


// export function Row(p){
//     return rce('div', {className: 'row'}, p.children);
// }

// export function Col(p){
//     return rce('div', {className: 'col'}, p.children);
// }

// export function Button(name, func){ 
//     return rce('button', {className: 'btn btn-secondary', onClick: func}, name);
// }