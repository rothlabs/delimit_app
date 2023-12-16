import {createElement as c, useRef, useState, useEffect} from 'react';
import {Row, Col, InputGroup} from 'react-bootstrap';
import {use_store, set_store, commit_store, icon, readable} from 'delimit';
import classNames from 'classnames';
import {animated, useSpring, useTransition} from '@react-spring/web';

function get_height(ref){
    return (ref.current?.offsetHeight ? ref.current.offsetHeight : 0);
}
const transition_config = {
    from:  {t: 1, opacity:0, y:'50%', transform: 'scaleY(0%)'}, // marginLeft:'-100%',   translateY(150%)
    enter: {t: 0, opacity:1, y:'0%',   transform: 'scaleY(100%)'}, // marginLeft:'0%',    
    leave: {t: 1, opacity:0, y:'50%', transform: 'scaleY(0%)'}, // marginLeft:'-100%', 
    //keys: p => p,
    config: { tension: 210, friction: 20, mass: 0.5 },
};
export const List_View = ({path, open=true, items, header_props={}, render_header, render_item}) => { 
    const body_div = useRef();
    const item_div = useRef();
    const transition = useTransition(open, transition_config);
    const item_transitions = useTransition(items, transition_config);
    const arrow_css = classNames(  
        //'h5', // position-absolute top-50 start-100 translate-middle-y  //  mx-2 mt-2 text-info
        (open ? icon.css.cls.chevron_down : icon.css.cls.chevron_left),
    );
    return[
        (render_header != null) && //c('div', {className:'d-inline-flex'}, // d-flex flex-column
            c(InputGroup, {  
                role: 'button',
                ...header_props,
                onClick: items.length ? e => set_store(d=> d.inspect.toggle(d, {path})) : null,
            },
                render_header(),
                items.length ? c(InputGroup.Text, {className:arrow_css}) : null, 
            ),
        //     items.length ? [
        //         //c('div', {className:'me-4'}),
        //         c('div', {className:arrow_css, style:{zIndex:10}}),
        //     ] : null,
        // ),
        c('div', {ref:body_div, className:'ms-4'},
            transition((style, open) => 
                open && c(animated.div, {style:{...style, marginTop:style.t.to(t => -get_height(body_div) * t)}},  
                    item_transitions((style, item, t, index) => 
                        c(animated.div, {style:{...style, marginTop:style.t.to(t => -get_height(item_div) * t)}},  
                            c('div', {ref:item_div},
                                render_item(item, index),
                            ),
                        )
                    )
                )
            )
        )
    ];
};

function make_size(show_name, width, height){
    if(width == null){
        if(!show_name) width = 45;
    }
    if(height == null){
        if(!show_name) height = 45;
        else height = 32;
    }
    return {width, height};
}

export function Toggle_Button(props){
    const active = use_store(d=> props.active(d));
    return c(Button, {...props, active});
}

export function Button({inner_ref, group, name, show_name, icon, width, height, active, action, commit, onClick, onPointerDown, onPointerUp, onContextMenu, children}){
    const target = useRef();
    const size = make_size(show_name, width, height);
    //const [springs, api] = useSpring(() => ({from:{backgroundColor: 'var(--bs-body-bg)'}})); 
    const [hover, set_hover] = useState(false);
    const content_css_cls = classNames(
        'my-auto', icon, {'h5': !show_name},
        (size.width ? 'mx-auto' : 'mx-3'), 
    );
    const className = classNames('d-inline-flex text-info rounded-pill bg-body', {
        'bg-info-subtle': hover,
        'border border-2 border-info': active,
    });
    return(
        //(active != null) && c(Active_Ring, {size, target: (active ? target.current : null)}),
        c('div', {
            ref: ref => {
                target.current = ref;
                if(inner_ref) inner_ref.current[name] = ref;
            },
            id: group ? group + '__' + name : name,
            role: 'button',
            className, //: 'd-flex text-info rounded-pill ' + (active ? 'border border-2 border-info' : ''), // bg-info-subtle 
            style: {...size},//{...size, ...springs},
            onClick(e){
                if(action)  set_store(d => action(d));
                if(commit)  commit_store(d => commit(d));
                if(onClick) onClick(e);
            },
            onPointerDown, onPointerUp, onContextMenu,
            onPointerEnter(e){
                set_hover(true);//api.start({backgroundColor: 'var(--bs-info-bg-subtle)'}); // var(--bs-info-bg-subtle)
            },
            onPointerLeave(e){
                set_hover(false);//api.start({backgroundColor: 'var(--bs-body-bg)'});
            },
        }, 
            c('div', {className:content_css_cls}, show_name ? ' '+name : null), // (window_width > 576) ? name : '',

        )
    )
}

export function Mode_Menu({group, items, state, action, width, height}){
    let show_name = (width > 65);
    const size = make_size(show_name, width, height);
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
            c(Button, {
                inner_ref: ref,
                group, 
                name: readable(mode),//: show_name ? name : null, 
                show_name,
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

export function Icon_Title({node}){ // badge for node (Node_Badge)
    //console.log(node);
    const {icon, title} = use_store(d=> d.face.primary(d, node));
    const node_joint = use_store(d=> d.node_joint(d, node));
    const className = classNames('text-body user-select-none', { // rounded-pill
        'text-body-secondary': node_joint != 'node',
    });
    const color = use_store(d=> node.type ? d.color.primary : d.color.body_fg);
    const size = node.type ? 24 : 16;
    return(
        c(InputGroup.Text, {className}, 
            c(Svg, {svg:icon, className:'me-1', color, size}),
            title,
        ) 
    )
}

export function Svg({svg, color, className, size}) { 
    color = use_store(d=> color ?? d.color.body_fg);
    const colored_svg = svg.replace('fill="currentColor"', 
		'fill="'+color.replace('#','%23')+'"'// transform="translate(0 -2)"'
		);
	return (
		c('img', {src:'data:image/svg+xml,'+colored_svg, className, draggable:false, style:{height:size+'px'}})
	)
}


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