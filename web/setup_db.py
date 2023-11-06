
import os, time, requests, json
#from dataclasses import dataclass #from typing import NamedTuple # https://stackoverflow.com/questions/35988/c-like-structures-in-python
from terminusdb_client import Client
from terminusdb_client import WOQLQuery as wq
from delimit.settings import GRAPH

os.system('nc -4 -vz '+GRAPH['host']+' '+GRAPH['socket_port']) # trigger terminusdb.socket
graph = Client('http://'+GRAPH['host']+':'+GRAPH['port']+'/')
for i in range(0, 20):
    print('Connecting terminus.')
    try:
        graph.connect(team=GRAPH['user'], password=GRAPH['password'], db=GRAPH['database'])
        break
    except:
        print('Failed to connect terminus.')
        time.sleep(.25)

icon = {
    'box': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
    </svg>''',
    'person': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-person" viewBox="0 0 16 16">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
    </svg>''',
    'arrows_move': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrows-move" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z"/>
    </svg>''',
    'circle_dot': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-record-circle" viewBox="0 0 16 16">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
        <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
    </svg>''',
    'bezier': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bezier2" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5h4.134a1 1 0 1 1 0 1h-2.01c.18.18.34.381.484.605.638.992.892 2.354.892 3.895 0 1.993.257 3.092.713 3.7.356.476.895.721 1.787.784A1.5 1.5 0 0 1 12.5 11h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5H6.866a1 1 0 1 1 0-1h1.711a2.839 2.839 0 0 1-.165-.2C7.743 11.407 7.5 10.007 7.5 8c0-1.46-.246-2.597-.733-3.355-.39-.605-.952-1-1.767-1.112A1.5 1.5 0 0 1 3.5 5h-1A1.5 1.5 0 0 1 1 3.5v-1zM2.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm10 10a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"/>
    </svg>''',
    'map': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-map" viewBox="0 0 16 16">
        <path fill-rule="evenodd" d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z"/>
    </svg>''',
    'machine': '''<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-device-ssd" viewBox="0 0 16 16">
        <path d="M4.75 4a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h6.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75h-6.5ZM5 8V5h6v3H5Zm0-5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 0a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0ZM4.5 11a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Zm7 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z"/>
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2Zm11 12V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1v-2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 0 1-1Zm-7.25 1v-2H5v2h.75Zm1.75 0v-2h-.75v2h.75Zm1.75 0v-2H8.5v2h.75ZM11 13h-.75v2H11v-2Z"/>
    </svg>''',
}

graph.insert_document([
    {"@base":"iri:///delimit/", "@schema":"iri:///delimit#", "@type":"@context"},

    {"@id":"Node",  "@type":"Class", "@abstract":[],
        "@metadata":{
            "icon":{
                "all": icon,
                "stem":{
                    "asset": "box",
                    "move": "arrows_move", 
                },
            }
        },
    },

    {"@id":"Admin", "@type":"Class", "@abstract":[], 
        "@inherits":"Node",
    },
    {"@id":"Asset", "@type":"Class", "@abstract":[], 
        "@inherits": "Node",
        "drop": "xsd:boolean", 
    },

    {"@id":"Open_Pack", "@type":"Class", 
        "user": "User",
        "node": {"@class":"Node", "@type":"Set"},
    },
    {"@id":"Poll_Pack", "@type":"Class", 
        "user": "User",
        "node": {"@class":"Node", "@type":"Set"},
    },

    {"@id":"User", "@type":"Class", 
        "@inherits": "Admin",
        "@metadata":{"icon":"person"},
        "user":  "xsd:string",
        "name":  {"@class":"String", "@type":"Optional"},
        "asset": {"@class":"Asset", "@type":"Set"},
    },

    {"@id":"Boolean", "@type":"Class", "@inherits":"Asset", "value":"xsd:boolean"},
    {"@id":"Integer", "@type":"Class", "@inherits":"Asset", "value":"xsd:integer"},
    {"@id":"Decimal", "@type":"Class", "@inherits":"Asset", "value":"xsd:decimal"},
    {"@id":"String",  "@type":"Class", "@inherits":"Asset", "value":"xsd:string" },

    {"@id":"Part", "@type":"Class", "@abstract":[], 
        "@inherits": "Asset",
        "@metadata":{"default":{"name":""}},
        "name": {"@class":"String", "@type":"Optional"},
    },

    {"@id":"Case", "@type":"Class", 
        "@inherits": "Part", 
        "@metadata":{"icon":"arrows_move"},
        "part": {"@class":"Part",    "@type":"Optional"},
        "case": {"@class":"Case",    "@type":"Optional"},
        "move": {"@class":"Vector",  "@type":"Optional"},
        "turn": {"@class":"Vector",  "@type":"Optional"},
        "axis": {"@class":"Vector",  "@type":"Optional"},
        "up":   {"@class":"Vector",  "@type":"Optional"},
        "spin": {"@class":"Decimal", "@type":"Optional"},
    },
    {"@id":"Vector", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"circle_dot", "default":{"x":0, "y":0, "z":0}},
        "x": {"@class":"Decimal", "@type":"Optional"},
        "y": {"@class":"Decimal", "@type":"Optional"},
        "z": {"@class":"Decimal", "@type":"Optional"},
    },
    {"@id":"Curve", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"bezier"},
        "part":   {"@class":"Part", "@type":"List"},
        "mix":    {"@class":"Part", "@type":"Set"}, 
        "radius": {"@class":"Decimal", "@type":"Optional"},
    },
    {"@id":"Surface", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"map"}, 
        "part":  {"@class":"Part", "@type":"List"},
        "guide": {"@class":"Part", "@type":"Set"},
    },
    {"@id":"Machine", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"icon":"machine"}, 
        "origin": {"@class":"Vector", "@type":"Optional"},
    },
], graph_type='schema', full_replace=True)


print('Schema:')
schema = json.loads(requests.get('http://admin:root@localhost:6363/api/schema/admin/delimit').text)
print('\n'.join([k+': '+str(schema[k]) for k in schema]))

print('Instance: ')
result = graph.get_all_documents(graph_type='instance')
print('\n'.join(map(str, result)))



    # {"@id":"Public", "@type":"Class", 
    #     "@inherits": "Admin",
    #     "@metadata":{"css":{"icon":"bi-globe-americas"}}, 
    #     "view":  {"@class":"Asset", "@type":"Set"},
    # },

# print('WOQL: ')
# query = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
#     wq().triple('v:public', 'rdf:type', '@schema:Public'),
#     wq().triple('v:public', '@schema:view', 'v:root'),
#     wq().triple('v:root', 'v:tag', 'v:stem'),
# )
# result = query.execute(client)
# print(list(result['bindings']))



# os.system('nc -4 -vz localhost 3636') # connect to terminus socket
# client = Client('http://localhost:6363/')
# for i in range(0, 20):
#     print('Connecting terminus.')
#     try:
#         client.connect(team='admin', password='root', db='delimit')
#         break
#     except:
#         print('Failed to connect terminus.')
#         time.sleep(.25)

#GRAPH = settings.GRAPH



# client.update_document([
#     {'@type':'Decimal', 
#         '@capture': 'id1',
#         'value': 1.11,
#     },
#     {'@type':'Decimal', 
#         '@capture': 'id2',
#         'value': 2.22,
#     },
#     {'@type':'Decimal', 
#         '@capture': 'id3',
#         'value': 3.33,
#     },
#     {'@type':'Public', 
#         'view': [{"@ref": 'id1'}, {"@ref": 'id2'}, {"@ref": 'id3'}],
#     },
# ], graph_type='instance')

#results = client.query_document({'@type':'Car', 'name':'juice'}) #_document
#myString = wq().string('sammy')
#query = wq().triple('v:named_node', '@schema:name', myString)
# query = wq().insert_document({
#     "@type": "Triple", "object": {"@type": "Value", "data": {"@type": "xsd:decimal", "@value": 1.23}}, "predicate": {"@type": "NodeValue", "node": "@schema:value"}, "subject": {"@type": "NodeValue", "Node": "@type:Decimal"}
# }, 'v:newId') # Decimal/qpwdngitcfkeldaz
#print(query.to_json())
#result = query.execute(client)
#print('Get: ')
#print(list(result['bindings']))


#"arc":      {"@class":"Bool", "@type":"Optional"},
        #"radius_x": {"@class":"Decimal", "@type":"Optional"},
        #"radius_y": {"@class":"Decimal", "@type":"Optional"},
        #"angle_a":  {"@class":"Decimal", "@type":"Optional"},
        #"angle_b":  {"@class":"Decimal", "@type":"Optional"},

# {"@id":"Case", "@type":"Class", 
    #     "@inherits": "Part",
    #     "part":  {"@class":"Part",  "@type":"Optional"},
    #     "frame": {"@class":"Frame", "@type":"Optional"},
    # },

# {"@id":"Curve", "@type":"Class", 
#         "@inherits": "Part",
#         "part": {"@class":"Part", "@type":"List"},
#         "mix":  {"@class":"Part", "@type":"List"}, 
#     },


#"iri:///testdb/Dog/JlcK9EP0jW-id60P"

    # {'@type':'Cat', 
    #     'name': 'Sammy',
    #     '@capture': 'Id_Sammy',
    #     'friend': {"@ref": 'Id_Buster'}
    # },
    # {'@type':'Dog', 
    #     'name': 'Buster',
    #     '@capture': 'Id_Buster',
    #     'friend': {'@ref': 'Id_Sammy'}
    # },




# import os, time, requests
# from terminusdb_client import Client, WOQLClient #, GraphType
# from terminusdb_client import WOQLQuery as wq

# # os.system('nc -4 -vz localhost 3636') # connect to terminus socket
# client = Client('http://localhost:6363/')
# for i in range(0, 20):
#     print('Connecting terminus.')
#     try:
#         client.connect(team='admin', password='root')
#         break
#     except:
#         print('Failed to connect terminus.')
#         time.sleep(.25)
# client.connect(db='testdb')

# wc = WOQLClient("http://localhost:6363/")
# wc.connect(db="testdb")





# client.delete_document([
#     {'@id':'curve/3uW3-MIG53jLfQXy'}, 
# ], graph_type='instance')

# client.insert_document([
#     #{'@type':'curve', 'part':['car/dZOsnLgE_8IFMXaM', 'point/FTuvWcJujLfPahcq']},
#     #{'@type':'curve', '@id':'curve/z4xAymCribLBfl2q', 'part':['car/dZOsnLgE_8IFMXaM', 'point/FTuvWcJujLfPahcq']}, #, 
#     #{'@type':'curve', 'part':[], 'mix':[]}, #, 'part':['point/FTuvWcJujLfPahcq']
#     #{'@type':'point', 'x':'decimal/2IUZsrWcHo4Md44D', 'y':'decimal/9ge4fv9lHHxkeWfO', 'z':'decimal/z3LqR3mN9B9epzKJ'},
#     {'@type':'point', 'x':'car/dZOsnLgE_8IFMXaM', 'y':'decimal/2IUZsrWcHo4Md44D', 'z':'car/dZOsnLgE_8IFMXaM'},
# ])# , graph_type='instance'


# client.update_document([
#     {'@type':'decimal', 'value':1.11},
#     {'@type':'decimal', 'value':2.22},
#     {'@type':'decimal', 'value':3.33},
# ], graph_type='instance')


# schema = requests.get('http://admin:root@localhost:6363/api/schema/admin/delimit').text 
# print(schema)



# results = client.get_document('')
# print(results)

print('done')



        # 'move_x': {'@class':'decimal', '@type':'Optional'},
        # 'move_y': {'@class':'decimal', '@type':'Optional'},
        # 'move_z': {'@class':'decimal', '@type':'Optional'},
        # 'turn_x': {'@class':'decimal', '@type':'Optional'},
        # 'turn_y': {'@class':'decimal', '@type':'Optional'},
        # 'turn_z': {'@class':'decimal', '@type':'Optional'},



    # {"@id":"boolean", "@type":"Class", "v":"xsd:boolean"},
    # {"@id":"integer", "@type":"Class", "v":"xsd:integer"},
    # {"@id":"decimal", "@type":"Class", "v":"xsd:decimal"},
    # {"@id":"text",    "@type":"Class", "v":"xsd:string" },

    # {"@id":"vector", "@type":"Class", 
    #     "name": {"@class":"text",   "@type":"Optional"},
    #     "x": "decimal",
    #     "y": "decimal",
    #     "z": "decimal",
    # },

    # {"@id":"geometry", "@type":"Class", "@abstract":[],  
    #     "name": {"@class":"text",   "@type":"Optional"},
    #     "move": {"@class":"vector", "@type":"Optional"},
    #     "turn": {"@class":"vector", "@type":"Optional"},
    # },
    # {"@id":"point", "@type":"Class", "@inherits":["geometry", "vector"]},
    # {"@id":"curve", "@type":"Class", "@inherits":"geometry",  
    #     "geometry": {"@class":"geometry", "@type":"List"},
    #     "mix":      {"@class":"curve",    "@type":"List"}, 
    # },




#import requests
#print(requests.get('http://localhost:3636'))

# import requests_unixsocket
# session = requests_unixsocket.Session()
# print(session.get('http+unix://%2Frun%2Fterminusdb.sock/'))

# import socket
# def check_db_socket(address, port):
#     s = socket.socket(socket.AF_INET, socket.SOCK_STREAM, socket.SO_REUSEADDR)
#     s.settimeout(1)
#     try:
#         s.connect((address, port))
#         return "Connected to %s on port %s" % (address, port)
#     except socket.error as error:
#         return "Connection to %s on port %s failed: %s" % (address, port, error)
#     finally:
#         s.close()

# print(check_db_socket('172.0.0.1', 3636))



# schema = {'@type' : 'Class', '@id' : 'Person', 'name' : 'xsd:string'}
# results = client.insert_document(schema, graph_type="schema")

# document = {'@type' : 'Person', 'name' : 'Jim'}
# results = client.insert_document(document)


# dbid="delimit"
# label="delimit"
# description="Delimit Database"
# prefixes = {'@base' : 'iri:///delimit/',
#             '@schema' : 'iri:///delimit#'}
# team="admin"
# client.create_database(
#     dbid,
#     team,
#     label=label,
#     description=description,
#     prefixes=prefixes)

# dbid="testdb"
# label="testdb"
# description="Test Database"
# prefixes = {'@base' : 'iri:///testdb/',
#             '@schema' : 'iri:///testdb#'}
# team="admin"
# client.create_database(
#     dbid,
#     team,
#     label=label,
#     description=description,
#     prefixes=prefixes)