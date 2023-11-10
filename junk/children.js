import {createElement as c, Fragment, useCallback, useRef} from 'react';
import {Row, Col, Container, Form, InputGroup, Button, ListGroup, ButtonToolbar} from 'react-bootstrap';
import { useDrag, useDrop } from 'react-dnd';
import {useS, ss, gs, readable, fs, sf, mf, rs} from '../../../app.js';


function Card({ n, t, text, index }){
    const ref = useRef(null)
    const [{ handlerId }, drop] = useDrop({
      accept: 'Card',
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        }
      },
      hover(item, monitor) {
        if (!ref.current) {
          return
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        console.log('dragIndex', dragIndex);
        console.log('hoverIndex', hoverIndex);

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return
        }
        // Determine rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect()
        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
        // Determine mouse position
        const clientOffset = monitor.getClientOffset()
        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return
        }
        // Time to actually perform the action
        sf(d=> d.pick.set_child_order(d, t, dragIndex, hoverIndex));//moveCard(dragIndex, hoverIndex);
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        item.index = hoverIndex
      },
    })
    const [{ isDragging }, drag] = useDrag({
      type: 'Card',
      item: () => {
        fs(d=> d.pick.pin_children(d, t)); 
        return { n, index }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end(item, monitor){
        //console.log('drag end');
        if(monitor.didDrop()){
            rs(d=> d.pick.flip_children_pin(d, t));
            mf(d=> d.pick.set_children_from_pin(d, t));
            //rs(d=> d.pick.set_children_order(d, t, item.index, index));//moveCard(item.index, index));
        }
      },
    })
    const opacity = isDragging ? 0 : 1;
    drag(drop(ref));


    const buttons = [
      {name:'Remove', icon:'bi-x-lg', func(d){
        console.log('try to remove');
        d.graph.for_stem(d, d.pick.n, (r,nn,t)=>{
          if(n == nn) d.delete.edge(d, r, nn, {t:t});
        })
      }},
    ];

    return (
        c(ListGroup.Item, {
            ref:ref, 
            style:{opacity:opacity}, 
            dataHandlerId:handlerId
            //className: button.icon,
            //variant: 'outline-secondary',
            //onClick:e=> ss(d=> button.func(d)),
        },
            text,//d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t)
            buttons.map(button=>
                c(Button, {
                    className: button.icon,
                    variant: 'outline-secondary',
                    onClick:e=> ss(d=> button.func(d)),
                }),
            ),
        )
    )

}

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
    const children = useS(d=> d.inspect.source[t]);
    const asset = useS(d=> d.inspect.asset[t]);
    const d = gs();

    // const moveCard = useCallback((src_idx, new_idx) => {
    //     sf(d=> d.pick.set_children_order(d, t, src_idx, new_idx));
    //     //         dragged_node = d.n[n].n[t][dragIndex];
    //     //         d.n[n].n[t].splice(dragIndex, 1);
    //     //         d.n[n].n[t].splice(hoverIndex, 0, dragged_node);
    //     // });
    //     // setCards((prevCards) =>
    //     //   update(prevCards, {
    //     //     // $splice: [
    //     //     //   [dragIndex, 1],
    //     //     //   [hoverIndex, 0, prevCards[dragIndex]],
    //     //     // ],
    //     //   }),
    //     // )
    // },[]);

    return (
        children != null && asset && c(Fragment, {}, 
            c('h5', {className:'text-secondary mt-4 '+d.node_css[t]}, ' '+readable(t)),
            c(ListGroup, {className:'mb-3'},
                children.map((n,i)=>
                    c(Card, {
                        n: n,
                        t: t,
                        index: i,
                        text: d.n[n]? d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t) : '...',
                        key: n,
                        //moveCard: moveCard,
                    })
                ),
            ),
        )
    )
}

// c(ListGroup.Item, {
//     //className: button.icon,
//     //variant: 'outline-secondary',
//     //onClick:e=> ss(d=> button.func(d)),
// },
//     d.n[n].c.name ? d.n[n].c.name : readable(d.n[n].t)
// ),
