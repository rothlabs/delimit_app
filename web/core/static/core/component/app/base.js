import {createElement as c, useState} from 'react';
import {Row, Col, Button, Container} from 'react-bootstrap';
import {use_store} from 'delimit';

export function Svg({svg, color, className}) { 
    const default_color = use_store(d=> d.color.body_fg);
    if(!color) color = default_color;
    const colored_svg = svg.replace('fill="currentColor"', 
		'fill="'+color.replace('#','%23')+'"'// transform="translate(0 -2)"'
		);
	return (
		c('img', {src:'data:image/svg+xml,'+colored_svg, className, draggable:false})
	)
}

export function Svg_Button({svg, text, func}){
    const primary_color = use_store(d=> d.color.primary);
	const [svg_color, set_svg_color] = useState(primary_color);
	return(
		c(Button, {
			//id:'make_'+text,
			className: 'border-0 text-start pt-0',//+d.node[t].css.icon,
			variant:'outline-primary', //size:'lg',
			style:{transition:'none', },
			onClick: e=> func(),
			onPointerEnter: e=> {
				set_svg_color('white');//console.log('hover');
			},
			onPointerLeave: e=> {
				set_svg_color(primary_color);//console.log('hover');
			},
		}, 
			c(Row, {xs:'auto'},
				c(Col, {className:'pe-0'}, 
					c(Svg, {svg, color:svg_color, className:'mt-1'}),
				),
				c(Col, {className:'mt-1'},
					text,
				)
			)
		)
	)
}