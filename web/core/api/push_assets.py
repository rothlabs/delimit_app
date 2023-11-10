import json
import graphene
from core.api.types import Pack_Type
from core.api.config import auth_required_message, system_classes
from graph import graph
from terminusdb_client import WOQLQuery as wq

class Push_Assets(graphene.Mutation):
    class Arguments:
        triples = graphene.String()
        clientInstance = graphene.String()
    reply = graphene.String(default_value = 'Failed to save')
    @classmethod
    def mutate(cls, root, info, triples, clientInstance):
        try: # must make sure nodes do not get added to poll_pack if set for delete!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            user = info.context.user
            if not user.is_authenticated: 
                return Push_Assets(reply = auth_required_message)
            triples = json.loads(triples)['list']
            user_triples = wq().woql_and(
                wq().triple('v:root', 'rdf:type', '@schema:User'),
                wq().triple('v:root', '@schema:user', wq().string(user.id)),
            ).execute(graph.client)['bindings']
            user_node = graph.client.get_document(user_triples[0]['root'])
            new_nodes = []
            drop_nodes = []
            nodes = {} 
            for triple in triples:
                r = triple['root']
                if triple['tag'] == 'class':
                    nodes[r] = {'@id':r}
                    try: # exists 
                        node = graph.client.get_document(r)
                        nodes[r]['@type'] = node['@type'] # force type to existing node
                        if not r in user_node['asset']:
                            del nodes[r]
                    except: # not exits
                        nodes[r]['@type'] = triple['stem'] 
                        new_nodes.append(r) 
                    if nodes[r]['@type'] in system_classes:
                        del nodes[r]
            for r in nodes:
                clss = nodes[r]['@type']
                for t in graph.schema[clss]:
                    if '@class' in graph.schema[clss][t]:
                        if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
                            nodes[r][t] = []
            for triple in triples:
                if triple['tag'][:4] == 'tag:':
                    r = triple['root']
                    if not r in nodes:
                        continue
                    clss = nodes[r]['@type']
                    t = triple['tag'][4:]
                    stem = triple['stem']
                    if '@class' in graph.schema[clss][t]:
                        if graph.schema[clss][t]['@type'] == 'List' or graph.schema[clss][t]['@type'] == 'Set':
                            nodes[r][t].append(stem)
                            continue
                    nodes[r][t] = stem
                    if t == 'drop' and stem == True:
                        drop_nodes.append(r)
            graph.client.update_document([nodes[k] for k in nodes])
            if len(new_nodes) > 0:
                user_node['asset'].extend(new_nodes)
                graph.client.update_document(user_node)
            if len(drop_nodes) > 0:
                graph.client.delete_document(drop_nodes)
            return Push_Assets(reply='Saved') 
        except Exception as e: 
            print('Push_Assets Error: ')
            print(e)
        return Push_Assets()