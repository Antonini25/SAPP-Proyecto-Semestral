
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    try {
      /************ Datos estáticos ************/
      const sampleUsers = [
        {user:'admin',   pass:'admin123',   name:'Administrador',   role:'Administrador', email:'admin@sapp.com'},
        {user:'gerente', pass:'gerente123', name:'Gerente General', role:'Gerente',      email:'gerente@sapp.com'},
        {user:'ventas',  pass:'ventas123',  name:'Empleado Ventas', role:'Ventas',       email:'ventas@sapp.com'}
      ];

      const products = [
        {code:'PRD-001',name:'Combo Hamburguesa',cat:'Comidas',     price:8.5,qty:120},
        {code:'PRD-002',name:'Combo Pollo',      cat:'Comidas',     price:9.0,qty:75},
        {code:'PRD-003',name:'Refresco 500ml',   cat:'Bebidas',     price:1.5,qty:200},
        {code:'PRD-004',name:'Papas Fritas',     cat:'Complementos',price:2.5,qty:90},
        {code:'PRD-005',name:'Caja de Cartón',   cat:'Insumos',     price:0.6,qty:350}
      ];

      const inventory = products.map(p => ({
        code:p.code,
        name:p.name,
        category:p.cat,
        quantity:p.qty,
        provider:'Proveedor 1',
        price:p.price
      }));

      const providers = [
        {id:1,name:'Proveedor 1',phone:'+507 6000-1111',email:'proveedor1@fran.com',address:'Calle 10, Ciudad'},
        {id:2,name:'Proveedor 2',phone:'+507 6000-2222',email:'proveedor2@fran.com',address:'Av Central 23'},
        {id:3,name:'Proveedor 3',phone:'+507 6000-3333',email:'proveedor3@fran.com',address:'Zona Industrial'}
      ];

      const clients = [
        {id:1,name:'Empresa A',     phone:'+507 6789-0001',email:'compras@empresaa.com',  orders:12,last:'2025-10-20'},
        {id:2,name:'Mercado Mayor', phone:'+507 6789-0002',email:'contacto@mercadom.com', orders:3, last:'2025-09-05'},
        {id:3,name:'Doña Juana',    phone:'+507 6789-0003',email:'juana@mail.com',        orders:1, last:'2025-10-25'}
      ];

      const movements = [
        {date:'2025-11-10',type:'Ingreso',concept:'Venta local',    amount:850,responsible:'Ventas'},
        {date:'2025-11-10',type:'Egreso', concept:'Compra insumos', amount:320,responsible:'Compras'},
        {date:'2025-11-09',type:'Ingreso',concept:'Pedido online',  amount:450,responsible:'Ventas'},
        {date:'2025-11-08',type:'Egreso', concept:'Pago servicio',  amount:120,responsible:'Admin'}
      ];

      // Promos ficticias
      const combosData = [
        {name:'Combo Familiar XXL', tag:'Familiar',   desc:'4 hamburguesas, 2 papas grandes y 2 bebidas de 1L.', price:'$24.99'},
        {name:'Combo Ejecutivo',    tag:'Oficina',    desc:'Hamburguesa + papas + bebida mediana.',              price:'$9.50'},
        {name:'Combo Pareja',       tag:'2x',         desc:'2 combos clásicos con bebida grande compartida.',    price:'$17.99'}
      ];
      const couponsData = [
        {name:'Cupón LUNES10', tag:'-10%', desc:'10% de descuento en órdenes mayores a $15 los lunes.', code:'LUNES10'},
        {name:'Cupón PRIMERA', tag:'Nuevo', desc:'Envío gratis en tu primera compra.',                  code:'PRIMERA'},
        {name:'Cupón NOCTURNO',tag:'Noche', desc:'15% de descuento en pedidos después de las 9PM.',     code:'NOCTE15'}
      ];
      const offersData = [
        {name:'2x1 en bebidas',  tag:'Hoy',  desc:'Todas las bebidas 2x1 de 3:00pm a 5:00pm.',          valid:'Solo hoy'},
        {name:'Postre -50%',     tag:'Dulce',desc:'Postres al 50% con cualquier combo grande.',         valid:'Hasta fin de mes'},
        {name:'Upgrade gratis',  tag:'Extra',desc:'Papas medianas se actualizan a grandes sin costo.',  valid:'Fin de semana'}
      ];

      // estado global
      let current = {module:1,user:null,cart:[]};
      let settings = {
        darkMode:false,
        language:'es'
      };

      /************ util ************/
      const qs = id => document.getElementById(id);

      function showSection(sec){
        ['welcomeSection','clienteSection','adminSection'].forEach(s=>{
          const el = qs(s);
          if(el) el.classList.add('hidden');
        });
        const target = qs(sec);
        if(target) target.classList.remove('hidden');
      }

      function applyTheme(){
        document.body.classList.toggle('dark-theme', settings.darkMode);
      }

      function safeSetInner(id, html){
        const el = qs(id);
        if(!el){ console.warn('No existe elemento:',id); return false; }
        el.innerHTML = html;
        return true;
      }

      function formatDateToday(){
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth()+1).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        return `${yyyy}-${mm}-${dd}`;
      }

      // Inicial
      function init(){
        showSection('welcomeSection');
        applyTheme();
      }

      /************ PANTALLA INICIAL ************/
      const btnCliente = qs('btnCliente');
      if(btnCliente) btnCliente.addEventListener('click',()=>{
        current.module = 2;
        current.user = {role:'cliente',name:'Cliente Demo'};
        const ud = qs('userDisplay');
        if(ud) ud.innerText = 'Cliente demo';
        enterCliente();
      });

      const btnUsuario = qs('btnUsuario');
      if(btnUsuario) btnUsuario.addEventListener('click',()=>{
        const la=qs('loginArea');
        if(la) la.classList.remove('hidden');
      });

      const btnLoginCancel = qs('btnLoginCancel');
      if(btnLoginCancel) btnLoginCancel.addEventListener('click',()=>{
        const la=qs('loginArea'); if(la) la.classList.add('hidden');
        const lm=qs('loginMsg'); if(lm) lm.innerText='';
      });

      const btnLoginDo = qs('btnLoginDo');
      if(btnLoginDo) btnLoginDo.addEventListener('click',()=>{
        const lu = qs('loginUser'); const lp = qs('loginPass');
        if(!lu || !lp) return;
        const u = lu.value.trim(); const p = lp.value;
        const found = sampleUsers.find(x=>x.user===u && x.pass===p);
        const lm = qs('loginMsg');
        if(!found){
          if(lm) lm.innerText='Credenciales inválidas';
          return;
        }
        current.user = found;
        current.module = 3;
        const an = qs('adminName'); if(an) an.innerText = found.name;
        const ud = qs('userDisplay'); if(ud) ud.innerText = found.name;
        enterAdmin();
      });

      /************ CLIENTE ************/
      function enterCliente(){
        showSection('clienteSection');
        renderClientMenu('menuMain');
        renderProducts();
        updateCartPane();

        document.querySelectorAll('.client-side li').forEach(li=>{
          li.addEventListener('click',()=>{
            document.querySelectorAll('.client-side li').forEach(x=>x.classList.remove('active'));
            li.classList.add('active');
            const view = li.getAttribute('data-view');
            renderClientMenu(view);
          });
        });

        const viewCartBtn = qs('viewCartBtn');
        if(viewCartBtn) viewCartBtn.addEventListener('click',()=>{
          const el = document.querySelector('[data-view="menuCart"]');
          if(el) el.click();
        });

        const exitCliente = qs('exitCliente');
        if(exitCliente) exitCliente.addEventListener('click',()=>{
          current = {module:1,user:null,cart:[]};
          const ud = qs('userDisplay'); if(ud) ud.innerText = 'Visita';
          init();
        });

        const checkoutBtn = qs('checkoutBtn');
        if(checkoutBtn) checkoutBtn.addEventListener('click',finishPayment);

        const clearCart = qs('clearCart');
        if(clearCart) clearCart.addEventListener('click',()=>{
          current.cart = [];
          updateCartPane();
        });
      }

      function renderClientMenu(view){
        const c = qs('clientPanelContent'); if(!c) return;

        if(view === 'menuMain'){
          c.innerHTML = `
            <h3>Menú</h3>
            <p class="small">Explora nuestras opciones destacadas:</p>
            <div class="chip-row">
              <button class="chip-btn active" data-chip="combos">🍔 Combos</button>
              <button class="chip-btn" data-chip="coupons">🏷️ Cupones</button>
              <button class="chip-btn" data-chip="offers">🔥 Ofertas</button>
            </div>
            <div id="promoContent"></div>
            <h4 style="margin-top:16px">Todos los productos</h4>
            <div class="products" id="productsWrap"></div>
          `;
          attachPromoHandlers();
          renderPromoSection('combos');
          renderProducts();
        } else if(view === 'menuCart'){
          c.innerHTML = `
            <h3>Tu Carrito</h3>
            <div id="cartView"></div>
          `;
          renderCartView();
        } else if(view === 'menuConfig'){
          c.innerHTML = `
            <h3>Configuración de Cliente</h3>
            <div class="card" style="margin-top:8px">
              <h4>Tema</h4>
              <label class="toggle">
                <input type="checkbox" id="clientDarkToggle" ${settings.darkMode ? 'checked' : ''}>
                <span>Activar tema oscuro</span>
              </label>
              <h4 style="margin-top:12px">Idioma</h4>
              <select id="clientLangSelect">
                <option value="es" ${settings.language==='es'?'selected':''}>Español</option>
                <option value="en" ${settings.language==='en'?'selected':''}>English</option>
              </select>
              <p class="small" style="margin-top:8px">
                * Demostración: el cambio de idioma aún no traduce todo el sistema.
              </p>
            </div>`;
          const clientDarkToggle = qs('clientDarkToggle');
          if(clientDarkToggle){
            clientDarkToggle.addEventListener('change',e=>{
              settings.darkMode = e.target.checked;
              applyTheme();
            });
          }
          const clientLangSelect = qs('clientLangSelect');
          if(clientLangSelect){
            clientLangSelect.addEventListener('change',e=>{
              settings.language = e.target.value;
            });
          }
        } else if(view === 'menuCustom'){
          renderCustomOrder();
        }
      }

      function attachPromoHandlers(){
        const chips = document.querySelectorAll('.chip-btn');
        chips.forEach(chip=>{
          chip.addEventListener('click',()=>{
            chips.forEach(c=>c.classList.remove('active'));
            chip.classList.add('active');
            const type = chip.getAttribute('data-chip');
            renderPromoSection(type);
          });
        });
      }

      function renderPromoSection(type){
        const wrap = qs('promoContent'); if(!wrap) return;
        let data = [];
        if(type === 'combos') data = combosData;
        else if(type === 'coupons') data = couponsData;
        else if(type === 'offers') data = offersData;

        if(type === 'combos'){
          wrap.innerHTML = `
            <div class="promo-grid">
              ${data.map(d=>`
                <div class="promo-card">
                  <div class="promo-tag">${d.tag}</div>
                  <h4>${d.name}</h4>
                  <p class="small">${d.desc}</p>
                  <p><strong>${d.price}</strong></p>
                </div>`).join('')}
            </div>`;
        } else if(type === 'coupons'){
          wrap.innerHTML = `
            <div class="promo-grid">
              ${data.map(d=>`
                <div class="promo-card">
                  <div class="promo-tag">${d.tag}</div>
                  <h4>${d.name}</h4>
                  <p class="small">${d.desc}</p>
                  <p class="small">Código: <strong>${d.code}</strong></p>
                </div>`).join('')}
            </div>`;
        } else {
          wrap.innerHTML = `
            <div class="promo-grid">
              ${data.map(d=>`
                <div class="promo-card">
                  <div class="promo-tag">${d.tag}</div>
                  <h4>${d.name}</h4>
                  <p class="small">${d.desc}</p>
                  <p class="small">Válido: <strong>${d.valid}</strong></p>
                </div>`).join('')}
            </div>`;
        }
      }

      function renderCustomOrder(){
        const c = qs('clientPanelContent'); if(!c) return;
        c.innerHTML = `
          <h3>🎨 Personalizar pedido</h3>
          <div class="card" style="margin-top:8px">
            <div class="controls">
              <div style="flex:1;min-width:180px">
                <label class="small">Producto base</label><br>
                <select id="customBase">
                  ${products.map(p=>`<option value="${p.code}">${p.name}</option>`).join('')}
                </select>
              </div>
              <div style="flex:1;min-width:180px">
                <label class="small">Extras</label>
                <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
                  <label class="small"><input type="checkbox" id="extraQueso"> Extra queso (+$1.00)</label>
                  <label class="small"><input type="checkbox" id="papasGrandes"> Papas grandes (+$1.50)</label>
                  <label class="small"><input type="checkbox" id="bebidaGrande"> Bebida grande (+$1.00)</label>
                  <label class="small"><input type="checkbox" id="salsaEspecial"> Salsa especial (+$0.50)</label>
                </div>
              </div>
            </div>
            <button class="btn primary" id="btnAddCustom">Agregar pedido personalizado</button>
            <div id="customSummary" class="small" style="margin-top:8px;"></div>
          </div>
        `;
        attachCustomHandlers();
      }

      function attachCustomHandlers(){
        const baseSel = qs('customBase');
        const summary = qs('customSummary');
        const btnAdd = qs('btnAddCustom');

        const extrasDef = [
          {id:'extraQueso',    label:'Extra queso',    cost:1.00},
          {id:'papasGrandes',  label:'Papas grandes',  cost:1.50},
          {id:'bebidaGrande',  label:'Bebida grande',  cost:1.00},
          {id:'salsaEspecial', label:'Salsa especial', cost:0.50},
        ];

        function updateSummary(){
          if(!baseSel || !summary) return;
          const base = products.find(p=>p.code===baseSel.value);
          let extraCost = 0;
          let extraText = [];
          extrasDef.forEach(ex=>{
            const el = qs(ex.id);
            if(el && el.checked){
              extraCost += ex.cost;
              extraText.push(ex.label);
            }
          });
          const total = (base?base.price:0) + extraCost;
          summary.textContent = `Total estimado: $${total.toFixed(2)} | Extras: ${extraText.join(', ') || 'Ninguno'}`;
        }

        extrasDef.forEach(ex=>{
          const el = qs(ex.id);
          if(el) el.addEventListener('change',updateSummary);
        });
        if(baseSel) baseSel.addEventListener('change',updateSummary);
        updateSummary();

        if(btnAdd){
          btnAdd.addEventListener('click',()=>{
            const base = products.find(p=>p.code===baseSel.value);
            if(!base) return;
            let name = base.name+' (Pers.)';
            let price = base.price;
            extrasDef.forEach(ex=>{
              const el = qs(ex.id);
              if(el && el.checked){
                name += ' + '+ex.label.split(' ')[0];
                price += ex.cost;
              }
            });
            current.cart.push({
              code:base.code+'-C'+Date.now(),
              name,
              price,
              qty:1
            });
            updateCartPane();
            alert('Pedido personalizado agregado al carrito');
          });
        }
      }

      function renderProducts(){
        const wrap = qs('productsWrap'); if(!wrap) return;
        wrap.innerHTML = '';
        products.forEach(p=>{
          const d = document.createElement('div'); d.className='product';
          d.innerHTML = `
            <strong>${p.name}</strong>
            <div class="small">${p.code} • ${p.cat}</div>
            <div style="margin-top:8px">$${p.price.toFixed(2)}</div>
            <div style="margin-top:8px">
              <button class="btn small-btn" data-add="${p.code}">Agregar</button>
            </div>`;
          wrap.appendChild(d);
        });
        wrap.querySelectorAll('[data-add]').forEach(btn=>{
          btn.addEventListener('click',()=>{
            const code = btn.getAttribute('data-add');
            addToCart(code);
          });
        });
      }

      function addToCart(code){
        const prod = products.find(p=>p.code===code); if(!prod) return;
        const exists = current.cart.find(i=>i.code===code);
        if(exists) exists.qty++;
        else current.cart.push({code:prod.code,name:prod.name,price:prod.price,qty:1});
        updateCartPane();
      }

      function updateCartPane(){
        const cc = qs('cartCount');
        if(cc) cc.innerText = current.cart.reduce((s,i)=>s+i.qty,0);
        const ci = qs('cartItems');
        if(ci) ci.innerHTML = current.cart.length
          ? current.cart.map(i =>
              `<div style="display:flex;justify-content:space-between;padding:6px 0">
                <div>${i.name} x${i.qty}</div>
                <div>$${(i.price*i.qty).toFixed(2)}</div>
              </div>`
            ).join('')
          : '<div class="small">Carrito vacío</div>';
        const ct = qs('cartTotal');
        if(ct) ct.innerText = current.cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
      }

      function renderCartView(){
        const v = qs('cartView'); if(!v) return;
        v.innerHTML = current.cart.length
          ? current.cart.map(i =>
              `<div style="display:flex;justify-content:space-between;padding:6px 0">
                <div>${i.name} x${i.qty}</div>
                <div>$${(i.price*i.qty).toFixed(2)}</div>
              </div>`
            ).join('')
          : '<div class="small">Tu carrito está vacío.</div>';
      }

      /************ FACTURA (MODAL) ************/
      const invoiceOverlay = qs('invoiceOverlay');
      const invNumberEl = qs('invNumber');
      const invDateEl   = qs('invDate');
      const invItemsEl  = qs('invItems');
      const invTotalEl  = qs('invTotal');
      const invClose    = qs('invClose');
      const invCloseBottom = qs('invCloseBottom');
      const invDownload = qs('invDownload');

      function showInvoiceModal(itemsSnapshot, total){
        if(!invoiceOverlay) return;
        const invoiceNumber = 'INV-' + Date.now().toString().slice(-6);
        const today = formatDateToday();

        if(invNumberEl) invNumberEl.textContent = invoiceNumber;
        if(invDateEl)   invDateEl.textContent   = today;
        if(invTotalEl)  invTotalEl.textContent  = total.toFixed(2);

        if(invItemsEl){
          invItemsEl.innerHTML = itemsSnapshot.map(i =>
            `<div class="modal-item">
               <span>${i.name} x${i.qty}</span>
               <span>$${(i.price*i.qty).toFixed(2)}</span>
             </div>`
          ).join('');
        }

        invoiceOverlay.classList.remove('hidden');
      }

      function closeInvoiceModal(){
        if(invoiceOverlay) invoiceOverlay.classList.add('hidden');
      }

      if(invClose) invClose.addEventListener('click',closeInvoiceModal);
      if(invCloseBottom) invCloseBottom.addEventListener('click',closeInvoiceModal);

      if(invDownload){
        invDownload.addEventListener('click',()=>{
          // Usamos ventana de impresión simulando descarga
          const invoiceNumber = invNumberEl ? invNumberEl.textContent : '';
          const date = invDateEl ? invDateEl.textContent : '';
          const total = invTotalEl ? invTotalEl.textContent : '';
          const itemsHtml = invItemsEl ? invItemsEl.innerHTML : '';

          const w = window.open('','Factura SAPP','width=800,height=600');
          if(!w) return alert('No se pudo abrir la ventana de factura (bloqueador?)');
          w.document.write(`
            <html>
            <head>
              <title>Factura ${invoiceNumber}</title>
              <style>
                body{font-family:Arial, sans-serif;padding:20px;}
                h1,h3{margin:0 0 10px;}
                .small{font-size:13px;color:#4b5563;}
                .item{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #e5e7eb;}
              </style>
            </head>
            <body>
              <h1>SAPP</h1>
              <h3>Factura ${invoiceNumber}</h3>
              <p class="small">Fecha: ${date}</p>
              <h4>Detalle</h4>
              ${itemsHtml.replace(/modal-item/g,'item')}
              <h3>Total: $${total}</h3>
            </body>
            </html>
          `);
          w.document.close();
          w.focus();
          setTimeout(()=>w.print(), 500);
        });
      }

      function finishPayment(){
        if(current.cart.length === 0){
          alert('El carrito está vacío');
          return;
        }
        const itemsSnapshot = current.cart.map(i => ({...i}));
        const total = current.cart.reduce((s,i)=>s+i.price*i.qty,0);
        // Registrar movimiento
        movements.unshift({
          date: formatDateToday(),
          type:'Ingreso',
          concept:'Venta cliente',
          amount: total,
          responsible:'Cliente Demo'
        });
        // Vaciar carrito pero mantener snapshot para factura
        current.cart = [];
        updateCartPane();
        showInvoiceModal(itemsSnapshot, total);
      }

      /************ ADMIN ************/
      function enterAdmin(){
        showSection('adminSection');
        renderAdmin('dashboard');

        const adminNav = qs('adminNav');
        if(adminNav){
          adminNav.querySelectorAll('a').forEach(a=>{
            a.addEventListener('click',e=>{
              e.preventDefault();
              adminNav.querySelectorAll('a').forEach(x=>x.classList.remove('active'));
              a.classList.add('active');
              renderAdmin(a.getAttribute('data-admin'));
            });
          });
        }

        const logoutBtn = qs('logoutBtn');
        if(logoutBtn) logoutBtn.addEventListener('click',()=>{
          current = {module:1,user:null,cart:[]};
          const ud = qs('userDisplay'); if(ud) ud.innerText = 'Visita';
          init();
        });
      }

      function renderAdmin(view){
        const container = qs('adminContent'); if(!container) return;
        if(view==='dashboard'){
          container.innerHTML = `
            <div class="cards">
              <div class="card">
                <div class="small">Productos en Inventario</div>
                <h3>${inventory.length}</h3>
              </div>
              <div class="card">
                <div class="small">Alertas de Stock Bajo</div>
                <h3>${inventory.filter(i=>i.quantity<10).length}</h3>
              </div>
              <div class="card">
                <div class="small">Ventas Acumuladas</div>
                <h3>$${movements.filter(m=>m.type==='Ingreso').reduce((s,m)=>s+m.amount,0)}</h3>
              </div>
              <div class="card">
                <div class="small">Órdenes en Proceso</div>
                <h3>--</h3>
              </div>
            </div>
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <div style="flex:1;min-width:260px" class="card">
                <h4>Flujo de Caja Semanal (Resumen)</h4>
                <div class="chart">${renderSmallChart()}</div>
              </div>
              <div style="width:360px;max-width:100%" class="card">
                <h4>Productos con Stock Bajo</h4>
                <div>${
                  inventory.filter(i=>i.quantity<10).map(i=>
                    `<div style="padding:6px;border-radius:6px;background:rgba(254,226,226,0.6);margin-bottom:6px">
                      <strong>${i.name}</strong>
                      <div class="small">Stock: ${i.quantity} • Mín: 10</div>
                    </div>`
                  ).join('') || '<div class="small">Sin alertas</div>'
                }</div>
              </div>
            </div>
          `;
        } else if(view==='inventario'){
          container.innerHTML = `
            <div class="card">
              <div class="controls">
                <input type="text" id="invSearch" placeholder="Buscar por nombre o código...">
                <button class="btn primary" id="btnAddInv">Agregar Producto</button>
                <div class="right"><button class="btn" id="btnReloadInv">Recargar</button></div>
              </div>
              <div id="invTableWrap"></div>
            </div>
          `;
          renderInvTable();
          const addBtn = qs('btnAddInv');
          if(addBtn) addBtn.addEventListener('click',()=>{
            const code = prompt('Código'); if(!code) return;
            const name = prompt('Nombre') || 'Nuevo producto';
            const cat  = prompt('Categoría') || 'General';
            const qty  = Number(prompt('Cantidad')) || 0;
            const price= Number(prompt('Precio')) || 0;
            inventory.push({code,name,category:cat,quantity:qty,provider:'Proveedor X',price});
            renderInvTable();
          });
        } else if(view==='flujo'){
          container.innerHTML = `
            <div class="card">
              <h4>Flujo de Caja - Movimientos</h4>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Responsable</th>
                  </tr>
                </thead>
                <tbody id="movT"></tbody>
              </table>
            </div>
          `;
          renderMovements();
        } else if(view==='proveedores'){
          container.innerHTML = `
            <div class="card">
              <h4>Proveedores</h4>
              <div id="providersWrap"></div>
              <div style="margin-top:8px">
                <button class="btn primary" id="addProv">Agregar Proveedor</button>
              </div>
            </div>`;
          renderProviders();
          const addProv = qs('addProv');
          if(addProv) addProv.addEventListener('click',()=>{
            const name = prompt('Nombre'); if(!name) return;
            providers.push({
              id:Date.now(),
              name,
              phone:prompt('Teléfono')||'',
              email:prompt('Email')||'',
              address:prompt('Dirección')||''
            });
            renderProviders();
          });
        } else if(view==='clientes'){
          container.innerHTML = `
            <div class="card">
              <h4>Clientes</h4>
              <div id="clientsWrap"></div>
            </div>`;
          renderClients();
        } else if(view==='reportes'){
          container.innerHTML = `
            <div class="card">
              <h4>Reportes</h4>
              <p class="small">
                Generar PDF con resumen del sistema (se abre diálogo de impresión para guardar como PDF).
              </p>
              <div style="margin-top:8px">
                <button class="btn primary" id="genPdf">Generar Reporte (PDF)</button>
              </div>
            </div>`;
          const gen = qs('genPdf');
          if(gen) gen.addEventListener('click',()=>{generateReport();});
        } else if(view==='config'){
          container.innerHTML = `
            <div class="card">
              <h4>Configuración</h4>
              <div style="margin-top:8px">
                <h5>Tema</h5>
                <label class="toggle">
                  <input type="checkbox" id="adminDarkToggle" ${settings.darkMode ? 'checked' : ''}>
                  <span>Activar tema oscuro</span>
                </label>
                <h5 style="margin-top:16px">Usuarios</h5>
                <div id="usersWrap"></div>
                <h5 style="margin-top:16px">Roles</h5>
                <div id="rolesWrap"></div>
              </div>
            </div>
          `;
          renderUsers();
          renderRoles();
          const adminDarkToggle = qs('adminDarkToggle');
          if(adminDarkToggle){
            adminDarkToggle.addEventListener('change', e=>{
              settings.darkMode = e.target.checked;
              applyTheme();
            });
          }
        }
      }

      function renderSmallChart(){
        const days = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
        const vals = [12000,15000,18000,14000,21000,24000,16000];
        return '<div style="display:flex;height:180px;align-items:end;gap:8px;">'+
          vals.map((v,i)=>`
            <div style="flex:1;text-align:center">
              <div style="height:${Math.round(v/150)}px;
                          background:linear-gradient(#34d399,#059669);
                          border-radius:6px"></div>
              <div class="small">${days[i]}</div>
            </div>`).join('')+
          '</div>';
      }

      function renderInvTable(){
        const wrap = qs('invTableWrap'); if(!wrap) return;
        const search = qs('invSearch');
        const term = (search && search.value.trim().toLowerCase()) || '';
        const filtered = term
          ? inventory.filter(i =>
              i.code.toLowerCase().includes(term) ||
              i.name.toLowerCase().includes(term)
            )
          : inventory;

        wrap.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                filtered.map(i=>`
                  <tr>
                    <td>${i.code}</td>
                    <td>${i.name}</td>
                    <td>${i.category}</td>
                    <td>${i.quantity}</td>
                    <td>${i.provider}</td>
                    <td>$${i.price}</td>
                    <td>
                      <button class="btn small-btn" data-del="${i.code}">Eliminar</button>
                    </td>
                  </tr>`
                ).join('')
              }
            </tbody>
          </table>`;
        wrap.querySelectorAll('[data-del]').forEach(b=>{
          b.addEventListener('click',()=>{
            const code=b.getAttribute('data-del');
            if(confirm('Eliminar '+code+'?')){
              const idx = inventory.findIndex(x=>x.code===code);
              if(idx>-1) inventory.splice(idx,1);
              renderInvTable();
            }
          });
        });
        const searchInput = qs('invSearch');
        const reloadBtn = qs('btnReloadInv');
        if(searchInput && !searchInput._bound){
          searchInput._bound = true;
          searchInput.addEventListener('input',renderInvTable);
        }
        if(reloadBtn && !reloadBtn._bound){
          reloadBtn._bound = true;
          reloadBtn.addEventListener('click',()=>{
            searchInput.value='';
            renderInvTable();
          });
        }
      }

      function renderMovements(){
        const mEl = qs('movT'); if(!mEl) return;
        mEl.innerHTML = movements.map(m=>
          `<tr>
            <td>${m.date}</td>
            <td>${m.type}</td>
            <td>${m.concept}</td>
            <td>$${m.amount}</td>
            <td>${m.responsible}</td>
          </tr>`
        ).join('');
      }

      function renderProviders(){
        const pWrap = qs('providersWrap'); if(!pWrap) return;
        pWrap.innerHTML = providers.map(p=>
          `<div style="padding:8px;border-radius:8px;background:#f8fafc;margin-bottom:8px;
                       box-shadow:0 2px 6px rgba(15,23,42,0.06)">
            <strong>${p.name}</strong>
            <div class="small">${p.phone} • ${p.email}</div>
            <div class="small">${p.address}</div>
            <div style="margin-top:6px">
              <button class='btn small-btn' data-prov='${p.id}'>Eliminar</button>
            </div>
          </div>`
        ).join('');
        pWrap.querySelectorAll('[data-prov]').forEach(b=>{
          b.addEventListener('click',()=>{
            const id = Number(b.getAttribute('data-prov'));
            if(confirm('Eliminar proveedor?')){
              const idx = providers.findIndex(x=>x.id===id);
              if(idx>-1) providers.splice(idx,1);
              renderProviders();
            }
          });
        });
      }

      function renderClients(){
        const cWrap = qs('clientsWrap'); if(!cWrap) return;
        cWrap.innerHTML = `
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Órdenes</th>
                <th>Última</th>
              </tr>
            </thead>
            <tbody>
              ${
                clients.map(c=>
                  `<tr>
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${c.email}</td>
                    <td>${c.orders}</td>
                    <td>${c.last}</td>
                  </tr>`
                ).join('')
              }
            </tbody>
          </table>`;
      }

      function renderUsers(){
        const uWrap = qs('usersWrap'); if(!uWrap) return;
        uWrap.innerHTML = `
          <div class="small" style="margin-bottom:6px">
            Gestione los usuarios del sistema (demo).
          </div>
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${
                sampleUsers.map(u=>
                  `<tr>
                    <td>${u.user}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td>${u.role}</td>
                    <td>
                      <button class="btn small-btn" data-del-user="${u.user}">Eliminar</button>
                    </td>
                  </tr>`
                ).join('')
              }
            </tbody>
          </table>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn primary" id="addUserBtn">Agregar Usuario</button>
          </div>
        `;
        uWrap.querySelectorAll('[data-del-user]').forEach(b=>{
          b.addEventListener('click',()=>{
            const userId = b.getAttribute('data-del-user');
            if(confirm('¿Eliminar usuario '+userId+'?')){
              const idx = sampleUsers.findIndex(u=>u.user===userId);
              if(idx>-1){
                sampleUsers.splice(idx,1);
                renderUsers();
              }
            }
          });
        });

        const addBtn = qs('addUserBtn');
        if(addBtn){
          addBtn.addEventListener('click',()=>{
            const user = prompt('Usuario (login):'); if(!user) return;
            const pass = prompt('Contraseña:') || 'demo123';
            const name = prompt('Nombre visible:') || user;
            const role = prompt('Rol (Administrador / Gerente / Ventas):') || 'Invitado';
            const email = prompt('Correo:') || `${user}@sapp.com`;
            sampleUsers.push({user,pass,name,role,email});
            renderUsers();
          });
        }
      }

      function renderRoles(){
        const rWrap = qs('rolesWrap'); if(!rWrap) return;
        const roles = [
          {name:'Administrador',perms:['Todas']},
          {name:'Gerente',      perms:['Ver reportes','Gestionar inventario']},
          {name:'Ventas',       perms:['Crear pedidos','Ver clientes']},
          {name:'Compras',      perms:['Registrar compras','Gestionar proveedores']},
          {name:'Producción',   perms:['Ver recetas','Control producción']}
        ];
        rWrap.innerHTML = roles.map(r=>
          `<div style="padding:8px;border-radius:8px;background:#fff;margin-bottom:8px;
                       box-shadow:0 2px 6px rgba(15,23,42,0.06)">
            <strong>${r.name}</strong>
            <div class='small'>Permisos: ${r.perms.join(', ')}</div>
          </div>`
        ).join('');
      }

      function generateReport(){
        const rpt = window.open('','Reporte SAPP','width=900,height=700');
        if(!rpt) return alert('No se pudo abrir la ventana de reporte (bloqueador?).');
        rpt.document.write('<h1>Reporte SAPP</h1>');
        rpt.document.write('<h3>Inventario</h3>');
        rpt.document.write('<table border="1" cellpadding="6" cellspacing="0"><tr><th>Código</th><th>Nombre</th><th>Cantidad</th><th>Precio</th></tr>'+
          inventory.map(i=>`<tr><td>${i.code}</td><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price}</td></tr>`).join('')+
          '</table>');
        rpt.document.write('<h3>Proveedores</h3>');
        rpt.document.write('<ul>'+providers.map(p=>`<li>${p.name} - ${p.phone} - ${p.email}</li>`).join('')+'</ul>');
        rpt.document.write('<h3>Movimientos recientes</h3>');
        rpt.document.write('<table border="1" cellpadding="6" cellspacing="0"><tr><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th></tr>'+
          movements.map(m=>`<tr><td>${m.date}</td><td>${m.type}</td><td>${m.concept}</td><td>$${m.amount}</td></tr>`).join('')+
          '</table>');
        rpt.document.close();
        rpt.focus();
        setTimeout(()=>{rpt.print();},500);
      }

      // start
      init();

    } catch(err){
      console.error('Error en la app SAPP:',err);
      alert('Ocurrió un error, abre la consola para más detalles.');
    }
  });
})();
