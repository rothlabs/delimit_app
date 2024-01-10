import {set_store, act_on_store, pointer} from 'delimit';

const pointer_style = {
    onPointerEnter(e){ 
        document.body.style.cursor = 'pointer';
    },
    onPointerLeave(e){ 
        e.stopPropagation();
        document.body.style.cursor = 'auto';
    },
};

export const droppable = ({root, term, index}) => {
    const result = {...pointer_style};
    result.onPointerEnter = e => {
        if(pointer.dragging) document.body.style.cursor = 'pointer';
    };
    result.onPointerUp = e => {
        act_on_store(d=>{
            if(!d.drag.edge.stem) return;
            d.make.edge(d, {root, term, stem:d.drag.edge.stem, index});
        });
        set_store(d=> d.drag.edge = {});
    };
    return result;
};

export const draggable = edge => {
    const result = {...pointer_style};
    result.onPointerDown = e => {
        if(e.nativeEvent.button != 0) return;
        pointer.dragging = true;
        pointer.start.set(e.clientX, e.clientY);
        set_store(d=> d.drag.staged = edge);
    };
    return result;
};

export const drag_drop = edge => ({...droppable(edge), ...draggable(edge)});

export const pickable = ({mode='all', root, term, ...item}) => {
    const result = {...pointer_style, ...item, root, term};
    if(mode == 'all' || mode == 'primary') result.onClick = e => { 
        e.stopPropagation();
        set_store(d=> d.pick(d, {multi:e.ctrlKey, root, term, ...item}));
    };
    if(mode == 'all' || mode == 'secondary') result.onContextMenu = e => {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        set_store(d=> d.pick(d, {multi:e.ctrlKey, mode:'secondary', root, term, ...item}));
    };
    return result;
};

        //if(e.preventDefault) e.preventDefault();
        //if(e.nativeEvent) 