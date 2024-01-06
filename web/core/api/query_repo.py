from core.api.util import readable_repo, readable_version
from core.api.types import Pack_Type
from core.models import Node, Repo, Version

def get_repos(user):
    return Pack_Type(
        result = { 
            repo.id: make_staged_repo_and_versions(repo)
            for repo in Repo.objects.prefetch_related('versions').filter(
                readable_repo(user), versions__committed = False, #versions__stems__isnull = True,
            )
        }
    )

def make_staged_repo_and_versions(repo):
    return {
        'metadata': repo.metadata,
        'versions': {
            version.id:{
                'metadata': version.metadata,
            } for version in repo.versions.all() # try versions__stems__isnull in main filter
        },
    }


def get_version(user, id):
    repos, versions, nodes, staged_nodes = {}, {}, {}, {}
    top_node_ids = set()
    def stage_items(version_id):
        if version_id in versions: return
        version = get_one_readable_version(user, version_id)
        if not version: return
        is_top = (version.id == id)
        repos[version.repo.id] = make_staged_repo(user, version)
        versions[version.id] = make_staged_version(user, version, is_top)
        new_nodes, version_dependency_ids = make_staged_nodes_and_version_dependency_ids(version)
        nodes.update(new_nodes)
        if is_top: top_node_ids.update(new_nodes)
        for v_d_id in version_dependency_ids: stage_items(v_d_id)
    stage_items(id)
    if len(versions) > 1: nodes = select_nodes_from_top(top_node_ids, nodes)
    return Pack_Type(
        result = {
            'nodes': nodes,
            'repos': repos,
            'versions': versions,    
        },
        reply = 'Get version successful',
    )

def select_nodes_from_top(top_node_ids, nodes):
    result = {}
    def select_node(node):
        if node in result: return
        if not node in nodes: return
        result[node] = nodes[node]
        for term in result[node].values():
            for stem in term:
                if isinstance(stem, str): select_node(stem)
    for node in top_node_ids: select_node(node)
    return result

def get_one_readable_version(user, id):
    result = Version.objects.select_related('repo').filter(readable_version(user), id=id)
    if len(result) < 1: return
    return result[0]

def make_staged_repo(user, version):
    return {
        'metadata': version.repo.metadata, 
        'writable': user.writable_repos.filter(id=version.repo.id).exists()
    }

def make_staged_version(user, version, is_top):
    return {
        'top':       is_top,
        'repo':      version.repo.id,
        'metadata':  version.metadata,
        'committed': version.committed,
        'writable':  user.writable_versions.filter(id=version.id).exists()
    }

def make_staged_nodes_and_version_dependency_ids(version):
    staged_nodes = {}
    version_dependency_ids = set()
    for node in Node.objects.select_related('snap').filter(version=version): 
        terms = node.snap.content 
        for term in terms.keys():
            for index, stem in enumerate(terms[term]):
                if isinstance(stem, str): 
                    if len(stem) > 16: 
                        version_dependency_ids.add(stem[:16])
                    else: 
                        terms[term][index] = version.id + terms[term][index] # stem instead of terms[term][index] ?
        staged_nodes[version.id + node.key] = terms
    return staged_nodes, version_dependency_ids