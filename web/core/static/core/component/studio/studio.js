import {createElement as c} from 'react';
import {Canvas} from '@react-three/fiber';
import {
    use_store, undo, redo, render_token, icons, draggable, pickable, get_snake_case, 
    render_badge, render_badge_token, 
    act_on_store_without_history,
    Mode_Menu, 
    Server_Mutations, Scene_Query,
    Make_Node, Make_Repo, Node_Editor, Term_Editor, Repo_Editor, Scene_Editor,
    Repo_Browser, Code_Editor, Viewport,
} from 'delimit';
import {useOutletContext} from 'react-router-dom';
import {animated, useTransition} from '@react-spring/web';

export function Studio(){
    const {render_header} = useOutletContext();
    //geometry.greet();
    return[
        render_header(() => 
            c('div', {className:'position-relative d-flex gap-5',},
                c('div', {className:'position-relative d-flex mt-1'}, 
                    render_mode_menu(),
                    c(Server_Mutations),
                    c(Scene_Query),
                ),
                c('div', {className:'position-absolute end-0 d-flex', style:{marginRight:200}},
                    render_history_buttons(),
                )
            ),
        ),
        c('div', {className:'position-absolute start-0 end-0 top-0 bottom-0'},
            c(Canvas_3D),
        ),
        c(Topic),
        c('div', {className:'z-1 position-absolute top-0 start-0 ms-1 mt-5 pt-2'},
            c('div', {className:'position-relative d-flex flex-column'}, 
                render_panel_menu(),
            ),
        ),
        c('div', {id:'panel', className:'z-1 position-absolute top-0 start-0 mt-5 ms-5 ps-3 pt-1'}, // 90vh put scroll bar crap here ?! #1
            c(Panel),
        ),
        c('div', {className:'z-1 position-absolute bottom-0 start-0 d-flex flex-column ms-1 mb-1'},
            render_leaf_menu(),
        ),
        c('div', {className:'z-1 position-absolute start-0 bottom-0 ms-5 mb-1 ps-1'},
            c(Term_Name_Editor),
        ),
        c('div', {className: 'z-1 position-absolute top-0 end-0 me-1 mt-5 pt-3'},
            c(Node_Action_Menu),
        ),
        c('div', {className: 'z-1 position-absolute top-0 end-0 me-1 mt-5 pt-3'}, //c('div', {className: 'z-1 position-absolute bottom-0 end-0 mb-1 me-1'},
            c(Repo_Action_Menu),
        ),
        c('div', {className: 'z-1 position-absolute top-0 end-0 me-1 mt-5 pt-3'},
            c(Version_Action_Menu),
        ),
        c('div', {className:'z-1 position-absolute start-50 bottom-0 translate-middle-x mb-1'},
            c(Targeted_Version),
        ),
    ]
}

function Term_Name_Editor(){
    const {root, term} = use_store(d=> d.get.picked_context(d));
    const content = ({render_name, render_input}) => [
        render_badge({node:root}),
        render_name({}),
        render_input({
            value: term,
            store_action: (d,e) => d.set_term(d, {root, term, new_term:get_snake_case(e.target.value)}),
        }),
    ];
    if(!root || !term) return;
    return render_token({name:'Term', content, style:{borderRight:'thick solid var(--bs-secondary)'}});
}

function Targeted_Version(){
    const version = use_store(d=> d.get.targeted.version(d));
    const repo = use_store(d=> d.get.version.repo(d, version));
    if(!version) return;
    return render_token({
        icon: 'bi-fullscreen-exit',
        name: 'Target',
        ...pickable({version, mode:'secondary'}),
        content: ({render_token_badge}) => [
            render_token_badge(),
            render_badge({repo}),
            render_badge({version}),
        ],
        store_setter: d => {
            d.studio.panel.mode = 'repo_editor';
            d.inspect.open(d, {path:repo});
        },
    });
}

function Action_Menu({open, group, items}){
    const transition = useTransition(open, {
        from:  {x:'125%'}, 
        enter: {x:'0%'},    
        leave: {x:'125%'}, 
    });
    return transition((style, item) => item && c(animated.div, {
        style: {...style, borderRight:'thick solid var(--bs-secondary)'},
    }, 
        c(Secondary_Picked_Nodes),
        items.map(item => 
            c('div', {className:'d-flex justify-content-end'},
                render_token({...item, group, hide_secondary_pick:true})
            )
        )),
    )
} 

function Node_Action_Menu(){
    const prm_nodes = use_store(d=> [...d.picked.primary.node]);
    const nodes = use_store(d=> [...d.picked.secondary.node]);
    const scene_sources = use_store(d=> d.scene.get_sources(d));
    return c(Action_Menu, {open:(nodes.length > 0), group:'node_action_menu', items:[
        //root && term && {name:'Term', content:render_term_content},
        nodes.some(x => !scene_sources.includes(x)) &&
            {name:'Add to Scene', icon:'bi-camera-reels', store_action:d=> d.scene.make_sources(d, {nodes})},
        nodes.some(x =>  scene_sources.includes(x)) &&
            {name:'Remove from Scene', icon:'bi-camera-video-off', store_action:d=> d.scene.drop_sources(d, {nodes})},
        prm_nodes.length==1 && !nodes.includes(prm_nodes[0])  &&
            {name:'Replace', icon:'bi-repeat', store_action:d=> d.replace.node(d, {nodes, source:prm_nodes[0]})},
        {name:'Copy', icon:'bi-file-earmark', store_action:d=> d.copy.node(d, {nodes})},
        {name:'Copy', icon:'bi-file-earmark-fill', store_action:d=> d.copy.node(d, {nodes, deep:true})},
        {name:'Roots', icon:'bi-arrow-left-circle', store_setter:d=> d.pick_back(d, {nodes})},
        {name:'Delete', icon:'bi-trash2', store_action:d=> d.drop.node(d, {nodes})},
        {name:'Deep Delete', icon:'bi-trash2-fill', store_action:d=> d.drop.node(d, {nodes, deep:true})},
    ]})
}

function Secondary_Picked_Nodes(){
    const nodes = use_store(d=> [...d.picked.secondary.node]);
    if(!nodes.length) return;
    if(nodes.length == 1){
        const node = nodes[0];
        return [//c('div', {},
            render_token({
                content: render_badge({node}), 
                ...pickable({node}),
            }),
            c(Nodes_Version, {nodes}),
        ]
    }
    return [//c('div', {},
        c(render_badge_token, {
            icon: 'bi-collection',
            name: 'Multiple nodes',
        }),
        c(Nodes_Version, {nodes}),
    ]
}

function Nodes_Version({nodes}){
    const versions = use_store(d=> nodes.map(node=> d.get.node.version(d, node)));
    const repo = use_store(d=> d.get.version.repo(d, versions[0]));
    if(!nodes.length) return;
    if(versions.some(v => v != versions[0])) return render_badge_token({
        icon: 'bi-collection',
        name: 'Multiple versions',
    });
    const version = versions[0];
    return render_token({
        content:[render_badge({repo}), render_badge({version})], 
        ...pickable({version}),
    });
}

function Repo_Action_Menu(){
    const repo = use_store(d=> d.picked.secondary.repo.keys().next().value);
    const name = use_store(d=> d.get.repo.name(d, repo));
    const version = use_store(d=> d.get.repo.main_version(d, repo));
    return c(Action_Menu, {open:(repo != null), group:'repo_action_menu', items:[
        {name, content:render_badge({repo}), store_setter:d=> d.pick(d, {version})},
        {name:'Close',   icon:'bi-x-lg', store_action:d=> d.close.repo(d, {repo})},
        {name:'Delete',  icon:'bi-trash2', store_setter:d=> d.confirm = {
            title: `Delete: ${name}`,
            body: `All data will be irreversibly destroyed in ${name} (repository). Proceed with caution.`,
            func:()=> act_on_store_without_history(d=> d.drop.repo(d, {repo})),
        }},
    ]})
}

function Version_Action_Menu(){
    const version = use_store(d=> d.picked.secondary.version.keys().next().value);
    const name = use_store(d=> d.get.version.name(d, version));
    const repo = use_store(d=> d.get.version.repo(d, version));
    const repo_name = use_store(d=> d.get.repo.name(d, repo));
    //const targeted = use_store(d=> d.get.targeted.version(d));
    return c(Action_Menu, {open:(version != null), group:'version_action_menu', items:[
        {name, content:[render_badge({repo}), render_badge({version})], ...pickable({version, mode:'primary'})},
        //(version != targeted) && {name:'Target', icon:'bi-fullscreen-exit', store_setter:d=> d.pick(d, {version})},
        {name:'Commit', icon:'bi-bookmark', store_setter:d=> d.server.commit_version({variables:{id:version}})},
        {name:'Close', icon:'bi-x-lg', store_action:d=> d.close.version(d, {version})},
        {name:'Delete', icon:'bi-trash2', store_setter:d=> d.confirm = {
            title: `Delete: ${name}`,
            body: `All data will be irreversibly destroyed in ${name} (version) of ${repo_name} (repository). Proceed with caution.`,
            func:()=> act_on_store_without_history(d=> d.drop.version(d, {version})),
        }},
    ]})
}

export function render_mode_menu(){
    return c(Mode_Menu, {
        group: 'studio_mode',
        items:[
            {mode:'repo',  icon:'bi-journal-bookmark'}, 
            {mode:'graph', icon:'bi-diagram-3'},
            {mode:'scene', icon:'bi-pencil-square'}, 
            {mode:'code',  icon:'bi-braces'},
        ], 
        width: 110, 
        state: d => d.studio.mode,
        store_setter: (d, mode) => d.studio.set_mode(d, mode), // d.studio.mode = mode,
    })
}

function render_history_buttons(){
    return c('div', {className:'d-flex'}, [
        {name:'Undo', onClick:()=>undo(), icon:'bi-arrow-left'},
        {name:'Redo', onClick:()=>redo(), icon:'bi-arrow-right'},
    ].map(item => render_token({group:'history', ...item})))
}

export function render_panel_menu(){
    return c(Mode_Menu, {
        group: 'panel_mode',
        items:[
            {mode:'node_editor',  icon:'bi-box'}, 
            {mode:'make',         icon:'bi-plus-square'},
            {mode:'schema',       icon:'bi-ui-checks'},
            {mode:'scene_editor', icon:'bi-camera-reels'},
            {mode:'repo_editor',  icon:'bi-journal-bookmark'},
            {mode:'display',      icon:'bi-eye'}, 
        ], 
        state: d => d.studio.panel.mode,
        store_setter: (d, mode) => d.studio.panel.mode = mode,
    });
}

export function render_leaf_menu(){
    return [
        {name:'Decimal', stem:{type:'decimal', value:0}},
        {name:'Integer', stem:{type:'integer', value:0}},
        {name:'String',  stem:{type:'string',  value:'New'}},
        {name:'Boolean', stem:{type:'boolean', value:true}},
    ].map(({name, stem}) => render_token({
        group:'new_leaf', name,
        icon: icons.css.cls[stem.type],
        ...draggable({stem}),
    }))
}

function Panel(){ 
    const studio_mode = use_store(d=> d.studio.mode);
    const mode = use_store(d=> d.studio.panel.mode);
    if(mode == 'make'){
        if(studio_mode == 'repo') return c(Make_Repo);
        return c(Make_Node);
    }
    if(mode == 'node_editor')  return c(Node_Editor);
    if(mode == 'schema')       return c(Term_Editor);
    if(mode == 'repo_editor')  return c(Repo_Editor);
    if(mode == 'scene_editor') return c(Scene_Editor);
}

export function Topic(){
    const studio_mode = use_store(d=> d.studio.mode);
    if(studio_mode == 'code'){
        return c('div', {className: 'position-absolute end-0 bottom-0'},
            c(Code_Editor),
        )
    }else if(studio_mode == 'repo'){
        return c('div', {className:'position-absolute start-0 end-0 top-0 bottom-0 overflow-y-auto'},
            c('div', {className:'position-absolute top-0 start-50 translate-middle-x my-4 py-5'},
                c(Repo_Browser),
            )
        )
    }
}

function Canvas_3D(){
    const cursor = use_store(d=> d.studio.cursor);
    return c(Canvas,{
        className: cursor,// + ' bg-primary-subtle', 
        orthographic: true, 
        camera: {near:.01, far:10000}, //gl: {antialias: false},
        dpr: Math.max(window.devicePixelRatio, 2), //[2, 2], 
        frameloop: 'demand',
    }, 
        c(Viewport),
    )
}