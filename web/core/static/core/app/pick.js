import {set_store, commit_store, pointer} from 'delimit';

export const pickable = node => {
    const result = {};
    result.onClick = e => { 
        //e.stopPropagation();
        set_store(d=> d.pick.node(d, node, {multi:e.ctrlKey}));
    }
    result.onPointerEnter = e => {
        document.body.style.cursor = 'pointer';
    };
    result.onPointerLeave = e => { 
        document.body.style.cursor = 'auto';
    };
    return result;
};

export const draggable = data => {
    const result = {};
    result.onPointerDown = e => {
        pointer.dragging = true;
        pointer.start.set(e.clientX, e.clientY);
        set_store(d=> d.drag.staged = data);
    };
    return result;
};

export const droppable = ({root, term, index}) => {
    const result = {};
    result.onPointerUp = e => {
        commit_store(d=>{
            if(!d.drag.data.node) return 'cancel';
            d.make.edge(d, {root, term, stem:d.drag.data.node, index});
        });
        set_store(d=> d.drag.data = {});
    };
    return result;
};