import {createElement as c, useRef, useState, useEffect} from 'react';
import {use_store, set_store, render_token, icons, readable, assess} from 'delimit';
import {animated, useSpring, useTransition} from '@react-spring/web';
import classNames from 'classnames';

export const block_size = 45;
export const row_height = 32;

export function make_size(content, width, height){
    if(width == null){
        if(!content) width = block_size;
    }
    if(height == null){
        if(!content) height = block_size;
        else height = row_height;
    }
    return {width, height};
}

export function get_height(id){
    const element = document.getElementById(id);
    return (element ? element.offsetHeight : 0);
}

export const List_View = ({path, items, header_props={}, header, render_item, header_addon}) => { 
    const transition_config = { 
        keys: (item, i) => item+i,
        from:   {t: 1, opacity:0, y:'-50%', transform: 'scaleY(0%)'}, 
        enter:  {t: 0, opacity:1, y:'0%',   transform: 'scaleY(100%)'},  
        leave:  {t: 1, opacity:0, y:'-50%', transform: 'scaleY(0%)'}, 
        config: { tension: 250, friction: 20, mass: 0.5 },
    };
    const open  = use_store(d=> path ? d.inspected.has(path) : true);
    const transition = useTransition(open, transition_config);
    const item_transitions = useTransition(items, transition_config);
    const render_header = () => [
        assess(header),
        items.length ? c('div', {className:(open ? icons.css.cls.chevron_down : icons.css.cls.chevron_left)}) : null, 
    ];
    return[
        header && c('div', {className:'d-flex'}, // d-inline-flex 
            header_addon && render_token({...header_addon, width:row_height, height:row_height}),
            render_token({ 
                name: path, 
                ...header_props,
                onClick: items.length ? e => set_store(d=> d.inspect.toggle(d, {path})) : null,
                content: render_header,
            }),
        ),
        c('div', {id:'list_header_'+path, className: header ? 'ms-4' : ''},
            transition((style, open) => 
                open && c(animated.div, {style:{...style,  marginBottom:style.t.to(t => -get_height('list_header_'+path) * t)  }}, // marginTop:style.t.to(t => -get_height(body_div) * t)  
                    item_transitions((style, item, t, index) => 
                        c(animated.div, {style:{...style,  marginBottom:style.t.to(t => -get_height('list_item_'+path+item+index) * t) }},  // marginTop:style.t.to(t => -get_height(item_div) * t)  
                            c('div', {id:'list_item_'+path+item+index}, // key:path+item+index, 
                                render_item(item, index),
                            ),
                        )
                    )
                )
            )
        )
    ];
};

export function Mode_Menu({group, items, state, store_setter, width, height}){
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
            render_token({
                inner_ref: ref,
                group, 
                name: readable(mode),//: show_name ? name : null, 
                content: badge,
                icon, 
                ...size,
                store_setter: d => store_setter(d, mode),
            }),
        ),
        //c(Active_Ring, {size, target}),
        c(animated.div,{
            className: 'position-absolute border border-2 border-info rounded-pill',  
            style: {...size, ...springs},
        }),
    ]
}

export const render_badge = ({icon, name, color='info', size, node, repo, version}) => {
    if(node)    return c(Node_Badge,    {node});
    if(repo)    return c(Repo_Badge,    {repo});
    if(version) return c(Version_Badge, {version});
    if(typeof color === 'string') color = {icon:color, name:color};
    return c('div', {className:'d-flex gap-2 h-100 align-items-center'},
        c(Icon, {icon, color:color.icon, size}),
        c('div', {className:'text-'+color.name}, name),
    )
};

export function Node_Badge({node}){ 
    const icon = use_store(d=> d.get.node.icon(d, node));
    const title = use_store(d=> d.get.node.title(d, node));
    //const get_node_case = use_store(d=> d.get_node_case(d, node));
    const color = node.type ? {name:'body'} : 'body';
    const size = node.type ? 'h5' : null;
    // const className = classNames('user-select-none', 'text-'+color, { 
    //     'text-body-secondary': get_node_case != 'node',
    // });
    return render_badge({icon, name:title, color, size});
    // return c('div', {className:'d-flex align-items-center h-100 gap-2'},
    //     c(Icon, {icon, color, size}),
    //     c('div', {className}, title),
    // )
}

export function Repo_Badge({repo}){
    const name = use_store(d=> d.get.repo.name(d, repo));
    return render_badge({icon:'bi-journal-bookmark', name, color:{name:'body'}});
}
export function Version_Badge({version}){
    const name = use_store(d=> d.get.version.name(d, version));
    return render_badge({icon:'bi-bookmark', name, color:{name:'body'}});
}

export function Icon({icon, color='info', size=''}) { 
    icon = icon ?? icons.css.cls.generic;
    if(icon.length < 32){
        color = 'text-' + color;
        return c('div', {className: icon +' '+ color +' '+ size +' ' + ' mb-0'});
    }else{
        let height = 16;
        if(size == 'h5') height = 20;
        if(color == 'body') color = 'body_fg';
        return c(Svg, {svg:icon, color, height});
    }
}

export function Svg({svg, color='info', height}) { 
    const ref = useRef();
    color = use_store(d=> d.color[color]); // color = use_store(d=> color?.length ? d.color[color] : d.color.body_fg);
    const colored_svg = svg.replace('fill="currentColor"', 
		'fill="'+color.replace('#','%23')+'"'// transform="translate(0 -2)"'
	);
	return c('img', {
        ref, 
        src:'data:image/svg+xml,'+colored_svg, 
        draggable: false, 
        style:{height} 
    })
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
// 			//className: 'border-0 text-start pt-0',//+d.nodes[t].css.icon,
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