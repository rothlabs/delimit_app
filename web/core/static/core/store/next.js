import {current} from 'immer';
import lodash from 'lodash';
export const create_next_slice =(set,get)=>({next:{
    funcs: [],
    funcs_ids: [],
    add:(d, ...a)=>{
        const id = a.map(a=> String(a)).join('_');
        if(d.add(d.next.funcs_ids, id)){ //JSON.stringify(a).split('').sort().join()
            //console.log(id);
            d.next.funcs.push(a);
        }
    },
    run:(d)=>{
        const funcs = [...d.next.funcs];
        console.log(current(d).next.funcs_ids);
        d.next.funcs     = d.empty_list;
        d.next.funcs_ids = d.empty_list;
        console.log(current(d).next.funcs_ids);
        funcs.forEach(a=>    lodash.get(d, a[0])(d, ...a.slice(1))   );
    },

}});

//add_n_deleted(d, n, v){
//    d.next.add(d, 'graph.update');
//},