import json, time
import graphene
from core.api.config import auth_required_message
#from core.api.types import Pack_Type
#from graph.database import gdbc, gdb_connect, gdb_write_access
#from terminus import WOQLQuery as wq
from core.models import Repo, Commit, Snap
from core.api.util import readable_commit

# data = json.loads(data)

# '::next::'
#'name___delimit|||app___{'type':'xsd:boolean','value':true}|||'

class Open_Repo(graphene.Mutation): # rename to Open_Module?! #1
    class Arguments:
        commit = graphene.String()
    data = graphene.String(default_value = 'null')
    reply = graphene.String(default_value = 'Failed to open repo')
    @classmethod
    def mutate(cls, root, info, commit): # , include, exclude): # offset, limit for pages
        try:
            user = info.context.user
            repos = {}
            commits = {}
            nodes = {}
            commit_id = commit 
            top_nodes = set()
            node_map = {}
            def build_map(inner_commit_id):
                if inner_commit_id in commits: return
                try: 
                    commit = Commit.objects.select_related('repo').prefetch_related('snaps').get(
                        readable_commit(user),
                        id = inner_commit_id,
                    )
                except: return
                top = (commit.id == commit_id)
                repos[commit.repo.id] = {
                    'flex': commit.repo.flex, 
                    'writable': True,
                    #'writable': user.writable_repos.filter(id=repo.id).exists()
                }
                commits[commit.id] = {
                    'top':   top,
                    'repo':  commit.repo.id,
                    'flex':  commit.flex,
                    'writable': True,
                    #'roots': commit.roots 
                    #'branch': commit.filter(stems__isnull = True),
                }
                for snap in commit.snaps.all():#repo.commit.snaps.all():  #Snap.objects.filter(commits = inner_commit_id)
                    forw = snap.forw.copy()
                    for term in snap.forw.keys():
                        for index, stem in enumerate(snap.forw[term]):
                            if isinstance(stem, str): 
                                if len(stem) > 16: build_map(stem[16:])
                                else: forw[term][index] = snap.forw[term][index] + commit.id # if not hasattr(stem, 'type'):
                    if top: top_nodes.add(snap.node + commit.id)
                    node_map[snap.node + commit.id] = forw #{'forw':forw, 'commit':commit.id}
            build_map(commit_id)
            if len(commits) == 1: 
                nodes = node_map
            else:
                def select_nodes(node):
                    if node in nodes: return
                    nodes[node] = node_map[node]
                    for term in nodes[node]:
                        for stem in term:
                            if isinstance(stem, str): select_nodes(stem)
                for node in top_nodes: select_nodes(node)
            return Open_Repo(
                reply = 'Open repo successful',
                data = json.dumps({
                    'commits': commits,
                    'repos':   repos,
                    'nodes':   nodes,
                }),
            )
        except Exception as e: 
            print('Error: Open_Repo')
            print(e)
        return Open_Repo()


                    # 'commit':{
                    #     commit.id:{
                    #         'tip':  commit.
                    #         'repo': commit.repo, # 'committer': commit.committer,
                    #         #'roots': x.roots,
                    #         'flex':  commit.flex,
                    #     } for commit in Commit.objects.filter(commit__in = commits)
                    # },

#flex__perm__contains = {user.id:'read'}


# user = info.context.user
#             if not user.is_authenticated:
#                 return Push_Node(reply = auth_required_message)
#             repos = {}
#             node_map = {}
#             roots = set()
#             commits = set()
#             def build_node_map(current_commit):
#                 if current_commit in commits: return
#                 try:
#                     repo = Repo.objects.get(commits = current_commit, readers = user) #flex__perm__contains = {user.id:'read'}
#                     repos[repo.repo] = {'flex':repo.flex}
#                 except: return
#                 commits.add(current_commit)
#                 for snap in Snap.objects.filter(commits = current_commit):
#                     forw = snap.forw.copy()
#                     for term in snap.forw.keys():
#                         for stem, index in enumerate(term):
#                             if isinstance(stem, str): 
#                                 if len(stem) > 16: build_node_map(stem[16:])
#                                 else: forw[term][index] = snap.forw[term][index] + current_commit # if not hasattr(stem, 'type'):
#                     if commit == current_commit:
#                         roots.add(snap.node + current_commit)
#                     node_map[snap.node + current_commit] = forw
#             build_node_map(commit)
#             nodes = {}
#             if len(commit) == 1: 
#                 nodes = node_map
#             else:
#                 def build_nodes(node):
#                     if node in nodes: return
#                     nodes[node] = node_map[node]
#                     for term in nodes[node].keys():
#                         for stem in term:
#                             if isinstance(stem, str): build_nodes(stem)
#                 for node in roots: build_nodes(node)
#             return Open_Repo(
#                 reply = 'Open repo successful',
#                 data = json.dumps({
#                     'repo': repos,
#                     'commit':{
#                         commit.id:{
#                             'repo':  commit.repo, # 'committer': commit.committer,
#                             #'roots': x.roots,
#                             'flex':  commit.flex,
#                         } for commit in Commit.objects.filter(commit__in = commits)
#                     },
#                     'node': nodes,
#                 }),
#             )






                    # 'repos':{repo.repo:{
                    #     'flex': repo.flex,
                    #     } for repo in Repo.objects.get(commits__in = commits)},

    # class Arguments:
    #     #client = graphene.String()
    #     commit = graphene.String()
    #     #nodes = graphene.List(graphene.String())
    # #pack = graphene.Field(Pack_Type)
    # #write = graphene.Boolean(default_value = False)

            #repo_obj = Repo.objects.get(branch=branch)
            #branch_obj = Branch.objects.get(branch=branch)
            #node = {branch+x.node:x.data for x in Node.objects.filter(branch=branch)} # Node.objects.filter(branch=branch).values('node', 'data')

            #repo_obj = Repo.objects.get(branch=branch)
            #branch_obj = Branch.objects.get(branch=branch)
            #node = {branch+x.node:x.data for x in Node.objects.filter(branch=branch)} # Node.objects.filter(branch=branch).values('node', 'data')
                                    # stem_commit = stem[16:]
                                    # if not stem_commit in all_commits:
                                    #     all_commits.add(stem_commit)
                                    #     stem_commits.add(stem_commit)

                                                    # for stem_commit in stem_commits:
                #     build_node_map(stem_commit)


            # data = {}
            # for item in sequence.split(']::['):
            #     data[item] = []
            #     for item in item.split('>>>'):
            #         data[item].append()


#triples = wq().triple('v:root', 'v:term', 'v:stem').execute(gdbc)['bindings'] # star(subj='root', pred='term', obj='stem')


            # triples = wq().select('v:root', 'v:term', 'v:stem').woql_or(
            #     wq().triple('v:root', 'v:term', 'v:stem'),
            #     wq().woql_and(
            #         wq().triple('v:root', 'v:term', 'v:cons'),
            #         wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #     )
            # ).execute(gdbc)['bindings']    



        # triples = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
            #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
            #     wq().woql_or(
            #         wq().triple('v:root', 'v:tag', 'v:stem'),
            #         wq().woql_and(
            #             wq().triple('v:root', 'v:tag', 'v:cons'),
            #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
            #         )
            #     ),
            # ).execute(gdbc)['bindings'] 
            # triples = query.execute(gdbc)['bindings']    
            #return Open_Module(nodes=Pack_Type(data={'list':triples}), reply='Opened nodes')





        # depth = graphene.Int()
        #include = graphene.List(graphene.List(graphene.String)) # must include nodes that use these atoms with these values 
        #exclude = graphene.List(graphene.List(graphene.String)) # must exclude nodes that use these atoms with these values


                # user_id = wq().string(user.id)
                # triples = wq().select('v:root', 'v:tag', 'v:stem').woql_and(
                #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
                #     wq().woql_or(
                #         wq().triple('v:root', 'v:tag', 'v:stem'),
                #         wq().woql_and(
                #             wq().triple('v:root', 'v:tag', 'v:cons'),
                #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
                #         )
                #     ),
                # )

                    # wq().woql_and(
                    #     wq().triple('v:root', 'rdf:type', '@schema:User'),
                    #     wq().triple('v:root', '@schema:user', user_id),
                    #     wq().triple('v:root', 'v:tag', 'v:stem'),
                    # ),
                    # wq().woql_and(
                    #     wq().triple('v:user', 'rdf:type', '@schema:User'),
                    #     wq().triple('v:user', '@schema:user', user_id),
                    #     wq().triple('v:user', '@schema:asset', 'v:root'),
                    #     wq().triple('v:root', '@schema:drop', wq().boolean(False)),
                    #     wq().woql_or(
                    #         wq().triple('v:root', 'v:tag', 'v:stem'),
                    #         wq().woql_and(
                    #             wq().triple('v:root', 'v:tag', 'v:cons'),
                    #             wq().path('v:cons', 'rdf:rest*,rdf:first', 'v:stem'),
                    #         )
                    #     ),
                    # ),