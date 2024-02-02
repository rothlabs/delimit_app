import {set_store, act_on_store, controls, get_store} from 'delimit';

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

export const droppable = ({root, term, index, scene}) => {
    const result = {...pointer_style_events};
    result.onPointerUp = e => {
        act_on_store(d=>{
            const stem = d.drag.edge.stem;
            if(!stem) return;
            d.make.edge(d, {root, term, stem, index, scene});
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
        const scene = item.scene;
        if(scene && !e.shiftKey){
            controls.staged_drag_type = 'scene'; 
            const draft = get_store();
            const {eventObject, point} = e.intersections[0];
            controls.projection.start.copy(point); 
            controls.drag.start.copy(point);
            controls.projection.start.project(draft.camera);
            eventObject.worldToLocal(controls.drag.start); 
            controls.drag.matrix.copy(eventObject.matrixWorld).invert();
            controls.scene.start.fromArray(draft.scene.get_vector3({scene, term:'position', draft}));  
        }else{
            controls.staged_drag_type = 'edge';
        }
        set_store(d=> d.drag.staged = item);
    };
    return result;
};

export const pickable = ({mode='all', ...item}) => { 
    const result = {...item, ...pointer_style_events};
    if(mode == 'all' || mode == 'primary') result.onClick = e => { 
        e.stopPropagation();
        if(controls.dragging) return;
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
