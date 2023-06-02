
// need line merge that looks for closest points so it doesn't just put the line on the end of the target (same as special drawing tool in legacy system)
// this kind of merge could transform one line to fit to the points of the other line
// point and line need merge settings

// make list of nodes to never have more than one: name, x, y, z, etc (singular non-list nodes) - use value_tags!!!! (maybe rename to single_tags)

export const create_remake_slice = (set,get)=>({remake:{
    merge(d){ 
        const target = d.pick.same[0];
        const nodes = d.pick.same.slice(1);
        if(d.remake.merge_funcs[d.n[d.pick.same[0]].t]){  
            d.remake.merge_funcs[d.n[d.pick.same[0]].t](d, nodes, target); 
            d.remake.merge_funcs.base(d, nodes, target);  
        }
        else{  
            d.remake.merge_funcs.default(d, nodes, target);  
            d.remake.merge_funcs.base(d, nodes, target);
        }
    },
    merge_funcs:{
        base(d, nodes, target){
            //d.node.for_r(d, nodes, (r,n,t)=>{
            //    d.make.edge(d, target, n, {t:t});
            //});
            d.node.delete(d, nodes, true);
        },
        //point(d, nodes, target){

        //},
        default(d, nodes, target){
            d.node.for_n(d, nodes, (r,n,t)=>{
                if(!d.value_tags.includes(t)) d.make.edge(d, target, n, {t:t});
            });
        },
    },
    split(d){
        console.log('split');
    },
}});
