import {createElement as c, useRef, useState, useEffect} from 'react';
import {Row, Col, InputGroup} from 'react-bootstrap';
import {use_store, set_store, commit_store, icons, readable, assess} from 'delimit';
import classNames from 'classnames';
import {animated, useSpring, useTransition} from '@react-spring/web';

function get_height(id){
    const element = document.getElementById(id);
    return (element ? element.offsetHeight : 0);
}
const transition_config = {
    from:  {t: 1, opacity:0, y:'-50%', transform: 'scaleY(0%)'}, // marginLeft:'-100%',   translateY(150%)
    enter: {t: 0, opacity:1, y:'0%',   transform: 'scaleY(100%)'}, // marginLeft:'0%',    
    leave: {t: 1, opacity:0, y:'-50%', transform: 'scaleY(0%)'}, // marginLeft:'-100%', 
    //keys: p => p,
    config: { tension: 210, friction: 20, mass: 0.5 },
};
export const List_View = ({path, items, header_props={}, header, render_item}) => { 
    const open  = use_store(d=> path ? d.inspected.has(path) : true);
    const transition = useTransition(open, transition_config);
    const item_transitions = useTransition(items, transition_config);
    const render_header = () => [
        assess(header),
        items.length ? c('div', {className:(open ? icons.css.cls.chevron_down : icons.css.cls.chevron_left)}) : null, 
    ];
    return[
        header && Token({ 
            name: path, 
            ...header_props,
            onClick: items.length ? e => set_store(d=> d.inspect.toggle(d, {path})) : null,
            content: render_header,
        }),
        c('div', {id:'list_header_'+path, className:'ms-4'},
            transition((style, open) => 
                open && c(animated.div, {style:{...style,  marginBottom:style.t.to(t => -get_height('list_header_'+path) * t)  }}, // marginTop:style.t.to(t => -get_height(body_div) * t)  
                    item_transitions((style, item, t, index) => 
                        c(animated.div, {style:{...style,  marginBottom:style.t.to(t => -get_height('list_item_'+path+item+index) * t) }},  // marginTop:style.t.to(t => -get_height(item_div) * t)  
                            c('div', {id:'list_item_'+path+item+index},
                                render_item(item, index),
                            ),
                        )
                    )
                )
            )
        )
    ];
};

function make_size(content, width, height){
    if(width == null){
        if(!content) width = 45;
    }
    if(height == null){
        if(!content) height = 45;
        else height = 32;
    }
    return {width, height};
}

export function Token(props){
    if(props.active) return c(Toggle_Token, props);
    if(props.node)   return c(Node_Token, props);
    return c(Token_Base, props);
}
export function Toggle_Token(props){
    const active = use_store(d=> props.active(d));
    return c(Token_Base, {...props, active});
}
export function Node_Token(props){
    const primary_pick = use_store(d=> d.picked.primary.node.has(props.node));
    const secondary_pick = use_store(d=> d.picked.secondary.node.has(props.node));
    props.style = props.style ?? {};
    props.style.borderLeft  = (primary_pick ?   ('thick solid var(--bs-primary)')   : 'none');
    props.style.borderRight = (secondary_pick ? ('thick solid var(--bs-secondary)') : 'none');
    return c(Token_Base, props);
}
export function Token_Base({inner_ref, group, icon, name, content, width, height, style, active, action, commit,
                        onClick, onPointerDown, onPointerUp, onContextMenu}){
    const target = useRef();
    const size = make_size(content, width, height);
    //const [springs, api] = useSpring(() => ({from:{backgroundColor: 'var(--bs-body-bg)'}})); 
    const [hover, set_hover] = useState(false);
    //let icon_cls = null;
    //if(icon.length < 32) icon_cls = icon;
    const className = classNames('text-info rounded-pill bg-body user-select-none', {  // position-static 
        'bg-info-subtle': hover,
        'border border-2 border-info': active,
    });
    const content_css_cls = classNames(
        'd-flex align-items-center h-100 gap-3', //icon_cls, {'h5': !items},
        (size.width ? 'justify-content-center' : 'mx-3'), //mx-auto
    );
    //if(!size.width) size.width = 'fit-content';
    size.width = size.width ?? 'fit-content';
    const render_content = () => {
        if(content == null) return c(Icon, {icon, size:'h5', color:'info'});//c('div', {className:content_css_cls});
        if(content == 'badge')
            return c('div', {className:'d-flex gap-1'}, c(Icon, {icon, color:'info'}), name ?? 'untitled'); 
        return assess(content);//return content();
    }
    return(
        //(active != null) && c(Active_Ring, {size, target: (active ? target.current : null)}),
        c('div', {
            ref: ref => {
                target.current = ref;
                if(inner_ref) inner_ref.current[name] = ref;
            },
            id: group + '__' + name, // group ? group + '__' + name : name,
            role: 'button',
            className, //: 'd-flex text-info rounded-pill ' + (active ? 'border border-2 border-info' : ''), // bg-info-subtle 
            style: {...style, ...size},//{...size, ...springs},
            onClick(e){
                if(action)  set_store(d => action(d));
                if(commit)  commit_store(d => commit(d));
                if(onClick) onClick(e);
            },
            onPointerDown, onPointerUp, onContextMenu,
            onPointerEnter(e){
                if(name) set_hover(true);//api.start({backgroundColor: 'var(--bs-info-bg-subtle)'}); // var(--bs-info-bg-subtle)
            },
            onPointerLeave(e){
                if(name) set_hover(false);//api.start({backgroundColor: 'var(--bs-body-bg)'});
            },
        }, 
            c('div', {className:content_css_cls}, render_content()),
        )
    )
}

export function Mode_Menu({group, items, state, action, width, height}){
    let badge = (width > 65) ? 'badge' : null;
    const size = make_size(badge, width, height);
    const ref = useRef({});
    // const [window_width] = use_window_size();
    const mode = use_store(d=> state(d));
    const [springs, api] = useSpring(() => ({x:0, y:0})); // rotation:0.02
    //const target = document.getElementById(group + '__' + readable(mode));
    useEffect(()=>{
        const target = ref.current[readable(mode)];
        if(target){
            api.start({x:target.offsetLeft, y:target.offsetTop});
        }
    });
    return[
        items.map(({mode, icon})=>
            Token({
                inner_ref: ref,
                group, 
                name: readable(mode),//: show_name ? name : null, 
                content: badge,
                icon, 
                ...size,
                action: d => action(d, mode),
            }),
        ),
        //c(Active_Ring, {size, target}),
        c(animated.div,{
            className: 'position-absolute border border-2 border-info rounded-pill',  
            style: {...size, ...springs},
        }),
    ]
}

export function Badge({node}){ // badge for node (Node_Badge)
    //console.log(node);
    const {icon, title} = use_store(d=> d.face.primary(d, node));
    const node_case = use_store(d=> d.node_case(d, node));
    //const color = use_store(d=> node.type ? d.color.primary : d.color.body_fg);
    const color = node.type ? 'info' : 'body';
    const size = node.type ? 'h5' : null;
    const className = classNames('user-select-none', 'text-'+color, { // rounded-pill
        'text-body-secondary': node_case != 'node',
    });
    return c('div', {className:'d-flex gap-1'},
        c(Icon, {icon, color, size}),//c(Svg, {svg:icon, className:'me-1', color, size}),
        c('div', {className}, title),
    )
}

// return(
//     c(InputGroup.Text, {className}, 
//         c(Svg, {svg:icon, className:'me-1', color, size}),
//         title,
//     ) 
// )


export function Icon({icon, color='', size='', className=''}) { 
    if(icon.length < 32){
        color = 'text-'+color;
        return c('div', {className: icon +' '+ color +' '+ size +' '+ className + ' mb-0'});
    }else{
        let sized = null;
        if(size == 'h5') sized = 24;
        //color = color.substring(5);
        //if(color == 'body-color')
        if(color == 'body') color = 'body_fg';
        return c(Svg, {svg:icon, color, size:sized, className});
    }
}

export function Svg({svg, color, size, className}) { 
    const ref = useRef();
    color = use_store(d=> color?.length ? d.color[color] : d.color.body_fg);
    //const [colored_svg, 
    const colored_svg = svg.replace('fill="currentColor"', 
		'fill="'+color.replace('#','%23')+'"'// transform="translate(0 -2)"'
		);
    
	return (
		c('img', {ref, src:'data:image/svg+xml,'+colored_svg, className, draggable:false, style:{height:size+'px'}})
	)
}



// function get_height(ref){
//     return (ref.current?.offsetHeight ? ref.current.offsetHeight : 0);
// }

        //     },
        //         //render_header(),
        //         //items.length ? c(InputGroup.Text, {className:arrow_css}) : null, 
        //     ),
        //     // c(InputGroup, {  
        //     //     role: 'button',
        //     //     ...header_props,
        //     //     onClick: items.length ? e => set_store(d=> d.inspect.toggle(d, {path})) : null,
        //     // },
        //     //     render_header(),
        //     //     items.length ? c(InputGroup.Text, {className:arrow_css}) : null, 
        //     // ),
        // //     items.length ? [
        // //         //c('div', {className:'me-4'}),
        // //         c('div', {className:arrow_css, style:{zIndex:10}}),
        // //     ] : null,
        // // ),

// function Active_Ring({size, target}){
//     const [springs, api] = useSpring(() => ({x:0, y:0, opacity:1})); // rotation:0.02
//     if(target){
//         api.start({x:target.offsetLeft, y:target.offsetTop, opacity:1});
//     }else{
//         api.start({x:0, y:0, opacity:0});
//     }
//     return c(animated.div,{
//         className: 'position-absolute border border-2 border-info rounded-pill',  
//         style: {...size, ...springs},
//     })
// }

// export function Svg_Button({svg, text, func}){
//     const primary_color = use_store(d=> d.color.primary);
// 	const [svg_color, set_svg_color] = useState(primary_color);
// 	return(
// 		c(Button, {
// 			//id:'make_'+text,
// 			//className: 'border-0 text-start pt-0',//+d.node[t].css.icon,
// 			//variant:'outline-primary', //size:'lg',
// 			//style:{transition:'none', },
// 			onClick: e=> func(),
// 			onPointerEnter: e=> {
// 				set_svg_color('white');//console.log('hover');
// 			},
// 			onPointerLeave: e=> {
// 				set_svg_color(primary_color);//console.log('hover');
// 			},
// 		}, 
// 			c(Row, {xs:'auto'},
// 				c(Col, {className:'pe-0'}, 
// 					c(Svg, {svg, color:svg_color, className:'mt-1'}),
// 				),
// 				c(Col, {className:'mt-1'},
// 					text,
// 				)
// 			)
// 		)
// 	)
// }