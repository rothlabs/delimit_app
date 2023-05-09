import {produce, produceWithPatches} from 'immer';
import {model_tags, float_tags, val_tags} from './basic.js';

export const create_select_slice = (set,get)=>({

    multiselect: false,

    selected: {
        nodes: [],
        edit_val: (t,v)=>{ 
            get().edit(d=>{
                d.inspect.content[t] = v;
                if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
                if(Object.values(model_tags).includes(t)){
                    d.selected.nodes.forEach(n => {
                        if(model_tags[d.n[n].m] == t) {
                            d.n[n].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }else{
                    d.selected.nodes.forEach(n => {
                        if(d.n[n].m=='p' && d.n[n].n[t]) {
                            d.n[d.n[n].n[t][0]].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }
            });
        },
    }, 

    hover: (id, hover)=>set(produce(d=>{
        d.n[id].hover = hover;
    })),

    select: (id, selected)=>set(produce(d=>{  // make hover action and hovering store so the same node is highlighted for different occurances
        d.n[id].selected = selected;
        d.selected.nodes = Object.keys(d.n).filter(n=> d.n[n].selected); 
        const node_content = d.selected.nodes.map(n=> d.n[n]);
        val_tags.forEach(t=>{
            const nodes = node_content.filter(n=> n.c[t]!=null);
            if(nodes.length){
                if(nodes.every((n,i,nodes)=> n.c[t]==nodes[0].c[t])){
                    d.inspect.content[t] = nodes[0].c[t];
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = 'Multi: ' + nodes.map(n=>n.c[t]).join(', ');
                }
                d.inspect.asset[t] = nodes.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;   }
        })
        Object.entries(model_tags).forEach(([m,t],i)=>{
            const nodes = node_content.filter(n=> n.m==m && n.v!=null);
            if(nodes.length){
                if(nodes.every((n,i,nodes)=> n.v==nodes[0].v)){
                    d.inspect.content[t] = nodes[0].v;
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = 'Multi: ' + nodes.map(n=>n.v).join(', ');
                }
                d.inspect.asset[t] = nodes.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;   }
        });
    })),

});