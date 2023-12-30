import json, time, hashlib
import graphene
from django.db.models import Prefetch, Count
from core.api.types import Pack_Type
from core.api.config import auth_required_message
from core.models import Commit, Snap
from core.api.util import writable_commit, make_id

class Push_Node(graphene.Mutation):
    class Arguments:
        nodes = graphene.String()#forw   = graphene.List(graphene.String)
    reply = graphene.String() # default_value = 'Failed to push node'
    @classmethod
    def mutate(cls, root, info, nodes):
        try: 
            #print('repo, node: '+str(repo)+', '+str(node))
            user = info.context.user
            if not user.is_authenticated:
                return Push_Node(reply = auth_required_message)
            commits = normalize_to_commits(json.loads(nodes))
            for target_commit in filter_commits(commits, user):
                push_snaps(target_commit, commits)
            return Push_Node(reply='Push node complete') 
        except Exception as e: 
            print('Error: Push_Node')
            print(str(e))
            return Push_Node(reply = 'Error, Push_Node: '+str(e))

def normalize_to_commits(nodes):
    commits = {}
    for comp_id, forw in nodes.items():
        node_id = comp_id[:16]
        commit_id = comp_id[16:]
        if not commit_id in commits: 
            commits[commit_id] = {}
        new_forw = forw.copy()
        for term, stems in forw.items():
            for index, stem in enumerate(stems):
                if isinstance(stem, str): 
                    if stem[16:] == commit_id:
                        new_forw[term][index] = stem[:16]
        commits[commit_id][node_id] = new_forw
    return commits

def filter_commits(commits, user):
    return Commit.objects.annotate(stem_count=Count('stems')).prefetch_related(
        'snaps' # Prefetch("snaps", queryset = Snap.objects.filter(node__in = node_ids))
    ).filter( 
        writable_commit(user),
        id__in = commits.keys(), 
    )

def push_snaps(target_commit, commits):
    new_snaps = []
    for snap in target_commit.snaps.filter(node__in = commits[target_commit.id].keys()): # add_commit_count.filter(node__in = node_ids):
        forw = commits[target_commit.id][snap.node]
        forw_hash = hashlib.sha256(json.dumps(forw)).hexdigest()
        if snap.commit_count > 1:
            print('new snap!!!')
            new_snaps.append(Snap(node=snap.node, forw=forw))
        else:
            print('update snap!!!')
            new_snaps.append(Snap(node=snap.node, forw=forw, id=snap.id))
        commits[target_commit.id][snap.node] = None
    for node_id in commits[target_commit.id]:
        if commits[target_commit.id][node_id]:
            print('new node!!!')
            new_snaps.append(Snap(node=make_id(), forw=commits[target_commit.id][node_id]))
    snaps = Snap.objects.bulk_create(
        new_snaps, 
        update_conflicts = True,
        update_fields = ['forw'],
        unique_fields = ['id'],
    )
    target_commit.snaps.add(*snaps)


# def push_snaps(target_commit, commits):
#     new_snaps = []
#     for snap in target_commit.snaps.annotate(commit_count=Count('commits')).filter(node__in = commits[target_commit.id].keys()): # add_commit_count.filter(node__in = node_ids):
#         forw = commits[target_commit.id][snap.node]
#         forw_hash = hashlib.sha256(json.dumps(forw)).hexdigest()
#         if snap.commit_count > 1:
#             print('new snap!!!')
#             new_snaps.append(Snap(node=snap.node, forw=forw))
#         else:
#             print('update snap!!!')
#             new_snaps.append(Snap(node=snap.node, forw=forw, id=snap.id))
#         commits[target_commit.id][snap.node] = None
#     for node_id in commits[target_commit.id]:
#         if commits[target_commit.id][node_id]:
#             print('new node!!!')
#             new_snaps.append(Snap(node=make_id(), forw=commits[target_commit.id][node_id]))
#     snaps = Snap.objects.bulk_create(
#         new_snaps, 
#         update_conflicts = True,
#         update_fields = ['forw'],
#         unique_fields = ['id'],
#     )
#     target_commit.snaps.add(*snaps)


#from graph.database import gdbc, gdb_connect, gdb_write_access
#from terminus import WOQLQuery as wq

            # node_ids = set()
            # commit_ids = set()
            # for node_commit in nodes.items():
            #     node_ids.add(node_commit[:16])
            #     commit_ids.add(node_commit[16:])

#  nodes = json.loads(nodes)
#             node_ids = set()
#             commit_ids = set()
#             for node_commit in nodes.items():
#                 node_ids.add(node_commit[:16])
#                 commit_ids.add(node_commit[16:])
#             commits = Commit.objects.add_stem_count().prefetch_related(
#                 Prefetch("snaps", queryset = Snap.objects.filter(node__in = node_ids))
#             ).filter( 
#                 writable_commit(user),
#                 id__in = commit_ids, 
#             )
#             for commit in commits:
#                 new_snaps = []
#                 for snap in commit.snaps: # add_commit_count.filter(node__in = node_ids):
#                     node_commit = snap.node + commit.id
#                     if not node_commit in nodes: continue
#                     forw = nodes[node_commit]
#                     if snap.commit_count > 1:
#                         new_snaps.append(Snap(node=snap.node, forw=forw))
#                     else:
#                         new_snaps.append(Snap(node=snap.node, forw=forw, id=snap.id))
                
#                 snaps = Snap.objects.bulk_create(
#                     new_snaps, 
#                     update_conflicts = True,
#                     update_fields = ['forw'],
#                     unique_fields = ['id'],
#                 )
#                 commit.snaps.add(new_snaps)
#             return Push_Node(reply='Push node complete') 


            # commits = Commit.objects.add_stem_count().prefetch_related(
            #     Prefetch("snaps", queryset = Snap.objects.filter(node__in = node_ids))
            # ).filter( 
            #     writable_commit(user),
            #     id__in = commit_ids, 
            # )

            # nodes = json.loads(nodes)
            # node_ids = set()
            # commit_ids = set()
            # for node_commit, forw in nodes.items():
            #     node = node_commit[:16]
            #     node_ids.add(node)
            #     commit_id = node_commit[16:]
            #     commit_ids.add(commit_id)
            #     # Snap(node=node, forw=forw)
            # snaps = Snap.objects.prefetch_related('commits').add_counts().filter(
            #     writable_snap(user),
            #     node__in = node_ids,
            #     commits__in = commit_ids,
            # )
            # new_snaps = []
            # for snap in snaps:
            #     forw = nodes[snap.node + snap.commits[-1].id]
            #     if snap.commit_count > 1:
            #         new_snaps.append(Snap(node=snap.node, forw=forw))
                    
            #     else:
            #         new_snaps.append(Snap(node=snap.node, forw=forw, id=snap.id))
            # snaps = Snap.objects.bulk_create(
            #     new_snaps, 
            #     update_conflicts = True,
            #     update_fields = ['node', 'forw'],
            #     unique_fields = ['id'],
            # )
            # commits = Commit.objects.filter(
            #     writable_commit(user),
            # )
            # # for commit in snap
            # # for snap in snaps:
            # #     snap.add


    # class Arguments:
    #     client = graphene.String()
    #     repo   = graphene.String()
    #     node   = graphene.List(graphene.String)
    #     forw   = graphene.List(graphene.String)


# subj = 'id_string' 
# obj = 'some string' # 200 to 300 characters
# delete_query = wq().triple(subj, '@schema:predicate', 'v:obj')
#     .delete_triple(subj, '@schema:predicate', 'v:obj')
# query.woql_or(
#     delete_query, 
#     wq().add_triple(subj, '@schema:predicate', wq().string(obj))) 
# print('start time: '+str(time.time()))
# query.execute(client)
# print('end time: '+str(time.time())) 





        #     delete_triples = wq().select(root, 'v:term', 'v:stem').woql_and(
            #         wq().woql_or(
            #             wq().triple(root, 'v:term', 'v:stem'),
            #             wq().woql_and(
            #                 wq().triple(root, 'v:term', 'v:cons'),
            #                 wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #             )
            #         ),
            #         wq().delete_triple(root, 'v:term', 'v:stem'),
            #     ).execute(gdbc)['bindings']  


            # user = info.context.user
            # if not user.is_authenticated: 
            #     return Push_Node(reply = auth_required_message)
            # triples = json.loads(triples)['list']
            # drop_nodes = []
            # nodes = {} 
            # for triple in triples:
            #     r = triple['root']
            #     if triple['tag'] == 'class':
            #         nodes[r] = {'@id':r, '@type': triple['stem']}
            # # for r in nodes:
            # #     clss = nodes[r]['@type']
            # #     for t in graph.schema[clss]:
            # #         if '@class' in graph.schema[clss][t]:
            # #             if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
            # #                 nodes[r][t] = []
            # for triple in triples:
            #     if triple['tag'][:4] == 'tag:':
            #         r = triple['root']
            #         if not r in nodes:
            #             continue
            #         clss = nodes[r]['@type']
            #         t = triple['tag'][4:]
            #         stem = triple['stem']
            #         if '@class' in graph.schema[clss][t]:
            #             if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
            #                 nodes[r][t].append(stem)
            #                 continue
                    
            #         nodes[r][t] = stem
            #         if t == 'drop' and stem == True:
            #             drop_nodes.append(r)
            # gdbc.update_document([nodes[k] for k in nodes])
            # if len(drop_nodes) > 0:
            #     gdbc.delete_document(drop_nodes)



                    # try: # exists 
                    #     node = gdbc.get_document(r)
                    #     #nodes[r]['@type'] = node['@type'] # force type to existing node
                    # except: # not exits
                    #     nodes[r]['@type'] = triple['stem'] 
                    # # if nodes[r]['@type'] in core_classes:
                    # #     del nodes[r]

                # if triple['tag'] == 'class':
                #     nodes[r] = {'@id':r}
                #     try: # exists 
                #         node = gdbc.get_document(r)
                #         nodes[r]['@type'] = node['@type'] # force type to existing node
                #         if not r in user_node['asset']:
                #             del nodes[r]
                #     except: # not exits
                #         nodes[r]['@type'] = triple['stem'] 
                #         new_nodes.append(r) 
                #     if nodes[r]['@type'] in system_classes:
                #         del nodes[r]

            # user_triples = wq().woql_and(
            #     wq().triple('v:root', 'rdf:type', '@schema:User'),
            #     wq().triple('v:root', '@schema:user', wq().string(user.id)),
            # ).execute(gdbc)['bindings']
            # user_node = gdbc.get_document(user_triples[0]['root'])
            # new_nodes = []

# if len(new_nodes) > 0:
#     user_node['asset'].extend(new_nodes)
#     gdbc.update_document(user_node)