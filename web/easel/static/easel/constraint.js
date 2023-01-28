import * as vtx from 'easel/vertex.js';

export function Coincident(line1, line2){
    const constraint = {};
    const test_dist = 0.1;
    var ep1 = 0;
    var ep2 = 0;

    constraint.enforce = function(){
        if(correction != null){
            if(vtx.vector(line1.verts,ep1).distanceTo(vtx.vector(line2.verts,ep2)) > test_dist){
                correction();
                line2.update({rules: true, history:true});
            }
        }
    }

    var correction = null;
    if(line1 != line2){
        if(vtx.vector(line1.verts,0).distanceTo(vtx.vector(line2.verts,0)) < test_dist){
            correction = function(){
                line2.verts = vtx.map(line2.verts, vtx.first(line1.verts), vtx.last(line2.verts));
            };
            line1.add_constraint(constraint);
        }else if(vtx.vector(line1.verts,0).distanceTo(vtx.vector(line2.verts,-1)) < test_dist){
            correction = function(){
                line2.verts = vtx.map(line2.verts, vtx.first(line2.verts), vtx.first(line1.verts));
            };
            line1.add_constraint(constraint);
            ep2 = -1;
        }else if(vtx.vector(line1.verts,-1).distanceTo(vtx.vector(line2.verts,0)) < test_dist){
            correction = function(){
                line2.verts = vtx.map(line2.verts, vtx.last(line1.verts), vtx.last(line2.verts));
            };
            line1.add_constraint(constraint);
            ep1 = -1;
        }else if(vtx.vector(line1.verts,-1).distanceTo(vtx.vector(line2.verts,-1)) < test_dist){
            correction = function(){
                line2.verts = vtx.map(line2.verts, vtx.first(line2.verts), vtx.last(line1.verts));
            };
            line1.add_constraint(constraint);
            ep1 = -1;
            ep2 = -1;
        }
    }

    return constraint;
}//export{Coincident}