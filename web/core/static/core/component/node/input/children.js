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




export function Children({t}){
	const children = useS(d=> d.inspect.children[t]);
	//const asset = useS(d=> d.inspect.asset[t]);
	const d = gs();

	const buttons = [
		{name:'Remove', icon:'bi-x-lg', func(d, n){
			d.node.for_n(d, d.pick.n, (r,nn,t)=>{
				if(n == nn) d.delete.edge(d, r, nn, {t:t});
			})
		}},
	];

	//console.log('render children', t, children, children != null, asset);
	return (
		children != null && c(Fragment, {}, 
			c('h5', {className:'text-secondary mt-4 '+d.node_css[t]}, ' '+readable(t)),
			c(Droppable, {droppableId: t, direction: 'vertical', key:t}, (provided, snapshot) => (
				c(ListGroup, {
					ref: provided.innerRef,
					style: {background: snapshot.isDraggingOver ? 'white' : 'white',},//getFirstListStyle(snapshot.isDraggingOver),
					...provided.droppableProps,
					className:'mb-3',	
				},
					children.map((n,i)=>
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
										className: button.icon,
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
// 			d.node.for_n(d, d.pick.n, (r,nn,t)=>{
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
