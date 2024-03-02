import {
    MeshBasicMaterial, MeshStandardMaterial, CircleGeometry,
    DoubleSide, FrontSide,
} from 'three';
//import {preloadFont} from '../troika/troika-three-text.js';

export const theme = {
    mode: document.documentElement.getAttribute('data-bs-theme'),
};
export const color = {};
export const material = {};
export const shaded = {};
export const font = {};
export const geometry = {
    circle: new CircleGeometry(1.5, 16),
};

theme.compute = d =>{
    //const bs_theme = document.documentElement.getAttribute('data-bs-theme');
    const style = getComputedStyle(document.body);
    const css = name => style.getPropertyValue(name);
    d.color.primary      = css('--bs-primary');
    d.color.secondary    = css('--bs-secondary');
    //d.color.both = '#00a088';
    d.color.success      = css('--bs-success');
    d.color.info         = css('--bs-info');
    d.color.warning      = css('--bs-warning');
    d.color.danger       = css('--bs-danger');
    d.color.body_fg      = css('--bs-body-color');
    d.color.body_bg      = css('--bs-body-bg');
    d.color.secondary_fg = css('--bs-secondary-color');
    d.color.secondary_bg = css('--bs-secondary-bg');
    d.color.tertiary_fg  = css('--bs-tertiary-color');
    d.color.tertiary_bg  = css('--bs-tertiary-bg');
    d.color.emphasis     = css('--bs-emphasis-color');
    d.color.border       = css('--bs-border-color');

    const toneMapped = false;
    d.material.primary = new MeshBasicMaterial({color:d.color.primary, toneMapped});
    d.material.secondary = new MeshBasicMaterial({color:d.color.secondary, toneMapped});
    //d.material.both = new MeshBasicMaterial({color:d.color.both, toneMapped});
    d.material.success = new MeshBasicMaterial({color:d.color.success, toneMapped});
    d.material.info = new MeshBasicMaterial({color:d.color.info, toneMapped});
    d.material.warning = new MeshBasicMaterial({color:d.color.warning, toneMapped});
    d.material.danger = new MeshBasicMaterial({color:d.color.danger, toneMapped});
    d.material.body_fg = new MeshBasicMaterial({color:d.color.body_fg, toneMapped});
    d.material.body_bg = new MeshBasicMaterial({color:d.color.body_bg, toneMapped});
    d.material.secondary_fg = new MeshBasicMaterial({color:d.color.secondary_fg, toneMapped});
    d.material.secondary_bg = new MeshBasicMaterial({color:d.color.secondary_bg, toneMapped});
    d.material.tertiary_fg = new MeshBasicMaterial({color:d.color.tertiary_fg, toneMapped});
    d.material.tertiary_bg = new MeshBasicMaterial({color:d.color.tertiary_bg, toneMapped});
    d.material.emphasis = new MeshBasicMaterial({color:d.color.emphasis, toneMapped});
    d.material.border = new MeshBasicMaterial({color:d.color.border, toneMapped});
    d.font.body = d.base_url + 'font/Inter-Medium.ttf';

    const side = FrontSide;
    const roughness = 0.4;
    d.shaded.primary = new MeshStandardMaterial({color:d.color.primary, toneMapped, side, roughness});
    d.shaded.secondary = new MeshStandardMaterial({color:d.color.secondary, toneMapped, side, roughness});
    d.shaded.info = new MeshStandardMaterial({color:d.color.info, toneMapped, side, roughness}); // , wireframe:true
    d.shaded.body_fg = new MeshStandardMaterial({color:d.color.body_fg, toneMapped, side, roughness});
    d.shaded.secondary_fg = new MeshStandardMaterial({color:d.color.secondary_fg, toneMapped, side, roughness});
    d.shaded.tertiary_fg = new MeshStandardMaterial({color:d.color.tertiary_fg, toneMapped, side, roughness});
    d.shaded.border = new MeshStandardMaterial({color:d.color.border, toneMapped, side, roughness}); 
    d.shaded.gray = new MeshStandardMaterial({color:'lightgray', toneMapped, side, roughness});
    //preloadFont({font:d.font.body}, ()=>{},);
};

theme.toggle = d =>{
    d.theme.mode = (d.theme.mode=='light') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', d.theme.mode)
    theme.compute(d);
};


    //d.color.low_body_contrast = bs_theme == 'light' ? css('--bs-secondary-bg') : css('--bs-body-color');  //tint(d.color.body, -15) : tint(d.color.body, 15);

// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
// https://gist.github.com/renancouto/4675192
// function tint(color, percent) {
//     var num = parseInt(color.replace("#",""),16),
//     amt = Math.round(2.55 * percent),
//     R = (num >> 16) + amt,
//     B = (num >> 8 & 0x00FF) + amt,
//     G = (num & 0x0000FF) + amt;
//     return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
// };
