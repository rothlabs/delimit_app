import {createElement as c} from 'react';
import {Token} from 'delimit';
import {useOutletContext, useNavigate} from 'react-router-dom';

export function Home(){
    const {render_header} = useOutletContext();
    return[
        render_header(() => 
            c('div', {
                className:'position-relative d-inline-flex',
            },
                c(Nav_Menu),
            ),
        ),
    ]
}

function Nav_Menu(){
    const navigate = useNavigate();
    return [
        {name:'Shop',   onClick:()=>navigate('shop'),   icon:'bi-bag'},
        {name:'Studio', onClick:()=>navigate('studio'), icon:'bi-palette2'},
    ].map(props => c(Token, {group:'history', ...props, content:'badge'}))
}