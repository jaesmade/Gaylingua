import { createServer } from 'node:http';
import { createPreviewServer } from '../server.mjs';

const app = createPreviewServer();
const layouts = { phone: [390,844,1], small: [320,740,1], tablet: [768,1024,.8], desktop: [1440,1100,.43] };
createServer((request,response) => {
  const url = new URL(request.url,'http://localhost');
  const layout = layouts[url.pathname.replace('/qa/','')];
  if (url.pathname.startsWith('/qa/') && layout) {
    const [width,height,scale] = layout;
    const route = ['translate','dictionary','play','saved'].includes(url.searchParams.get('route')) ? url.searchParams.get('route') : 'translate';
    response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    response.end(`<!doctype html><html><head><title>Gaylingua layout QA · ${width}px</title></head><body style="margin:0;background:#e3e6dc;font:12px sans-serif"><p style="margin:10px;text-align:center">Gaylingua layout QA · ${width} × ${height} CSS pixels · scale ${scale}</p><div style="width:${width*scale}px;height:${height*scale}px;margin:0 auto;overflow:hidden;box-shadow:0 2px 14px #0002"><iframe title="Gaylingua ${width}px preview" src="/#${route}" style="width:${width}px;height:${height}px;border:0;transform:scale(${scale});transform-origin:top left"></iframe></div></body></html>`);
    return;
  }
  app.emit('request',request,response);
}).listen(5188,'::',()=>console.log('QA preview: http://localhost:5188 (layouts: /qa/phone, /qa/small, /qa/tablet, /qa/desktop)'));
