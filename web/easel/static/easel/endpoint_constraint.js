function Endpoint_Constraint(line_a, line_b){
    const constraint = {
        active: false,
    };
    const test_dist = 1;
    var ep_a = 'start';
    var ep_b = 'start';

    constraint.enforce = function(){
        console.log('Enforce endpoint constraint');
    }

    if(line_a != line_b){
        // if(line_a.start.distanceTo(line_b.start) < test_dist){
        //     constraint.active = true;
        //     line_a.add_constraint(constraint);
        // }else if(line_a.start.distanceTo(line_b.end) < test_dist){
        //     constraint.active = true;
        //     line_a.add_constraint(constraint);
        //     ep_b = 'end';
        // }else if(line_a.end.distanceTo(line_b.start) < test_dist){
        //     constraint.active = true;
        //     line_a.add_constraint(constraint);
        //     ep_a = 'end';
        // }else if(line_a.end.distanceTo(line_b.end) < test_dist){
        //     constraint.active = true;
        //     line_a.add_constraint(constraint);
        //     ep_a = 'end';
        //     ep_b = 'end';
        // }
    }

    return constraint;
}export{Endpoint_Constraint}