import * as vtx from './vertex.js'; 

// constrain endpoint of line2 to line1 of endpoints are overlaping
export function Coincident(line1,line2, ids){
    if(line1 != line2){
        const constraint = {};
        const mount_dist = 0.5;
        const max_dist = 0.5;
        var correction = null; 
        var v1a=()=>  vtx.vect(line1.verts(),0);
        var v1b=()=> vtx.vect(line1.verts(),-1);
        var v2a=()=>  vtx.vect(line2.verts(),0);
        var v2b=()=> vtx.vect(line2.verts(),-1);

        constraint.enforce = function(args){
            if(correction != null){
                if(v1a().distanceTo(v2a()) > max_dist){
                    args.depth--;
                    line2.update({verts:correction(), depth:args.depth}); 
                }
            }
        };
    
        var id = line1.name()+'__'+line2.name()+'__';
        if(v1a().distanceTo(v2a()) < mount_dist && !ids.includes(id+'a_a')){
            correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1));
            id += 'a_a';
        }else if(v1a().distanceTo(v2b()) < mount_dist && !ids.includes(id+'a_b')){
            v2a = v2b;
            correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a());
            id += 'a_b';
        }else if(v1b().distanceTo(v2a()) < mount_dist && !ids.includes(id+'b_a')){
            v1a = v1b;
            correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1));
            id += 'b_a';
        }else if(v1b().distanceTo(v2b()) < mount_dist && !ids.includes(id+'b_b')){
            v1a = v1b;
            v2a = v2b;
            correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a());
            id += 'b_b';
        }else if(vtx.closest(line1.verts(), v2a()).dist < mount_dist){
            v1a=()=> vtx.closest(line1.verts(), v2a()).vert; 
            correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1)); 
            line2.add_constraint(constraint);
        }else if(vtx.closest(line1.verts(), v2b()).dist < mount_dist){
            v1a=()=> vtx.closest(line1.verts(), v2b()).vert; 
            v2a = v2b;
            correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a()); 
            line2.add_constraint(constraint);
        }
        if(correction != null){
            line1.add_constraint(constraint);
            ids.push(id);
        }

    }
    return null;
}
