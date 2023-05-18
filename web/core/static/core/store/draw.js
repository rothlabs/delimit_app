
export const create_draw_slice = (set,get)=>({draw:{
    mode: null,
    point: (d, point)=>{
        d.make.point(d, point, -1); // must have insertion index. For now, using -1 for last
    },
}});

