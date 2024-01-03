import {createElement as c, useEffect, useState} from 'react';
//import Editor from 'react-simple-code-editor';
import Editor from '@monaco-editor/react';
import {use_store, act_store} from 'delimit';

//const default_code = '// Select a Code node';


export function Code(){
    const node = use_store(d=> d.picked.primary.node.keys().next().value);
    let code = use_store(d=> d.value(d, node, 'source', '// Select a Code node'))
    useEffect(() => {
        return () => {
            act_store(d=> {
                if(!d.value(d, node, 'source')) return;//if(!d.node.get(node).terms.get('code')[0].value) return;
                d.set_leaf(d, node, 'source', 0, code);
            });
        }
    }, []);
    return c(Editor, {
        height: '100%', //height: '100vh', 
        defaultLanguage: 'javascript', 
        defaultValue: code,
        onChange: new_code=>{
            code = new_code;
        },
    });
}

            // setTimeout(()=>{

            // }, 4000);
            // set_store(d=>{
            //     d.mutate.leaf(d, root, term, index, code)
            //     d.graph.set(d, n, {code});
            // });

    // let code = use_store(d=> {
    //     try{
    //         const code_string = d.node.get(node).terms.get('code')[0].value;
    //         return code_string ?? default_code;
    //     }catch{}
    //     return default_code;
    // });

// c('div', {
//     classname:'',
// },
// )

// act_store(d=>{
//     const coerced = d.mutate.leaf(d, root, term, index, e.target.value);
//     if(coerced != null) set_input_value(coerced); 
// });




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