import json, time
import graphene
from core.api.config import auth_required_message
from core.models import Repo, Commit, Snap, Node
from core.api.util import readable_commit

class Open_Commit(graphene.Mutation):
    class Arguments:
        commitId = graphene.String()
    reply = graphene.String(default_value = 'Failed to open commit')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, commitId):
        try:
            user = info.context.user
            repos = {}
            commits = {}
            nodes = {}
            top_node_ids = set()
            node_map = {}
            def build_map(inner_commit_id):
                if inner_commit_id in commits: return
                try: 
                    commit = Commit.objects.select_related('repo').get( # prefetch_related('snaps')
                        readable_commit(user),
                        id = inner_commit_id,
                    )
                except: return
                top = (commit.id == commitId)
                repos[commit.repo.id] = {
                    'metadata': commit.repo.metadata, 
                    'writable': user.writable_repos.filter(id=commit.repo.id).exists()
                }
                commits[commit.id] = {
                    'top':       top,
                    'repo':      commit.repo.id,
                    'metadata':  commit.metadata,
                    'committed': commit.committed,
                    'writable':  user.writable_commits.filter(id=commit.id).exists()
                }
                for node in Node.objects.select_related('snap').filter(commit=commit): 
                    terms = node.snap.content 
                    for term in terms.keys():
                        for index, stem in enumerate(terms[term]):
                            if isinstance(stem, str): 
                                if len(stem) > 16: 
                                    build_map(stem[:16])
                                else: 
                                    terms[term][index] = commit.id + terms[term][index]
                    joined_id = commit.id + node.key
                    if top: top_node_ids.add(joined_id)
                    node_map[joined_id] = terms 
            build_map(commitId)
            if len(commits) == 1: 
                nodes = node_map
            else:
                def select_nodes(node):
                    if node in nodes: return
                    nodes[node] = node_map[node]
                    for term in nodes[node]:
                        for stem in term:
                            if isinstance(stem, str): select_nodes(stem)
                for node in top_node_ids: select_nodes(node)
            return Open_Commit(
                reply = 'Open commit successful',
                result = json.dumps({
                    'commits': commits,
                    'repos':   repos,
                    'nodes':   nodes,
                }),
            )
        except Exception as e: 
            print('Error: Open_Commit')
            print(e)
        return Open_Commit()