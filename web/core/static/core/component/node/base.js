import {createElement as c} from 'react';
import {Badge as Boot_Badge, CloseButton} from 'react-bootstrap';
import {useS, ss, gs} from '../../app.js';

export function Pickable({n, drawable, children}){
    return c('group', {
        name: 'pickable',
        pickable: n, // for accessing via three_object.__r3f.memoizedProps.pickable
        onClick(e){ // onClick //onPointerDown
            e.stopPropagation();//e.stopPropagation?.call(); 
            ss(d=>{
                if(!d.studio.gizmo_active && e.delta < d.max_click_delta){
                    if(drawable && d.design.mode == 'draw'){
                        d.design.make_point(d, e);
                    }else if(d.studio.mode=='design' && d.design.mode == 'erase'){
                        d.delete.node(d, n, {deep:true});
                    }else{
                        const a = {deep:d.pick.deep};
                        if(d.pick.multi) d.pick.set(d, n, !d.n[n].pick.pick, a) // || e.multi
                        else             d.pick.one(d, n, a);
                    }
                }
                d.studio.gizmo_active = false;
            });
        },
        onPointerOver:e=>{e.stopPropagation();  ss(d=> d.pick.hover(d, n, true));}, // should be something different from recieve state but should not commit state here
        onPointerOut:e=>  {e.stopPropagation(); ss(d=>d.pick.hover(d,n, false));},
        children:children,
    });
}

export function Badge({n}){ // more than one reason to change but okay because it's so simple?
    const name = useS(d=> d.n[n].c.name);
    const color = useS(d=> d.n[n].pick.color);
    const d = gs();
    const t = d.n[n].t;
    //console.log('render node badge');
    return (
        c(Boot_Badge, {className:d.node.meta[t].css, bg:color[4]}, (name?' '+name:'') + ' ('+d.node.meta[t].tag+')')
    )
}


// if(d.studio.mode=='design' && d.design.mode == 'erase'){
//     d.delete.node(d, n, {deep:true});
// }else{
    
//         const a = {deep:d.pick.deep};
//         if(d.pick.multi){d.pick.set(d, n, !d.n[n].pick.pick, a)} // || e.multi
//         else            {d.pick.one(d, n, a)}  
    
// }


// onPointerOver:e=>{
//     e.stopPropagation(); 
//     ss(d=>{
//         if(!d.studio.gizmo_active){
//             d.pick.hover(d, n, true);
//         }
//     });
// }, // should be something different from recieve state but should not commit state here

// onPointerUp(e){
        //     if(e.which==3){//[0,1].includes(e.which)){
        //         ss(d=>{ d.studio.gizmo_active = false; });
        //     }
        // },
        // onPointerMove(e){
        //     e.stopPropagation(); 
        //     ss(d=>{
        //         if(!d.studio.gizmo_active){
        //             d.pick.hover(d, n, true);
        //         }
        //     });
        // },

// export function Cat_Badge({t}){ // need to include remove button ?!?!?!?!
//     const d = gs();
//     return (
//         c(Boot_Badge, {className:'bg-secondary '+d.node.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.node.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }

// export function Cat_Badge({t}){ // need to include remove button ?!?!?!?!
//     const d = gs();
//     return (
//         c(Boot_Badge, {className:'bg-secondary '+d.node.meta[t].css, style:{fontSize:'16px'}}, 
//             ' '+d.node.meta[t].tag,
//             c(CloseButton, {className:'p-0 m-0'}),
//         )
//     )
// }