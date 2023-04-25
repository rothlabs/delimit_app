import {createElement as r} from 'react';
import {Row, Col, Container} from 'boot';
import {History_Tool} from './history_tool.js';
import {File_Tool} from './file_tool.js';
import {Draw_Tool} from './draw_tool.js';
import {Pref_Tool} from './pref_tool.js';

const button_variant = 'outline-primary';

export function Toolbar(p){
    const tools = [History_Tool, Draw_Tool, Pref_Tool];
    return(
        r(Container, {fluid:true, className:'bg-light pt-2 pb-2'}, // pb:5,
            r(Row,{className:'row-cols-auto gap-2'},
                ...tools.map(tool => 
                    r(Col,{}, r(tool, {button_variant:button_variant, ...p})),
                )
            )
        )
    )
}