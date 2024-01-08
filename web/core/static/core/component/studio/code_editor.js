import {createElement as c, useEffect, useState} from 'react';
import Editor, {useMonaco} from '@monaco-editor/react';
import {use_store, act_on_store} from 'delimit';

const default_code = '// Secondary pick a node containing Type->Code->Source. Alternatively, pick the Type or Code directly.';

export function Code_Editor(){
    const [editor, set_editor] = useState();
    let root = use_store(d=> d.picked.secondary.node.keys().next().value);
    let value = use_store(d=> d.value(d, root, ['source', 'code source', 'type code source'], default_code));
    const language = use_store(d=> d.value(d, root, ['language', 'code language', 'type code language'], 'javascript'));
    const theme_mode = use_store(d=> d.theme.mode);
    const color = use_store(d=> d.color.body_bg);
    const monaco = useMonaco();
    useEffect(() => {
        if(!monaco) return;
        monaco.editor.defineTheme('delimit', {
            base: theme_mode=='light' ? 'vs' : 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': theme_mode=='light' ? '#ffffff' : color,
            },
        }); 
        monaco.editor.setTheme('delimit');
        
    }, [monaco, theme_mode]);
    useEffect(() => {
        return () => {
            act_on_store(d=> {
                if(!editor) return;
                value = editor.getValue();
                if(d.value(d, root, 'source')) d.set_leaf(d, {root, term:'source', value});
                if(d.value(d, root, 'code source')) {
                    root = d.stem(d, root, 'code');
                    d.set_leaf(d, {root, term:'source', value});
                }
                if(d.value(d, root, 'type code source')) {
                    root = d.stem(d, root, 'type code');
                    d.set_leaf(d, {root, term:'source', value});
                }
            });
        }
    }, [root, value]);
    const onMount = editor => {
        set_editor(editor);
        const panel = document.getElementById('panel');
        const resize = () => {
            const width = window.innerWidth - panel.offsetWidth - 50;
            editor.layout({width, height:window.innerHeight-55});
        }
        new ResizeObserver(resize).observe(panel);
        window.onresize = resize;
    }
    return c(Editor, {
        onMount,
        //onChange: new_value =>  value = new_value, // should set store or use editor instance ?!?!
        value, 
        language, 
        theme: 'delimit',
        options: {minimap: { enabled: false }},
    });
}

//import Editor from 'react-simple-code-editor';

// function get_width_height(){
//     const element = document.getElementById('code_editor_container');
//     console.log(element.offsetWidth);
//     return {width:element.offsetWidth, height:element.offsetHeight};
// }
//  // const onMount = editor => {
//     //     //set_editor(editor);
//     //     // new ResizeObserver(()=>{
//     //     //     console.log('fired!!!');
//     //     //     editor.layout(get_width_height());
//     //     // }).observe(document.getElementById('code_editor_container'))
//     //     window.addEventListener('resize', ()=> editor.layout(get_width_height()));
//     //     //document.getElementById('code_editor_container').addEventListener('resize', ()=> editor.layout(get_width_height));
//     // }



    // // useEffect(() => {
    // //     return ()=>{
    // //         window.removeEventListener("resize", editor.layout);
    // //     }
    // // }, []);
    // const onMount = editor => {
    //     window.addEventListener("resize", editor.layout);
    //     // window.onresize = () => {
    //     //     editor.layout();
    //     // };
    // }





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

// act_on_store(d=>{
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