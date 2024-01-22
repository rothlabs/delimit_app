import {set_store, act_on_store, controls, get_store} from 'delimit';
//import {Vector3} from 'three';

const pointer_style_events = {
    onPointerOver(e){ // onPointerEnter
        e.stopPropagation(); 
        document.body.style.cursor = 'pointer';
    },
    onPointerLeave(e){ // onPointerLeave
        e.stopPropagation();
        document.body.style.cursor = 'auto';
    },
};

export const droppable = ({root, term, index}) => {
    const result = {...pointer_style_events};
    result.onPointerUp = e => {
        act_on_store(d=>{
            const stem = d.drag.edge.stem;
            if(!stem) return;
            d.make.edge(d, {root, term, stem, index});
        });
        set_store(d=> {
            if(Object.keys(d.drag.edge).length) d.drag.edge = {};
        });
    };
    return result;
};

export const draggable = item => { 
    const result = {...item, ...pointer_style_events};
    result.onPointerDown = e => {
        if(e.nativeEvent.button != 0) return; // prevents right click?
        e.stopPropagation();
        controls.pointer.start.set(e.clientX, e.clientY);
        controls.pointer.delta.set(0, 0, 0); 
        // controls.pointer.start.set(e.clientX, e.clientY);
        const scene = item.scene;
        if(scene && !e.shiftKey){
            controls.staged_drag_type = 'scene'; 
            const draft = get_store();
            controls.scene.start = draft.scene.get_position({scene, draft});
            controls.projection.start.copy(controls.scene.start);
            controls.projection.start.project(draft.camera)
        }else{
            controls.staged_drag_type = 'edge';
        }
        set_store(d=> d.drag.staged = item);
    };
    return result;
};

export const pickable = ({mode='all', ...item}) => { // root, term, ...item
    const result = {...item, ...pointer_style_events};
    if(mode == 'all' || mode == 'primary') result.onClick = e => { 
        e.stopPropagation();
        //console.log(controls.pointer.delta);
        if(controls.pointer.delta.length() > 14) return;
        set_store(d=> d.pick(d, {multi:e.ctrlKey, ...item}));
    };
    if(mode == 'all' || mode == 'secondary') result.onContextMenu = e => {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        set_store(d=> d.pick(d, {multi:e.ctrlKey, mode:'secondary', ...item}));
    };
    return result;
};

export const drag_n_droppable = args => 
    ({...draggable(args), ...droppable(args)});
    
export const pick_drag_n_droppable = ({node, ...args}) => 
    ({...pickable({node}), ...drag_n_droppable({root:node, stem:node, ...args})});


        //if(e.preventDefault) e.preventDefault();
        //if(e.nativeEvent) 



    // result.onPointerEnter = e => {
    //     if(pointer.dragging) document.body.style.cursor = 'pointer';
    // };