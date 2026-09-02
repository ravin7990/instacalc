(function(){
  const $=id=>document.getElementById(id);
  const els={
    menuToggle:$("menuToggle"),
    mainNav:$("mainNav"),
    modeBtns:[...document.querySelectorAll('.mode-pill-btn')],
    panels:[...document.querySelectorAll('.mode-panel')],
    primaryValue:$("primaryValue"),
    primaryContext:$("primaryContext"),
    primaryEyebrow:$("primaryEyebrow"),
    copyBtn:$("copyBtn"),
    copyBtnAlt:$("copyBtnAlt"),
    addLogBtn:$("addLogBtn"),
    clearLogBtn:$("clearLogBtn"),
    history:$("history"),
    topBtn:$("topBtn"),
    liveDiagram:$("liveDiagram"),
    diagramCaption:$("diagramCaption")
  };
  
  let mode='rectangle', primary={mode:'rectangle',label:'Diagonal',value:NaN,unit:'',context:''}, log=[];
  const fmt=(v,d=4)=>Number.isFinite(v)?v.toLocaleString('en-IN',{maximumFractionDigits:d}):'-';
  const num=e=>{const v=Number(e.value);return Number.isFinite(v)?v:NaN};
  const diag=(a,b)=>Math.sqrt(a*a+b*b);
  const gcd=(a,b)=>{let x=Math.abs(a),y=Math.abs(b);while(y){const t=x%y;x=y;y=t}return x||1};

  function setPrimary(m,label,val,unit,ctx){
    primary={mode:m,label:label,value:val,unit:unit||'',context:ctx||''};
    const formattedVal = Number.isFinite(val)?fmt(val)+(unit?' '+unit:''):'-';
    els.primaryValue.textContent = formattedVal;
    els.primaryContext.textContent = ctx||'Enter valid dimensions.';
    els.primaryEyebrow.textContent = label;
    
    const mobVal = document.getElementById("mobileSummaryVal");
    const mobLabel = document.getElementById("mobileSummaryLabel");
    if(mobVal) mobVal.textContent = formattedVal;
    if(mobLabel) mobLabel.textContent = label;
  }

  function drawPlaceholder(msg){
    if(!els.liveDiagram)return;
    els.liveDiagram.innerHTML='<rect x="14" y="14" width="292" height="192" rx="12" fill="#f4fbfa" stroke="#c7dedc"/><text x="160" y="110" text-anchor="middle" fill="#4b6768" font-size="13">'+msg+'</text>';
    if(els.diagramCaption)els.diagramCaption.textContent=msg;
  }

  function drawDiagram(){
    if(!els.liveDiagram)return;
    const W=320,H=220,P=26;
    if(mode==='rectangle'){
      const l=num($('rectLength')),w=num($('rectWidth')),u=$('rectUnit').value;
      if(!(l>0&&w>0)){drawPlaceholder('Enter rectangle length and width.');return;}
      const d=diag(l,w);
      const s=Math.min((W-2*P)/l,(H-2*P)/w),rw=l*s,rh=w*s,x=(W-rw)/2,y=(H-rh)/2,mx=x+rw/2,my=y+rh/2;
      els.liveDiagram.innerHTML=
        '<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+rw.toFixed(2)+'" height="'+rh.toFixed(2)+'" rx="6" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+
        '<line x1="'+x.toFixed(2)+'" y1="'+y.toFixed(2)+'" x2="'+(x+rw).toFixed(2)+'" y2="'+(y+rh).toFixed(2)+'" stroke="#e76f51" stroke-width="2.6" stroke-dasharray="6 4"/>'+
        '<text x="'+mx.toFixed(2)+'" y="'+(y-8).toFixed(2)+'" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Length = '+fmt(l,2)+' '+u+'</text>'+
        '<text x="'+(x-8).toFixed(2)+'" y="'+my.toFixed(2)+'" text-anchor="end" fill="#0c5f5b" font-weight="700" font-size="12">Width = '+fmt(w,2)+' '+u+'</text>'+
        '<text x="'+(mx+8).toFixed(2)+'" y="'+(my+4).toFixed(2)+'" fill="#e76f51" font-weight="700" font-size="12">d = '+fmt(d,2)+' '+u+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Rectangle: d = √(l² + w²)';
      return;
    }
    if(mode==='square'){
      const sVal=num($('sqSide')),u=$('sqUnit').value;
      if(!(sVal>0)){drawPlaceholder('Enter square side.');return;}
      const d=sVal*Math.sqrt(2);
      const side=Math.max(42,Math.min(Math.min(W-2*P,H-2*P),sVal*8)),x=(W-side)/2,y=(H-side)/2,mx=x+side/2,my=y+side/2;
      els.liveDiagram.innerHTML=
        '<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+side.toFixed(2)+'" height="'+side.toFixed(2)+'" rx="6" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+
        '<line x1="'+x.toFixed(2)+'" y1="'+y.toFixed(2)+'" x2="'+(x+side).toFixed(2)+'" y2="'+(y+side).toFixed(2)+'" stroke="#e76f51" stroke-width="2.6" stroke-dasharray="6 4"/>'+
        '<text x="'+mx.toFixed(2)+'" y="'+(y-8).toFixed(2)+'" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Side = '+fmt(sVal,2)+' '+u+'</text>'+
        '<text x="'+(mx+8).toFixed(2)+'" y="'+(my+4).toFixed(2)+'" fill="#e76f51" font-weight="700" font-size="12">d = '+fmt(d,2)+' '+u+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Square: d = s × √2';
      return;
    }
    if(mode==='triangle'){
      const calcType = $('triCalcType').value;
      const u = $('triUnit').value;
      if (calcType === 'equilateral') {
        const s = num($('triSideA'));
        if (!(s > 0)) { drawPlaceholder('Enter side length.'); return; }
        const h = (Math.sqrt(3) / 2) * s;
        const scale = Math.min((W - 2 * P) / s, (H - 2 * P) / h);
        const tw = s * scale, th = h * scale;
        const x1 = W / 2, y1 = (H - th) / 2;
        const x2 = x1 - tw / 2, y2 = y1 + th;
        const x3 = x1 + tw / 2, y3 = y1 + th;
        els.liveDiagram.innerHTML =
          '<polygon points="' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' + x3.toFixed(1) + ',' + y3.toFixed(1) + '" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>' +
          '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x1.toFixed(1) + '" y2="' + y3.toFixed(1) + '" stroke="#e76f51" stroke-width="2.5" stroke-dasharray="6 4"/>' +
          '<text x="' + x1.toFixed(1) + '" y="' + (y1 - 8).toFixed(1) + '" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Side = ' + fmt(s, 2) + ' ' + u + '</text>' +
          '<text x="' + (x1 + 10).toFixed(1) + '" y="' + (y1 + th / 2).toFixed(1) + '" fill="#e76f51" font-weight="700" font-size="12">h = ' + fmt(h, 2) + ' ' + u + '</text>';
        if (els.diagramCaption) els.diagramCaption.textContent = 'Equilateral Triangle Altitude: h = (√3 / 2) × s';
        return;
      }
      const a = num($('triSideA')), bVal = num($('triSideB'));
      if (calcType === 'hypotenuse') {
        if (!(a > 0 && bVal > 0)) { drawPlaceholder('Enter Leg a and Leg b.'); return; }
        const c = Math.sqrt(a * a + bVal * bVal);
        const scale = Math.min((W - 2 * P - 40) / a, (H - 2 * P - 30) / bVal);
        const rw = a * scale, rh = bVal * scale;
        const x = (W - rw) / 2 + 10, y = (H - rh) / 2;
        const x1 = x, y1 = y + rh, x2 = x + rw, y2 = y + rh, x3 = x, y3 = y;
        const sq = Math.min(14, Math.min(rw, rh) * 0.2);
        els.liveDiagram.innerHTML =
          '<polygon points="' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' + x3.toFixed(1) + ',' + y3.toFixed(1) + '" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>' +
          '<path d="M ' + (x1 + sq).toFixed(1) + ' ' + y1.toFixed(1) + ' L ' + (x1 + sq).toFixed(1) + ' ' + (y1 - sq).toFixed(1) + ' L ' + x1.toFixed(1) + ' ' + (y1 - sq).toFixed(1) + '" fill="none" stroke="#0f7d78" stroke-width="1.5"/>' +
          '<line x1="' + x3.toFixed(1) + '" y1="' + y3.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#e76f51" stroke-width="2.8" stroke-dasharray="6 4"/>' +
          '<text x="' + (x1 + rw / 2).toFixed(1) + '" y="' + (y1 + 18).toFixed(1) + '" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Leg a = ' + fmt(a, 2) + ' ' + u + '</text>' +
          '<text x="' + (x1 - 8).toFixed(1) + '" y="' + (y + rh / 2).toFixed(1) + '" text-anchor="end" fill="#0c5f5b" font-weight="700" font-size="12">Leg b = ' + fmt(bVal, 2) + ' ' + u + '</text>' +
          '<text x="' + (x1 + rw / 2 + 10).toFixed(1) + '" y="' + (y + rh / 2 - 6).toFixed(1) + '" fill="#e76f51" font-weight="700" font-size="12">c = ' + fmt(c, 2) + ' ' + u + '</text>';
        if (els.diagramCaption) els.diagramCaption.textContent = 'Right Triangle Hypotenuse: c = √(a² + b²)';
        return;
      } else {
        if (!(a > 0 && bVal > a)) { drawPlaceholder('Enter Leg a < Hypotenuse c.'); return; }
        const b = Math.sqrt(bVal * bVal - a * a);
        const scale = Math.min((W - 2 * P - 40) / a, (H - 2 * P - 30) / b);
        const rw = a * scale, rh = b * scale;
        const x = (W - rw) / 2 + 10, y = (H - rh) / 2;
        const x1 = x, y1 = y + rh, x2 = x + rw, y2 = y + rh, x3 = x, y3 = y;
        const sq = Math.min(14, Math.min(rw, rh) * 0.2);
        els.liveDiagram.innerHTML =
          '<polygon points="' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' ' + x3.toFixed(1) + ',' + y3.toFixed(1) + '" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>' +
          '<path d="M ' + (x1 + sq).toFixed(1) + ' ' + y1.toFixed(1) + ' L ' + (x1 + sq).toFixed(1) + ' ' + (y1 - sq).toFixed(1) + ' L ' + x1.toFixed(1) + ' ' + (y1 - sq).toFixed(1) + '" fill="none" stroke="#0f7d78" stroke-width="1.5"/>' +
          '<line x1="' + x3.toFixed(1) + '" y1="' + y3.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="#e76f51" stroke-width="2.8" stroke-dasharray="6 4"/>' +
          '<text x="' + (x1 + rw / 2).toFixed(1) + '" y="' + (y1 + 18).toFixed(1) + '" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Leg a = ' + fmt(a, 2) + ' ' + u + '</text>' +
          '<text x="' + (x1 - 8).toFixed(1) + '" y="' + (y + rh / 2).toFixed(1) + '" text-anchor="end" fill="#0c5f5b" font-weight="700" font-size="12">Missing b = ' + fmt(b, 2) + ' ' + u + '</text>' +
          '<text x="' + (x1 + rw / 2 + 10).toFixed(1) + '" y="' + (y + rh / 2 - 6).toFixed(1) + '" fill="#e76f51" font-weight="700" font-size="12">c = ' + fmt(bVal, 2) + ' ' + u + '</text>';
        if (els.diagramCaption) els.diagramCaption.textContent = 'Right Triangle Leg: b = √(c² - a²)';
        return;
      }
    }
    if(mode==='parallelogram'){
      const a=num($('paraSideA')),b=num($('paraSideB')),ang=num($('paraAngle')),u=$('paraUnit').value;
      if(!(a>0&&b>0&&ang>0&&ang<180)){drawPlaceholder('Enter sides and angle.');return;}
      const rad=ang*Math.PI/180,p=Math.sqrt(a*a+b*b-2*a*b*Math.cos(rad)),q=Math.sqrt(a*a+b*b+2*a*b*Math.cos(rad));
      const sk=Math.cos(rad)*0.3,s=Math.min((W-2*P-40)/(a+Math.abs(b*sk)),(H-2*P)/b);
      const rw=a*s,rh=b*s*Math.sin(rad),ox=b*s*Math.cos(rad);
      const cx=(W-(rw+Math.abs(ox)))/2,cy=(H-rh)/2;
      const x1=cx+(ox>0?0:-ox),y1=cy+rh,x2=x1+rw,y2=y1,x3=x2+ox,y3=cy,x4=x1+ox,y4=cy;
      els.liveDiagram.innerHTML=
        '<polygon points="'+x1.toFixed(1)+','+y1.toFixed(1)+' '+x2.toFixed(1)+','+y2.toFixed(1)+' '+x3.toFixed(1)+','+y3.toFixed(1)+' '+x4.toFixed(1)+','+y4.toFixed(1)+'" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+
        '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x3.toFixed(1)+'" y2="'+y3.toFixed(1)+'" stroke="#e76f51" stroke-width="2.4" stroke-dasharray="6 4"/>'+
        '<line x1="'+x2.toFixed(1)+'" y1="'+y2.toFixed(1)+'" x2="'+x4.toFixed(1)+'" y2="'+y4.toFixed(1)+'" stroke="#ee9f2e" stroke-width="2" stroke-dasharray="5 3"/>'+
        '<text x="160" y="16" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Sides = '+fmt(a,2)+', '+fmt(b,2)+' '+u+' | '+fmt(ang,1)+'°</text>'+
        '<text x="160" y="212" text-anchor="middle" fill="#e76f51" font-weight="700" font-size="12">p = '+fmt(p,2)+' '+u+', q = '+fmt(q,2)+' '+u+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Parallelogram Diagonals: Law of Cosines';
      return;
    }
    if(mode==='rhombus'){
      const s=num($('rhombusSide')),ang=num($('rhombusAngle')),u=$('rhombusUnit').value;
      if(!(s>0&&ang>0&&ang<180)){drawPlaceholder('Enter side and angle.');return;}
      const rad=ang*Math.PI/180,p=2*s*Math.sin(rad/2),q=2*s*Math.cos(rad/2);
      const sk=Math.cos(rad)*0.3,sc=Math.min((W-2*P-40)/(s+Math.abs(s*sk)),(H-2*P)/s);
      const rw=s*sc,rh=s*sc*Math.sin(rad),ox=s*sc*Math.cos(rad);
      const cx=(W-(rw+Math.abs(ox)))/2,cy=(H-rh)/2;
      const x1=cx+(ox>0?0:-ox),y1=cy+rh,x2=x1+rw,y2=y1,x3=x2+ox,y3=cy,x4=x1+ox,y4=cy;
      els.liveDiagram.innerHTML=
        '<polygon points="'+x1.toFixed(1)+','+y1.toFixed(1)+' '+x2.toFixed(1)+','+y2.toFixed(1)+' '+x3.toFixed(1)+','+y3.toFixed(1)+' '+x4.toFixed(1)+','+y4.toFixed(1)+'" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+
        '<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x3.toFixed(1)+'" y2="'+y3.toFixed(1)+'" stroke="#e76f51" stroke-width="2.4" stroke-dasharray="6 4"/>'+
        '<line x1="'+x2.toFixed(1)+'" y1="'+y2.toFixed(1)+'" x2="'+x4.toFixed(1)+'" y2="'+y4.toFixed(1)+'" stroke="#ee9f2e" stroke-width="2" stroke-dasharray="5 3"/>'+
        '<text x="160" y="212" text-anchor="middle" fill="#e76f51" font-weight="700" font-size="12">p = '+fmt(p,2)+', q = '+fmt(q,2)+' '+u+' (Perpendicular)</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Rhombus Diagonals: Perpendicular Bisectors';
      return;
    }
    if(mode==='cuboid'){
      const l=num($('boxLength')),w=num($('boxWidth')),h=num($('boxHeight')),u=$('boxUnit').value;
      if(!(l>0&&w>0&&h>0)){drawPlaceholder('Enter box dimensions.');return;}
      const d=Math.sqrt(l*l+w*w+h*h);
      const s=Math.min(130/Math.max(l,w),90/Math.max(w,h),90/Math.max(l,h)),fw=l*s,fh=w*s,ox=Math.min(48,h*s*0.45),oy=Math.min(34,h*s*0.3),x=(W-fw-ox)/2,y=(H-fh-oy)/2;
      const fx=x+ox,fy=y+oy;
      els.liveDiagram.innerHTML=
        '<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+fw.toFixed(2)+'" height="'+fh.toFixed(2)+'" fill="#edf7f6" stroke="#0f7d78"/>'+
        '<rect x="'+fx.toFixed(2)+'" y="'+fy.toFixed(2)+'" width="'+fw.toFixed(2)+'" height="'+fh.toFixed(2)+'" fill="#d9f1ef" stroke="#0f7d78"/>'+
        '<line x1="'+x.toFixed(2)+'" y1="'+y.toFixed(2)+'" x2="'+fx.toFixed(2)+'" y2="'+fy.toFixed(2)+'" stroke="#0f7d78"/>'+
        '<line x1="'+(x+fw).toFixed(2)+'" y1="'+y.toFixed(2)+'" x2="'+(fx+fw).toFixed(2)+'" y2="'+fy.toFixed(2)+'" stroke="#0f7d78"/>'+
        '<line x1="'+x.toFixed(2)+'" y1="'+(y+fh).toFixed(2)+'" x2="'+fx.toFixed(2)+'" y2="'+(fy+fh).toFixed(2)+'" stroke="#0f7d78"/>'+
        '<line x1="'+(x+fw).toFixed(2)+'" y1="'+(y+fh).toFixed(2)+'" x2="'+(fx+fw).toFixed(2)+'" y2="'+(fy+fh).toFixed(2)+'" stroke="#0f7d78"/>'+
        '<line x1="'+x.toFixed(2)+'" y1="'+y.toFixed(2)+'" x2="'+(fx+fw).toFixed(2)+'" y2="'+(fy+fh).toFixed(2)+'" stroke="#e76f51" stroke-width="2.6" stroke-dasharray="6 4"/>'+
        '<text x="'+(x+fw/2).toFixed(2)+'" y="'+(y-8).toFixed(2)+'" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">l='+fmt(l,2)+'</text>'+
        '<text x="'+(x-8).toFixed(2)+'" y="'+(y+fh/2).toFixed(2)+'" text-anchor="end" fill="#0c5f5b" font-weight="700" font-size="12">w='+fmt(w,2)+'</text>'+
        '<text x="'+(x+fw/2+ox/2).toFixed(2)+'" y="'+(y+fh/2+oy/2+4).toFixed(2)+'" fill="#e76f51" font-weight="700" font-size="12">Space d = '+fmt(d,2)+' '+u+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='3D Space Diagonal: d = √(l² + w² + h²)';
      return;
    }
    if(mode==='polygon'){
      const n=Math.round(num($('polySides')));
      if(!(Number.isFinite(n)&&n>=3)){drawPlaceholder('Enter polygon sides n >= 3.');return;}
      const k=Math.max(3,Math.min(n,16)),cx=160,cy=110,r=76,pts=[];
      for(let i=0;i<k;i+=1){const a=-Math.PI/2+2*Math.PI*i/k;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
      const pstr=pts.map(p=>p[0].toFixed(2)+','+p[1].toFixed(2)).join(' ');
      const d1=k>2?'<line x1="'+pts[0][0].toFixed(2)+'" y1="'+pts[0][1].toFixed(2)+'" x2="'+pts[2][0].toFixed(2)+'" y2="'+pts[2][1].toFixed(2)+'" stroke="#e76f51" stroke-width="2.3" stroke-dasharray="6 4"/>':'';
      const d2=k>3?'<line x1="'+pts[0][0].toFixed(2)+'" y1="'+pts[0][1].toFixed(2)+'" x2="'+pts[3][0].toFixed(2)+'" y2="'+pts[3][1].toFixed(2)+'" stroke="#e76f51" stroke-width="2" stroke-dasharray="6 4"/>':'';
      els.liveDiagram.innerHTML='<polygon points="'+pstr+'" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+d1+d2+'<text x="160" y="22" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">n='+n+' sides</text><text x="160" y="212" text-anchor="middle" fill="#e76f51" font-weight="700" font-size="12">Sample diagonals shown</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Polygon Diagonals: n × (n - 3) ÷ 2';
      return;
    }
    if(mode==='screen'){
      const w=Math.round(num($('scrW'))),h=Math.round(num($('scrH'))),ppi=num($('scrPpi'));
      if(!(Number.isFinite(w)&&Number.isFinite(h)&&w>0&&h>0)){drawPlaceholder('Enter screen resolution.');return;}
      const d=diag(w,h);
      const s=Math.min((W-2*P)/w,(H-2*P)/h),rw=w*s,rh=h*s,x=(W-rw)/2,y=(H-rh)/2,mx=x+rw/2,my=y+rh/2;
      const g=gcd(w,h);
      els.liveDiagram.innerHTML=
        '<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+rw.toFixed(2)+'" height="'+rh.toFixed(2)+'" rx="8" fill="#0f172a" stroke="#334155"/>'+
        '<rect x="'+(x+6).toFixed(2)+'" y="'+(y+6).toFixed(2)+'" width="'+(rw-12).toFixed(2)+'" height="'+(rh-12).toFixed(2)+'" fill="#d9f1ef"/>'+
        '<line x1="'+(x+6).toFixed(2)+'" y1="'+(y+6).toFixed(2)+'" x2="'+(x+rw-6).toFixed(2)+'" y2="'+(y+rh-6).toFixed(2)+'" stroke="#e76f51" stroke-width="2.4" stroke-dasharray="6 4"/>'+
        '<text x="'+mx.toFixed(2)+'" y="'+(y-8).toFixed(2)+'" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">'+w+' × '+h+' px</text>'+
        '<text x="'+(mx+8).toFixed(2)+'" y="'+(my+4).toFixed(2)+'" fill="#e76f51" font-weight="700" font-size="12">Diag = '+fmt(d,2)+' px</text>'+
        '<text x="160" y="212" text-anchor="middle" fill="#0c5f5b" font-size="12">Aspect '+(w/g)+':'+(h/g)+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Screen Display Diagonal';
      return;
    }
    if(mode==='room'){
      const l=num($('roomL')),w=num($('roomW')),m=num($('roomM')),u=$('roomUnit').value;
      if(!(l>0&&w>0)){drawPlaceholder('Enter room dimensions.');return;}
      const d=diag(l,w);
      const s=Math.min((W-2*P)/l,(H-2*P)/w),rw=l*s,rh=w*s,x=(W-rw)/2,y=(H-rh)/2,mx=x+rw/2,my=y+rh/2;
      const ex=x,ey=y,fx=x+rw,fy=y+rh;
      let measuredLine='';
      if(Number.isFinite(m)&&m>0){const ratio=Math.max(0.6,Math.min(1.4,m/d)),cx=(ex+fx)/2,cy=(ey+fy)/2,vx=fx-ex,vy=fy-ey,mx1=cx-vx*ratio/2,my1=cy-vy*ratio/2,mx2=cx+vx*ratio/2,my2=cy+vy*ratio/2;measuredLine='<line x1="'+mx1.toFixed(2)+'" y1="'+my1.toFixed(2)+'" x2="'+mx2.toFixed(2)+'" y2="'+my2.toFixed(2)+'" stroke="#3459c9" stroke-width="2"/>';}
      els.liveDiagram.innerHTML=
        '<rect x="'+x.toFixed(2)+'" y="'+y.toFixed(2)+'" width="'+rw.toFixed(2)+'" height="'+rh.toFixed(2)+'" rx="6" fill="#d9f1ef" stroke="#0f7d78" stroke-width="2"/>'+
        '<line x1="'+ex.toFixed(2)+'" y1="'+ey.toFixed(2)+'" x2="'+fx.toFixed(2)+'" y2="'+fy.toFixed(2)+'" stroke="#e76f51" stroke-width="2.6" stroke-dasharray="6 4"/>'+
        measuredLine+
        '<text x="'+mx.toFixed(2)+'" y="'+(y-8).toFixed(2)+'" text-anchor="middle" fill="#0c5f5b" font-weight="700" font-size="12">Length = '+fmt(l,2)+' '+u+'</text>'+
        '<text x="'+(mx+8).toFixed(2)+'" y="'+(my+4).toFixed(2)+'" fill="#e76f51" font-weight="700" font-size="12">Expected = '+fmt(d,2)+' '+u+'</text>';
      if(els.diagramCaption)els.diagramCaption.textContent='Room Cross-Measurement Squaring';
      return;
    }
    drawPlaceholder('Select a mode to view diagram.');
  }

  function updateRectangle(){
    const l=num($('rectLength')),w=num($('rectWidth')),u=$('rectUnit').value;
    if(l<=0||w<=0){
      $('rectDiagonal').textContent='-';$('rectPerimeter').textContent='-';$('rectArea').textContent='-';
      setPrimary('rectangle','Rectangle Diagonal',NaN,u,'Enter positive length & width.');return;
    }
    const d=diag(l,w);
    $('rectDiagonal').textContent=fmt(d)+' '+u;
    $('rectPerimeter').textContent=fmt(2*(l+w))+' '+u;
    $('rectArea').textContent=fmt(l*w)+' '+u+'²';
    setPrimary('rectangle','Rectangle Diagonal',d,u,'Diagonal: d = √(l² + w²)');
  }

  function updateSquare(){
    const s=num($('sqSide')),u=$('sqUnit').value;
    if(s<=0){
      $('sqDiagonal').textContent='-';$('sqPerimeter').textContent='-';$('sqArea').textContent='-';
      setPrimary('square','Square Diagonal',NaN,u,'Enter positive side length.');return;
    }
    const d=s*Math.sqrt(2);
    $('sqDiagonal').textContent=fmt(d)+' '+u;
    $('sqPerimeter').textContent=fmt(4*s)+' '+u;
    $('sqArea').textContent=fmt(s*s)+' '+u+'²';
    setPrimary('square','Square Diagonal',d,u,'Diagonal: d = s × √2');
  }

  function updateTriangle() {
    const calcType = $('triCalcType').value;
    const u = $('triUnit').value;
    const bField = $('triSideBField');
    const aLabel = $('triSideALabel'), bLabel = $('triSideBLabel');
    
    if (calcType === 'equilateral') {
      bField.style.display = 'none';
      aLabel.textContent = 'Side Length (s)';
      const s = num($('triSideA'));
      if (!(s > 0)) {
        $('triResultValue').textContent = '-'; $('triPerimeter').textContent = '-'; $('triArea').textContent = '-'; $('triAngles').textContent = '-';
        setPrimary('triangle', 'Equilateral Altitude', NaN, u, 'Enter side length.');
        return;
      }
      const h = (Math.sqrt(3) / 2) * s;
      $('triResultLabel').textContent = 'Altitude / Height (h)';
      $('triResultValue').textContent = fmt(h) + ' ' + u;
      $('triPerimeter').textContent = fmt(3 * s) + ' ' + u;
      $('triArea').textContent = fmt((Math.sqrt(3) / 4) * s * s) + ' ' + u + '²';
      $('triAngles').textContent = '60°, 60°, 60°';
      setPrimary('triangle', 'Altitude (h)', h, u, 'Equilateral height h = (√3/2) × s');
      return;
    }
    
    bField.style.display = 'grid';
    if (calcType === 'hypotenuse') {
      aLabel.textContent = 'Leg a (Base)';
      bLabel.textContent = 'Leg b (Height)';
      const a = num($('triSideA')), b = num($('triSideB'));
      if (!(a > 0 && b > 0)) {
        $('triResultValue').textContent = '-'; $('triPerimeter').textContent = '-'; $('triArea').textContent = '-'; $('triAngles').textContent = '-';
        setPrimary('triangle', 'Triangle Hypotenuse', NaN, u, 'Enter perpendicular legs.');
        return;
      }
      const c = Math.sqrt(a * a + b * b);
      const angA = Math.atan2(a, b) * 180 / Math.PI;
      const angB = 90 - angA;
      $('triResultLabel').textContent = 'Hypotenuse / Diagonal (c)';
      $('triResultValue').textContent = fmt(c) + ' ' + u;
      $('triPerimeter').textContent = fmt(a + b + c) + ' ' + u;
      $('triArea').textContent = fmt(0.5 * a * b) + ' ' + u + '²';
      $('triAngles').textContent = 'α = ' + fmt(angB, 1) + '°, β = ' + fmt(angA, 1) + '°, γ = 90°';
      setPrimary('triangle', 'Hypotenuse (c)', c, u, 'Right triangle diagonal c = √(a² + b²)');
    } else {
      aLabel.textContent = 'Known Leg (a)';
      bLabel.textContent = 'Hypotenuse (c)';
      const a = num($('triSideA')), c = num($('triSideB'));
      if (!(a > 0 && c > 0 && c > a)) {
        $('triResultValue').textContent = '-'; $('triPerimeter').textContent = '-'; $('triArea').textContent = '-'; $('triAngles').textContent = '-';
        setPrimary('triangle', 'Missing Leg b', NaN, u, 'Hypotenuse must exceed leg.');
        return;
      }
      const b = Math.sqrt(c * c - a * a);
      const angA = Math.asin(a / c) * 180 / Math.PI;
      const angB = 90 - angA;
      $('triResultLabel').textContent = 'Missing Leg (b)';
      $('triResultValue').textContent = fmt(b) + ' ' + u;
      $('triPerimeter').textContent = fmt(a + b + c) + ' ' + u;
      $('triArea').textContent = fmt(0.5 * a * b) + ' ' + u + '²';
      $('triAngles').textContent = 'α = ' + fmt(angA, 1) + '°, β = ' + fmt(angB, 1) + '°, γ = 90°';
      setPrimary('triangle', 'Missing Leg b', b, u, 'Leg b = √(c² - a²)');
    }
  }

  function updateParallelogram(){
    const a=num($('paraSideA')),b=num($('paraSideB')),ang=num($('paraAngle')),u=$('paraUnit').value;
    if(a<=0||b<=0||ang<=0||ang>=180){
      $('paraDiag1').textContent='-';$('paraDiag2').textContent='-';$('paraArea').textContent='-';$('paraPerimeter').textContent='-';
      setPrimary('parallelogram','Parallelogram Diagonals',NaN,u,'Enter sides & angle.');return;
    }
    const rad=ang*Math.PI/180;
    const p=Math.sqrt(a*a+b*b-2*a*b*Math.cos(rad));
    const q=Math.sqrt(a*a+b*b+2*a*b*Math.cos(rad));
    $('paraDiag1').textContent=fmt(p)+' '+u;
    $('paraDiag2').textContent=fmt(q)+' '+u;
    $('paraArea').textContent=fmt(a*b*Math.sin(rad))+' '+u+'²';
    $('paraPerimeter').textContent=fmt(2*(a+b))+' '+u;
    setPrimary('parallelogram','Shorter Diag (p)',p,u,'p = √(a² + b² - 2ab·cos θ)');
  }

  function updateRhombus(){
    const s=num($('rhombusSide')),ang=num($('rhombusAngle')),u=$('rhombusUnit').value;
    if(s<=0||ang<=0||ang>=180){
      $('rhombusDiag1').textContent='-';$('rhombusDiag2').textContent='-';$('rhombusArea').textContent='-';$('rhombusPerimeter').textContent='-';
      setPrimary('rhombus','Rhombus Diagonals',NaN,u,'Enter side & angle.');return;
    }
    const rad=ang*Math.PI/180;
    const p=2*s*Math.sin(rad/2);
    const q=2*s*Math.cos(rad/2);
    $('rhombusDiag1').textContent=fmt(p)+' '+u;
    $('rhombusDiag2').textContent=fmt(q)+' '+u;
    $('rhombusArea').textContent=fmt((p*q)/2)+' '+u+'²';
    $('rhombusPerimeter').textContent=fmt(4*s)+' '+u;
    setPrimary('rhombus','Diagonal p',p,u,'Diagonals intersect at 90°');
  }

  function updateCuboid(){
    const l=num($('boxLength')),w=num($('boxWidth')),h=num($('boxHeight')),u=$('boxUnit').value;
    if(l<=0||w<=0||h<=0){
      $('boxDiagonal').textContent='-';$('boxFaceLW').textContent='-';$('boxFaceLH').textContent='-';$('boxFaceWH').textContent='-';
      setPrimary('cuboid','Cuboid Space Diagonal',NaN,u,'Enter dimensions.');return;
    }
    const d=Math.sqrt(l*l+w*w+h*h);
    $('boxDiagonal').textContent=fmt(d)+' '+u;
    $('boxFaceLW').textContent=fmt(diag(l,w))+' '+u;
    $('boxFaceLH').textContent=fmt(diag(l,h))+' '+u;
    $('boxFaceWH').textContent=fmt(diag(w,h))+' '+u;
    setPrimary('cuboid','Space Diagonal',d,u,'3D Space d = √(l² + w² + h²)');
  }

  function updatePolygon(){
    const n=Math.round(num($('polySides')));
    if(!Number.isFinite(n)||n<3){
      $('polyDiagonals').textContent='-';$('polyVertex').textContent='-';
      setPrimary('polygon','Polygon Diagonals',NaN,'','Enter n ≥ 3.');return;
    }
    const total=(n*(n-3))/2;
    $('polyDiagonals').textContent=fmt(total,0);
    $('polyVertex').textContent=fmt(n-3,0);
    setPrimary('polygon','Total Diagonals',total,'','n × (n - 3) ÷ 2');
  }

  function updateScreen(){
    const w=Math.round(num($('scrW'))),h=Math.round(num($('scrH'))),ppi=num($('scrPpi'));
    if(!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0){
      $('scrDiagPx').textContent='-';$('scrAspect').textContent='-';$('scrDiagIn').textContent='-';$('scrDiagCm').textContent='-';
      setPrimary('screen','Screen Diagonal',NaN,'','Enter resolution.');return;
    }
    const d=diag(w,h),g=gcd(w,h);
    $('scrDiagPx').textContent=fmt(d,2)+' px';
    $('scrAspect').textContent=(w/g)+':'+(h/g);
    if(Number.isFinite(ppi)&&ppi>0){
      const i=d/ppi,c=i*2.54;
      $('scrDiagIn').textContent=fmt(i,2)+' in';
      $('scrDiagCm').textContent=fmt(c,2)+' cm';
      setPrimary('screen','Screen Size',i,'in','Calculated from '+w+'×'+h+' @ '+ppi+' PPI');
    } else {
      $('scrDiagIn').textContent='Add PPI';
      $('scrDiagCm').textContent='Add PPI';
      setPrimary('screen','Screen Pixels',d,'px','Add PPI for physical inch size.');
    }
  }

  function updateRoom(){
    const l=num($('roomL')),w=num($('roomW')),m=num($('roomM')),u=$('roomUnit').value;
    if(l<=0||w<=0){
      $('roomExpected').textContent='-';$('roomDiff').textContent='-';$('roomStatus').textContent='Enter room size';
      setPrimary('room','Room Diagonal',NaN,u,'Enter dimensions.');return;
    }
    const d=diag(l,w);
    $('roomExpected').textContent=fmt(d)+' '+u;
    if(Number.isFinite(m)&&m>0){
      const diff=m-d,tol=d*.005;
      $('roomDiff').textContent=(diff>=0?'+':'')+fmt(diff)+' '+u;
      $('roomStatus').textContent=Math.abs(diff)<=tol?'✓ Perfectly Square (within 0.5%)':'⚠️ Out of Square — Adjust corners';
      $('roomStatus').style.color=Math.abs(diff)<=tol?'#1f9f67':'#e76f51';
    } else {
      $('roomDiff').textContent='Add measured';
      $('roomStatus').textContent='Enter tape measurement to verify';
      $('roomStatus').style.color='var(--ic-text)';
    }
    setPrimary('room','Expected Diagonal',d,u,'Corner-to-corner expected distance.');
  }

  function updateActive(){
    if(mode==='rectangle')updateRectangle();
    else if(mode==='square')updateSquare();
    else if(mode==='triangle')updateTriangle();
    else if(mode==='parallelogram')updateParallelogram();
    else if(mode==='rhombus')updateRhombus();
    else if(mode==='cuboid')updateCuboid();
    else if(mode==='polygon')updatePolygon();
    else if(mode==='screen')updateScreen();
    else if(mode==='room')updateRoom();
    drawDiagram();
  }

  function switchMode(m){
    mode=m;
    els.modeBtns.forEach(b=>{
      const on=b.dataset.mode===m;
      b.classList.toggle('active',on);
      b.setAttribute('aria-selected',String(on));
    });
    els.panels.forEach(p=>p.classList.toggle('active',p.dataset.panel===m));
    updateActive();
  }

  function saveLog(){try{localStorage.setItem('diagLog',JSON.stringify(log));}catch(e){}}
  function loadLog(){try{const raw=localStorage.getItem('diagLog');log=raw?JSON.parse(raw):[];if(!Array.isArray(log))log=[];}catch(e){log=[];}}
  function renderLog(){
    if(!log.length){els.history.innerHTML='<div style="font-size:0.85rem;color:var(--ic-text-muted);text-align:center;padding:1rem;">No calculations saved yet.</div>';return;}
    els.history.innerHTML=log.slice(-10).reverse().map(e=>
      '<div class="history-entry"><div><small style="color:var(--ic-text-muted);display:block;">'+e.time+'</small><strong>'+e.mode.toUpperCase()+': '+e.value+'</strong></div><span style="font-size:0.75rem;color:var(--ic-text-muted);">'+e.context+'</span></div>'
    ).join('');
  }
  function addLog(){
    if(!Number.isFinite(primary.value))return;
    const v=fmt(primary.value)+(primary.unit?' '+primary.unit:'');
    const rec={time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),mode:primary.mode,value:v,context:primary.context};
    const last=log[log.length-1];
    if(last&&last.mode===rec.mode&&last.value===rec.value)return;
    log.push(rec);
    if(log.length>30)log=log.slice(-30);
    saveLog();renderLog();
  }
  function clearLog(){log=[];saveLog();renderLog();}
  function copyPrimary(){
    if(!Number.isFinite(primary.value))return;
    const t=primary.label+': '+fmt(primary.value)+(primary.unit?' '+primary.unit:'');
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(()=>{
        const original = els.copyBtn.innerHTML;
        els.copyBtn.innerHTML = '<i class="fas fa-check" style="color:#1f9f67"></i>';
        setTimeout(()=>els.copyBtn.innerHTML = original, 1800);
      });
    }
  }

  function setupNav(){
    els.menuToggle.addEventListener('click',()=>{
      const open=els.mainNav.classList.toggle('open');
      els.menuToggle.setAttribute('aria-expanded',String(open));
    });
  }
  
  function setupTop(){
    window.addEventListener('scroll',()=>{
      els.topBtn.classList.toggle('show',window.scrollY>280);
    },{passive:true});
    els.topBtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  function wireInputs(){
    ['rectLength','rectWidth','rectUnit','sqSide','sqUnit','triCalcType','triSideA','triSideB','triUnit','paraSideA','paraSideB','paraAngle','paraUnit','rhombusSide','rhombusAngle','rhombusUnit','boxLength','boxWidth','boxHeight','boxUnit','polySides','scrW','scrH','scrPpi','roomL','roomW','roomM','roomUnit'].forEach(id=>{
      const e=$(id);if(e){e.addEventListener('input',updateActive);e.addEventListener('change',updateActive);}
    });
  }

  // Preset Chips Listener
  const triChips = document.querySelectorAll('#triPresetChips .chip');
  triChips.forEach(chip => {
    chip.addEventListener('click', function() {
      const aVal = this.dataset.a;
      const bVal = this.dataset.b;
      const tVal = this.dataset.type;
      if ($('triCalcType')) $('triCalcType').value = tVal;
      if ($('triSideA')) $('triSideA').value = aVal;
      if ($('triSideB')) $('triSideB').value = bVal;
      updateActive();
    });
  });

  // Generic Preset Chips Listener (replaces broken inline onclick handlers)
  const presetChips = document.querySelectorAll('.chip[data-set]');
  presetChips.forEach(chip => {
    chip.addEventListener('click', function() {
      const vals = JSON.parse(this.dataset.set);
      Object.entries(vals).forEach(([id, val]) => {
        const el = $(id);
        if (el) el.value = val;
      });
      updateActive();
    });
  });

  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = 'en';
    langSelect.addEventListener('change', function() {
      if (this.value === 'ru') {
        localStorage.setItem('user_lang', 'ru');
        window.location.href = '../ru/moretools/diagonalcalculator.html';
      } else if (this.value === 'ja') {
        localStorage.setItem('user_lang', 'ja');
        window.location.href = '../ja/moretools/diagonalcalculator.html';
      } else if (this.value === 'ko') {
        localStorage.setItem('user_lang', 'ko');
        window.location.href = '../ko/moretools/diagonalcalculator.html';
      }
    });
  }

  setupNav();
  setupTop();
  els.modeBtns.forEach(b=>b.addEventListener('click',()=>switchMode(b.dataset.mode)));
  els.copyBtn.addEventListener('click',copyPrimary);
  if(els.copyBtnAlt) els.copyBtnAlt.addEventListener('click',copyPrimary);
  els.addLogBtn.addEventListener('click',addLog);
  els.clearLogBtn.addEventListener('click',clearLog);
  wireInputs();
  loadLog();
  renderLog();
  switchMode('rectangle');
})();
