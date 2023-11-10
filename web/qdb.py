
import os, time, requests, json
from terminusdb_client import Client
from terminusdb_client import WOQLQuery as wq
from terminusdb_client.woqlquery import Doc 

os.system('nc -4 -vz localhost 3636') # connect to terminus socket
gdb = Client('http://localhost:6363/')
for i in range(0, 20):
    print('Connecting terminus.')
    try:
        gdb.connect(user='admin', password='root') # , db='delimit'
        break
    except:
        print('Failed to connect terminus.')
        time.sleep(.25)

print(gdb.get_databases())

gdb.set_db('delimit')

print('Schema: ')
result = gdb.get_all_documents(graph_type='schema')
#print('\n'.join(map(str,result)))
print('\n'.join(map(str, filter(lambda n: not (('@id' in n) and (n['@id'] in ['Node'])), result))))

# myString = wq().string('sammy')
# #query = wq().triple('v:named_node', '@schema:name', myString)
# query = wq().insert_document(Doc({"@type":"Vector", "x":"4"})) # Decimal/qpwdngitcfkeldaz
# print(query)#print(query.to_json())
# result = query.execute(graph)



# print('Get all roots and stems via any list.')
# query = wq().path('v:root', 'rdf:rest*,rdf:first', 'v:stem', 'v:hope')
# result = query.execute(graph)
# print(result)

#user = graph.get_document('User/7WogT0PW39UjmnTE')
# assets = []
# for asset in user['asset']:
#     print(asset)
#     if not '@id' in asset: assets.append(asset)
# user['asset'] = assets
# graph.update_document(user)



# graph.update_document([
#     {'@id': 'String/Ecu49XS2xeh3y0XC', '@type': 'String', 'value': 'Julian', 'drop':False},
#     {'@id': 'Vector/Fozw06RB8FpmR0Fa', '@type': 'Vector', 'x': 'Decimal/kpFzKeu3GStXYb5W', 'y': 'Decimal/ig4Gqy4FpqOw8PZr', 'z': 'Decimal/sSieDnnYLWI5ImKv', 'drop':False},
# ])


# graph.delete_document([
#     {'@id':'Public/L__y3Su-ZftsTH5p'},
#     {'@id':'Decimal/9p6uj0rbby71itx5'},
#     {'@id':'Decimal/p0nhj7s5fdk59d0z'},
#     {'@id':'Vector/no9rmuuxkxug6tkl'},
# ], graph_type='instance')

# result = graph.update_document([
#     {'@type':'Decimal', '@id': 'Decimal/kpFzKeu3GStXYb5W',
#         'value': 777,
#     },
#     {'@type':'Decimal', '@id': 'Decimal/fksmcnfjeitfopad',
#         'value': 888,
#     },
#     # {'@type':'Decimal', '@capture': 'd1',
#     #     'value': 1.11,
#     # },
#     # {'@type':'Decimal', '@capture': 'd2',
#     #     'value': 2.22,
#     # },
#     # {'@type':'Decimal', '@capture': 'd3',
#     #     'value': 3.33,
#     # },
#     # {'@type':'Vector', 
#     #     '@capture': 'v1',
#     #     'x': {"@ref": 'd1'},
#     #     'y': {"@ref": 'd2'},
#     #     'z': {"@ref": 'd3'},
#     # },
#     # {'@type':'User', '@id':'User/7WogT0PW39UjmnTE',
#     #     'user': '1',
#     #     'name': 'String/Ecu49XS2xeh3y0XC',
#     #     'asset': ['String/Ecu49XS2xeh3y0XC', 'Decimal/ig4Gqy4FpqOw8PZr', 'Decimal/kpFzKeu3GStXYb5W', 'Decimal/sSieDnnYLWI5ImKv', 'Vector/Fozw06RB8FpmR0Fa'],
#     # },
# ], graph_type='instance')
# print('update_document result:')
# print(result)


# triples = wq().woql_and(
#     wq().woql_or(
#         wq().triple('v:root', 'rdf:type', '@schema:Boolean'),
#         wq().triple('v:root', 'rdf:type', '@schema:Integer'),
#         wq().triple('v:root', 'rdf:type', '@schema:Decimal'),
#         wq().triple('v:root', 'rdf:type', '@schema:String'),
#         wq().triple('v:root', 'rdf:type', '@schema:Decimal'),
#         wq().triple('v:root', 'rdf:type', '@schema:Vector'),
#         wq().triple('v:root', 'rdf:type', '@schema:Case'),
#         wq().triple('v:root', 'rdf:type', '@schema:Machine'),
#     ),
#     wq().triple('v:root', '@schema:drop', wq().boolean(True)),
#     wq().triple('v:root', 'v:tag', 'v:stem'),
# ).execute(graph)['bindings']
# #print('\n'.join(map(str, triples)))
# nodes = [triple['root'] for triple in triples]
# graph.delete_document(nodes)



# print('Get Document: ')
# triples = wq().woql_and(
#     wq().triple('v:root', 'rdf:type', '@schema:User'),
#     wq().triple('v:root', '@schema:user', wq().string(1)),
# ).execute(graph)['bindings']
# user_node = graph.get_document(triples[0]['root'])
# print(user_node)

# print('WOQL: ')
# user_triples = wq().woql_and(
#     wq().triple('v:root', 'rdf:type', '@schema:User'),
#     wq().triple('v:root', '@schema:user', wq().string(1)),
# ).execute(graph)['bindings']
# user_node = graph.get_document(user_triples[0]['root'])
# user_node['asset'].extend(['crazy', 'horse'])         
# print(user_node)


# exclude_id = ['Open_Assets', 'Drop_Pack']
# data = graph.get_all_documents(graph_type='schema', as_list=True)[1:]
# data = filter(lambda n: n['@id'] not in exclude_id, data)
# print('test data')
# print(list(data))

# print('Schema:')
# schema = json.loads(requests.get('http://admin:root@localhost:6363/api/schema/admin/delimit').text)
# print(schema)
#print(graph.get_document('Machine', graph_type='schema'))
#print('\n'.join(map(str, graph.get_all_documents(graph_type='schema', as_list=True))))











# graph.update_document([
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

#results = graph.query_document({'@type':'Car', 'name':'juice'}) #_document
#myString = wq().string('sammy')
#query = wq().triple('v:named_node', '@schema:name', myString)
# query = wq().insert_document({
#     "@type": "Triple", "object": {"@type": "Value", "data": {"@type": "xsd:decimal", "@value": 1.23}}, "predicate": {"@type": "NodeValue", "node": "@schema:value"}, "subject": {"@type": "NodeValue", "Node": "@type:Decimal"}
# }, 'v:newId') # Decimal/qpwdngitcfkeldaz
#print(query.to_json())
#result = query.execute(graph)
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
# from terminusdb_client import graph, WOQLClient #, GraphType
# from terminusdb_client import WOQLQuery as wq

# # os.system('nc -4 -vz localhost 3636') # connect to terminus socket
# graph = graph('http://localhost:6363/')
# for i in range(0, 20):
#     print('Connecting terminus.')
#     try:
#         graph.connect(team='admin', password='root')
#         break
#     except:
#         print('Failed to connect terminus.')
#         time.sleep(.25)
# graph.connect(db='testdb')

# wc = WOQLClient("http://localhost:6363/")
# wc.connect(db="testdb")





# graph.delete_document([
#     {'@id':'curve/3uW3-MIG53jLfQXy'}, 
# ], graph_type='instance')

# graph.insert_document([
#     #{'@type':'curve', 'part':['car/dZOsnLgE_8IFMXaM', 'point/FTuvWcJujLfPahcq']},
#     #{'@type':'curve', '@id':'curve/z4xAymCribLBfl2q', 'part':['car/dZOsnLgE_8IFMXaM', 'point/FTuvWcJujLfPahcq']}, #, 
#     #{'@type':'curve', 'part':[], 'mix':[]}, #, 'part':['point/FTuvWcJujLfPahcq']
#     #{'@type':'point', 'x':'decimal/2IUZsrWcHo4Md44D', 'y':'decimal/9ge4fv9lHHxkeWfO', 'z':'decimal/z3LqR3mN9B9epzKJ'},
#     {'@type':'point', 'x':'car/dZOsnLgE_8IFMXaM', 'y':'decimal/2IUZsrWcHo4Md44D', 'z':'car/dZOsnLgE_8IFMXaM'},
# ])# , graph_type='instance'


# graph.update_document([
#     {'@type':'decimal', 'value':1.11},
#     {'@type':'decimal', 'value':2.22},
#     {'@type':'decimal', 'value':3.33},
# ], graph_type='instance')


# schema = requests.get('http://admin:root@localhost:6363/api/schema/admin/delimit').text 
# print(schema)



# results = graph.get_document('')
# print(results)





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
# results = graph.insert_document(schema, graph_type="schema")

# document = {'@type' : 'Person', 'name' : 'Jim'}
# results = graph.insert_document(document)


# dbid="delimit"
# label="delimit"
# description="Delimit Database"
# prefixes = {'@base' : 'iri:///delimit/',
#             '@schema' : 'iri:///delimit#'}
# team="admin"
# graph.create_database(
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
# graph.create_database(
#     dbid,
#     team,
#     label=label,
#     description=description,
#     prefixes=prefixes)