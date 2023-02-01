import { Base } from 'easel/base.js';
import { Draw } from 'easel/draw.js';
import { Product } from 'easel/product.js';
import { Toolbar } from 'easel/toolbar.js';

const base = Base();
const product = Product(base);
const draw = Draw(base, product);
product.draw = draw;
const toolbar = Toolbar(base, product);

function update() {
    base.update();
    product.fit();
    draw.fit();
    window.requestAnimationFrame(update);
}update();
 