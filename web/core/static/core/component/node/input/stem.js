import {createElement as c, Fragment, useCallback, useRef} from 'react';
import {Row, Col, Container, Form, InputGroup, Button, ListGroup, ButtonToolbar} from 'react-bootstrap';
import {Droppable, Draggable} from 'react-beautiful-dnd'; // import { useDrag, useDrop } from 'react-dnd';
import {useS, ss, gs, readable, fs, sf, mf, rs} from '../../../app.js';


// c(ListGroup.Item, {
//   ref:ref, 
//   style:{opacity:opacity}, 
//   dataHandlerId:handlerId
//   //className: button.icon,
//   //variant: 'outline-secondary',
//   //onClick:e=> ss(d=> button.func(d)),
// },
//   text,//d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t)
// )




export function Stem({t}){
	const stem = useS(d=> d.inspect.stem[t]);
	//const asset = useS(d=> d.inspect.asset[t]);
	const d = gs();

	const buttons = [
		{name:'Remove', icon:'bi-x-lg', func(d, n){
			d.graph.for_stem(d, d.pick.n, (r,nn,t)=>{
				if(n == nn) d.delete.edge(d, r, nn, {t:t});
			})
		}},
	];

	const pen_icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" class="bi bi-vector-pen" viewBox="0 0 16 16"> <path fill="%23ffffff" d="M 2.0036318,1.2502973 12.000126,4.2721455 13.455271,9.5511012 10.785786,12.56844 5.0143315,11.265355 Z"/>  <path fill="%23d63384" fill-rule="evenodd" d="m 15.030264,10.245718 a 0.5,0.5 0 0 1 0,0.708 l -4,4 a 0.5,0.5 0 0 1 -0.708,0 l -1.902,-1.902 -3.313,-0.829 a 1.5,1.5 0 0 1 -1.073,-1.024 L 0.93026405,0.85371789 11.276264,3.9577179 a 1.5,1.5 0 0 1 1.023,1.072 l 0.828,3.313 z m -2.908,-1.8000001 -0.793,-3.173 a 0.5,0.5 0 0 0 -0.342,-0.358 l -8.565,-2.57 2.57,8.5670001 a 0.5,0.5 0 0 0 0.357,0.34 l 3.174,0.794 3.6,-3.6000001 z" id="path59" /> <path fill-rule="evenodd" d="m 2.448264,2.4317179 4.228,5.168 a 1,1 0 1 0 1,-1 l -5.168,-4.228 -0.086,-0.026 z" id="path61" /></svg>';
	const dataUri = `data:image/svg+xml,${pen_icon}`;//const dataUri = `url("data:image/svg+xml,${pen_icon}")`;

	//console.log('render stem', t, stem, stem != null, asset);
	return (
		stem != null && c(Fragment, {}, 
			c('h5', {className:'text-secondary mt-4'},//, style:{background: dataUri}}, 
				c('img', {src:dataUri}),
				' '+readable(t),
			), // c('h5', {className:'text-secondary mt-4 '+d.node[t].css}, ' '+readable(t)),
			c(Droppable, {droppableId: t, direction: 'vertical', key:t}, (provided, snapshot) => (
				c(ListGroup, {
					ref: provided.innerRef,
					style: {background: snapshot.isDraggingOver ? 'white' : 'white',},//getFirstListStyle(snapshot.isDraggingOver),
					...provided.droppableProps,
					className:'mb-3',	
				},
					stem.map((n,i)=>
						c(Draggable, {key: n, draggableId: n, index: i}, (provided, snapshot) => (
							c(InputGroup, {
								ref: provided.innerRef, 
								className: 'mb-2',
								style:{...provided.draggableProps.style}, 
								...provided.draggableProps,
								...provided.dragHandleProps,
								onClick:e=> ss(d=> d.pick.one(d, n)),
							},
								c(InputGroup.Text, {
									className:'flex-grow-1 bg-white',
								}, 
									(d.n[n].c.name ?? readable(d.n[n].t)) + ' '
								),
								buttons.map(button=>
									c(Button, {
										className: 'border-0 ' + button.icon,
										variant: 'outline-secondary',
										onClick:e=> ss(d=> button.func(d, n)),
									}),
								),
							)
						))
					),
					provided.placeholder,
				)
			))
		)
	)
}


// function Card({ n, t, text, index }){
// 	const ref = useRef(null)

// 	const buttons = [
// 		{name:'Remove', icon:'bi-x-lg', func(d){
// 			console.log('try to remove');
// 			d.graph.for_stem(d, d.pick.n, (r,nn,t)=>{
// 				if(n == nn) d.delete.edge(d, r, nn, {t:t});
// 			})
// 		}},
// 	];

// 	return (
// 			c(ListGroup.Item, {
// 					ref:ref, 
// 					style:{opacity:opacity}, 
// 					dataHandlerId:handlerId
// 					//className: button.icon,
// 					//variant: 'outline-secondary',
// 					//onClick:e=> ss(d=> button.func(d)),
// 			},
// 					text,//d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t)
// 					buttons.map(button=>
// 							c(Button, {
// 									className: button.icon,
// 									variant: 'outline-secondary',
// 									onClick:e=> ss(d=> button.func(d)),
// 							}),
// 					),
// 			)
// 	)

// }


// c(Card, {
// 	n: n,
// 	t: t,
// 	index: i,
// 	text: d.n[n]? d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t) : '...',
// 	key: n,
// 	//moveCard: moveCard,
// })


// const getFirstListStyle = (isDraggingOver) => ({
// 	background: isDraggingOver ? 'lightblue' : 'lightgrey',
// 	display: 'flex',
// 	padding: grid,
// 	width: 400
// });

// c(ListGroup.Item, {
//     //className: button.icon,
//     //variant: 'outline-secondary',
//     //onClick:e=> ss(d=> button.func(d)),
// },
//     d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t)
// ),
