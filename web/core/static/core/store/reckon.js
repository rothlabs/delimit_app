//import {current} from 'immer';
//import lodash from 'lodash';

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    up(d, n, a={}){ 
        d.reckon.count++; // could be causing extra reckson ?!?!?!?!?!
        d.reckon.props(d, n, ['name', 'story', 'visible', 'autocalc',]);
        d.reckon.props(d, n, Object.keys(d.node.transform.common_float));
        d.n[n].c.matrix = d.node.transform.matrix(d, d.n[n].c);
        d.n[n].design.transform = d.node.transform.view(d, d.n[n].c);
        const node = d.node[d.n[n].t] ?? {};
        if(node.bool)   d.reckon.props(d, n, Object.keys(node.bool)); // do not need to reckon props on way up if caused by source node!!!!!! #1
        if(node.int)    d.reckon.props(d, n, Object.keys(node.int));
        if(node.float)  d.reckon.props(d, n, Object.keys(node.float));
        if(node.string) d.reckon.props(d, n, Object.keys(node.string));
        if(d.n[n].v != null || node.autocalc || d.n[n].c.autocalc || a.manual){//cause.includes('manual_compute')){ //if(!(d.n[n].c.manual_compute && !cause.includes('manual_compute'))){ 
            if(node.reckon){
                try{
                    const source = {};
                    if(node.source){
                        for(let i = 0; i < node.source.length; i++){
                            if(d.n[n].n[node.source[i]]){
                                source[node.source[i]] = d.n[n].n[node.source[i]].map(n=> d.n[n]);
                            }else{
                                source[node.source[i]] = [];
                            }
                        }
                    }
                    const new_part = node.reckon(d, source, d.n[n].c);
                    if(new_part && !d.n[n].p) d.next('design.show');
                    d.n[n].p = new_part;
                }catch(e){
                    console.log('Reckon Error: '+d.n[n].t, e);
                }
            }
            d.graph.for_root(d, n, r=> d.next('reckon.up', r));// [...cause, d.n[n].t+'__'+r])); // this does not send causes up the chain ?!?!?!?! [...cause, d.n[n].t]
        }
        d.next('design.update'); 
        d.next('inspect.update'); 
    },
    props(d, n, t){ 
        t.forEach(t=>{
            if(d.n[n].n && d.n[n].n[t]){ //  && d.graph.ex(d,d.n[n].n[t][0])
                d.n[n].c[t] = d.n[d.n[n].n[t][0]].v;
            }else{   delete d.n[n].c[t];  } // d.n[n].c[t]=null; // should delete attr instead ?!?!?!
        });
    },
}});


// && !(d.n[n].c.manual_compute && !cause.includes('manual_compute'))){

                //d.reckon[d.n[n].t].result(d, n, d.n[n].c, {cause:cause}); // get more cast_downs from here so it all goes down in one cast.down call ?!?!?!

// props(d, n, t){ // rename to props ?!?!?!?!
//     // // const result = {};
//     t.forEach(t=>{//t.split(' ').forEach(t=>{
//         if(d.n[n].n && d.n[n].n[t]){ //  && d.graph.ex(d,d.n[n].n[t][0])
//             d.n[n].c[t] = d.n[d.n[n].n[t][0]].v;
//             // // if(d.n[n].n[t].length > 1){ // and tag is not singleton ?!?!?! (x, y, z, etc should only have one!) 
//             // //     result[t] = [];
//             // //     d.n[n].n[t].forEach(nn=>{ // could use for_nt ?! #1
//             // //         if(d.graph.ex(d,nn)) result[t].push(d.n[nn].v);
//             // //     });
//             // // }else if(d.graph.ex(d,d.n[n].n[t][0])){
//             // //   result[t] = d.n[d.n[n].n[t][0]].v;
//             // // }
//             // // d.n[n].c[t] = result[t];
//         }else{   delete d.n[n].c[t];  } // d.n[n].c[t]=null; // should delete attr instead ?!?!?!
//     });
//     //if(lodash.isEmpty(result)) return null; 
//     //return result;
// },


        // if(d.cast_map[d.n[n].t]){ // it is a category node if its tag is in the cast map
        //     d.n[n].c[d.n[n].t] = true;
        //     d.cast.down(d, n, d.n[n].t, {shallow:d.cast_shallow_map[d.n[n].t]});
        // }

        // if(node && node.view){
        //     node.view(); // update rendering relevant stuff only
        // }

// if(node.props){
            //     d.reckon.props(d, n, node.props);
            // }

// matrix(d, n, ct, func, matrix){
//     if(d.n[n][ct].matrix_list == undefined){
//         if(func == d.pop_nc) return false;
//         d.n[n][ct].matrix_list = [];
//     }
//     const result = false;
//     if(func) func(d.n[n][ct].matrix_list, matrix);
//     if(d.n[n][ct].matrix_list.length < 1){
//         delete d.n[n][ct].matrix_list;
//         delete d.n[n][ct].matrix;
//         delete d.n[n][ct].invert;
//         return;
//     }
//     d.n[n][ct].matrix = d.n[n][ct].matrix_list.sort((a,b)=>b.o-a.o).reduce((a,b)=>a.multiply(b.c), new Matrix4());
//     d.n[n][ct].invert = d.n[n][ct].matrix.clone().invert();
//     return result;
// },
// base_transform(d, n, cause=[]){ // put this in base and make it work for at least one component (just scale_x for example)
//     //try{
//     if(cause.length < 1) return;
//     const sc = cause[0].split('__'); //'make.node',
//     if(cause[0]=='auxiliary' || (sc[0]=='decimal' && sc[1]==n) || (cause.length>1  
//         && ['make.edge','delete.edge'].includes(cause[0]) && transform_props.includes(cause[1]))){ 
//         const nn = d.reckon.props(d, n, transform_props); 
//         if(d.n[n].c.transform == true){
//             d.clear.down(d, n, {base_matrix:d.n[n].c.base_matrix}, {base_matrix:d.n[n].ax.base_matrix});
//             delete d.n[n].c.transform;
//             delete d.n[n].c.base_matrix;
//             delete d.n[n].ax.base_matrix;
//         }
//         if(nn){ //  && Object.keys(nn).length > 0
//             v1.set(0,0,0);
//             if(nn.move_x != undefined) v1.setX(nn.move_x);
//             if(nn.move_y != undefined) v1.setY(nn.move_y);
//             if(nn.move_z != undefined) v1.setZ(nn.move_z);
//             v2.set(0,0,0);
//             if(nn.turn_x != undefined) v2.setX(MathUtils.degToRad(nn.turn_x));
//             if(nn.turn_y != undefined) v2.setY(MathUtils.degToRad(nn.turn_y));
//             if(nn.turn_z != undefined) v2.setZ(MathUtils.degToRad(nn.turn_z));
//             tq.setFromEuler(te.setFromVector3(v2));
//             v3.set(1,1,1);
//             if(nn.scale_x != undefined) v3.setX(nn.scale_x);
//             if(nn.scale_y != undefined) v3.setY(nn.scale_y);
//             if(nn.scale_z != undefined) v3.setZ(nn.scale_z);
//             tm.compose(v1, tq, v3);   
//             const c_ax = (d.n[n].c.auxiliary ? 'ax' : 'c');
//             d.n[n][c_ax].base_matrix = {n:n, o:0, c:tm.clone()};
//             d.reckon.matrix(d, n, c_ax, d.add_nc, d.n[n][c_ax].base_matrix);
//             //d.n[n][c_ax].pos = new Vector3().setFromMatrixPosition(d.n[n].ax.matrix);
//             d.n[n].c.transform = true;
//             if(!d.cast_end[d.n[n].t]) d.cast.down(d,n,'base_matrix'); 
//             //console.log('reckon transform!!!!');
//         }
//     }
//     //}}catch{} //}catch(e){console.log(e)}
// },
// point:{
//     node(d, n, cause=[]){ // make big list of vector3 that can be assigned and released to improve performance (not creating new vector3 constantly)
//         try{ //if(pos){
//             const nn = d.reckon.props(d, n, ['x', 'y', 'z']);
//             d.n[n].c.xyz = new Vector3(0,0,0); // create vector on make.node so it can just be reused here ?!?!?!?!?!
//             if(nn.x != undefined) d.n[n].c.xyz.setX(nn.x);
//             if(nn.y != undefined) d.n[n].c.xyz.setY(nn.y);
//             if(nn.z != undefined) d.n[n].c.xyz.setZ(nn.z);
//             d.n[n].c.pos = d.n[n].c.xyz;
//             if(d.n[n].c.matrix) d.n[n].c.pos = d.n[n].c.pos.clone().applyMatrix4(d.n[n].c.matrix);
//             if(d.n[n].ax.matrix) d.n[n].ax.pos = d.n[n].c.pos.clone().applyMatrix4(d.n[n].ax.matrix);
//             else d.n[n].ax.pos = d.n[n].c.pos;
//             //console.log('reckon point!!!!');
//         }catch{} //console.error(e)
//     },
// },

