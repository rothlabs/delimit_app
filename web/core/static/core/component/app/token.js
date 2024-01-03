import {createElement as c, useRef, useState} from 'react';
import {use_store, set_store, act_store, assess, Icon, block_size, render_badge} from 'delimit';
import classNames from 'classnames';
import {make_size} from 'delimit';

export function render_token(props){
    if(props.active)  return c(Toggle_Token, props);
    if(props.node)    return c(Pickable_Token, {...props, type:'node',    id:props.node});
    if(props.repo)    return c(Pickable_Token, {...props, type:'repo',    id:props.repo});
    if(props.version) return c(Pickable_Token, {...props, type:'version', id:props.version});
    return c(Token_Base, props);
}

export const render_badge_token = props => render_token({...props, content:'badge'});

function Toggle_Token(props){
    const active = use_store(d=> props.active(d));
    return c(Token_Base, {...props, active});
}

function Pickable_Token(props){
    const primary_pick = use_store(d=> d.picked.primary[props.type].has(props.id));
    const secondary_pick = use_store(d=> d.picked.secondary[props.type].has(props.id));
    //console.log(secondary_pick, props.type, props.id);
    props.style = props.style ?? {};
    props.style.borderLeft  = (primary_pick ?   ('thick solid var(--bs-primary)')   : 'none');
    props.style.borderRight = (secondary_pick ? ('thick solid var(--bs-secondary)') : 'none');
    return c(Token_Base, props);
}

function render_input({type='input', maxLength, placeholder, value, onFocus, onBlur, onChange, store_action}){
    return c(type, {
        className: 'form-control h-100' + (type=='textarea' ? ' border-start border-info' : ''),
        style: {
            background: 'transparent',
            resize: 'none',
            width: type=='textarea' ? 300 : 250,
        },
        maxLength, placeholder, value, onFocus, onBlur, 
        onChange(e){
            if(store_action)  act_store(d => store_action(d, e));
            if(onChange) onChange(e);
        },
    })
}

function Token_Base({inner_ref, group, icon, name, content, width, height, style, active, store_setter, store_action,
                        onClick, onPointerDown, onPointerUp, onContextMenu, onPointerEnter, onPointerLeave}){
    const target = useRef();
    const size = make_size(content, width, height);
    const [hover, set_hover] = useState(false);
    if(!content && !name && !icon) return;
    const tall = (height > block_size);
    const className = classNames(
        'text-info bg-body user-select-none', 
        tall ? 'rounded' : 'rounded-pill', 
        {'bg-info-subtle': hover,
        'border border-2 border-info': active,}
    );
    const content_css_cls = classNames(
        'd-flex h-100 gap-3', //icon_cls, {'h5': !items},
        {'align-items-center': !tall},
        (size.width ? 'justify-content-center' : 'mx-3'), //mx-auto
    );
    //if(!size.width) size.width = 'fit-content';
    size.width = size.width ?? 'fit-content';
    let button = (store_setter || store_action || onClick || onPointerEnter);
    const render_name = ({minWidth}) => c('div', {className: tall ? 'mt-1' : '', style:{minWidth}}, name ?? 'untitled');
    const render_token_badge = () => render_badge({icon, name});//c('div', {className:'d-flex gap-2 h-100 align-items-center'}, c(Icon, {icon}), name ?? 'untitled');
    const render_token_input = props => {
        button = true;
        const type = tall ? 'textarea' : 'input';
        return render_input({...props, height, type});
    };
    const render_content = () => {
        if(content == null) return c(Icon, {icon, size:'h5', color:'info'});//c('div', {className:content_css_cls});
        if(content == 'badge') return render_token_badge(); 
        return assess(content, {
            render_name, 
            render_badge: render_token_badge, 
            render_input: render_token_input
        });
    }
    return(
        //(active != null) && c(Active_Ring, {size, target: (active ? target.current : null)}),
        c('div', {
            ref: ref => {
                target.current = ref;
                if(inner_ref) inner_ref.current[name] = ref;
            },
            id: group + '__' + name, // group ? group + '__' + name : name,
            role: button ? 'button' : null,
            className, //: 'd-flex text-info rounded-pill ' + (active ? 'border border-2 border-info' : ''), // bg-info-subtle 
            style: {...style, ...size},//{...size, ...springs},
            onClick(e){
                //e.stopPropagation();
                if(store_setter)  set_store(d => store_setter(d));
                if(store_action)  act_store(d => store_action(d));
                if(onClick) onClick(e);
            },
            onPointerDown, onPointerUp, onContextMenu,
            onPointerEnter(e){
                //e.stopPropagation();
                if(button) set_hover(true);//api.start({backgroundColor: 'var(--bs-info-bg-subtle)'}); // var(--bs-info-bg-subtle)
                //if(onPointerEnter) onPointerEnter(e);
            },
            onPointerLeave(e){
                //e.stopPropagation();
                if(button) set_hover(false);//api.start({backgroundColor: 'var(--bs-body-bg)'});
                //if(onPointerLeave) onPointerLeave(e);
            },
        }, 
            c('div', {className:content_css_cls}, render_content()),
        )
    )
}