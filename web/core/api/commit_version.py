import graphene
from core.api.util import try_mutation, readable_version
from core.models import Version, Node

class Commit_Version(graphene.Mutation):
    class Arguments:
        id = graphene.String()
    error = graphene.String()
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, id):
        args = {'user':info.context.user, 'id':id}
        return try_mutation(mutate=commit_version, args=args, alt=Commit_Version)

def commit_version(user, id):
    stem = Version.objects.get(readable_version(user), id=id)
    root = make_committed_root(user, id, stem)
    stem.roots.clear()
    stem.roots.add(root)
    copy_nodes_from_stem_to_root(root, stem)
    return Commit_Version() 

def make_committed_root(user, id, stem):
    root = Version.objects.create( 
        repo = stem.repo,
        committer = user,
        committed = True,
        metadata = stem.metadata,
    )
    for author in stem.authors.all():
        root.authors.add(author)
    for reader in stem.readers.all():
        root.readers.add(reader)
    for writer in stem.writers.all():
        root.writers.add(writer)
    for original_root in stem.roots.all():
        root.roots.add(original_root)
    return root

def copy_nodes_from_stem_to_root(root, stem):
    nodes = []
    for node in stem.nodes.all():
        nodes.append(Node(version=root, key=node.key, snap=node.snap))
    Node.objects.bulk_create(nodes)
