import { node_tags } from './base.js';

export const create_visual_slice = (set,get)=>({visual:{
    graph_tags:[
        {name:' Decimal', value:'decimal', on:true, icon:'bi-box',},
        {name:' Point',   value:'point',   on:true, icon:'bi-box',},
        {name:' Line',    value:'line',    on:true, icon:'bi-bezier2',},
    ],
    update: d=>{
        d.graph.update(d);
    },
}});

