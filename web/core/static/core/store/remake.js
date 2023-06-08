import {make_id, random_vector, theme} from '../app.js';

// need line merge that looks for closest points so it doesn't just put the line on the end of the target (same as special drawing tool in legacy system)
// this kind of merge could transform one line to fit to the points of the other line
// point and line need merge settings

// make list of nodes to never have more than one: name, x, y, z, etc (singular non-list nodes) - use value_tags!!!! (maybe rename to single_tags)

export const create_remake_slice = (set,get)=>({remake:{
    copy(d, src, a){ // maybe place in d.node (only run for part
        if(!d.node.limited(d, (a&&a.root ? [src,a.root] : [src]))){ // if a&&a.root then check if it is limited
            const cpy = d.make.node(d, d.n[src].m, d.n[src].t);
            if(d.n[src].m != 'p') d.n[cpy].v = d.n[src].v;
            if(a&&a.root) d.make.edge(d, a.root, cpy);
            d.node.for_n(d, src, (r,n,t,o)=>{
                if(a&&a.deep) {
                    delete a.root;
                    d.make.edge(d, cpy, d.remake.copy(d,n,a), {t:t, o:o}); //{...a, exclude_r:r}
                }else{
                    d.make.edge(d, cpy, n, {t:t, o:o});
                }
            });
            d.next('reckon.node', cpy); // maybe this should go in node creation
            return cpy;
        }
    },
    split(d, nodes, target){ // make unique copy for everything but asset and transform?
        if(!d.node.limited(d, [...nodes, target])){ 
            //const dead_edges = [];
            d.node.for_n(d, target, (r,n,t,o)=>{
                if(nodes.includes(n)){
                    const cpy = d.remake.copy(d, n, {deep:true}); // get rid of view for children as well //, rt:['asset', 'view']
                    d.make.edge(d, r, cpy, {t:t, o:o});
                    d.delete.edge(d, r, n, t);
                    //dead_edges.push({r:r, n:n, t:t}); // , o:o+1 +1 because new edge is inersted just in front of old edge 
                }
            });
            //d.node.delete_edges(d, dead_edges);
            
        }
    },
    merge(d, nodes, target){ 
        if(!d.node.limited(d, [...nodes, target])){ // d.n[target].asset && 
            if(d.remake.merging[d.n[d.pick.n[0]].t]){  
                d.remake.merging[d.n[d.pick.n[0]].t](d, nodes, target); 
                d.remake.merging.base(d, nodes, target);  
            }
            else{  
                d.remake.merging.default(d, nodes, target);  
                d.remake.merging.base(d, nodes, target);
            }
        }
    },
    merging:{
        base(d, nodes, target){
                d.node.for_rn(d, nodes, (r,n,t,o)=>{
                    if(!(d.n[r].n[t] && d.n[r].n[t].includes(target))){
                        d.make.edge(d, r, target, {t:t, o:o}); // adding edge in edge loop bad?!?!?!
                    }
                });
            nodes.forEach(n=> d.delete.node(d, n)); 
            d.next('reckon.node', target); // maybe this should go in edge creation
        },
        default(d, nodes, target){
            d.node.for_n(d, nodes, (r,n,t)=>{
                if(d.value_tags.includes(t)){
                    d.delete.node(d, n, {deep:true}); 
                }else{
                    d.make.edge(d, target, n, {t:t}); // should order be included?
                }
            });
        },
        //point(d, nodes, target){ // move target pos to midpoint

        //},
    },
}});


//d.node.for_r(d, nodes, r=>{ // make for_rn that uses d.n[n].rn which is tagged by use of n
            //    d.node.for_n(d, r, (r,n,t,o)=>{
                    //if(nodes.includes(n) && !(d.n[r].n[t] && d.n[r].n[t].includes(target))){

//console.log(roots);
            //console.log(target);
            //roots = d.node.edges(d,n);
            //d.node.ne(d,roots).forEach(([r,n,t,o])=>{//d.node.for_n(d, roots, (r,n,t,o)=>{

//d.node.for_r(d, src, r=>{ // could use for_rn here, 
            // d.node.for_rn(d, src, (r,n,t,o)=>{
            //     if(!(a&&a.exclude_r && a.exclude_r == r)){  // && !(a&&a.rt && !a.rt.includes(d.n[r].t))
            //         //d.node.for_n(d, r, (r,n,t,o)=>{
            //             //if(!(r==d.profile && t=='asset')){ //src == n && 
            //                 d.make.edge(d, r, cpy, {t:t, o:o}); // adding edge in edge loop bad?!?!?!
            //             //}
            //         //});
            //     }
            // });

            // if(a&&a.root){
            //     const rne = d.node.rne(d, src).find(e=> e.r == a.root);
            //     if(rne) d.make.edge(d, rne.r, cpy, {t:rne.t, o:rne.o});
            // }

// split(d, roots, target){ // make unique copy for everything but asset and transform?
//     roots = roots.filter(r=> d.n[r].asset);
//     if(!d.node.limited(d, [...roots, target])){ 
//         const dead_edges = [];
//         //console.log(roots);
//         //console.log(target);
//         //roots = d.node.edges(d,n);
//         //d.node.ne(d,roots).forEach(([r,n,t,o])=>{//d.node.for_n(d, roots, (r,n,t,o)=>{
//         d.node.for_n(d, roots, (r,n,t,o)=>{
//             console.log(r, n);
//             if(n == target){
//                 //console.log('copy');
//                 const cpy = d.remake.copy(d, n, {deep:true, rt:['asset', 'view']}); // get rid of view for children as well
//                 d.make.edge(d, r, cpy, {t:t, o:o});
//                 dead_edges.push({r:r, n:n, t:t, o:o+1}); // +1 because new edge is inersted just in front of old edge 
//             }
//         });
//         d.node.delete_edges(d, dead_edges);
//     }
// },

//d.node.for_r(d, nodes, (r,n,t)=>{
            //    d.make.edge(d, target, n, {t:t});
            //});
