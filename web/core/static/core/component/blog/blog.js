import {createElement as c} from 'react';
import {
    use_store,
    render_token, Center_Scroller,
    Repo_Browser, Blog_Post,
} from 'delimit';
import {useOutletContext, useNavigate} from 'react-router-dom';

export function Blog(){
    const {render_header} = useOutletContext();
    return[
        render_header(() => 
            c('div', {
                className:'d-inline-flex mt-1', // position-relative 
            },
                c(Nav_Menu),
            ),
        ),
        c(Mode),
    ]
}

export function Mode(){
    const mode = use_store(d=> d.blog.mode);
    console.log(mode);
    if(mode == 'post'){
        return c(Center_Scroller, {}, c(Blog_Post));
    }else if(mode == 'browse'){
        return c(Center_Scroller, {},
            c(Repo_Browser, {
                show_meta:false, 
                required:['blog'],
                post_load:d => d.blog.set_mode('post'),
            }),
        )
    }
}

function Nav_Menu(){
    const navigate = useNavigate();
    return [
        {name:'Studio', onClick:()=>navigate('/studio'), icon:'bi-palette2'},
    ].map(props => render_token({group:'nav_menu', ...props, content:'badge'}))
}