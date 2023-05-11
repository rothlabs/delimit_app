import {model_tags, float_tags, string_tags, val_tags} from './basic.js';

//export const create_inspect_slice = (set,get)=>({
export const inspect = {
    content:{}, 
    asset:{}, 
    placeholder:{}, 
    float_tags:float_tags, 
    string_tags:string_tags, 
    update:d=>{
        const node_content = d.pick.nodes.map(n=> d.n[n]);
        val_tags.forEach(t=>{
            const nodes = node_content.filter(n=> n.c[t]!=null);
            if(nodes.length){
                if(nodes.every((n,i,nodes)=> n.c[t]==nodes[0].c[t])){
                    d.inspect.content[t] = nodes[0].c[t];
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = nodes.map(n=>n.c[t]).join(',  ');
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
                    d.inspect.placeholder[t] = nodes.map(n=>n.v).join(',  ');
                }
                d.inspect.asset[t] = nodes.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;   }
        });
    },
}
//});