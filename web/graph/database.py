import os, time
from django.conf import settings
from terminusdb_client import Client
from terminusdb_client import WOQLQuery as wq

GRAPH = settings.GRAPH
os.system('nc -4 -vz '+GRAPH['socket']['host']+' '+GRAPH['socket']['port']) # trigger terminusdb.socket
client = Client('http://'+GRAPH['server']['host']+':'+GRAPH['server']['port']+'/')

# for i in range(0, 20):
#     print('Connecting terminus.')
#     try:
#         client.connect(user=GRAPH['user'], password=GRAPH['password'], db=GRAPH['database'])
#         break
#     except:
#         print('Failed to connect terminus.')
#         time.sleep(.25)
