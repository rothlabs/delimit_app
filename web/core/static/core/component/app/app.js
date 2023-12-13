import {createElement as c, useState} from 'react';
import {Row, Col, InputGroup} from 'react-bootstrap';
import {use_store, set_store} from 'delimit';
import classNames from 'classnames';
import {animated, useSpring} from '@react-spring/web';

export function Button({id, name, cls, svg, width = 32, height = 32, onClick, onPointerDown, onPointerUp, onPointerEnter, onPointerLeave, onContextMenu}){
    const [springs, api] = useSpring(() => ({from:{backgroundColor: 'var(--bs-body-bg)'}})); 
    const content_cls = classNames('mx-auto my-auto',
        cls, 
        {'h5': !name},
    );
    return c(animated.div, {
        id,
        role: 'button',
        className: 'd-flex text-info rounded-pill', // bg-info-subtle 
        style: {width, height, ...springs},
        onClick, onPointerDown, onPointerUp, onContextMenu,
        onPointerEnter(e){
            api.start({backgroundColor: 'var(--bs-info-bg-subtle)'}); // var(--bs-info-bg-subtle)
        },
        onPointerLeave(e){
            api.start({backgroundColor: 'var(--bs-body-bg)'});
        },
    }, 
        c('div', {className:content_cls}, name), // (window_width > 576) ? name : '',
    )
}

export function Mode_Menu({items, state, action, width = 32, height = 32, show_name = true}){
    //console.log('render mode bar', mode);
    // const [window_width] = use_window_size();
    const mode = use_store(d=> state(d));
    const [springs, api] = useSpring(() => ({x:0, y:0})); // rotation:0.02
    //console.log(mode)
    try{
        const x = document.getElementById('mode_menu_item_'+mode).offsetLeft;
        const y = document.getElementById('mode_menu_item_'+mode).offsetTop; //const index = items.indexOf(items.find(o => o.value == mode));
        api.start({x, y});
    }catch{}
    return[
        items.map(({cls, name, value})=>
            c(Button, {
                id: 'mode_menu_item_' + value, 
                name: show_name ? name : null, 
                cls, width, height,
                onClick: e => set_store(d=> action(d, value)),
            }),
            // c('div',{
            //     id: 'mode_menu_item_' + value,
            //     className: 'd-flex text-info', 
            //     style: {width, height},
            //     role: 'button',
            //     onClick: e => set_store(d=> action(d, value)),
            // }, 
            //     c('div', {className: css + ' mx-auto my-auto'}, show_name ? name : null), // (window_width > 576) ? name : '',
            // )
        ),
        c(animated.div,{
            className: 'position-absolute border border-2 border-info rounded-pill',  
            style: {width, height, ...springs},
        }),
    ]
}

export function Icon_Title({node}){
    //console.log(node);
    const {icon, title} = use_store(d=> d.face.primary(d, node));
    const node_joint = use_store(d=> d.node_joint(d, node));
    const className = classNames('text-body user-select-none', {
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