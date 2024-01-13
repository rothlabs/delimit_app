from core.api.util import readable_repo, readable_version, make_code_keys
from core.api.types import Pack_Type
from core.models import Node, Repo, Version

def get_repos(user):
    return Pack_Type(
        result = { 
            repo.id: get_staged_repo_and_versions(repo)
            for repo in Repo.objects.prefetch_related('versions').filter(
                readable_repo(user), versions__committed = False, 
            )
        }
    )

def get_staged_repo_and_versions(repo):
    return {
        'metadata': repo.metadata,
        'versions': {
            version.id:{
                'metadata': version.metadata,
            } for version in repo.versions.all() # try versions__stems__isnull in main filter
        },
    }

def get_version(user, id):
    repos, versions, nodes = {}, {}, {}
    top_node_ids = set()
    def stage_items(version_id):
        if version_id in versions: return
        version = get_one_readable_version(user, version_id)
        if not version: return
        is_top = (version.id == id)
        repos[version.repo.id] = get_staged_repo(user, version)
        versions[version.id] = get_staged_version(user, version, is_top)
        staged_nodes, version_dependency_ids = get_staged_nodes_and_version_dependency_ids(version)
        nodes.update(staged_nodes)
        if is_top: top_node_ids.update(staged_nodes)
        for v_d_id in version_dependency_ids: stage_items(v_d_id)
    stage_items(id)
    nodes, code_node_ids = filter_nodes_and_get_code_node_ids(nodes, top_node_ids)
    code_keys = make_code_keys(nodes, code_node_ids)
    return Pack_Type(
        result = {
            'nodes': nodes,
            'repos': repos,
            'versions': versions,  
            'code_keys': code_keys,  
        },
        reply = 'Got version',
    )

def filter_nodes_and_get_code_node_ids(nodes, top_node_ids):
    filtered_nodes = {}
    code_node_ids = []
    def select_node(id):
        if id in filtered_nodes: return
        if not id in nodes: return
        filtered_nodes[id] = nodes[id]
        code_terms = ['source', 'language']
        for term, stems in nodes[id].items():
            if term in code_terms: code_terms.remove(term)
            for stem in stems:
                if isinstance(stem, str): select_node(stem)
        if len(code_terms) == 0: code_node_ids.append(id)
    for id in top_node_ids: select_node(id)
    return filtered_nodes, code_node_ids

def get_one_readable_version(user, id):
    result = Version.objects.select_related('repo').filter(readable_version(user), id=id)
    if len(result) < 1: return
    return result[0]

def get_staged_repo(user, version):
    return {
        'metadata': version.repo.metadata, 
        'writable': user.writable_repos.filter(id=version.repo.id).exists()
    }

def get_staged_version(user, version, is_top):
    return {
        'top':       is_top,
        'repo':      version.repo.id,
        'metadata':  version.metadata,
        'committed': version.committed,
        'writable':  user.writable_versions.filter(id=version.id).exists()
    }

def get_staged_nodes_and_version_dependency_ids(version):
    staged_nodes = {}
    version_dependency_ids = set()
    for node in Node.objects.select_related('snap').filter(version=version): 
        terms = node.snap.content 
        for term in terms.keys():
            for index, stem in enumerate(terms[term]):
                if isinstance(stem, str): 
                    if len(stem) == 32: # ref to node in external version
                        version_dependency_ids.add(stem[:16])
                    elif len(stem) == 16: # ref to node in this version
                        terms[term][index] = version.id + terms[term][index] # stem instead of terms[term][index] ?
        staged_nodes[version.id + node.key] = terms
    return staged_nodes, version_dependency_ids