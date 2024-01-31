import {createElement as c, useState} from 'react';
import {render_token, render_badge_token} from 'delimit';

const minWidth = 45;

export function Make_Repo(){
    const [name, set_name] = useState('');
    const [story, set_story] = useState('');
    const [makeMeta, set_makeMeta] = useState(false);
    return[
        render_token({
            name: 'Name',
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    maxLength: 64, 
                    value: name, 
                    placeholder: 'Required', 
                    onChange: e => set_name(e.target.value),
                }),
            ],
        }),
        render_token({
            name: 'Story',
            height: 128,
            content: ({render_name, render_input}) => [
                render_name({minWidth}),
                render_input({
                    value: story, 
                    placeholder: 'Optional', 
                    onChange: e => set_story(e.target.value),
                }),
            ],
        }),
        render_token({
            name: 'Make Meta',
            content: ({render_name, render_switch}) => [
                render_name({minWidth}),
                render_switch({
                    checked: makeMeta, 
                    onChange: e => set_makeMeta(e.target.checked),
                })
            ],
        }),
        render_badge_token({
            icon: 'bi-journal-bookmark',
            name: 'Make Repo',
            store_setter(d){ 
                const args = {variables:{name, story}};
                if(makeMeta) d.server.make_meta_repo(args);
                else d.server.make_repo(args);
                d.studio.panel.show = false;
            },
        }),
    ]
}