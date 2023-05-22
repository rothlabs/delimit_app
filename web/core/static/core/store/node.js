import { reckoners } from '../reckon/reckon.js';

export const create_node_slice =(set,get)=>({node:{
    be:(d, n)=>{ // have to calculate this every time a user wants to know because the node could not be present at all
        if(d.n[n] && !d.n[n].deleted){
            if(d.n[n].open) return 'open';
            return 'here';
        }
        return null;
    },
    gv:(d, n, t, o)=>{
        if(!o) o=0;
        if(d.n[n].n[t] && o < d.n[n].n[t].length) return d.n[d.n[n].n[t][o]].v;
        return null;
    },
    // sv:(d, n, t, o)=>{
    //     if(!o) o=0;
    // },
    for_n:(d, n, func, filter)=>{
        if(!filter) filter = ['open']; 
        if(d.n[n].n) Object.entries(d.n[n].n).forEach(([t,nodes],i)=> nodes.forEach((n,o)=>{
            if(filter.includes(d.node.be(d,n))) func(n,t,o); //if(allow_null || d.node.be(d, n)) func(n,t,o);
        }));
    },
    for_r:(d, n, func, filter)=>{
        if(!filter) filter = ['open']; 
        Object.entries(d.n[n].r).forEach(([t,nodes],i)=> nodes.forEach((r,o)=> {
            if(filter.includes(d.node.be(d,r))) func(r,t,o); //if(allow_null || d.node.be(d, r)) func(r,t,o);
        }));
    },
    reckon:(d, n)=>{ // might need to check for node existence or track original reckon call
        if(reckoners[d.n[n].t]){   reckoners[d.n[n].t] (d, n);   }
        else{                      reckoners['default'](d, n);   }
    },
    delete:(d, n, shallow)=>{ // allow delete if not asset when it is another user deleting 
        if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
            d.n[n].open = false;
            d.n[n].deleted = true;
            d.node.for_r(d, n, r=>{
                const dead_edges = [];
                d.node.for_n(d, r, (nn,t,o)=>{
                    console.log(nn, t, o);
                    if(n==nn) dead_edges.push({t:t,o:o});
                }, [null]);
                //console.log(dead_edges);
                dead_edges.reverse().forEach(edge=>{ 
                    d.n[r].n[edge.t].splice(edge.o, 1);
                    if(d.n[r].n[edge.t].length==0) delete d.n[r].n[edge.t];
                });
            });
            if(!shallow){
                d.node.for_n(d, n, n=> d.node.delete(d, n, shallow)); // must check if no roots except profile, public, etc
            }
            d.node.reckon(d,n); // maybe instead of manually updating, allow patch consume function to figure out what updates to call
        }
        
    },
}});

