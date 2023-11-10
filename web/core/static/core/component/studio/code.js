import {createElement as c, useState} from 'react';
//import Editor from 'react-simple-code-editor';
import Editor from '@monaco-editor/react';
import {ss, useS, gs} from '../../app.js';


export function Code(){
    const n = useS(d=> d.pick.n[0]);
    const d = gs();
    let code = '// Select a Code node to edit.';
    try{
        code = d.n[d.n[n].n.code[0]].v;
    }catch{}
    return(
        c(Editor, {
            height: '80vh', 
            defaultLanguage: 'javascript', 
            defaultValue: code,
            onChange: code=>{
                ss(d=>{
                    d.graph.set(d, n, {code});
                });
            },
        }) 
    );
}




// // import { highlight, languages } from 'prismjs/components/prism-core';
// // import 'prismjs/components/prism-clike';
// // import 'prismjs/components/prism-javascript';
// // import 'prismjs/themes/prism.css'; //Example style, you can use another

// // console.log('code module');
// // console.log(Editor);

// export function Code() {
//     const [code, setCode] = useState(
//         `function add(a, b) {\n  return a + b;\n}`
//     );
//     return (
//         //c('p', {}, 'craaaaaaaaaaaazy!')
//         c(Editor, {
//             value: code,
//             onValueChange: code => setCode(code),
//             //highlight: code => highlight(code, languages.js),
//             padding: 10,
//             // style: {
//             //     fontFamily: '"Fira code", "Fira Mono", monospace',
//             //     fontSize: 12
//             // }
//         })
//     );
// }