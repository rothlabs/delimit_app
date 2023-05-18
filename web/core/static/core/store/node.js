import { LineCurve } from "three";

export const create_node_slice = (set,get)=>({node:{
    be:(d, n)=>{
        if(d.n[n] && !d.n[n].deleted){
            if(d.n[n].open) return 'open';
            return 'here';
        }
        return null;
    },
    for_n:(d, n, func, allow_null)=>{
        if(d.n[n].n) Object.entries(d.n[n].n).forEach(([t,nodes],i)=> nodes.forEach((n,o)=>{
            if(allow_null || d.node.be(d, n)) func(n,t,o);
        }));
    },
    for_r:(d, n, func, allow_null)=>{
        Object.entries(d.n[n].r).forEach(([t,nodes],i)=> nodes.forEach((r,o)=> {
            if(allow_null || d.node.be(d, r)) func(r,t,o);
        }));
    },
    delete:(d, n)=>{
        if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
            d.n[n].open = false;
            d.n[n].deleted = true;
            d.node.for_r(d, n, r=>{
                const dead_edges = [];
                d.node.for_n(d, r, (nn,t,o)=>{
                    console.log(nn, t, o);
                    if(n==nn) dead_edges.push({t:t,o:o});
                }, true);
                console.log(dead_edges);
                dead_edges.reverse().forEach(edge=>{ // look into for{} loop in general (performance gain?)
                    d.n[r].n[edge.t].splice(edge.o, 1);
                    if(d.n[r].n[edge.t].length==0) delete d.n[r].n[edge.t];
                });
            });
            d.n[n].update(d); // maybe instead of manually updating, allow patch consume function to figure out what updates to call
        }
        d.consume = d.send; // instead of setting consume here, make ssp_send and ssp_recieve?
    },
}});

