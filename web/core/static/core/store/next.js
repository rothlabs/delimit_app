import {current} from 'immer';
import lodash from 'lodash';
export const create_next_slice =(set,get)=>({next:{
    posts: [],
    post_ids: [],
    add:(d, ...a)=>{
        const id = a.map(a=> String(a)).join('_');
        if(d.add(d.next.post_ids, id)){ //JSON.stringify(a).split('').sort().join()
            console.log(id);
            d.next.posts.push(a);
        }
    },
    state:(d, patches)=>{
        patches.forEach(patch=>{
            if(patch.path.length > 1){
                if(patch.path[0]=='n'){
                    const n = patch.path[1];
                    patch.path.splice(1,1);
                    const func_name = patch.op+'_'+patch.path.join('_');
                    if(d.next[func_name]) d.next[func_name](d,n,patch.value);
                }
            }
        });
        d.next.posts.forEach(a=>{
            lodash.get(d, a[0])(d, ...a.slice(1));
        });
        d.next.posts    = d.empty_list;
        d.next.post_ids = d.empty_list;
        d.studio.ready = true;
    },

    add_n(d, n, v){
        d.next.add(d, 'graph.update');
        //d.next.update.graph = true;
    },
    add_n_deleted(d, n, v){
        d.next.add(d, 'graph.update');
        //d.next.update.graph = true;
    },
    replace_n_pick_picked(d, n, v){
        if(v){ d.add(d.pick.nodes, n)}
        else{  d.pop(d.pick.nodes, n)}
        d.pick.color(d,n);
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.next.add(d, 'reckon.node', n); 
        d.next.add(d, 'design.update');
        d.next.add(d, 'inspect.update');
    },
    replace_n_pick_hover(d, n, v){
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.next.add(d, 'reckon.node', n); 
    },
    replace_n_open(d, n, v){
        if(!v) d.n[n].pick.picked = false; 
    },

}});