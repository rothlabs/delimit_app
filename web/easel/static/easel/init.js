import { Base } from 'easel/base.js';
import { Draw } from 'easel/draw.js';
import { Product } from 'easel/product.js';

const base = Base();
const product = Product(base);
const draw = Draw(base, product);

function update() {
    base.update();
    //draw.update();
    window.requestAnimationFrame(update);
} update();
