import {set_queries, query, axiom} from 'delimit'; 

// delimit calls 'initialize' immediately
export function initialize(node_id){
    // 'set_queries' attaches functions to this node
    set_queries({
        node_id,
        get_scene, // delimit calls 'get_scene' for rendering on demand 
        get_model,
        // add references to custom functions here
    });
} 

// 'get_scene' must return an object describing the visual and interactive qualities
function get_scene({node_id, draft}){
    const {control_ids, controls} = get_controls({node_id, draft});
    return {
        type: 'polygon',
        node_id, 
        vectors: get_polygon_vectors({node_id}), //: test.basis.flat().map(v => v * 125),
        width: 3,
        scenes: [
            {
                type: 'polygon',
                node_id,
                vectors: controls.map(v => v.Vector),
                dashed: true,
                width: 1,
            },
            ...control_ids.map(node_id => query({node_id, get_scene:{}})),
        ],
    }
}

function get_polygon_vectors({node_id}){
    return axiom.get_polygon({
        model: query({node_id, get_model:{}}), 
        count: 80,
    });
}

function get_model({node_id, draft}){
    const {controls} = get_controls({node_id, draft});
    return {Nurbs:{controls, order:3}};
}

function get_controls({node_id, draft}){
    const control_ids = draft.get_stems({root:node_id, term:'parts'});
    const controls = control_ids.map(node_id => 
        query({node_id, get_model:{}})
    ).filter(p => p);
    return {control_ids, controls};
}


function make_point(d, n, e){
    const ray = d.design.ray_data(d,e);
    //if(!ray.n3) return;
    var r = d.pick.get_if_one(d, ['curve']); //, {one_tag:true}
    if(!r){
        r = d.make.node(d, {spec:'curve', r:n}); // r = d.make.part(d, 'curve', {r:n});//{r:ray.n3}); // d.design.part
        d.pick.one(d, r);
        d.next('design.insert_point', r, ray.pos); // wait until next so matrix can cast to curve
    }else{
        d.design.insert_point(d, r, ray.pos);
    }        
}
function insert_point(d, r, pos){ // in between points for a curve
    var o = undefined;
    if(d.n[r].p && d.n[r].p.design=='curve' && d.n[r].n.point && d.n[r].n.point.length > 2){ // check for d.n[r].ax.curve ?!?!?!?!
        const test_pos = d.n[r].p.points(200);//d.n[r].ax.curve.getPoints(200);//new CatmullRomCurve3(d.n[r].n.point.map(n=>d.n[n].ax.pos)).getPoints(200); //spaced points ?!?!?!?!   //d.n[r].c.pts.map(p=> p.pos)
        const tests = [];
        var o = 0;
        var prev_dist = 0;
        for (var i = 0; i < test_pos.length; i++) {
            //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
            const dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].p); //d.n[r].c.pts[o].pos
            if(dist > prev_dist){
                //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
                for (var k = o+1; k < d.n[r].n.point.length; k++) {
                    //let prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[k]].ax.pos);
                    if(d.n[d.n[r].n.point[o]].p.distanceTo(d.n[d.n[r].n.point[k]].p) > 1){
                    //if(dist < prev_dist){
                        o = k;
                        prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].p);
                        //prev_dist = base_dist;
                        break;
                    }
                    //v1.copy(d.n[d.n[r].n.point[k]].ax.pos);
                }
                // o++;
                // prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos
                // for (var k = i+1; i=k < test_pos.length; k++) {
                //     if(prev_dist  test_pos[k].distanceTo(d.n[d.n[r].n.point[o]].ax.pos)){
                //         i = k;
                //         break;
                //     }
                //     tests.push({o:o, dist:test_pos[k].distanceTo(pos)});
                // }
            }else{ prev_dist = dist }
            tests.push({o:o, dist:test_pos[i].distanceTo(pos)});
        }
        prev_dist = Infinity;
        for (var i = 0; i < tests.length; i++) { // use .sort here ?!?!?!?!
            if(tests[i].dist < prev_dist){
                o = tests[i].o;
                prev_dist = tests[i].dist;
                if(i == test_pos.length-1) o++;
            }
        }
    }
    const n = d.make.node(d, {spec:'point', r:r, o:o}); // const n = d.make.part(d, 'point', {r:r, o:o}); //d.make.point(d, {pos:pos, r:r, o:o}); // must have insertion index. For now, using -1 for last
    d.graph.set_pos(d, n, pos);
    d.pick.one(d, n, {t:true});
}