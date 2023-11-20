export const color = {};

color.compute = (d)=>{
    const style = getComputedStyle(document.body);
    const css = (name)=> style.getPropertyValue(name);
    d.color.primary   = css('--bs-primary');
    d.color.secondary = css('--bs-secondary');
    d.color.success   = css('--bs-success');
    d.color.info      = css('--bs-info');
    d.color.warning   = css('--bs-warning');
    d.color.danger    = css('--bs-danger');
    d.color.body      = css('--bs-body-bg');
};