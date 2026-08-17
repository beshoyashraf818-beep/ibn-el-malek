const PRODUCT_KEY = "ibn_products";
const CART_KEY = "ibn_cart";
const ORDER_KEY = "ibn_orders";
const SETTINGS_KEY = "ibn_settings";

const categories = ["شنط مدارس","شنط سفر","شنط حريمي","شنط بناتي","محافظ","ناموسيات أطفال","شمسيات"];
const defaults = [
  {id:1,name:"تشكيلة شنط مدارس متنوعة",price:0,oldPrice:0,category:"شنط مدارس",stock:20,image:"images/product-1.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:2,name:"شنطة ظهر CAT - موديل 1",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-2.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:3,name:"شنط ظهر CAT - موديلات متنوعة",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-3.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:4,name:"شنط ظهر CAT - موديلات سادة",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-4.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:5,name:"شنط ظهر CAT - موديلات متعددة",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-5.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:6,name:"شنطة ظهر عملية - ME",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-6.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:7,name:"شنطة ظهر رياضية",price:0,oldPrice:0,category:"شنط مدارس",stock:10,image:"images/product-7.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."},
  {id:8,name:"شنط أطفال - ألوان وتصميمات",price:0,oldPrice:0,category:"شنط بناتي",stock:10,image:"images/product-8.jpg",desc:"منتج تجريبي — السعر يحدد لاحقًا."}
];
const shippingDefaults = {"القاهرة":50,"الجيزة":50,"الإسكندرية":60,"الإسماعيلية":60,"الشرقية":60,"الدقهلية":65,"القليوبية":55,"المنوفية":60,"البحيرة":65,"الغربية":60,"بورسعيد":65,"السويس":60,"دمياط":65,"أسيوط":75,"سوهاج":80,"قنا":85,"الأقصر":90,"أسوان":95,"مطروح":90,"البحر الأحمر":90,"الفيوم":65,"بني سويف":65,"المنيا":70,"كفر الشيخ":65,"شمال سيناء":95,"جنوب سيناء":100,"الوادي الجديد":100};
const defaultSettings = {storeName:"ابن الملك",phone:"01285151156",whatsapp:"201285151156",shipping:50,shippingRates:shippingDefaults,banner:"جودة عالية بأسعار مميزة"};

function read(key, fallback){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
function write(key,value){localStorage.setItem(key,JSON.stringify(value))}
function products(){return read(PRODUCT_KEY, defaults)}
function saveProducts(v){write(PRODUCT_KEY,v)}
function cart(){return read(CART_KEY,[])}
function saveCart(v){write(CART_KEY,v);updateCartCount()}
function settings(){return read(SETTINGS_KEY,defaultSettings)}
function money(v){return Number(v||0).toLocaleString("ar-EG")+" جنيه"}
function cartCount(){return cart().reduce((n,x)=>n+x.qty,0)}
function updateCartCount(){document.querySelectorAll("#cartCount,#count").forEach(el=>el.textContent=cartCount())}
function toast(msg){const el=document.querySelector("#toast");if(!el)return alert(msg);el.textContent=msg;el.style.display="block";clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.style.display="none",1800)}

function add(id){
  const p=products().find(x=>x.id===id); if(!p)return;
  const c=cart(), row=c.find(x=>x.id===id), current=row?row.qty:0;
  if(p.stock>0 && current>=p.stock){toast("الكمية المتاحة خلصت");return}
  row?row.qty++:c.push({id,qty:1});
  saveCart(c); toast("تمت إضافة المنتج للسلة ✅");
}
function changeQty(id,delta){
  const p=products().find(x=>x.id===id), c=cart(), row=c.find(x=>x.id===id); if(!row)return;
  const next=row.qty+delta;
  if(next<=0){saveCart(c.filter(x=>x.id!==id));return}
  if(p?.stock>0 && next>p.stock){toast("الكمية المتاحة خلصت");return}
  row.qty=next; saveCart(c); renderCart();
}
function removeItem(id){saveCart(cart().filter(x=>x.id!==id));renderCart()}
function cartDetails(){
  const ps=products();
  return cart().map(x=>{const p=ps.find(y=>y.id===x.id);return p?{...p,qty:x.qty,lineTotal:Number(p.price||0)*x.qty}:null}).filter(Boolean)
}
function getShipping(gov){const s=settings();const rates=s.shippingRates||{};if(gov && rates[gov]!==undefined && rates[gov]!=="")return Number(rates[gov])||0;return Number(s.shipping||0)}
function cartTotals(gov){const items=cartDetails();const subtotal=items.reduce((s,x)=>s+x.lineTotal,0);const shipping=items.length?getShipping(gov):0;return {items,subtotal,shipping,total:subtotal+shipping}}

function renderHome(){
  const grid=document.querySelector("#grid"); if(!grid)return;
  const q=(document.querySelector("#search")?.value||"").trim().toLowerCase();
  const active=window.__activeCategory||"الكل";
  let list=products();
  if(active!=="الكل")list=list.filter(p=>p.category===active);
  if(q)list=list.filter(p=>(p.name+" "+p.category).toLowerCase().includes(q));
  document.querySelector("#filters").innerHTML=["الكل",...categories].map(c=>`<button class="${c===active?'active':''}" onclick="setCategory('${c}')">${c}</button>`).join("");
  document.querySelector("#count").textContent=`${list.length} منتج`;
  grid.innerHTML=list.map(p=>`<article class="card"><div class="pic">${p.image?`<img src="${p.image}" alt="${p.name}">`:"📦"}</div><b>${p.name}</b><small>${p.category}</small><div class="price">${p.price>0?money(p.price):"السعر عند الطلب"}</div><button class="btn buy" onclick="add(${p.id})">أضف للسلة</button></article>`).join("")||"<p>لا توجد منتجات في هذا القسم حاليًا.</p>";
  const s=settings();const contact=document.querySelector("#contact");if(contact)contact.innerHTML=`<h2>التواصل والطلبات</h2><p>للطلب والاستفسار: <b>${s.phone||""}</b></p>`;
  updateCartCount();
}
function setCategory(c){window.__activeCategory=c;renderHome()}
function renderCart(){
  const box=document.querySelector("#cart");if(!box)return;
  const {items,subtotal,shipping,total}=cartTotals();
  box.innerHTML=items.length?items.map(p=>`<div class="card cart-row"><div><b>${p.name}</b><small>${p.category}</small><div>${p.price>0?money(p.price):"السعر عند الطلب"}</div></div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><b>${p.qty}</b><button onclick="changeQty(${p.id},1)">+</button><button class="danger" onclick="removeItem(${p.id})">حذف</button></div><strong>${p.price>0?money(p.lineTotal):"عند الطلب"}</strong></div>`).join(""):"<div class='panel'><h3>السلة فارغة</h3><a class='btn' href='index.html'>العودة للمتجر</a></div>";
  const summary=document.querySelector("#summary");if(summary)summary.innerHTML=`<div>قيمة المنتجات: <b>${money(subtotal)}</b></div><div>الشحن: <b>${items.length?money(shipping):"0 جنيه"}</b></div><hr><div class="total">الإجمالي: <b>${money(total)}</b></div>`;
  updateCartCount();
}
function submitOrder(e){
  e.preventDefault();
  const f=new FormData(e.target), gov=f.get("gov"), s=settings();
  const {items,subtotal,shipping,total}=cartTotals(gov);if(!items.length){toast("السلة فارغة");return}
  const phone=String(f.get("phone")||"").replace(/[^0-9+]/g,"");
  if(phone.replace(/\D/g,"").length < 10){toast("اكتب رقم موبايل صحيح");return}
  const confirmed=confirm(`مراجعة الطلب\n\nقيمة المنتجات: ${money(subtotal)}\nالشحن: ${money(shipping)}\nالإجمالي: ${money(total)}\n\nإرسال الطلب على واتساب؟`);
  if(!confirmed)return;
  const order={id:Date.now(),name:f.get("name"),phone:f.get("phone"),gov:f.get("gov"),address:f.get("address"),items:items.map(x=>({id:x.id,name:x.name,qty:x.qty,price:x.price})),subtotal,shipping,total,date:new Date().toLocaleString("ar-EG"),status:"جديد"};
  const orders=read(ORDER_KEY,[]);orders.unshift(order);write(ORDER_KEY,orders);
  const lines=items.map((x,i)=>`${i+1}) ${x.name} — الكمية: ${x.qty} — ${x.price>0?money(x.lineTotal):"السعر عند الطلب"}`).join("\n");
  const msg=`طلب جديد من متجر ${s.storeName}\n\n${lines}\n\nقيمة المنتجات: ${money(subtotal)}\nالشحن: ${money(shipping)}\nالإجمالي: ${money(total)}\n\nبيانات العميل:\nالاسم: ${order.name}\nالموبايل: ${order.phone}\nالمحافظة: ${order.gov}\nالعنوان: ${order.address}`;
  saveCart([]);
  window.open(`https://wa.me/${s.whatsapp}?text=${encodeURIComponent(msg)}`,"_blank");
  toast("تم تجهيز الطلب وإرساله للواتساب ✅");
}

function renderAdmin(){
  const form=document.querySelector("#productForm");if(!form)return;
  form.addEventListener("submit",saveProduct);drawAdminProducts();drawOrders();
  const s=settings(),sf=document.querySelector("#settingsForm");Object.keys(s).forEach(k=>{if(sf.elements[k])sf.elements[k].value=s[k]??""});
  sf.addEventListener("submit",e=>{e.preventDefault();const o={};for(const [k,v] of new FormData(sf).entries())o[k]=v;o.shipping=Number(o.shipping)||0;write(SETTINGS_KEY,o);toast("تم حفظ الإعدادات")});
}
function saveProduct(e){
  e.preventDefault();const f=e.target, ps=products(), id=Number(f.id.value)||Date.now();
  const finish=image=>{const old=ps.find(p=>p.id===id);const p={id,name:f.name.value.trim(),price:Number(f.price.value)||0,oldPrice:Number(f.oldPrice.value)||0,category:f.category.value,stock:Number(f.stock.value)||0,desc:f.desc.value.trim(),image:image||old?.image||""};const i=ps.findIndex(x=>x.id===id);i>=0?ps[i]=p:ps.push(p);saveProducts(ps);f.reset();f.id.value="";drawAdminProducts();toast("تم حفظ المنتج")};
  if(f.image.files[0]){const r=new FileReader();r.onload=()=>finish(r.result);r.readAsDataURL(f.image.files[0])}else finish(null)
}
function drawAdminProducts(){const box=document.querySelector("#adminProducts");if(!box)return;box.innerHTML=products().map(p=>`<div class="admin-item"><span><b>${p.name}</b><br>${p.price>0?money(p.price):"السعر عند الطلب"} — مخزون ${p.stock}</span><span><button onclick="editP(${p.id})">تعديل</button> <button class="danger" onclick="delP(${p.id})">حذف</button></span></div>`).join("")}
function editP(id){const p=products().find(x=>x.id===id),f=document.querySelector("#productForm");if(!p)return;f.id.value=p.id;["name","price","oldPrice","category","stock","desc"].forEach(k=>f[k].value=p[k]??"");scrollTo({top:0,behavior:"smooth"})}
function delP(id){if(confirm("حذف المنتج؟")){saveProducts(products().filter(p=>p.id!==id));drawAdminProducts();toast("تم حذف المنتج")}}
function drawOrders(){const b=document.querySelector("#orders");if(!b)return;const os=read(ORDER_KEY,[]);b.innerHTML=os.map(o=>`<div class="card"><b>طلب #${o.id}</b><p>${o.name} — ${o.phone}<br>${o.gov} — ${o.address}</p><p>الإجمالي: <b>${money(o.total)}</b></p><small>${o.date} — ${o.status}</small></div>`).join("")||"<p>لا توجد طلبات.</p>"}
function showTab(t){["products","orders","settings"].forEach(x=>document.querySelector("#"+x+"Tab")?.classList.toggle("hidden",x!==t))}

if(!localStorage.getItem(PRODUCT_KEY))write(PRODUCT_KEY,defaults);
if(!localStorage.getItem(SETTINGS_KEY))write(SETTINGS_KEY,defaultSettings);
if(document.querySelector("#grid")){renderHome();document.querySelector("#search")?.addEventListener("input",renderHome)}
if(document.querySelector("#orderForm")){const gov=document.querySelector("[name=gov]");gov?.addEventListener("change",()=>renderCart());}
