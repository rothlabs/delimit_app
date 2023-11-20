
export const create_drop_slice = (set,get)=>({drop:{
    node(d, nodes, a={}){ // allow delete if not asset when it is another user deleting 
        let drops = new Set();
        for(const node of nodes){
            if(d.node.has(node)) drops.add(node);
        }
        if(a.deep){
            function get_stems(nodes){
                const next_nodes = new Set();
                for(const node of nodes){
                    for(const stems of d.node.get(node).forw.values()){
                        for(const stem of stems){
                            if(!d.node.has(stem)) continue;
                            if(d.node.get(stem).back.values().every(({root})=> drops.has(root))){ // what if the root doesn't exist?
                                drops.add(stem);
                                next_nodes.add(stem);
                            }
                        }
                    }
                }
                if(next_nodes.size) get_stems(next_nodes);
            };
            get_stems(drops);
        }
        if(!a.received) drops = d.write_access(d, drops);
        for(const node of drops){
            d.drop.edge(d, {root:node});
            d.drop.edge(d, {stem:node});
            d.node.delete(node);
        }
        if(drops.length) d.graph.next();
    },
    edge(d, a={}){
        const drops = []; 
        function forward_edge(func){
            if(!d.node.has(a.root)) return {};
            for(const [term, stems] of d.node.get(a.root).forw.entries()){
                for(let indx; indx < stems.length; indx++){
                    func({root:a.root, term, stem:stems[indx], indx});
                }
            }
        }
        if(a.root && a.term && a.stem){ 
            drops.push({root:a.root, term:a.term, stem:a.stem, indx:a.indx ?? 0});
        }else if(a.root && a.stem){
            forward_edge(edge=> edge.stem==a.stem && drops.push(edge));
        }else if(a.root){  
            forward_edge(edge=> edge && drops.push(edge));
        }else if(a.stem){
            if(!d.node.has(a.stem)) return;
            for(const {root, term, indx} of d.node.get(a.stem).back.values()){
                drops.push({root, term, stem:a.stem, indx});
            }
        }
        drops.sort((a, b)=> b.indx - a.indx);
        for(const drp of drops){
            if(!d.node.has(drp.root)) continue;
            const forw = d.node.get(drp.root).forw;
            if(!forw.has(drp.term)) continue;
            const stems = forw.get(drp.term);
            if(drp.indx >= stems.length) continue;
            stems.splice(drp.indx, 1);
            if(!stems.length) forw.delete(drp.term);
        }
        for(const drp of drops){
            if(!d.node.has(drp.stem)) continue;
            d.node.get(drp.stem).back.delete(drp.root+':'+drp.term+':'+drp.indx);
        }
        if(drops.length) d.graph.next();
    },
}});


    // edge_or_node(d,r,n,a){
    //     if(d.graph.asset_root(d,n).length > 1){
    //         d.delete.edge(d,r,n,a);
    //     }else{
    //         d.delete.node(d,n);
    //     }
    // },




        //d.next('reckon.up', r);
        //d.next('graph.update');
        //d.next('pick.update');
        //d.next('design.show');



// var t = d.n[n].t;
//         if(a.t != undefined) t = a.t;
//         if(d.n[r].asset && d.n[r].n[t]){ // if((d.n[r].asset || d.cats[d.n[r].t]) && d.n[r].n[t]){ // d.n[r].n[t] remove d.n[r].n[t] ?!?!?!?!
//             const re = d.graph.root_edge(d, n).find(re=> re.r==r);
//             if(re){
//                 d.pop(d.n[n].r[re.t], re.r); //d.n[n].r[re.t].splice(re.o, 1);
//                 if(d.n[n].r[re.t].length==0) delete d.n[n].r[re.t];
//                 if(!d.n[n].n && d.graph.asset_root(d,n).length==0) d.delete.node(d,n); // delete unused atoms
//             }
//             const o = d.pop(d.n[r].n[t], n); //d.n[r].n[t].splice(e.o, 1);
//             //console.log('delete edge', o);
//             if(o > -1){
//                 if(d.n[r].n[t].length==0) delete d.n[r].n[t];
//                 d.next('reckon.up', r);
//                 d.next('graph.update');
//                 d.next('pick.update');
//                 d.next('design.show');
//             }
//         }



//console.log('delete edge', r, n, t);

            ////////////////////////////// special case that needs generalized ?!?!?!?!?
            //var reckon_nodes = null;
            //if(d.n[r].t=='transform') reckon_nodes = d.graph.stem_of_tag(d,n,'point');
            //if(d.n[r].t=='transform') 
            //d.clear.down(d,r,n);
            //////////////////////////////
            


/////////////////////d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
            //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 

