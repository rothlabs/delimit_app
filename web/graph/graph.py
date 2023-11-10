import os, time
from django.conf import settings
from terminusdb_client import Client
from terminusdb_client import WOQLQuery as wq

GRAPH = settings.GRAPH

os.system('nc -4 -vz '+GRAPH['host']+' '+GRAPH['socket_port']) # trigger terminusdb.socket

client = Client('http://'+GRAPH['host']+':'+GRAPH['port']+'/')

for i in range(0, 20):
    print('Connecting terminus.')
    try:
        client.connect(team=GRAPH['user'], password=GRAPH['password'], db=GRAPH['database'])
        break
    except:
        print('Failed to connect terminus.')
        time.sleep(.25)
