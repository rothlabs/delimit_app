import {createElement as c, useState} from 'react';
import {Row, Col, Button, InputGroup} from 'react-bootstrap';
import {use_store} from 'delimit';
import classNames from 'classnames';

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