import {set_store, commit_store, pointer} from 'delimit';

const pointer_style = {
    onPointerEnter(e){ 
        document.body.style.cursor = 'pointer';
    },
    onPointerLeave(e){ 
        document.body.style.cursor = 'auto';
    },
};

export const draggable = data => {
    const result = {...pointer_style};
    result.onPointerDown = e => {
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
            if(!d.drag.data.stem) return;// 'cancel';
            d.make.edge(d, {root, term, stem:d.drag.data.stem, index});
        });
        set_store(d=> d.drag.data = {});
    };
    return result;
};

export const pickable = node => {
    const result = {...pointer_style};
    result.onClick = e => { 
        e.stopPropagation();
        set_store(d=> d.pick.node(d, node, {multi:e.ctrlKey}));
    }
    return result;
};