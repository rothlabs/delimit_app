import {createElement as c, useState} from 'react';
import {Row, Col, Button, Container} from 'react-bootstrap';
import { theme } from '../../app.js';

export function Svg({svg, color, className}) { 
    const colored_svg = svg.replace('fill="currentColor"', 
		'fill="'+color.replace('#','%23')+'"'// transform="translate(0 -2)"'
		);
	return (
		c('img', {src:'data:image/svg+xml,'+colored_svg, className})
	)
}

export function Svg_Button({svg, text, func}){
	const [svg_color, set_svg_color] = useState(theme.primary);
	return(
		c(Button, {
			//id:'make_'+text,
			className: 'border-white text-start pt-0',//+d.node[t].css.icon,
			variant:'outline-primary', //size:'lg',
			style:{transition:'none', },
			onClick: e=> func(),
			onPointerEnter: e=> {
				set_svg_color('white');//console.log('hover');
			},
			onPointerLeave: e=> {
				set_svg_color(theme.primary);//console.log('hover');
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