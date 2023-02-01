from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.http import JsonResponse
from django.core import serializers
from django.views import generic
from core.models import Product
import util
import os
import subprocess

@method_decorator(never_cache, name='dispatch')
class List_View(generic.ListView):
    model = Product
    template_name = 'easel/list.html'

@method_decorator(never_cache, name='dispatch')
class Detail_View(generic.DetailView):
    model = Product
    template_name = 'easel/detail.html'

def greenware(request, *args, **kwargs):
    if request.accepts('application/octet-stream') and request.method == 'POST':
        tmp_id = util.new_id()
        with open(util.cax('tmp/'+tmp_id+'.glb'), "wb") as f:
            f.write(request.body)
        cmd = ['/opt/blender/blender', '-b', '-P', util.cax('blender/bt.py'), '--', 'wow_path_cool']#request.FILES.get('file','no_file?')]
        bp = subprocess.Popen(cmd, stdout=subprocess.PIPE)
        for line in bp.stdout:
            print(str(line))
            if 'cax_done' in str(line):
                return JsonResponse({'greenware': 'success', 'blender': 'success'}, status=200)
    return JsonResponse({'greenware': 'bad request'}, status=400)



#bp.wait()
#data = json.loads(request.body)
        #if data['action'] == 'next':
        #    print(data)
    #from django.core.files import File
#from django.conf import settings
#from .forms import Edit_Form
#import asyncio, json, pathlib # From Python Built-In

