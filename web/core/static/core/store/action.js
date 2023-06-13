import {current} from 'immer';

export const create_action_slice=(set,get)=>({action:{
    node(d, n, a){ // might need to check for node existence or track original reckon call
        if(d.action[d.n[n].t]) d.action[d.n[n].t](d,n,a);
        d.node.for_r(d, n, r=> d.action.node(d,r,a)); // watch out for cycle ?!?!?!
    },
    equalizer(d, n, a){
        if(!(a&&a.src==n)){
            console.log('equalizer', a);
            const grps = d.n[n].n.group;
            if(grps && a.action == 'edge_created' && grps.includes(a.r)){ // && !d.n[n].c.stop 
                grps.forEach(g=>{
                    if(g != a.r){
                        d.remake.copy(d, a.n, {root:g, src:n});
                    }
                });
            }
            if(grps && a.action == 'edge_deleted' && grps.includes(a.r)){ // && !d.n[n].c.stop 
                grps.forEach(g=>{
                    if(g != a.r && d.n[g].n.group){
                        d.delete.node(d, d.n[g].n.group[a.o], {src:n});
                    }
                });
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
        //                     //console.log('equalizer remove i', i);
        //                     if(d.n[g].n.group){
        //                         const rmn = d.n[g].n.group[rm.i];
        //                         if(rmn){
        //                             //console.log('equalizer remove rmv', rmv);
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


