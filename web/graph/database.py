import os, time
from django.conf import settings
from core.models import Account
from terminus import Client           # terminusdb_client
from terminus import WOQLQuery as wq  # terminusdb_client

GRAPH = settings.GRAPH

#os.system('nc -4 -vz '+GRAPH['socket']['host']+' '+GRAPH['socket']['port']) # trigger terminusdb.socket

gdbc = Client('http://'+GRAPH['server']['host']+':'+GRAPH['server']['port']+'/')

def gdb_connect(user, team=None, repo=None):
    gdb_user = 'anonymous'
    gdb_key = 'anonymous'
    if user.is_authenticated:
        account = Account.objects.get(user = user)
        if not team: team = account.gdb_user
        gdb_user = account.gdb_user
        gdb_key = account.gdb_key
    if not team: team = 'anonymous'
    if repo: gdbc.connect(user=gdb_user, key=gdb_key, team=team, db=repo)
    else: gdbc.connect(user=gdb_user, key=gdb_key, team=team)
    return team



#admin_client = Client('http://'+GRAPH['server']['host']+':'+GRAPH['server']['port']+'/')

# for i in range(0, 20):
#     print('Connecting terminus.')
#     try:
#         admin_client.connect(team='admin', user='admin', key=GRAPH['admin']['key']) #admin_client.connect(user=GRAPH['user'], password=GRAPH['password'], db=GRAPH['database'])
#         break
#     except:
#         print('Failed to connect terminus.')
#         time.sleep(.25)
