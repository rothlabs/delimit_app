import json, time
import graphene
from core.api.config import auth_required_message
from core.models import Repo, Version, Snap, Node
from core.api.util import readable_version

class Open_Version(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    reply = graphene.String(default_value = 'Failed to open version')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        try:
            user = info.context.user
            repos = {}
            versions = {}
            nodes = {}
            top_node_ids = set()
            node_map = {}
            def build_map(inner_version_id):
                if inner_version_id in versions: return
                try: 
                    version = Version.objects.select_related('repo').get( # prefetch_related('snaps')
                        readable_version(user),
                        id = inner_version_id,
                    )
                except: return
                top = (version.id == id)
                repos[version.repo.id] = {
                    'metadata': version.repo.metadata, 
                    'writable': user.writable_repos.filter(id=version.repo.id).exists()
                }
                versions[version.id] = {
                    'top':       top,
                    'repo':      version.repo.id,
                    'metadata':  version.metadata,
                    'committed': version.committed,
                    'writable':  user.writable_versions.filter(id=version.id).exists()
                }
                for node in Node.objects.select_related('snap').filter(version=version): 
                    terms = node.snap.content 
                    for term in terms.keys():
                        for index, stem in enumerate(terms[term]):
                            if isinstance(stem, str): 
                                if len(stem) > 16: 
                                    build_map(stem[:16])
                                else: 
                                    terms[term][index] = version.id + terms[term][index]
                    joined_id = version.id + node.key
                    if top: top_node_ids.add(joined_id)
                    node_map[joined_id] = terms 
            build_map(id)
            if len(versions) == 1: 
                nodes = node_map
            else:
                def select_nodes(node):
                    print(node)
                    if node in nodes: return
                    if not node in node_map: return
                    nodes[node] = node_map[node]
                    for term in nodes[node].values():
                        for stem in term:
                            if isinstance(stem, str): select_nodes(stem)
                for node in top_node_ids: select_nodes(node)
            return Open_Version(
                reply = 'Open version successful',
                result = json.dumps({
                    'versions': versions,
                    'repos':    repos,
                    'nodes':    nodes,
                }),
            )
        except Exception as e: 
            print('Error: Open_Version')
            print(e)
        return Open_Version()