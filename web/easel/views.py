from django.views.generic import ListView, UpdateView
from catalog.models import Product, Sketch
from .forms import Edit_Form
import asyncio, json

class Index_View(ListView):
    model = Product
    template_name = 'easel/index.html'

class Edit_View(UpdateView):
    model = Product
    form_class = Edit_Form
    template_name = 'easel/edit.html'
    def get_success_url(self): return ''
    def post(self,request,*args,**kwargs):
        async def cax(data):
            reader, writer = await asyncio.open_connection('127.0.0.1',8888)
            writer.write(data.encode())
            writer.close()
        asyncio.run(cax(json.dumps({
            'sketch_xy': Sketch.objects.get(pk = request.POST['top_sketch']).svg,
            'sketch_yz': Sketch.objects.get(pk = request.POST['side_sketch']).svg,
        })))
        return super(Edit_View,self).post(request,*args,**kwargs)

#with open('../cax/freecad/input/top_sketch.svg', 'w+') as file:
        #    file.write(sketch.svg)