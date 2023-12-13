import {set_store, commit_store, pointer} from 'delimit';

const pointer_style = {
    onPointerEnter(e){ 
        document.body.style.cursor = 'pointer';
    },
    onPointerLeave(e){ 
        e.stopPropagation();
        document.body.style.cursor = 'auto';
    },
};

export const draggable = data => {
    const result = {...pointer_style};
    result.onPointerDown = e => {
        if(e.nativeEvent.button != 0) return;
        pointer.dragging = true;
        pointer.start.set(e.clientX, e.clientY);
        set_store(d=> d.drag.staged = data);
    };
    return result;
};

export const droppable = ({root, term, index}) => {
    const result = {...pointer_style};
    result.onPointerEnter = e => {
        if(pointer.dragging) document.body.style.cursor = 'pointer';
    };
    result.onPointerUp = e => {
        commit_store(d=>{
            if(!d.drag.data.stem) return;
            d.make.edge(d, {root, term, stem:d.drag.data.stem, index});
        });
        set_store(d=> d.drag.data = {});
    };
    return result;
};

export const pickable = ({node, mode='all'}) => {
    const result = {...pointer_style};
    if(mode == 'all' || mode == 'primary') result.onClick = e => { 
        e.stopPropagation();
        set_store(d=> d.pick(d, {node, multi:e.ctrlKey}));
    };
    if(mode == 'all' || mode == 'secondary') result.onContextMenu = e => {
        e.stopPropagation();
        e.nativeEvent.preventDefault();
        set_store(d=> d.pick(d, {node, multi:e.ctrlKey, mode:'secondary'}));
    };
    return result;
};

        //if(e.preventDefault) e.preventDefault();
        //if(e.nativeEvent) 