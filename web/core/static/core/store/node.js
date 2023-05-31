import { Vector3 } from 'three';

const tv = new Vector3();

export const create_node_slice =(set,get)=>({node:{
    be:(d, n)=>{ // have to calculate this every time a user wants to know because the node could not be present at all
        if(d.n[n] && !d.n[n].deleted){
            if(d.n[n].open) return 'open';
            return 'here';
        }
        return null;
    },
    get(d, n, t){
        const result = {};
        t.split(' ').forEach(t=>{
            if(d.n[n].n && d.n[n].n[t] && d.node.be(d,d.n[n].n[t][0])) result[t] = d.n[d.n[n].n[t][0]].v;
        });
        return result;
    },
    pin_pos(d, n){  // should go in transform slice?    
        if(d.node.be(d,n) && d.n[n].c.pos){
            if(!d.n[n].pin.pos) d.n[n].pin.pos = new Vector3();    //const pos = d.node.get(d, n, 'x y z');
            d.n[n].pin.pos.copy(d.n[n].c.pos);//.set(pos.x, pos.y, pos.z);//d.n[n].pin.pos.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z);
        }
    },
    set_pos(d, n, pos){ // should go in transform slice?
        d.node.set(d, n, {x:pos.x, y:pos.y, z:pos.z});
    },
    set(d, n, a){
        Object.entries(a).forEach(([t,v],i)=>{
            if(d.n[n].n && d.n[n].n[t]) d.node.sv(d, d.n[n].n[t][0], v);//d.n[n].n[t][0].v = v;
        });
    },
    sv(d, n, v){
        if(d.n[n].t=='decimal') v = Math.round((v + Number.EPSILON) * 100) / 100;//parseFloat(v.toFixed(2));// Math.round(v*100)*0.01; // need to set flag that says 'is_atom' or 'is_float'
        d.n[n].v = v; // check if has v?
        d.next('reckon.node', n);
    },
    for_n(d, n, func, filter){
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
    close:(d, n)=>{
        d.n[n].open = false; // rename to closed?
        d.next('graph.update');
    },
    delete:(d, n, shallow)=>{ // allow delete if not asset when it is another user deleting 
        if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
            d.node.close(d, n);
            d.pick.set(d, n, false);
            d.n[n].deleted = true;
            var reset_root_edges = false;
            if(d.order_tags.includes(d.n[n].t)) reset_root_edges=true;  
            d.node.for_r(d, n, r=>{
                const dead_edges = [];
                d.node.for_n(d, r, (nn,t,o)=>{
                    //console.log(nn, t, o);
                    if(n==nn) dead_edges.push({t:t,o:o});
                }, [null]);
                //console.log(dead_edges);
                dead_edges.reverse().forEach(edge=>{ 
                    d.n[r].n[edge.t].splice(edge.o, 1);
                    if(d.n[r].n[edge.t].length==0) delete d.n[r].n[edge.t];
                });
                if(reset_root_edges && d.n[r].n[d.n[n].t]) d.n[r].n[d.n[n].t] = [...d.n[r].n[d.n[n].t]]; // this way the patches function will send entire list 
            });
            if(!shallow){
                d.node.for_n(d, n, n=> d.node.delete(d, n, shallow)); // must check if no roots except profile, public, etc
            }
            d.reckon.node(d,n); // maybe instead of manually updating, allow patch consume function to figure out what updates to call
        }
    },
}});


// get:(d, n, t, o)=>{
    //     if(!o) o=0;
    //     if(d.n[n].n[t] && o < d.n[n].n[t].length) return d.n[n].n[t][o];
    //     return null;
    // },

