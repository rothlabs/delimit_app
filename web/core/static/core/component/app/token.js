import {createElement as c, useRef, useState} from 'react';
import {use_store, set_store, act_on_store, assess, Icon, block_size, render_badge} from 'delimit';
import classNames from 'classnames';
import {make_size} from 'delimit';

export function render_token(props){
    if(props.active)  return c(Toggle_Token, props);
    if(props.node)    return c(Pickable_Token, {...props, type:'node',    id:props.node});
    if(props.repo)    return c(Pickable_Token, {...props, type:'repo',    id:props.repo});
    if(props.version) return c(Pickable_Token, {...props, type:'version', id:props.version});
    if(props.root && props.term) return c(Pickable_Term_Token, props);
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
    props.style = props.style ?? {};
    props.style.borderLeft = 'none';
    if(primary_pick && !props.hide_primary_pick){
        props.style.borderLeft = 'thick solid var(--bs-primary)';
    }
    props.style.borderRight = 'none';
    if(secondary_pick && !props.hide_secondary_pick){
        props.style.borderRight = 'thick solid var(--bs-secondary)';
    }
    return c(Token_Base, props);
}

function Pickable_Term_Token(props){
    const picked = use_store(d=> {
        const {root, term} = d.get.picked_context(d);
        return (root == props.root && term == props.term);
    });
    props.style = props.style ?? {};
    props.style.borderRight = 'none';
    if(picked) props.style.borderRight = 'thick solid var(--bs-secondary)';
    return c(Token_Base, props);
}

function render_switch({checked, onChange, store_action}){
    return c('div', {className:'form-check form-switch mt-1'},
        c('input', {
            className:'form-check-input',
            type: 'checkbox',
            role: 'button',
            checked, 
            onChange(e){
                if(store_action) act_on_store(d => store_action(d, e));
                if(onChange) onChange(e);
            },
        })
    )
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
            if(store_action) act_on_store(d => store_action(d, e));
            if(onChange) onChange(e);
        },
    })
}

function Token_Base({inner_ref, group, icon, name, content, width, height, 
                        style, active, store_setter, store_action,
                        onClick, onPointerDown, onPointerUp, onContextMenu}){
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
    let button = (store_setter || store_action || onClick || onPointerDown || onContextMenu);
    const render_name = ({minWidth}) => c('div', {className: tall ? 'mt-1' : '', style:{minWidth}}, name ?? 'untitled');
    const render_token_badge = () => render_badge({icon, name});//c('div', {className:'d-flex gap-2 h-100 align-items-center'}, c(Icon, {icon}), name ?? 'untitled');
    const render_token_input = props => {
        button = true;
        const type = tall ? 'textarea' : 'input';
        return render_input({...props, height, type});
    };
    const render_token_switch = props => {
        button = true;
        return render_switch(props);
    };
    const render_content = () => {
        if(content == null) return c(Icon, {icon, size:'h5', color:'info'});//c('div', {className:content_css_cls});
        if(content == 'badge') return render_token_badge(); 
        return assess(content, {
            render_name, 
            render_token_badge, 
            render_input: render_token_input,
            render_switch: render_token_switch,
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
                if(store_action)  act_on_store(d => store_action(d));
                if(onClick) onClick(e);
            },
            onPointerDown, onPointerUp, onContextMenu,
            onPointerOver(e){//onPointerEnter(e){
                //e.stopPropagation();
                if(button) set_hover(true);//api.start({backgroundColor: 'var(--bs-info-bg-subtle)'}); // var(--bs-info-bg-subtle)
                //if(onPointerEnter) onPointerEnter(e);
            },
            onPointerOut(e){//onPointerLeave(e){
                //e.stopPropagation();
                if(button) set_hover(false);//api.start({backgroundColor: 'var(--bs-body-bg)'});
                //if(onPointerLeave) onPointerLeave(e);
            },
        }, 
            c('div', {className:content_css_cls}, render_content()),
        )
    )
}