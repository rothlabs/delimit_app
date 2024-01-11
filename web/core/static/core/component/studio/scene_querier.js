import {createElement as c} from 'react';
import {animated, useTransition} from '@react-spring/web';
import {
    use_store, set_store, render_badge_token,
} from 'delimit';

export function Scene_Querier(){
    console.log('Scene_Querier');
    const {loading, error} = use_store(d => d.graph_app.get_scenes(d));
    let open = true;
    let icon = 'bi-check-lg';
    let name = 'Done';
    if(loading){
        icon = 'bi-hourglass-split';
        name = 'Get Scenes';
    }else if(error){
        icon = 'bi-exclamation-triangle';
        name = `Error: ${error}`.substring(0, 64);
    }else{
        open = false;
    }
    const transition = useTransition(open, {
        from:{opacity:0}, enter:{opacity:1}, leave:{opacity:0}, 
        config:{tension:300, friction:10, mass:0.05},
    });
    return transition((style, item) => 
        item && c(animated.div, {style}, 
            render_badge_token({icon, name}),
    ))
}

// const {loading, error} = use_store(d => 
//     d.graph_app.get_scenes(d, {
//         // on_complete(data){
//         //     console.log(data);
//         //     set_store(d=> d.scene.update_from_graph_app(d, data));
//         // }
//     })
// );