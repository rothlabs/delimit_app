auth_required_message = 'Sign-in required'

template_code = '''
export function compute({app, id, stem, patch}){ 
    // node behavior 
    return {inner, outer}; 
}   
'''


icons = {
    'box': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
    </svg>''',
    'braces': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-braces" viewBox="0 0 16 16">
        <path d="M2.114 8.063V7.9c1.005-.102 1.497-.615 1.497-1.6V4.503c0-1.094.39-1.538 1.354-1.538h.273V2h-.376C3.25 2 2.49 2.759 2.49 4.352v1.524c0 1.094-.376 1.456-1.49 1.456v1.299c1.114 0 1.49.362 1.49 1.456v1.524c0 1.593.759 2.352 2.372 2.352h.376v-.964h-.273c-.964 0-1.354-.444-1.354-1.538V9.663c0-.984-.492-1.497-1.497-1.6zM13.886 7.9v.163c-1.005.103-1.497.616-1.497 1.6v1.798c0 1.094-.39 1.538-1.354 1.538h-.273v.964h.376c1.613 0 2.372-.759 2.372-2.352v-1.524c0-1.094.376-1.456 1.49-1.456V7.332c-1.114 0-1.49-.362-1.49-1.456V4.352C13.51 2.759 12.75 2 11.138 2h-.376v.964h.273c.964 0 1.354.444 1.354 1.538V6.3c0 .984.492 1.497 1.497 1.6z"/>
    </svg>''',
    'c_square': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-c-square" viewBox="0 0 16 16">
        <path d="M8.146 4.992c-1.212 0-1.927.92-1.927 2.502v1.06c0 1.571.703 2.462 1.927 2.462.979 0 1.641-.586 1.729-1.418h1.295v.093c-.1 1.448-1.354 2.467-3.03 2.467-2.091 0-3.269-1.336-3.269-3.603V7.482c0-2.261 1.201-3.638 3.27-3.638 1.681 0 2.935 1.054 3.029 2.572v.088H9.875c-.088-.879-.768-1.512-1.729-1.512Z"/>
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2Zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2Z"/>
    </svg>''',
    'diagram': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-3" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"/>
    </svg>''',
}

core_classes = [
    'Core', 'Node', 'Admin', 'Asset', 'User',
    'Leaf', 'Language',
]

core_schema = [
    {"@base":"iri:///delimit/", "@schema":"iri:///delimit#", "@type":"@context"},

    {"@id":"Core", "@type":"Class", "@abstract":[],
        "@metadata":{
            "icon":{
                "all": icons,
                "stem":{
                    "code": "braces",
                    "icon": "braces",
                    "stem": "diagram",
                    "class": "c_square",
                },
            },
        },
    },

    {"@id":"Node", "@type":"Class", "@abstract":[], 
        "drop": "xsd:boolean", 
    },

    {"@id":"Boolean", "@type":"Class", "@inherits":"Node", "value":"xsd:boolean"},
    {"@id":"Integer", "@type":"Class", "@inherits":"Node", "value":"xsd:integer"},
    {"@id":"Decimal", "@type":"Class", "@inherits":"Node", "value":"xsd:decimal"},
    {"@id":"String",  "@type":"Class", "@inherits":"Node", "value":"xsd:string" },

    {"@id":"Part", "@type":"Class", "@abstract":[], 
        "@inherits": "Node",
        "name": {"@class":"String", "@type":"Optional"},
    },
    {"@id":"Class", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"c_square", "default":{"name":""}},
        "code":     {"@class":"Code", "@type":"Optional"},
        "stem":     {"@class":"Stem", "@type":"List"},
        "icon":     {"@class":"Code", "@type":"Optional"},
    },
    {"@id":"Stem", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"diagram", "enum":{"leaf":"Leaf"}, "default":{"name":""}},
        "class":        {"@class":"Class",   "@type":"Optional"},
        "leaf":         {"@class":"String",  "@type":"Optional"},
        "default":      {"@class":"String",  "@type":"Optional"},
        "max_length":   {"@class":"Decimal", "@type":"Optional"},
        "icon":         {"@class":"Code",    "@type":"Optional"},
    },
    {"@id":"Code", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"braces", "default":{"name":"", "code":template_code, "language":"JavaScript"}, "enum":{"language":"Language"}},
        "code":     {"@class":"String", "@type":"Optional"},
        "language": {"@class":"String", "@type":"Optional"},
    },

    {"@id":"Language", "@type":"Enum",
        "@value":[
            "JavaScript", 
            "SVG",
        ],
    },
    {"@id":"Leaf", "@type":"Enum",
        "@value":[
            "Booleam",
            "Integer",
            "Decimal",
            "String",
        ],
    },
]