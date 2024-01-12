import {set_store, act_on_store, controls} from 'delimit';

const pointer_style_events = {
    onPointerEnter(){ 
        document.body.style.cursor = 'pointer';
    },
    onPointerLeave(e){ 
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
        controls.pointer.dragging = true;
        controls.pointer.start.set(e.clientX, e.clientY);
        set_store(d=> d.drag.staged = item);
    };
    return result;
};

export const drag_drop = args => ({...droppable(args), ...draggable(args)});

export const pickable = ({mode='all', ...item}) => { // root, term, ...item
    const result = {...item, ...pointer_style_events};
    if(mode == 'all' || mode == 'primary') result.onClick = e => { 
        e.stopPropagation();
        set_store(d=> d.pick(d, {multi:e.ctrlKey, ...item}));
    };
    if(mode == 'all' || mode == 'secondary') result.onContextMenu = e => {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        set_store(d=> d.pick(d, {multi:e.ctrlKey, mode:'secondary', ...item}));
    };
    return result;
};

        //if(e.preventDefault) e.preventDefault();
        //if(e.nativeEvent) 



    // result.onPointerEnter = e => {
    //     if(pointer.dragging) document.body.style.cursor = 'pointer';
    // };