const $ = id => document.getElementById(id);
const STORE_KEY = "valtrix_bakery_manager_v1";
const DEFAULT_PRODUCTS = [
  {id:1,name:"Milk Bread",price:45,stock:20,alert:5},
  {id:2,name:"Cream Bun",price:25,stock:30,alert:8},
  {id:3,name:"Puffs",price:20,stock:25,alert:6},
  {id:4,name:"Butter Cake (slice)",price:40,stock:15,alert:4}
];
let state = loadState();
let lastReceipt = null;
function loadState(){
  try { const saved = JSON.parse(localStorage.getItem(STORE_KEY)); if(saved) return saved; } catch(e){}
  return {products:DEFAULT_PRODUCTS, sales:[], business:{name:"Ganapathy Bakery",contact:""}};
}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state));}
function money(n){return "₹"+Number(n||0).toFixed(2);}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function dayKey(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function render(){
  const today=dayKey(new Date());
  const todays=state.sales.filter(s=>dayKey(s.date)===today);
  $("todaySales").textContent=money(todays.reduce((sum,s)=>sum+s.total,0));
  $("todayCount").textContent=todays.length;
  $("productCount").textContent=state.products.length;
  $("lowStock").textContent=state.products.filter(p=>p.stock<=p.alert).length;
  $("productRows").innerHTML=state.products.length?state.products.map(p=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${money(p.price)}</td><td>${p.stock}</td><td><span class="pill ${p.stock<=p.alert?"low":""}">${p.stock<=p.alert?"Low stock":"In stock"}</span></td><td><button class="secondary" onclick="editProduct(${p.id})">Edit</button> <button class="secondary" onclick="deleteProduct(${p.id})">Delete</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">No products yet. Add your first product above.</td></tr>`;
  $("saleProduct").innerHTML=state.products.filter(p=>p.stock>0).map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)} (${p.stock} left)</option>`).join("");
  if(!$("saleProduct").options.length)$("saleProduct").innerHTML='<option value="">No stock available</option>';
  $("salesRows").innerHTML=state.sales.slice().reverse().slice(0,20).map(s=>`<tr><td>${new Date(s.date).toLocaleString()}</td><td>${esc(s.receipt)}</td><td>${esc(s.customer||"Walk-in")}</td><td>${esc(s.product)}</td><td>${s.qty}</td><td><strong>${money(s.total)}</strong></td><td><button class="secondary" onclick="printReceipt('${s.id}')">Print</button></td></tr>`).join("")||`<tr><td colspan="7" class="empty">No sales recorded yet.</td></tr>`;
  $("businessName").value=state.business.name||"";
  $("businessContact").value=state.business.contact||"";
  updateTotal();
}
function updateTotal(){const p=state.products.find(p=>p.id===Number($("saleProduct").value));$("saleTotal").textContent=money(p? p.price*Math.max(1,Number($("saleQty").value)||1):0);}
$("productForm").addEventListener("submit",e=>{e.preventDefault();const name=$("pName").value.trim(),price=Number($("pPrice").value),stock=Number($("pStock").value),alert=Number($("pAlert").value);if(!name||price<=0||stock<0||alert<0)return alertUser("Enter a product name, a price above zero and valid stock.");state.products.push({id:Date.now(),name,price,stock,alert});save();e.target.reset();$("pAlert").value=5;render();});
function alertUser(msg){window.alert(msg);}
function editProduct(id){const p=state.products.find(p=>p.id===id);if(!p)return;const name=prompt("Product name:",p.name);if(name===null)return;const price=prompt("Price in ₹:",p.price);if(price===null)return;const stock=prompt("Current stock quantity:",p.stock);if(stock===null)return;const alert=prompt("Low-stock alert level:",p.alert);if(alert===null)return;if(!name.trim()||Number(price)<=0||Number(stock)<0||Number(alert)<0){alertUser("Invalid details. No changes saved.");return;}Object.assign(p,{name:name.trim(),price:Number(price),stock:Number(stock),alert:Number(alert)});save();render();}
function deleteProduct(id){const p=state.products.find(p=>p.id===id);if(p&&confirm(`Delete ${p.name} from the catalogue? Existing sales records will remain.`)){state.products=state.products.filter(x=>x.id!==id);save();render();}}
window.editProduct=editProduct;window.deleteProduct=deleteProduct;
$("saleProduct").addEventListener("change",updateTotal);$("saleQty").addEventListener("input",updateTotal);
$("saleForm").addEventListener("submit",e=>{e.preventDefault();const p=state.products.find(p=>p.id===Number($("saleProduct").value)),qty=Math.floor(Number($("saleQty").value));if(!p)return alertUser("Add a product with stock before recording a sale.");if(!Number.isInteger(qty)||qty<1)return alertUser("Quantity must be at least 1.");if(qty>p.stock)return alertUser(`Only ${p.stock} unit(s) of ${p.name} are available.`);const sale={id:String(Date.now()),receipt:"VBM-"+Date.now().toString().slice(-7),date:new Date().toISOString(),customer:$("customer").value.trim(),product:p.name,productId:p.id,qty,unitPrice:p.price,total:Math.round(p.price*qty*100)/100};p.stock-=qty;state.sales.push(sale);save();render();showReceipt(sale);e.target.reset();$("saleQty").value=1;updateTotal();});
function showReceipt(s){lastReceipt=s;const b=state.business;$("receiptArea").innerHTML=`<div class="receipt"><h2>${esc(b.name||"Bakery")}</h2><p>${esc(b.contact||"")}</p><hr><p><strong>SALES RECEIPT</strong></p><p>${esc(s.receipt)}</p><p>${new Date(s.date).toLocaleString()}</p><p>Customer: ${esc(s.customer||"Walk-in")}</p><hr><div class="rline"><span>${esc(s.product)} × ${s.qty}</span><span>${money(s.total)}</span></div><div class="rline"><strong>Total</strong><strong>${money(s.total)}</strong></div><hr><p>Thank you! Visit again.</p><p>Receipt generated by Valtrix Bakery Manager</p></div>`;window.print();}
function printReceipt(id){const s=state.sales.find(x=>x.id===id);if(s)showReceipt(s);}window.printReceipt=printReceipt;
$("saveBusiness").addEventListener("click",()=>{state.business={name:$("businessName").value.trim()||"Bakery",contact:$("businessContact").value.trim()};save();alertUser("Business details saved.");});
$("exportBtn").addEventListener("click",()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="valtrix-bakery-backup.json";a.click();URL.revokeObjectURL(a.href);});
$("clearDemo").addEventListener("click",()=>{if(confirm("This removes all saved products, sales and business settings from this browser. Export a backup first if needed. Continue?")){localStorage.removeItem(STORE_KEY);state={products:[],sales:[],business:{name:"Ganapathy Bakery",contact:""}};save();render();}});
render();