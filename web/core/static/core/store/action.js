import {current} from 'immer';

export const create_action_slice=(set,get)=>({action:{
    node(d, n, a={}){ // might need to check for node existence or track original reckon call
        if(d.action[d.n[n].t]) d.action[d.n[n].t](d,n,a);
        d.node.for_r(d, n, r=> d.action.node(d,r,a)); // watch out for cycle ?!?!?!
    },
    repeater(d, n, a={}){
        if(a.src!=n){
            console.log('repeater', a);
            const grps = d.n[n].n.group;
            if(grps){
                if(a.act == 'make.edge'){
                    console.log('make edge');
                    if(grps.includes(a.r)){ // && !d.n[n].c.stop 
                        grps.forEach(g=>{
                            if(g != a.r) d.remake.copy(d, a.n, {r:g, src:n}); // only if not grouping? // rename src to act ?!?!?!?!
                        });
                    }else{ // check if atom should be shared or not in a?!?!?!?!
                        const share = (d.n[a.n].n ? false : true);
                        const cgr = d.node.r(d, a.r, {filter:r=>grps.includes(r), deep:true});
                        const cgn = (share ? cgr : d.node.r(d, a.n, {filter:r=>grps.includes(r), deep:true}));
                        if(cgr.length>0 && cgn.length>0 && cgr[0]==cgn[0]){
                            const cg = cgr[0];
                            grps.forEach(g=>{
                                if(g != cg){
                                    const alt_r = d.n[g].n.group[d.n[cg].n.group.indexOf(a.r)];
                                    const alt_n = (share ? a.n : d.n[g].n.group[d.n[cg].n.group.indexOf(a.n)]);
                                    d.make.edge(d, alt_r, alt_n, {src:n, t:a.t, o:a.o}); // need o:o
                                }
                            });
                        }
                    }
                }
                if(a.act == 'delete.edge'){
                    if(grps.includes(a.r)){ // && !d.n[n].c.stop 
                        grps.forEach(g=>{
                            if(g != a.r && d.n[g].n.group) d.delete.node(d, d.n[g].n.group[a.o], {src:n});
                        });
                    }else{ 
                        const cgr = d.node.r(d, a.r, {filter:r=>grps.includes(r), deep:true});
                        const cgn = d.node.r(d, a.n, {filter:r=>grps.includes(r), deep:true});
                        if(cgr.length>0 && cgn.length>0 && cgr[0]==cgn[0]){
                            const cg = cgr[0];
                            grps.forEach(g=>{
                                if(g != cg){
                                    const alt_r = d.n[g].n.group[d.n[cg].n.group.indexOf(a.r)];
                                    const alt_n = d.n[g].n.group[d.n[cg].n.group.indexOf(a.n)];
                                    d.delete.edge(d, alt_r, alt_n, a.t, {src:n});
                                }
                            });
                        }
                    }
                }
            }
        }


        //     if(!d.n[n].c.grp) d.n[n].c.grp = [];

        //     var cg = [];
        //     grps.forEach(g=>{
        //         if(d.n[g].c.pushed != undefined && d.n[g].c.removed != undefined){
        //             if(!d.n[n].c.grp[g]) d.n[n].c.grp[g] = {pushed:d.n[g].c.pushed, removed:d.n[g].c.removed};
        //             if(d.n[n].c.grp[g].pushed.join() != d.n[g].c.pushed.join() || d.n[n].c.grp[g].removed.map(rm=>rm.n).join() != d.n[g].c.removed.map(rm=>rm.n).join()){
        //                 cg.push(g);
        //             }
        //             d.n[n].c.grp[g].pushed = d.n[g].c.pushed;
        //             d.n[n].c.grp[g].removed = d.n[g].c.removed;
        //         }
        //     });
        //     if(cg.length){
        //         cg = cg[0];
        //         grps.forEach(g=>{
        //             if(g!=cg){
        //                 d.n[cg].c.pushed.forEach(pn=>{
        //                     const cpy = d.remake.copy(d, pn, {root:g});
        //                     d.add(d.n[g].c.n, cpy); // add to group content so it doesn't see a diff and cause infinit loop
        //                 });
        //                 d.n[cg].c.removed.forEach(rm=>{
        //                     //console.log('repeater remove i', i);
        //                     if(d.n[g].n.group){
        //                         const rmn = d.n[g].n.group[rm.i];
        //                         if(rmn){
        //                             //console.log('repeater remove rmv', rmv);
        //                             d.delete.node(d, rmn);
        //                             d.pop(d.n[g].c.n, rmn); // add to group content so it doesn't see a diff and cause infinit loop
        //                         }
        //                     }
        //                 });
        //             }
        //         });
        //     }
        // }
    }
}});


//if(d.node.r(d, a.r, {filter:r=>grps.includes(r), deep:true})){

// var grp1 = null;
                        // d.node.for_r(d, a.r, r=>{
                        //     grp1 = grps.find(r)
                        // },{deep:true});

// group(d,n){ // use a.cause='edge_create' and a.cause='edge_deleted'?
    //     //if(d.n[n].c.n == undefined) d.n[n].c.n = [];
    //     const nodes = (d.n[n].n.group ? d.n[n].n.group : []);//d.node.n(d, n, {filter:n=>d.n[n].n});//.filter(n=> d.n[n].n);
    //     if(d.n[n].c.n == undefined) d.n[n].c.n = nodes;
    //     if(d.n[n].c.pushed == undefined) d.n[n].c.pushed = [];
    //     if(d.n[n].c.removed == undefined) d.n[n].c.removed = [];
    //     if(nodes.join() != d.n[n].c.n.join()){
    //         d.n[n].c.pushed = [];
    //         d.n[n].c.removed = [];
    //         nodes.forEach(nn=>{
    //             if(!d.n[n].c.n.includes(nn)) d.n[n].c.pushed.push(nn);
    //         });
    //         d.n[n].c.n.forEach((nn,i)=>{
    //             if(!nodes.includes(nn)) d.n[n].c.removed.push({n:nn, i:i.toString()});
    //         });
    //         d.n[n].c.n = nodes;
    //     }
    // },


