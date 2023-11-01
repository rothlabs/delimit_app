
import os, time, requests
from terminusdb_client import Client#, WOQLClient #, GraphType
from terminusdb_client import WOQLQuery as wq

os.system('nc -4 -vz localhost 3636') # connect to terminus socket
client = Client('http://localhost:6363/')
for i in range(0, 20):
    print('Connecting terminus.')
    try:
        client.connect(team='admin', password='root', db='testdb')
        break
    except:
        print('Failed to connect terminus.')
        time.sleep(.25)

# wc = WOQLClient("http://localhost:6363/")
# wc.connect(db="testdb")


# client.update_document([
#     {'@type':'Class', '@id':'Cat', 
#         'name': 'xsd:string',
#         'vehicle': 'Bike', 
#     },
#     {'@type':'Class', '@id':'Dog', 
#         'name': 'xsd:string', 
#         'vehicle': 'Bus', 
#     },
#     {'@type':'Class', '@id':'Bike', 
#         'name': 'xsd:string', 
#     },
#     {'@type':'Class', '@id':'Bus', 
#         'name': 'xsd:string', 
#     },
# ], graph_type='schema')

# client.delete_document([
#     {'@id':'Dog/deZV2WyghKh-WLy4'},
#     #{'@id':'Dog/beQ7uUNufGy64usM'},
#     #{'@id':'Car/fiIBbILonRH4iaRM'},
#     #{'@id':'Car/GeyXmpzmOA2FJcJU'},
# ], graph_type='instance')

# client.update_document([
#     # {'@type':'Bike', '@id':'Bike/rxJnJ6Ccc6_iiT2x',
#     #     'name': 'Speedy',
#     # },
#     {'@type':'Dog', 
#         'name': 'Dude',
#         'vehicle': 'DTp-WCpBXReqd7kJ',
#     },
# ], graph_type='instance')

print(client.info())

result = client.get_all_documents(graph_type='schema')
print('Schema:')
print('\n'.join(map(str, result)))


#results = client.query_document({'@type':'Car', 'name':'juice'}) #_document
myString = wq().string('sammy')
query = wq().triple('v:named_node', '@schema:name', myString)
result = query.execute(client)
print('Get: ')
print(list(result['bindings']))


result = client.get_all_documents(graph_type='instance')
print('Instance: ')
print('\n'.join(map(str, result)))

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



# parts = {'@class':'part', '@type':'List'}
# client.update_document([
#     {'@id':'boolean', '@type':'Class', 'value':'xsd:boolean'},
#     {'@id':'integer', '@type':'Class', 'value':'xsd:integer'},
#     {'@id':'decimal', '@type':'Class', 'value':'xsd:decimal'},
#     {'@id':'string',  '@type':'Class', 'value':'xsd:string' },
#     {'@id':'part', '@type':'Class', '@abstract':[], 
#         'name': {'@class':'string', '@type':'Optional'},
#     },
#     {'@id':'vector', '@type':'Class', 
#         '@inherits': 'part',
#         'x': 'decimal',
#         'y': 'decimal',
#         'z': 'decimal',
#     },
#     {'@id':'placement', '@type':'Class', '@abstract':[], 
#         'move': {'@class':'vector', '@type':'Optional'},
#         'turn': {'@class':'vector', '@type':'Optional'},
#         'axis': {'@class':'vector', '@type':'Optional'},
#         'up':   {'@class':'vector', '@type':'Optional'},
#     },

#     {'@id':'user', '@type':'Class', 
#         'name': 'string',
#         'asset': parts,
#     },
    
#     {'@id':'point', '@type':'Class', 
#         '@inherits': ['vector', 'placement'],
#     },
#     {'@id':'case', '@type':'Class', 
#         '@inherits': ['part', 'placement'],
#         'part': {'@class':'part', '@type':'Optional'},
#     },
#     {'@id':'ellipse', '@type':'Class', 
#         '@inherits': ['part', 'placement'],
#         'radius_x': 'decimal',
#         'radius_y': 'decimal',
#         'angle_a':  'decimal',
#         'angle_b':  'decimal',
#     },


#     {'@id':'vehicle', '@type':'Class', '@abstract':[], 'color':'xsd:string'},
#     {'@id':'car', '@type':'Class', '@inherits':'vehicle', 'wheels':'xsd:integer'},

#     {'@id':'curve', '@type':'Class', 
#         '@inherits': ['part', 'placement'],
#         'part': {'@class':'part', '@type':'List'},
#         'mix':  {'@class':'part', '@type':'Set'}, 
#     },
# ], graph_type='schema')

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