from django.views.generic import ListView, UpdateView
from django.core.files import File
from catalog.models import Product, Sketch
from .forms import Edit_Form
import asyncio, json, pathlib # From Python Built-In

class Index_View(ListView):
    model = Product
    template_name = 'easel/index.html'


# Instead of waiting for CAx to be done, provide htttp response immediately and 
# use Django Channels to push updated model when ready
class Edit_View(UpdateView):
    model = Product
    form_class = Edit_Form
    template_name = 'easel/edit.html'
    def get_success_url(self): return ''
    def post(self,request,*args,**kwargs):
        product = self.get_object()
        async def cax(data_out):
            reader, writer = await asyncio.open_connection('127.0.0.1', 8888) # Connect to FreeCAD Worker
            writer.write(json.dumps(data_out).encode())
            data_in = await reader.read(1000000) # 1 Megabyte limit
            print('CAX Meta Response: '+data_in.decode())
            writer.close()
        asyncio.run(cax({ # send product id, sketches, and more to cax
                'product_id': product.id, 
                'sketch_xy': Sketch.objects.get(pk = request.POST['top_sketch']).svg, 
                'sketch_yz': Sketch.objects.get(pk = request.POST['side_sketch']).svg,
            }))
        path = pathlib.Path('../cax/tmp/'+str(product.id)+'.glb') # D file from cax 
        with path.open(mode='rb') as f:
            product.glb = File(f, name=path.name) 
            product.save()
        # Old file is not automatically overritten/deleted. Need to write cleanup system. See the following:
        # https://stackoverflow.com/questions/16041232/django-delete-filefield
        return super(Edit_View,self).post(request,*args,**kwargs)