import {make_id, random_vector, theme} from '../app.js';

// need line merge that looks for closest points so it doesn't just put the line on the end of the target (same as special drawing tool in legacy system)
// this kind of merge could transform one line to fit to the points of the other line
// point and line need merge settings

// make list of nodes to never have more than one: name, x, y, z, etc (singular non-list nodes) - use value_tags!!!! (maybe rename to single_tags)

export const create_remake_slice = (set,get)=>({remake:{
    copy(d, src, a){ // maybe place in d.node (only run for part
        if(!d.node.limited(d, [src])){
            const cpy = d.make.node(d, d.n[src].m, d.n[src].t);
            if(d.n[src].m != 'p') d.n[cpy].v = d.n[src].v;
            d.node.for_r(d, src, r=>{ // make for_rn that just has these nested loops
                if(!(a&&a.exclude_r && a.exclude_r == r) && !(a&&a.rt && !a.rt.includes(d.n[r].t))){
                    d.node.for_n(d, r, (r,n,t,o)=>{
                        if(src == n) d.make.edge(d, r, cpy, {t:t, o:o}); // adding edge in edge loop bad?!?!?!
                    });
                }
            });
            d.node.for_n(d, src, (r,n,t,o)=>{
                if(a&&a.deep) {
                    d.make.edge(d, cpy, d.remake.copy(d,n, {deep:true, exclude_r:r}), {t:t, o:o});
                }else{
                    d.make.edge(d, cpy, n, {t:t, o:o});
                }
            });
            d.next('reckon.node', cpy); // maybe this should go in node creation
            return cpy;
        }
    },
    merge(d, nodes, target){ 
        if(!d.node.limited(d, [...nodes, target])){
            if(d.remake.merge_funcs[d.n[d.pick.same[0]].t]){  
                d.remake.merge_funcs[d.n[d.pick.same[0]].t](d, nodes, target); 
                d.remake.merge_funcs.base(d, nodes, target);  
            }
            else{  
                d.remake.merge_funcs.default(d, nodes, target);  
                d.remake.merge_funcs.base(d, nodes, target);
            }
        }
    },
    merge_funcs:{
        base(d, nodes, target){
            d.node.for_r(d, nodes, r=>{ // make for_rn that uses d.n[n].rn which is tagged by use of n
                d.node.for_n(d, r, (r,n,t,o)=>{
                    if(nodes.includes(n)) d.make.edge(d, r, target, {t:t, o:o}); // adding edge in edge loop bad?!?!?!
                });
            });
            nodes.forEach(n=> d.node.delete(d, n)); 
            d.next('reckon.node', target); // maybe this should go in edge creation
        },
        //point(d, nodes, target){

        //},
        default(d, nodes, target){
            d.node.for_n(d, nodes, (r,n,t)=>{
                if(d.value_tags.includes(t)){
                    d.node.delete(d, n, {deep:true});
                }else{
                    d.make.edge(d, target, n, {t:t}); // should order be included?
                }
            });
        },
    },
    split(d, roots, target){ // make unique copy for everything but asset and transform?
        if(!d.node.limited(d, [...roots, target])){
            const dead_edges = [];
            d.node.for_n(d, roots, (r,n,t,o)=>{
                if(n == target){
                    const cpy = d.remake.copy(d, n, {deep:true, rt:['asset', 'view']}); // should include matrix node?
                    d.make.edge(d, r, cpy, {t:t, o:o});
                    dead_edges.push({r:r, n:n, t:t, o:o+1}); // +1 because new edge is inersted just in front of old edge 
                }
            });
            d.node.delete_edges(d, dead_edges);
        }
    },
}});

//d.node.for_r(d, nodes, (r,n,t)=>{
            //    d.make.edge(d, target, n, {t:t});
            //});
