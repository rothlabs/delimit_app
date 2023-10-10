import {current} from 'immer';
import {Vector3, Vector4, Matrix4, MathUtils, LineCurve3, CurvePath} from 'three';

////////////////////////////////  Machine Data //////////////////////
// Home is -1000 for X and Z 
// Home is 0 for Y
// For tool +Z at center top of rod: X:-835, Y:-5, Z:-672, A:-58, B:0
// Y-AXis:
    // -462 tool clears holder (tool)
    // -504 lined up with holder
// A-Axis:
    // 0 is limit switch 
    // -90 carriage can pass tools while moving Y
    // -105 bar can pass tools while moving Y IF TOOLS LEANING BACK
    // -108 is almost connecting to tool
    // -113 bar is in down position (connected to tool)
/////////////////////////////////////////////////////////////////////

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v4 = new Vector3();
const v5 = new Vector3();
const ref = new Vector4();
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
const forward = new Vector3(0, 0, 1);
const back    = new Vector3(0, 0,-1);
const down    = new Vector3(0,-1, 0);

const ribbon_div = 2;
const normal_smooth_span = 8; // mm
//const ribbon_div = 2;

// machine space, absolute:
//const origin_x   = -835;   
//const origin_y   = -15; // -5 is okay     
//const origin_z   = -672; 
//const a_pz = -58;
//const origin_a = -148; // point y

// model space, relative:
//const z_start = -40; 
const pulloff = 25; // along surface normal

const cmd = {
    idle:        '00000', // 0
    air_off_t1:  '10000', // 1
    heat_off_t2: '01000', // 2
    heat_off_t3: '11000', // 3
    heat_off_t4: '00100', // 4
    air_on_t1:   '10100', // 5
    heat_on_t2:  '01100', // 6
    heat_on_t3:  '11100', // 7
    heat_on_t4:  '00010', // 8
    flow_t1a:    '10010', // 9,  H2O
    flow_t1b:    '01010', // 10, PVA
    flow_t1c:    '11010', // 11, PU
    step_t2:     '00110', // 12, PLA
    step_t3:     '10110', // 13, TPU coarse
    step_t4:     '01110', // 14, TPU fine
    laser_t5:    '11110', // 15
    fiber_off_t5:'00001', // 16
    fiber_on_t5: '10001', // 17
    close_cap:   '01001', // 18
    open_cap:    '11001', // 19
    open_mixer:  '00101', // 20
    //open_plug:   '101010', // 21
    //close_plug:  '011010', // 22
};

const cmd_names = {};
Object.keys(cmd).forEach(key=>{
    cmd_names[cmd[key]] = key;
});

const modal = ['idle', 'flow_t1a', 'flow_t1b', 'flow_t1c', 'step_t2', 'step_t3', 'step_t4', 'laser_t5'];//['idle', 'step_t2', 'step_t3', 'step_t4', 'laser_t5']; 
const cmd_dwell = 0.02; // was 0.01
const approx_rapid_interval = cmd_dwell;
const preheat_interval = 165;
const cord_radius_transition = 0.4;
const max_direct_dist = 4;
const max_direct_dist_air = 10;
const tool_offset_a = 35;
//const max_brush_dist = 80;
//const flow_off_interval = 0.75;

// const state = {
//     air: false,
//     heat_t1: false,
//     heat_t2: false,
//     heat_t3: false,
//     heat_t4: false,
// };

const machine_z_y_ratio = 0.9;
const pva_offset_z = 14; // 20

const n = {}
n.source = ['machine', 'slice']; 
n.reckon = (d, s, c) => {            
    const mach = s.machine[0].c;//d.n[d.n[n].n.machine[0]].c;
    const tools = [null,
        {x:mach.holder_x1, offset_x:mach.offset_x1},
        {x:mach.holder_x2, offset_x:mach.offset_x2},
        {x:mach.holder_x3, offset_x:mach.offset_x3},
        {x:mach.holder_x4, offset_x:mach.offset_x4},
        {x:mach.holder_x5, offset_x:mach.offset_x5}
    ];
    const code = ['(Delimit Slicer)', 'G21 G90 G93', 'G92 B0', 'M5 S0', ''];//g21=mm, g90=absolute, g93=inverse-time-feed, g92=reset-axis
    const cmd_slots = [{i:code.length, time:0}]; // rename to cmd_slots? #1
    const cmds = [];
    const heat_cmds = [];
    var model_offset_y = null;
    var time = 0;
    var cmd_time = 0;
    var tool = 0; // no tool
    var axis_a = 0; 
    var axis_b = 0; // need to set to start of path 
    var mode = 'idle';
    var material = 'none';
    var mach_y = mach.holder_y;
    var mach_a = 0;
    var tool_aim_z = mach.origin_a + tool_offset_a - 90;
    //var tool_aim_y = mach.origin_a + tool_offset_a;
    //var brush_dist = 0;
    var paths = [];
    s.slice.forEach(slice => {
        if(slice.p) paths = paths.concat(slice.p.paths);
    });

    function move(a={}){
        //console.log(cmds);
        var cl = '';
        if(a.p){a.x=a.p.x; a.y=a.p.y; a.z=a.p.z}
        ref.set(0, 0, 0, 0);
        if(a.ref == 'product'){
            if(a.x != undefined){
                a.x += tools[tool].offset_x;
                if(material == 'AIR') a.x += 50;
            }
            if(a.y != undefined)  a.y += model_offset_y;
            if(a.z != undefined){
                a.z  = -a.z;
                //if(material == 'AIR') a.z -= 20;
                if(material == 'PVA') a.z += (a.y * machine_z_y_ratio) + pva_offset_z;
            }
            if(a.a != undefined)  a.a  = MathUtils.radToDeg(-a.a) + tool_offset_a;//mach.offset_a;
            if(a.b != undefined)  a.b  = MathUtils.radToDeg(-a.b);
        }
        if(a.ref == 'product' || a.ref == 'origin'){
            ref.set(mach.origin_x, mach.origin_y, mach.origin_z, mach.origin_a);
        }
        if(material == 'PVA'){
            a.x = undefined;
            a.y = undefined;
            a.a = undefined;
        }
        if(a.x != undefined) cl += ' X'+d.rnd(ref.x+a.x, 1000);
        if(a.y != undefined){
            mach_y = d.rnd(ref.y+a.y, 1000);
            cl += ' Y'+mach_y;
        }
        if(a.z != undefined) cl += ' Z'+d.rnd(ref.z+a.z, 1000);
        if(a.a != undefined){
            mach_a = d.rnd(ref.w+a.a, 1000);
            if(mach_y > -120 && mach_a < tool_aim_z){
                var diff = tool_aim_z - mach_a;
                mach_a = tool_aim_z - (diff*(-mach_y/280));
            }
            if(mach_y > -100 && mach_a > tool_aim_z+45){
                mach_a = tool_aim_z+45;
                //var diff = tool_aim_z - mach_a;
                //mach_a = tool_aim_z - (diff*(-mach_y/200));
            }
            cl += ' A'+mach_a;
        }
        if(a.b != undefined) cl += ' B'+d.rnd(      a.b, 1000);
        if(time - cmd_time > cmd_dwell){
            //if(cmds.length > 0) code.push(...write_cmd(cmds.shift()))
            //else cmd_slots.push({i:code.length, time:time});
            cmd_slots.push({i:code.length, time:time});
            //prev_cmd_time = time;
        }
        if(a.speed && a.dist){
            cl = 'G1' + cl + ' F'+d.rnd((a.speed / a.dist) * 60, 1000);
            time += a.dist / a.speed;
        }else{
            cl = 'G0' + cl;
            if(!a.no_time) time += approx_rapid_interval;
        }
        code.push(cl);
        if(a.back_to_g1){
            code.push('G1 Z'+d.rnd(ref.z+a.z, 1000)+' F1000');
        }
    }
    function pick_tool(id){
        if(tool == id) return;
        code.push('(Tool '+id+')');
        move({y:-300, z:-900});
        if(tool > 0){
            move({x:tools[tool].x, a:mach.origin_a+12}); // was 8 // position above holder
            move({y:mach.holder_y+60});
            move({y:mach.holder_y+40, a:mach.origin_a}); // move just above holder
            move({y:mach.holder_y}); // move into holder 
        }
        move({a:35, ref:'origin'}); // was 23 // rotate back to CARRIAGE CLEARANCE  (degree)
        if(id > 0){
            move({x:tools[id].x, y:mach.holder_y}); 
            move({a:0, ref:'origin'});  // rotate forward to grip tool
            move({y:mach.holder_y+40}); // pull tool up out of holder
            move({y:mach.holder_y+60, a:mach.origin_a+12}); // rotate back to X-RAIL CLEARANCE
        }
        move({y:-300});//move({y:mach.holder_y+150}); // move to clearance height
        tool = id;
        code.push('');
    }
    function write_cmd(id, aa={}){ // put same material check here? #1
        if(modal.includes(cmd_names[id])){
            if(mode == cmd_names[id]) return [];
            mode = cmd_names[id];
        }
        let bits = id.split('').map(v=> parseInt(v));
        var bc = [];
        if(!aa.no_white_space) bc.push('');
        bc.push('(Cmd '+(bits[0]+bits[1]*2+bits[2]*4+bits[3]*8+bits[4]*16)+', '+cmd_names[id]+')'); //+bits[5]*32
        if(!aa.no_dwell) bc.push('G4 P'+cmd_dwell);
        bc.push('M9'); // turn off M7 (mist) and M8 (flood)
        if(bits[0]){ bc.push('M64 P0') }else{ bc.push('M65 P0') } // Aux0
        if(bits[1]){ bc.push('M64 P1') }else{ bc.push('M65 P1') } // Aux1
        if(bits[2]){ bc.push('M64 P2') }else{ bc.push('M65 P2') } // Aux2
        if(bits[3])  bc.push('M7'); // Mist 
        if(bits[4])  bc.push('M8'); // Flood
        //if(bits[5]){ bc.push('M4') }else{ bc.push('M3') }; // spindle dir
        if(!aa.no_dwell) {
            bc.push('G4 P'+cmd_dwell);
            time += cmd_dwell*2;
        }
        if(!aa.no_white_space) bc.push('');
        cmd_time = time;
        return bc;
    }
    function dwell(interval){
        code.push('G4 P'+interval);//code.push('S1000', 'G4 P'+interval);
        time += interval;
        cmd_time = time;
    }
    function start_pva(){
        if(material == 'PVA') return;
        code.push('', '(Start PVA)');
        move({z:-900, back_to_g1:true});
        code.push(...write_cmd(cmd.open_cap, {no_white_space:true}));
        code.push(...write_cmd(cmd.flow_t1b, {no_white_space:true}));
        code.push('M3 S1000');
        dwell(8);
        code.push('');
        material = 'PVA';
    }
    function flush(a={}){
        code.push('', '(Flush)');
        move({z:-900, back_to_g1:true}); //move({x:-900, z:-900, a:mach.origin_a-90+tool_offset_a});
        code.push(...write_cmd(cmd.flow_t1a,  {no_white_space:true}));
        if(a.hard){
            code.push('M3 S1000'); 
            dwell(4);
        }
        //code.push('S1000'); // make this smaller when not hard flush!!!! #1
        //dwell(1);
        code.push(...write_cmd(cmd.close_cap, {no_white_space:true}));
        dwell(2);
        code.push('M3 S1000');
        dwell(.2);
        code.push('M5 S0');
        code.push('');
        material = 'H2O';
    }

    //function push_cmd(id){
    //    if(cmds.at(-1) != id) cmds.push(id);
    //}

    function push_heat_cmd(hc){
        if(heat_cmds.length > 0){
            if(heat_cmds.at(-1).cmd != hc.cmd){
                heat_cmds.push(hc);
                //code.push('', 'M66 P'+(tool-2)+' L3', '');
                //if(tool == 2) code.push('', 'M66 P0 L3', '');
                //if(tool == 3) code.push('', 'M66 P1 L3', '');
                //if(tool == 4) code.push('', 'M66 P2 L3', '');
            }
        }else{
            heat_cmds.push(hc);
            //code.push('', 'M66 P'+(tool-2)+' L3', '');
        }
    }

    

    var direct = -1;
    const curves = [];
    for(let pi = 0; pi < paths.length; pi++){ //paths.forEach((path, pi)=>{
        let path = paths[pi];
        var res = path.ribbon.length_v / ribbon_div; 
        if(res < 2) continue; // how should min points be decided? #1

        if(path.material == 'AIR' && material != 'AIR'){// && material != 'AIR'){
            pick_tool(1);
            code.push(...write_cmd(cmd.air_on_t1)); // push_cmd(cmd.air_on_t1);
        }else if(path.material == 'H2O'){// && material != 'H2O'){
            pick_tool(1);
            code.push(...write_cmd(cmd.flow_t1a)); // push_cmd(cmd.flow_t1a);
        }else if(path.material == 'PVA'){// && material != 'PVA'){
            pick_tool(1);
            start_pva();
            //code.push(...write_cmd(cmd.flow_t1b)); // push_cmd(cmd.flow_t1b);
        }else if(path.material == 'PU'){// && material != 'PU'){
            pick_tool(1);
            code.push(...write_cmd(cmd.flow_t1c)); // push_cmd(cmd.flow_t1c);
        }else if(path.material == 'PLA'){// && material != 'PLA'){
            pick_tool(2);
            code.push(...write_cmd(cmd.step_t2)); // push_cmd(cmd.step_t2);
            push_heat_cmd({time:time, cmd:cmd.heat_on_t2});
            //code.push('', 'M66 P0 L3', ''); // Hotend ready?
        }else if(path.material == 'TPU'){// && path.cord_radius >= cord_radius_transition){
            pick_tool(3);
            code.push(...write_cmd(cmd.step_t3)); // push_cmd(cmd.step_t3);
            push_heat_cmd({time:time, cmd:cmd.heat_on_t3});
            //code.push('', 'M66 P1 L3', ''); // Hotend ready?
        }
        // else if(path.material == 'TPU' && path.cord_radius < cord_radius_transition){
        //     pick_tool(4);
        //     code.push(...write_cmd(cmd.step_t4)); // push_cmd(cmd.step_t4);
        //     push_heat_cmd({time:time, cmd:cmd.heat_on_t4});
        //     //code.push('', 'M66 P2 L3', ''); // Hotend ready?
        // }
        material = path.material;

        var curve = new CurvePath();
        curve.arcLengthDivisions = 2000;
        curves.push(curve);
        var pts = [];
        var nml = [];
        var dis = [0];
        var n_ref = [];

        //var length = path.ribbon.length_v; //path.curve.getLength(); 
        //total_length += length;
        // Collect point, normal, distance, and normal reference:
        /////////var res = path.ribbon.length_v / ribbon_div; 
        for(let v=0; v<res; v++){
            pts.push(new Vector3());
            nml.push(new Vector3());
            path.ribbon.get_point(0, v/res, pts.at(-1));
            path.ribbon.get_point(1, v/res, nml.at(-1));
            nml.at(-1).sub(pts.at(-1));
            n_ref.push(nml.at(-1).clone());
            if(pts.length > 1){
                curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
                dis.push(pts.at(-2).distanceTo(pts.at(-1)));
            }
        }

        // Smooth normals over travel:
        var pt_span = curve.getLength() / pts.length;
        var range = Math.round(normal_smooth_span / pt_span / 2) + 1; // remove +1? #2
        for(let i=0; i<nml.length; i++){ 
            var vc = 1;
            var rng = range;
            if(rng > i) rng = i;
            if(rng > nml.length-1-i) rng = nml.length-1-i;
            for(let k=-rng; k<=rng; k++){ 
                if(k != 0 && n_ref[i+k]){
                    nml[i].add(n_ref[i+k]);
                    vc++;
                }
            }
            nml[i].divideScalar(vc);      
        }

        if(model_offset_y == null) model_offset_y = -pts[0].y - 80; // 95

        function rotate_point_normal(i, b){
            m1.makeRotationY(b); // Vector3.applyAxisAngle #2
            pts[i].applyMatrix4(m1);
            nml[i].applyMatrix4(m1);
        }

        // Write tool paths  to gcode:
        code.push('(Path '+path.name+', '+pi+')');
        rotate_point_normal(0, axis_b);
        for(let i=0; i<pts.length; i++){ 
            if(material == 'PVA'){
                v1.copy(pts[i]).sub(v2.set(0, pts[i].y, 0)); // for aligning point on YZ plane
            }else{
                v1.set(nml[i].x, 0, nml[i].z); // for pointing normal forward
                //v3.set(0, nml[i].y, nml[i].z); //v1.set(normal.x, 0, normal.z);//
                //axis_a = down.angleTo(v3) * Math.sign(nml[i].z);
            }
            var shift_b = forward.angleTo(v1) * Math.sign(-nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
            rotate_point_normal(i, shift_b);
            axis_b += shift_b;  
            
            v3.set(0, nml[i].y, nml[i].z); //v1.set(normal.x, 0, normal.z);//
            axis_a = down.angleTo(v3) * Math.sign(nml[i].z); // might need -nml[i].z!!!!!!! #1


                            
            // if(material == 'PVA'){
            //     if(i == 0){
            //         move({p:pts[i], b:axis_b, ref:'product'});
            //     }else{
            //         move({p:pts[i], b:axis_b, speed:path.speed, dist:dis[i], ref:'product'});
            //     }
            // }else{
                if(i == 0){
                    if(direct < 0){
                        v2.copy(pts[i]).add(v3.copy(nml[i]).multiplyScalar(pulloff));
                        move({p:v2, a:axis_a, b:axis_b, ref:'product', no_time:true});
                        if(material != 'AIR' && material != 'PVA') code.push('M3');//, 'G4 P0.08'); // open plug
                        move({p:pts[i], ref:'product', no_time:true});
                        if(material != 'AIR' && material != 'PVA'){
                            //code.push('M4');
                            code.push('S'+Math.round(path.flow * path.speed * 10)); // S1000 = 100mm/s 
                            //code.push('G4 P0.05');
                        }
                    }else{
                        move({p:pts[i], a:axis_a, b:axis_b, speed:path.speed, dist:direct, ref:'product', no_time:true});
                        direct = -1;
                    }
                }else{
                    move({p:pts[i], a:axis_a, b:axis_b, speed:path.speed, dist:dis[i], ref:'product'});
                }
                // if(i == pts.length-4){ // path should have exact distance for exact time built into it on end
                //     if(pi < paths.length-1){
                //         if(paths[pi].material == paths[pi+1].material){
                //             paths[pi  ].ribbon.get_point(0, 1, v1);
                //             paths[pi+1].ribbon.get_point(0, 0, v2);
                //             let dist = v1.distanceTo(v2);
                //             if(dist < max_direct_dist || ((material=='AIR' || material=='PVA') && dist < max_direct_dist_air)){
                //                 direct = dist;
                //                 console.log('direct move!!!');
                //             }
                //         }
                //     }
                //     if(direct < 0 && material != 'AIR' && material != 'PVA'){
                //         code.push('M5 S0'); //code.push('M5'); // close plug
                //     }
                // }
                if(i == pts.length-1){
                    if(pi < paths.length-1){
                        if(paths[pi].material == paths[pi+1].material){
                            paths[pi  ].ribbon.get_point(0, 1, v1);
                            paths[pi+1].ribbon.get_point(0, 0, v2);
                            let dist = v1.distanceTo(v2);
                            if(dist < max_direct_dist || ((material=='AIR' || material=='PVA') && dist < max_direct_dist_air)){
                                direct = dist;
                                console.log('direct move!!!');
                            }
                        }
                    }
                    if(direct < 0){
                        if(material != 'AIR' && material != 'PVA') code.push('M5 S0');
                        v2.copy(pts[i]).add(v3.copy(nml[i]).multiplyScalar(pulloff));
                        move({p:v2, ref:'product', no_time:true});
                    }
                }
            //}

            if(i < pts.length-1) rotate_point_normal(i+1, axis_b);
            // code += 'G1 X'+d.rnd(origin_x+pts[i].x, 1000) + ' Y'+d.rnd(origin_y-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(origin_z-pts[i].z, 1000);
            // code += ' A'+d.rnd(angle_a, 1000); 
            // code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
            // code += ' F'+d.rnd(path.speed/dis[i]*60, 1000); 
            // code += '\r\n';
        }

        // code += 'S0\r\n';
        // ribbon.get_point(0, 1, v1); // start point
        // ribbon.get_point(1, 1, v2); v2.sub(v1); // start normal
        // v3.copy(v1).add(v4.copy(v2).multiplyScalar(pulloff));
        // move('G0', v3);
        // paths.push({ribbon:ribbon, speed:path.speed, flow:path.flow});

        if(pi < paths.length-1){
            if(material == 'AIR' && paths[pi+1].material != 'AIR'){
                code.push(...write_cmd(cmd.air_off_t1)); // push_cmd(cmd.air_off_t1);
            }else if(material == 'PVA' && paths[pi+1].material != 'PVA'){
                flush();
            }else if(material == 'PLA' && paths[pi+1].material != 'PLA'){
                code.push(...write_cmd(cmd.heat_off_t2)); // push_cmd(cmd.heat_off_t2);
            }else if((material == 'TPU' && paths[pi+1].material != 'TPU')){// && path.cord_radius >= cord_radius_transition) && !(paths[pi+1].material == 'TPU' && paths[pi+1].cord_radius >= cord_radius_transition)){
                code.push(...write_cmd(cmd.heat_off_t3)); // push_cmd(cmd.heat_off_t3);
            }
            // else if((material == 'TPU' && path.cord_radius < cord_radius_transition) && !(paths[pi+1].material == 'TPU' && paths[pi+1].cord_radius < cord_radius_transition)){
            //     code.push(...write_cmd(cmd.heat_off_t4)); // push_cmd(cmd.heat_off_t4);
            // }
        }else{
            if(material == 'PVA'){
                flush();
            }
        }
        code.push('');
    };//);


    for(let i = heat_cmds.length-1; i >= 0; i--){
        for(let k = cmd_slots.length-2; k >= 0; k--){
            if((heat_cmds[i].time - cmd_slots[k].time > preheat_interval && ['G0','G1'].includes(code[k].slice(0,2))) || k == 0){
                code.splice(cmd_slots[k].i, 0, ...write_cmd(heat_cmds[i].cmd, {no_dwell:true}));
                break;
            }
            // if(k == 0){
            //     code.splice(cmd_slots[k].i, 0, [...write_cmd(heat_cmds[i].cmd), 'M66 P0 L3']); // wait for preheat
            // }
        }
    }

    code.push(...write_cmd(cmd.idle));
    pick_tool(0);

    //c.code = code.join('\r\n');
    //c.surface = ribbon;
    //ax.curve = curves;
    return{
        design: 'curve',
        curves: curves.map(curve=> d.part.curve(d, curve)),
        code:   code.join('\r\n'),
    };
};
export const post = n;







    // var paths = [];
    // function get_paths(nn){ // make this a general recursive func for getting all of some name #1
    //     const path_nodes = [];
    //     d.node.for_n(d, nn, (r,nnn)=>{
    //         if(d.n[nnn].c.paths != undefined){
    //             paths = paths.concat(d.n[nnn].c.paths);
    //             path_nodes.push(nnn);
    //         }
    //     });
    //     path_nodes.forEach(nnn=> get_paths(nnn));
    // }
    // get_paths(n);




// function pick_tool(id){
//     if(tool == id) return;
//     code.push('(Tool '+id+')');
//     if(tool > 0){
//         move({x:tools[tool].x, a:mach.origin_a+12}); // was 8 // position above holder
//         //move({y:mach.holder_y+60});
//         move({y:mach.holder_y+40}); // move just above holder
//         move({a:0, ref:'origin'});
//         move({y:mach.holder_y}); // move into holder 
//     }
//     move({a:27, ref:'origin'}); // was 23 // rotate back to CARRIAGE CLEARANCE  (degree)
//     if(id > 0){
//         move({x:tools[id].x, y:mach.holder_y}); 
//         move({a:0, ref:'origin'});  // rotate forward to grip tool
//         move({y: mach.holder_y+40}); // pull tool up out of holder
//         move({a:12, ref:'origin'}); // rotate back to X-RAIL CLEARANCE
//     }
//     move({y:mach.holder_y+150}); // move to clearance height
//     tool = id;
//     code.push('');
// }



// if(material == 'PVA'){
//     brush_dist += dis[i];
//     if(brush_dist > max_brush_dist){
//         load_brush({p:pts[i], a:axis_a, b:axis_b});
//         brush_dist = 0;
//     }
// }else{
//     brush_dist = 0;
// }



            //var total_length = 0;
            //const paths = [];
            //v1.set(nml[0].x, 0, nml[0].z);
            //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
            //var axis_a = -58; // tool points Z+
            //var pos = new Vector3();
            // code += 'G1 Z'+(origin_z-pts[0].z)+' F30 \r\n \r\n';



// code.push('G4 P0.02');
// push_cmd(cmd.idle);
// code.push('G4 P0.02');
// push_cmd(cmd.air_off_t1);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_off_t2);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_off_t3);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_off_t4);
// code.push('G4 P0.02');
// push_cmd(cmd.air_on_t1);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_on_t2);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_on_t3);
// code.push('G4 P0.02');
// push_cmd(cmd.heat_on_t4);
// code.push('G4 P0.02');
// push_cmd(cmd.flow_t1a);
// code.push('G4 P0.02');
// push_cmd(cmd.flow_t1b);
// code.push('G4 P0.02');
// push_cmd(cmd.flow_t1c);
// code.push('G4 P0.02');
// push_cmd(cmd.step_t2);
// code.push('G4 P0.02');
// push_cmd(cmd.step_t3);
// code.push('G4 P0.02');
// push_cmd(cmd.step_t4);
// code.push('G4 P0.02');
// push_cmd(cmd.laser_t5);
// code.push('G4 P0.02');
// push_cmd(cmd.fiber_off_t5);
// code.push('G4 P0.02');
// push_cmd(cmd.fiber_on_t5);
// c.code = code.join('\r\n');
// return





// function heat(id){
//     code.push('(Heat Tool: '+id+')');
//     code.push('M9'); // turn off M7 and M8
//     if(id==1) code.push('M64 P0', 'M65 P1', 'M65 P2', 'M65 P3'); // PVA 
//     if(id==2) code.push('M65 P0', 'M64 P1', 'M65 P2', 'M65 P3'); // PLA
//     if(id==3) code.push('M64 P0', 'M64 P1', 'M65 P2', 'M65 P3'); // TPU
//     if(id==4) code.push('M64 P0', 'M64 P1', 'M65 P2', 'M65 P3'); // TPU
//     //code.push('G4 P0.02'); // delay 20ms so other controller can read
// }
// function flow(id){
//     code.push('(Flow '+id+')');
//     if(id==1.1) code.push('M65 P0', 'M65 P1', 'M64 P2', 'M65 P3'); // H2O 
//     if(id==1.2) code.push('M64 P0', 'M65 P1', 'M64 P2', 'M65 P3'); // PVA 
//     if(id==1.3) code.push('M65 P0', 'M64 P1', 'M64 P2', 'M65 P3'); // PU
//     if(id==2)   code.push('M64 P0', 'M64 P1', 'M64 P2', 'M65 P3'); // PLA
//     if(id==3)   code.push('M65 P0', 'M65 P1', 'M65 P2', 'M64 P3'); // TPU
// }
// function plug(id){
//     code.push('(Plug '+id+')');
//     if(id==2) code.push('M64 P0', 'M65 P1', 'M65 P2', 'M64 P3'); // PLA 
//     if(id==3) code.push('M65 P0', 'M64 P1', 'M65 P2', 'M64 P3'); // TPU 
// }



// code += 'G0 X'+mach.origin_x+' Y-300 A'+a_pz+' \r\n'; 
// code += 'G0 Z'+(mach.origin_z-z_start)+' \r\n'; //code += 'G0 Z'+(origin_z-pts[0].z-z_start)+' \r\n';
// code += 'G0 Y'+mach.origin_y+' \r\n';
// code += 'G4 P2 \r\n'; // wait 2 seconds for heat to come to temperature



// //             var angle_a = -58; 
//                 // //v1.set(nml[0].x, 0, nml[0].z);
//                 // //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
//                 // var angle_b = 0; // need to set to start of path 
//                 // var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
//                 // code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
//                 // code += 'G0 X'+origin_x+' Y-300 A'+angle_a+' \r\n';
//                 // code += 'G0 Z'+(origin_z-pts[0].z-z_start)+' \r\n';
//                 // code += 'G0 Y'+origin_y+' \r\n';
//                 // code += 'G1 Z'+(origin_z-pts[0].z)+' F30 \r\n \r\n';
//                 for(let i=0; i<pts.length; i++){ 
//                     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//                     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//                     m1.makeRotationY(shift_angle_b); 
//                     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//                     angle_b += shift_angle_b;
//                     if(i < pts.length-1){
//                         m1.makeRotationY(angle_b);
//                         pts[i+1].applyMatrix4(m1);
//                         nml[i+1].applyMatrix4(m1);
//                     }
//                     code += 'G1 X'+d.rnd(origin_x+pts[i].x, 1000) + ' Y'+d.rnd(origin_y-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(origin_z-pts[i].z, 1000);
//                     code += ' A'+d.rnd(angle_a, 1000); 
//                     code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
//                     code += ' F'+d.rnd(feed/dis[i]*60, 1000); 
//                     code += '\r\n';
//                 }




///////////////////////////////////// 5 axis ribbon style //////////////////////////
// function spread_angles(v){
//     v5.set(0, v.y, v.z); // can't calculate angle_a until normal has been rotated on B!!! #1
//     let angle_a = down.angleTo(v5) * Math.sign(v.z);
//     v5.set(v.x, 0, v.z);
//     let angle_b = back.angleTo(v5) * Math.sign(v.x);
//     return {a:angle_a, b:angle_b};
// }

// var n_ref = nml[0].clone();
// var pts_ribbon = [[],[],[]];
// var angle_b = 0;
// for(let i=0; i<pts.length; i++){ 
//     //v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//     //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//     let shift_angle_b = spread_angles(nml[i]).b;
//     m1.makeRotationY(shift_angle_b); 
//     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//     pts_ribbon[0].push(pts[i]);
//     pts_ribbon[1].push(pts[i].clone().add(v1.copy(n_ref).divideScalar(2)));
//     pts_ribbon[2].push(pts[i].clone().add(n_ref));
//     angle_b += shift_angle_b;
//     if(i < pts.length-1){
//         n_ref.copy(nml[i+1]);
//         m1.makeRotationY(angle_b);
//         pts[i+1].applyMatrix4(m1);
//         nml[i+1].applyMatrix4(m1);
//     }
// }

// var ribbon = d.geo.surface(d, pts_ribbon, {length_v:curve.getLength()});

// function move(gc, p, a={}){
//     pos.copy(p);
//     code += gc+' X'+d.rnd(origin_x+p.x, 1000)+' Y'+d.rnd(origin_y+offset_y+p.y, 1000)+' Z'+d.rnd(origin_z-p.z, 1000);
//     if(a.angles){
//         axis_b = a.angles.b;
//         code += ' A'+d.rnd(origin_a+MathUtils.radToDeg(a.angles.a), 1000);
//         code += ' B'+d.rnd(    MathUtils.radToDeg(-a.angles.b), 1000);
//     }
//     if(gc == 'G1') code += ' F'+d.rnd(a.speed, 1000);
//     code += ' \r\n';
// }

// var res = ribbon.length_v / ribbon_div; 
// for(let v=1; v<res; v++){ 
//     ribbon.get_point(0, v/res, v1); 
//     ribbon.get_point(1, v/res, v2); v2.sub(v1); 
//     var angles = spread_angles(v2);
//     var delta_b = angles.b-axis_b;
//     v3.copy(v1).sub(pos);
//     v3.setX(v3.x + (delta_b*((pos.z+v1.z)/2)));//(Math.sin(angles.b-axis_b)*((pos.z+v1.z)/2))); // math.abs(z)? #1
//     move('G1', v1, {
//         angles: angles, 
//         speed: (path.speed / v3.length()) * 60,
//     });
// }
/////////////////////////////// 5 axis ribbon style /////////////////////////////////////










// var paths = [];
// function get_paths(nn){
//     const path_nodes = [];
//     d.node.for_n(d, nn, (r,nnn)=>{
//         if(d.n[nnn].c.paths != undefined){
//             paths = paths.concat(d.n[nnn].c.paths);
//             path_nodes.push(nnn);
//         }
//     });
//     path_nodes.forEach(nnn=> get_paths(nnn));
// }
// get_paths(n);
// var curve = new CurvePath();
// curve.arcLengthDivisions = 2000;
// var pts = [];
// var nml = [];
// var n_ref = [];
// var dis = [0];
// //var 
// var total_length = 0;
// paths.forEach(path=>{
//     var length = path.curve.getLength();
//     total_length += length;
//     var res = length / ribbon_div; // path.surface.length_v / span;
//     for(let v=0; v<res; v++){
//         pts.push(new Vector3());
//         nml.push(new Vector3());
//         path.ribbon.get_point(0, v/res, pts.at(-1));
//         path.ribbon.get_point(1, v/res, nml.at(-1));
//         nml.at(-1).sub(pts.at(-1));
//         n_ref.push(nml.at(-1).clone());
//         if(pts.length > 1){
//             curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
//             dis.push(pts.at(-2).distanceTo(pts.at(-1)));
//         }
//     }
// });

// const pt_span = curve.getLength() / pts.length;
// const range = Math.round(normal_smooth_span / pt_span / 2) + 1; // +1 here ?!?!?!?!?!
// for(let i=0; i<nml.length; i++){ 
//     var vc = 1;
//     var rng = range;
//     if(rng > i) rng = i;
//     if(rng > nml.length-1-i) rng = nml.length-1-i;
//     for(let k=-rng; k<=rng; k++){ 
//         if(k != 0 && n_ref[i+k]){
//             nml[i].add(n_ref[i+k]);
//             vc++;
//         }
//     }
//     nml[i].divideScalar(vc);      
// }

// var n_ref = nml[0].clone();
// var pts_ribbon = [[],[],[]];
// var angle_b = 0;
// for(let i=0; i<pts.length; i++){ 
//     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
//     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
//     m1.makeRotationY(shift_angle_b); 
//     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
//     pts_ribbon[0].push(pts[i]);
//     pts_ribbon[1].push(pts[i].clone().add(v1.copy(n_ref).divideScalar(2)));
//     pts_ribbon[2].push(pts[i].clone().add(n_ref));
//     angle_b += shift_angle_b;
//     if(i < pts.length-1){
//         n_ref.copy(nml[i+1]);
//         m1.makeRotationY(angle_b);
//         pts[i+1].applyMatrix4(m1);
//         nml[i+1].applyMatrix4(m1);
//     }
// }

// const ribbon = d.geo.surface(d, pts_ribbon, {length_v:total_length});





            // var angle_a = -58; 
            // //v1.set(nml[0].x, 0, nml[0].z);
            // //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
            // var angle_b = 0; // need to set to start of path 
            // var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
            // code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
            // code += 'G0 X'+origin_x+' Y-300 A'+angle_a+' \r\n';
            // code += 'G0 Z'+(origin_z-pts[0].z-z_start)+' \r\n';
            // code += 'G0 Y'+origin_y+' \r\n';
            // code += 'G1 Z'+(origin_z-pts[0].z)+' F30 \r\n \r\n';
            // for(let i=0; i<pts.length; i++){ 
            //     v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
            //     let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
            //     m1.makeRotationY(shift_angle_b); 
            //     pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
            //     angle_b += shift_angle_b;
            //     if(i < pts.length-1){
            //         m1.makeRotationY(angle_b);
            //         pts[i+1].applyMatrix4(m1);
            //         nml[i+1].applyMatrix4(m1);
            //     }
            //     code += 'G1 X'+d.rnd(origin_x+pts[i].x, 1000) + ' Y'+d.rnd(origin_y-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(origin_z-pts[i].z, 1000);
            //     code += ' A'+d.rnd(angle_a, 1000); 
            //     code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
            //     code += ' F'+d.rnd(feed/dis[i]*60, 1000); 
            //     code += '\r\n';
            // }

















            // for(let i=0; i<nml.length; i++){ 
            //     var vc = 1;
            //     for(let k=-nml_smooth_range; k<=nml_smooth_range; k++){ 
            //         if(k != 0 && n_ref[i+k]){
            //             nml[i].add(n_ref[i+k]);
            //             vc++;
            //         }
            //     }
            //     nml[i].divideScalar(vc);      
            // }


//for(let i=nml_smooth_range; i<nml.length-nml_smooth_range; i++){ // not smoothing front and end !!!!!!
//nml[i].divideScalar(nml_smooth_range*2 + 1);

// path.forEach(np=>{
//     pts.push(pn.p.clone());
//     nml.push(pn.n.clone());
//     n_ref.push(pn.n.clone());
//     if(pts.length > 1){
//         curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
//         dis.push(pts.at(-2).distanceTo(pts.at(-1)));
//     }
// });

//if(dis[i] == 0) continue;


            // var curve = new CatmullRomCurve3(pts);
            // curve.arcLengthDivisions = 2000;
            // var nml_curve = new CatmullRomCurve3(nml);
            // nml_curve.arcLengthDivisions = 2000;
            // //pts = pts.map(p=> p.clone());

            // const pt_count = Math.round(curve.getLength()*code_res);
            // pts = curve.getSpacedPoints(pt_count);
            // // nml = nml_curve.getSpacedPoints(pt_count);
            // var nml = [];
            // var nml2 = [];
            // //var normal = new Vector3(0,0,-1);
            // var t = 0;
            // var step_t = 1/pts.length/100;
            // for(let i=0; i<pts.length; i++){ 
            //     var prev_dist = 10000;
            //     for(let k=0; k<100000; k++){ 
            //         t += step_t;
            //         var normal = nml_curve.getPoint(t);
            //         let dist = normal.distanceTo(pts[i]);
            //         if(dist > prev_dist){
            //             t -= step_t;
            //             nml_curve.getPoint(t, normal);
            //             break;
            //         }
            //         prev_dist = dist;
            //     }
            //     normal.sub(pts[i]);
            //     nml.push(normal);
            //     nml2.push(normal.clone());
            // }


                    // let step = Math.round(v1.distanceTo(pts[i]) / 1); // fill point every 1 mm
                    // if(step < 1) step = 1;
                    // for(let k=1; k<=step; k++){ 
                    //     let step_angle_b = shift_angle_b*(k/step);
                    //     m1.makeRotationY(step_angle_b); 
                    //     v2.copy(v1).applyMatrix4(m1);
                    //     //rpts.push(v2.clone());
                    //     gpts.push(v2.clone());
                    //     code += 'G1 X'+d.rnd(v2.x) + ' Y'+d.rnd(v2.y)+ ' Z'+d.rnd(v2.z);
                    //     code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(base_angle_b + step_angle_b));
                    //     code += ' F1000'; // mm per minute
                    //     code += '\r\n';
                    // }