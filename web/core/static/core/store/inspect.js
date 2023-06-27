export const create_inspect_slice = (set,get)=>({inspect:{
    cats:[],
    content:{}, 
    asset:{}, 
    placeholder:{}, 
    mergeable:{},
    splittable:{},
    update(d){ 
        //console.log('update inspect');
        d.inspect.cats = d.node.cats(d,d.pick.n);
        //d.pick.n.forEach(n=>{
        //    d.node.cats(d,n).forEach(t=> d.add(d.inspect.cats, t));
        //});

        const node_content = d.pick.n.map(n=> d.n[n]);
        d.value_tags.forEach(t=>{
            const nc = node_content.filter(n=> n.c[t]!=null);
            const nodes = d.node.get(d, d.pick.n, t);
            d.inspect.mergeable[t] = false;
            d.inspect.splittable[t] = false;
            if(nodes.length > 1) d.inspect.mergeable[t] = true;
            if(nodes.length == 1 && d.node.cr(d,nodes[0]).length > 1) d.inspect.splittable[t] = true;
            if(nc.length){
                if(nc.every((n,i,nc)=> n.c[t]==nc[0].c[t])){ // nc[0].c[t] might be array
                    d.inspect.content[t] = nc[0].c[t];
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = nc.map(n=>n.c[t]).join(',  ');
                }
                d.inspect.asset[t] = nc.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;   }
        })
        Object.entries(d.model_tags).forEach(([m,t],i)=>{
            const nc = node_content.filter(n=> n.m==m && n.v!=null);
            if(nc.length){  
                if(nc.every((n,i,nc)=> n.v==nc[0].v)){
                    d.inspect.content[t] = nc[0].v;   // could be content just like part
                    d.inspect.placeholder[t] = '';
                }else{ 
                    d.inspect.content[t] = '';
                    d.inspect.placeholder[t] = nc.map(n=>n.v).join(',  ');
                }
                d.inspect.asset[t] = nc.some(n=> n.asset);
            }else{  d.inspect.content[t] = undefined;  }
        });
        if(d.pick.n.length > 0){
            if(window.innerWidth>=576 || (d.studio.panel.show && (d.studio.panel.name=='inspect_design' || d.studio.panel.name=='inspect_nodes'))){
                if(d.design.part && d.design.part==d.pick.get_if_one(d)){ //d.pick.n.length==1 && d.pick.n[0]==d.design.part
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