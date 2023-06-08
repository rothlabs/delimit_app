
export const create_delete_slice = (set,get)=>({delete:{
    node:(d, n, a)=>{ // allow delete if not asset when it is another user deleting 
        var nodes = [n];
        if(a&&a.deep) nodes = nodes.concat(d.node.n(d, n, a));
        nodes.filter(n=> d.n[n].asset).forEach(n=>{
            d.node.for_rn(d, n, (r,n,t)=> d.delete.edge(d,r,n,t));//d.edge.delete(d, d.node.rne(d,n));
            d.node.for_n (d, n, (r,n,t)=> d.delete.edge(d,r,n,t));//d.edge.delete(d, d.node.ne(d,n));
            d.node.close(d, n);
            d.n[n].deleted = true;
        });
    },
    edge(d, r, n, t){ // can be delete_edge, not taking array  
        //edges.reverse().forEach(e=>{ 
            const re = d.node.re(d, n).find(re=> re.r==r);
            if(re){
                d.pop(d.n[n].r[re.t], re.r); //d.n[n].r[re.t].splice(re.o, 1);
                if(d.n[n].r[re.t].length==0) delete d.n[n].r[re.t];
            }
            d.pop(d.n[r].n[t], n); //d.n[r].n[t].splice(e.o, 1);
            if(d.n[r].n[t].length==0) delete d.n[r].n[t];
            d.next('reckon.node', r);
        //});
        d.next('graph.update');
        d.next('pick.update');
    },
}});


/////////////////////d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
            //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 

