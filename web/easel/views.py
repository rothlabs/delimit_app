from django.views.generic import ListView, UpdateView
from django.core.files import File
from django.conf import settings
from catalog.models import Shoe, Sketch
from .forms import Edit_Form
import asyncio, json, pathlib # From Python Built-In

class Index_View(ListView):
    model = Shoe
    template_name = 'easel/index.html'


class Edit_View(UpdateView):
    #print(Shoe.objects.last().data())

    model = Shoe
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
                'product_id':  product.id, 
                'sketch_xy':   Sketch.objects.get(pk = request.POST['sketch_xy']).file.path, 
                'sketch_yz':   Sketch.objects.get(pk = request.POST['sketch_yz']).file.path,
                'heel_height': float(request.POST['heel_height']), 
            }))

        path = pathlib.Path('../cax/tmp/'+str(product.id)+'.glb') # 3D file from cax 
        with path.open(mode='rb') as f:
            product.file = File(f, name=path.name) 
            product.save()

        return super(Edit_View,self).post(request,*args,**kwargs)



# Consider:
# Instead of waiting for CAx to be done, provide htttp response immediately and 
# use Django Channels to push updated model when ready