import traceback
from django.http import HttpResponse
from django.shortcuts import render
from core.models import Node, Snap, Code_Access
from core.api.util import split_id

def index(request):
    return render(request, 'graph/index.html')

def extension(request, apiKey, codeNode, name):
    default = HttpResponse('''// not found''', content_type='application/javascript')
    try:
        code_access = Code_Access.objects.filter(key=apiKey, node=codeNode)
        if len(code_access) < 1: return default
        code_access.delete()
        version_id, node_id = split_id(codeNode)
        snaps = Snap.objects.filter(nodes__version=version_id, nodes__key=node_id)
        if len(snaps) < 1: return default
        terms = snaps[0].content
        if not 'source' in terms: return default
        code = terms['source'][0]['value']
        if not isinstance(code, str): return default
        return HttpResponse(code, content_type='application/javascript')
    except:
        traceback.print_exc()
        return default



    # nodes = Node.objects.filter(key=pk)
    # if len(nodes) < 1: return default

    # #print(pk)
    # #print(graph.schema)
    # # wq().string(pk)
    # # triples = wq().select('code').woql_and(
    # #     wq().triple('v:root', 'rdf:type', '@schema:Script'),
    # #     wq().triple('v:root', '@schema:key', pk),
    # #     wq().triple('v:root', '@schema:code', 'v:code'),
    # # ).execute(graph.client)['bindings']


    # code = '''
    # import {{Vector3}} from 'three';
    # const v = new Vector3(1, 2, 3);
    # onmessage = e => {{
    #     console.log("Message received from main script: {pk}");
    #     const workerResult = `Result: ${{e.data[0] * e.data[1]}}`;
    #     console.log("Posting message back to main script", v);
    #     postMessage(workerResult);
    # }};
    # '''.format(pk=pk)

    # #print(code)







# #from django.views.decorators.clickjacking import xframe_options_sameorigin # , xframe_options_deny
# #from django.views.decorators.clickjacking import xframe_options_exempt 

# #@xframe_options_exempt
# def index(request):
#     #response = HttpResponse('graph/index.html', content_type='text/javascript')
#     #return response
#     #context = {'ctx':{'entry':'/'}}
#     #return HttpResponse("Display onlly if from the same origin host.")
#     response = render(request, 'graph/index.html')
#     #del response['X-Frame-Options']# = "SAMEORIGIN"
#     response['Access-Control-Allow-Origin'] = '*'
#     print('RESPONSE')
#     #print(response['X-Frame-Options'])
#     #response['Content-Security-Policy'] = "frame-ancestors 'self' https://delimit.art"
#     return response 
