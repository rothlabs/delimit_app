export const create_remake_slice = (set,get)=>({remake:{
    merge(d){ 
        if(d.remake.merge_funcs[d.n[d.pick.same[0]].t]){  d.remake.merge_funcs[d.n[d.pick.same[0]].t](d); d.remake.merge_funcs.base(d);  }
        else{  d.remake.merge_funcs.default(d);  }
    },
    merge_funcs:{
        base(d){
            const roots = [];
            //d.pick.same.forEach(n=>{ // put node loop in for_r?
                
            d.node.for_r(d, d.pick.same, r=> roots.push(r));

            console.log('remake', roots);
            //});
        },
        point(d){

        },
        default(d){

        },
    },
    split(d){
        console.log('split');
    },
}});
