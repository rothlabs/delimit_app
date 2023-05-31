export const create_inspect_slice = (set,get)=>({inspect:{
    content:{}, 
    asset:{}, 
    placeholder:{}, 
    update(d){
        //console.log('update inspect');
        const node_content = d.pick.nodes.map(n=> d.n[n]);
        d.value_tags.forEach(t=>{
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
        Object.entries(d.model_tags).forEach(([m,t],i)=>{
            const nodes = node_content.filter(n=> n.m==m && n.v!=null);
            if(nodes.length){
                if(nodes.every((n,i,nodes)=> n.v==nodes[0].v)){
                    d.inspect.content[t] = nodes[0].v;   // could be content just like part
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = nodes.map(n=>n.v).join(',  ');
                }
                d.inspect.asset[t] = nodes.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;   }
        });
        if(d.pick.nodes.length > 0){
            if(window.innerWidth>=576 || (d.studio.panel.show && (d.studio.panel.name=='inspect_design' || d.studio.panel.name=='inspect_nodes'))){
                if(d.design.part && d.pick.nodes.length==1 && d.pick.nodes[0]==d.design.part){
                    d.studio.panel={name:'inspect_design', show:true};
                }else{
                    d.studio.panel={name:'inspect_nodes', show:true};
                }
            }
        }else{
            if((d.studio.panel.name=='inspect_design' || d.studio.panel.name=='inspect_nodes')) d.studio.panel.show=false;
        }
    },
}});