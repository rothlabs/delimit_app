import * as THREE from 'three';
//import {preloadFont} from '../troika/troika-three-text.js';

export const theme = {
    mode: document.documentElement.getAttribute('data-bs-theme'),
};
export const color = {};
export const material = {};
export const font = {};
export const geometry = {
    circle: new THREE.CircleGeometry(1.5, 16),
};

theme.compute = d =>{
    //const bs_theme = document.documentElement.getAttribute('data-bs-theme');
    const style = getComputedStyle(document.body);
    const css = name => style.getPropertyValue(name);
    d.color.primary      = css('--bs-primary');
    d.color.secondary    = css('--bs-secondary');
    d.color.both = '#00a088';
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
    d.color.emphasis   = css('--bs-emphasis-color');
    d.color.border       = css('--bs-border-color');
    d.material.primary = new THREE.MeshBasicMaterial({color:d.color.primary, toneMapped:false});
    d.material.secondary = new THREE.MeshBasicMaterial({color:d.color.secondary, toneMapped:false});
    d.material.both = new THREE.MeshBasicMaterial({color:d.color.both, toneMapped:false});
    d.material.success = new THREE.MeshBasicMaterial({color:d.color.success, toneMapped:false});
    d.material.info = new THREE.MeshBasicMaterial({color:d.color.info, toneMapped:false});
    d.material.warning = new THREE.MeshBasicMaterial({color:d.color.warning, toneMapped:false});
    d.material.danger = new THREE.MeshBasicMaterial({color:d.color.danger, toneMapped:false});
    d.material.body_fg = new THREE.MeshBasicMaterial({color:d.color.body_fg, toneMapped:false});
    d.material.body_bg = new THREE.MeshBasicMaterial({color:d.color.body_bg, toneMapped:false});
    d.material.secondary_fg = new THREE.MeshBasicMaterial({color:d.color.secondary_fg, toneMapped:false});
    d.material.secondary_bg = new THREE.MeshBasicMaterial({color:d.color.secondary_bg, toneMapped:false});
    d.material.tertiary_fg = new THREE.MeshBasicMaterial({color:d.color.tertiary_fg, toneMapped:false});
    d.material.tertiary_bg = new THREE.MeshBasicMaterial({color:d.color.tertiary_bg, toneMapped:false});
    d.material.emphasis = new THREE.MeshBasicMaterial({color:d.color.emphasis, toneMapped:false});
    d.material.border = new THREE.MeshBasicMaterial({color:d.color.border, toneMapped:false});
    d.font.body = d.static_url + 'font/Inter-Medium.ttf';
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
