
import os, time, requests, json
from terminusdb_client import Client
from terminusdb_client import WOQLQuery as wq

os.system('nc -4 -vz localhost 3636') # connect to terminus socket
client = Client('http://localhost:6363/')
for i in range(0, 20):
    print('Connecting terminus.')
    try:
        client.connect(team='admin', password='root', db='delimit')
        break
    except:
        print('Failed to connect terminus.')
        time.sleep(.25)


client.insert_document([
    {"@base":"iri:///delimit/", "@schema":"iri:///delimit#", "@type":"@context"},

    {"@id":"Node",  "@type":"Class", "@abstract":[]},
    {"@id":"Admin", "@type":"Class", "@abstract":[], "@inherits":"Node"},
    {"@id":"Asset", "@type":"Class", "@abstract":[], "@inherits":"Node"},

    {"@id":"Open_Pack", "@type":"Class", 
        "node": {"@class":"Node", "@type":"Set"},
    },
    {"@id":"Poll_Pack", "@type":"Class", 
        "node": {"@class":"Node", "@type":"Set"},
    },
    {"@id":"Drop_Pack", "@type":"Class", 
        "node": {"@class":"Node", "@type":"Set"},
    },

    {"@id":"User", "@type":"Class", 
        "@inherits": "Admin",
        "@metadata":{"css":{"icon":"bi-person"}},
        "name":  "String",
        "asset": {"@class":"Asset", "@type":"Set"},
        "view":  {"@class":"Asset", "@type":"Set"},
        "open_pack": "Open_Pack",
        "poll_Pack": "Poll_Pack",
        "drop_Pack": "Drop_Pack",
    },
    {"@id":"Public", "@type":"Class", 
        "@inherits": "Admin",
        "@metadata":{"css":{"icon":"bi-globe-americas"}}, 
        "view":  {"@class":"Asset", "@type":"Set"},
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
        "@metadata":{"css":{"icon":"bi-arrows-move"}},
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
        "@metadata":{"default":{"x":0, "y":0, "z":0}, "css":{"icon":"bi-record-circle"}},
        "x": {"@class":"Decimal", "@type":"Optional"},
        "y": {"@class":"Decimal", "@type":"Optional"},
        "z": {"@class":"Decimal", "@type":"Optional"},
    },
    {"@id":"Curve", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"css":{"icon":"bi-bezier2"}},
        "part":   {"@class":"Part", "@type":"List"},
        "mix":    {"@class":"Part", "@type":"Set"}, 
        "radius": {"@class":"Decimal", "@type":"Optional"},
    },
    {"@id":"Surface", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"css":{"icon":"bi-map"}}, 
        "part":  {"@class":"Part", "@type":"List"},
        "guide": {"@class":"Part", "@type":"Set"},
    },
    {"@id":"Machine", "@type":"Class", 
        "@inherits": "Part",
        "@metadata":{"css":{"icon":"bi-device-ssd"}},
        "origin": {"@class":"Vector", "@type":"Optional"},
    },
], graph_type='schema', full_replace=True)


# client.delete_document([
#     {'@id':'Public/rrWz1g6OwImRQQaz'},
#     {'@id':'Decimal/nwzVKESEwB_oJz8K'},
#     {'@id':'Decimal/SMnA6ntU098-f_z3'},
#     {'@id':'Decimal/0BLuabSS0kPoDLHI'},
# ], graph_type='instance')

# client.update_document([
#     {'@type':'Decimal', '@capture': 'd1',
#         'value': 1.11,
#     },
#     {'@type':'Decimal', '@capture': 'd2',
#         'value': 2.22,
#     },
#     {'@type':'Decimal', '@capture': 'd3',
#         'value': 3.33,
#     },
#     {'@type':'Vector', 
#         '@capture': 'v1',
#         'x': {"@ref": 'd1'},
#         'y': {"@ref": 'd2'},
#         'z': {"@ref": 'd3'},
#     },
#     {'@type':'Public', 
#         'view': [
#             {"@ref": 'd1'}, {"@ref": 'd2'}, {"@ref": 'd3'}, 
#             {"@ref": 'v1'}
#         ],
#     },
# ], graph_type='instance')


# exclude_id = ['Open_Pack', 'Drop_Pack']
# data = client.get_all_documents(graph_type='schema', as_list=True)[1:]
# data = filter(lambda n: n['@id'] not in exclude_id, data)
# print('test data')
# print(list(data))

print('Schema:')
print('\n'.join(map(str, client.get_all_documents(graph_type='schema', as_list=True))))

print('Instance: ')
result = client.get_all_documents(graph_type='instance')
print('\n'.join(map(str, result)))

print('WOQL: ')
query = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
    wq().triple('v:public', 'rdf:type', '@schema:Public'),
    wq().triple('v:public', '@schema:view', 'v:root'),
    wq().triple('v:root', 'v:tag', 'v:stem'),
)
result = query.execute(client)
print(list(result['bindings']))



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