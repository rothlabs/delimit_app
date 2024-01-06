import json, re, hashlib
import graphene
from core.api.config import menu_button_svg, braces_svg, plus_square_svg, abc_svg
from core.api.util import attempt, conform_user_input, make_node_snaps
from core.models import Repo, Version, Snap, make_id

class Make_Repo(graphene.Mutation):
    class Arguments:
        name = graphene.String()
        story = graphene.String()
        makeMeta = graphene.Boolean()
    reply = graphene.String(default_value = 'Failed to make repo')
    result = graphene.String()
    @classmethod
    def mutate(cls, root, info, name, story, makeMeta):
        return attempt(Make_Repo, make_repo, (info.context.user, name, story, makeMeta))

def make_repo(user, name, story, makeMeta):
    repo = Repo.objects.create(
        metadata = {
            'name':  conform_user_input(name,  max_length=64), # name=True),
            'story': conform_user_input(story, max_length=512),
        }
    )
    repo.writers.add(user)
    repo.readers.add(user)
    version = Version.objects.create( # pre select authors and snaps ?!
        repo      = repo,
        metadata = {
            'name':  'Main',
            'story': '',
        },
    )
    version.authors.add(user)
    make_node_snaps(version, starter_nodes(name, makeMeta))
    return Make_Repo(reply = 'Make repo complete')

def starter_nodes(name, makeMeta):
    delimit_app      = make_id()
    starter_context  = make_id()
    root_type        = make_id()
    term_type        = make_id()
    stem_type        = make_id()
    context_leaf_node= make_id()
    code_root        = make_id()
    type_icon_code   = make_id()
    abc_icon_code    = make_id()
    plus_icon_code   = make_id()
    code_icon_code   = make_id()
    language_term    = make_id()
    source_term      = make_id()
    name_term        = make_id()
    context_term     = make_id()
    icon_term        = make_id()
    required_term    = make_id()
    optional_term    = make_id()
    pick_one_term    = make_id()
    one_or_more_term = make_id()
    add_term         = make_id()
    make_term        = make_id()
    minimum_term     = make_id()
    maximum_term     = make_id()
    code_term        = make_id()
    code_stem        = make_id()

    core_nodes = {
        delimit_app:{
            'name':        [{'type':'string', 'value':'Delimit'}],
            'type':        [{'type':'string', 'value':'App'}],
            'delimit_app': [{'type':'boolean', 'value':True}],
            'contexts':    [starter_context],
        },
        starter_context:{
            'name':     [{'type':'string', 'value':name}],
            'type':     [{'type':'string', 'value':'Context'}],
            'types':    [],
        },
    }

    print('makeMeta', makeMeta)
    if not makeMeta: 
        return core_nodes
 
    return {
        **core_nodes,
        starter_context:{
            'name':     [context_leaf_node],
            'type':     [{'type':'string', 'value':'Context'}],
            'types':    [root_type, term_type, stem_type, code_root],
        },
        code_root:{
            'type':     [root_type],
            'name':     [{'type':'string', 'value':'Code'}],
            'required': [name_term, language_term, source_term],
        },
        language_term:{
            'type':     [term_type],
            'name':     [{'type':'string', 'value':'Language'}],
            'make':     [{'type':'string', 'value':'JavaScript'}],
            'required': [{'type':'string', 'value':'String'}],
        },
        source_term:{
            'type':     [term_type],
            'name':     [{'type':'string', 'value':'Source'}],
            'make':     [{'type':'string', 'value':'// default code'}],
            'required': [{'type':'string', 'value':'String'}],
        },
        context_leaf_node:{ 
            'leaf':[{'type':'string', 'value':name}],
        },
        code_stem:{
            'name':    [{'type':'string', 'value':'Code'}],
            'type':    [{'type':'string', 'value':'Stem'}],
            'context': [context_leaf_node],
        },
        type_icon_code:{
            'name':     [{'type':'string', 'value':'Type Icon'}],
            'source':   [{'type':'string', 'value':menu_button_svg}],
            'language': [{'type':'string', 'value':'SVG'}],
        },
        abc_icon_code:{
            'name':     [{'type':'string', 'value':'Text Icon'}],
            'source':   [{'type':'string', 'value':abc_svg}],
            'language': [{'type':'string', 'value':'SVG'}],
        },
        plus_icon_code:{
            'name':     [{'type':'string', 'value':'Plus Icon'}],
            'source':   [{'type':'string', 'value':plus_square_svg}],
            'language': [{'type':'string', 'value':'SVG'}],
        },
        code_icon_code:{
            'name':     [{'type':'string', 'value':'Braces Icon'}],
            'source':   [{'type':'string', 'value':braces_svg}],
            'language': [{'type':'string', 'value':'SVG'}],
        },
        icon_term:{
            'type':     [{'type':'string', 'value':'Term'}],
            'name':     [{'type':'string', 'value':'Icon'}],
            'icon':     [code_icon_code],
            'make':     [code_stem],
            'required': [code_stem],
        },
        name_term:{
            'name':     [{'type':'string', 'value':'Name'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [abc_icon_code],
            'required': [{'type':'string', 'value':'String'}],
            'make':     [{'type':'string', 'value':'New'}],
        },
        context_term:{
            'name':     [{'type':'string', 'value':'Context'}],
            'type':     [term_type],
            'required': [{'type':'string', 'value':'String'}],
            'add':      [context_leaf_node],
        },
        make_term:{
            'name':     [{'type':'string', 'value':'Make'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [plus_icon_code],
        },
        add_term:{
            'name':     [{'type':'string', 'value':'Add'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [plus_icon_code],
        },
        minimum_term:{
            'name':     [{'type':'string', 'value':'Minimum'}],
            'type':     [term_type],
        },
        maximum_term:{
            'name':     [{'type':'string', 'value':'Maximum'}],
            'type':     [term_type],
        },
        code_term:{
            'name':     [{'type':'string', 'value':'Code'}],
            'type':     [term_type],
            'required': [code_stem],
            'make':     [code_stem],
        },
        required_term:{
            'name':     [{'type':'string', 'value':'Required'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        optional_term:{
            'name':     [{'type':'string', 'value':'Optional'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        pick_one_term:{
            'name':     [{'type':'string', 'value':'Pick One'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        one_or_more_term:{
            'name':     [{'type':'string', 'value':'One or More'}],
            'type':     [{'type':'string', 'value':'Term'}],
            'icon':     [type_icon_code],
        },
        root_type:{
            'name':     [{'type':'string', 'value':'Root'}],
            'icon':     [type_icon_code],
            'required': [name_term],
            'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, code_term],
        },
        term_type:{
            'name':     [{'type':'string', 'value':'Term'}],
            'icon':     [type_icon_code],
            'required': [name_term],
            'optional': [icon_term, required_term, optional_term, pick_one_term, one_or_more_term, make_term, add_term],
        },
        stem_type:{
            'name':     [{'type':'string', 'value':'Stem'}],
            'icon':     [type_icon_code],
            'required': [name_term, context_term],
            'optional': [icon_term, minimum_term, maximum_term],
        },
    }

