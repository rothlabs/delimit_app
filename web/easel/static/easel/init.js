import { Base } from 'easel/base.js';
import { Draw } from 'easel/draw.js';
import { Product } from 'easel/product.js';

const base = Base();
const draw = Draw(base);
const product = Product(base);

function update() {
    base.update(base);
    draw.update(base, draw, product);
    window.requestAnimationFrame(update);
}

update();
