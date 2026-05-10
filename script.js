const authView=document.getElementById("authView");
const blogView=document.getElementById("blogView");
const detailView=document.getElementById("detailView");

const tabLogin=document.getElementById("tabLogin");
const tabRegister=document.getElementById("tabRegister");
const loginForm=document.getElementById("loginForm");
const registerForm=document.getElementById("registerForm");

const logoutBtn=document.getElementById("logoutBtn");
const welcomeText=document.getElementById("welcomeText");

const postForm=document.getElementById("postForm");
const postId=document.getElementById("postId");
const postTitle=document.getElementById("postTitle");
const postContent=document.getElementById("postContent");
const postList=document.getElementById("postList");
const formTitle=document.getElementById("formTitle");
const cancelEditBtn=document.getElementById("cancelEditBtn");

const backBtn=document.getElementById("backBtn");
const detailTitle=document.getElementById("detailTitle");
const detailDate=document.getElementById("detailDate");
const detailContent=document.getElementById("detailContent");

const messageModal=document.getElementById("messageModal");
const modalIcon=document.getElementById("modalIcon");
const modalTitle=document.getElementById("modalTitle");
const modalText=document.getElementById("modalText");
const modalClose=document.getElementById("modalClose");

const confirmModal=document.getElementById("confirmModal");
const confirmDeleteBtn=document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn=document.getElementById("cancelDeleteBtn");

const themeBtnAuth=document.getElementById("themeBtnAuth");
const themeBtnBlog=document.getElementById("themeBtnBlog");

let deleteId=null;

function showModal(title,text,type="success"){
  modalTitle.textContent=title;
  modalText.textContent=text;
  modalIcon.className="modal-icon "+type;
  modalIcon.textContent=type==="success"?"✅":type==="error"?"❌":"⚠️";
  messageModal.classList.remove("hidden");
}

modalClose.addEventListener("click",()=>messageModal.classList.add("hidden"));

function getUsers(){return JSON.parse(localStorage.getItem("usuarios"))||[]}
function saveUsers(users){localStorage.setItem("usuarios",JSON.stringify(users))}
function getPosts(){return JSON.parse(localStorage.getItem("publicaciones"))||[]}
function savePosts(posts){localStorage.setItem("publicaciones",JSON.stringify(posts))}
function getSession(){return localStorage.getItem("usuarioActivo")}

async function hashPassword(password){
  const encoder=new TextEncoder();
  const data=encoder.encode(password);
  const hash=await crypto.subtle.digest("SHA-256",data);
  return Array.from(new Uint8Array(hash)).map(byte=>byte.toString(16).padStart(2,"0")).join("");
}

function showLogin(){
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
}

function showRegister(){
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
}

function showAuth(){
  authView.classList.remove("hidden");
  blogView.classList.add("hidden");
  detailView.classList.add("hidden");
  showLogin();
}

function showBlog(){
  authView.classList.add("hidden");
  detailView.classList.add("hidden");
  blogView.classList.remove("hidden");
  welcomeText.textContent="Bienvenido, "+getSession();
  renderPosts();
}

tabLogin.addEventListener("click",showLogin);
tabRegister.addEventListener("click",showRegister);

registerForm.addEventListener("submit",async function(e){
  e.preventDefault();

  const user=document.getElementById("registerUser").value.trim();
  const password=document.getElementById("registerPassword").value.trim();

  if(!user||!password){
    showModal("Campos incompletos","Debes completar usuario y contraseña.","warning");
    return;
  }

  if(password.length<4){
    showModal("Contraseña débil","La contraseña debe tener al menos 4 caracteres.","warning");
    return;
  }

  const users=getUsers();
  const exists=users.some(item=>item.user===user);

  if(exists){
    showModal("Usuario existente","Este usuario ya se encuentra registrado.","error");
    return;
  }

  const passwordHash=await hashPassword(password);

  users.push({user:user,password:passwordHash});
  saveUsers(users);
  registerForm.reset();
  showLogin();

  showModal("Registro exitoso","Tu cuenta fue creada correctamente.","success");
});

loginForm.addEventListener("submit",async function(e){
  e.preventDefault();

  const user=document.getElementById("loginUser").value.trim();
  const password=document.getElementById("loginPassword").value.trim();

  if(!user||!password){
    showModal("Campos incompletos","Ingresa tu usuario y contraseña.","warning");
    return;
  }

  const passwordHash=await hashPassword(password);
  const users=getUsers();

  const validUser=users.find(item=>item.user===user&&item.password===passwordHash);

  if(!validUser){
    showModal("Acceso denegado","Usuario o contraseña incorrectos.","error");
    return;
  }

  localStorage.setItem("usuarioActivo",user);
  loginForm.reset();

  showModal("Bienvenido","Inicio de sesión correcto.","success");

  setTimeout(()=>{
    messageModal.classList.add("hidden");
    showBlog();
  },700);
});

logoutBtn.addEventListener("click",function(){
  localStorage.removeItem("usuarioActivo");
  resetPostForm();
  showAuth();
  showModal("Sesión cerrada","Cerraste sesión correctamente.","success");
});

postForm.addEventListener("submit",function(e){
  e.preventDefault();

  const title=postTitle.value.trim();
  const content=postContent.value.trim();
  const user=getSession();

  if(!title||!content){
    showModal("Campos incompletos","Completa el título y el contenido.","warning");
    return;
  }

  if(title.length<3){
    showModal("Título muy corto","El título debe tener al menos 3 caracteres.","warning");
    return;
  }

  let posts=getPosts();

  if(postId.value){
    const index=posts.findIndex(post=>post.id===Number(postId.value));
    posts[index].title=title;
    posts[index].content=content;
    posts[index].date=new Date().toLocaleString("es-PE");
    showModal("Actualizado","La publicación fue actualizada correctamente.","success");
  }else{
    posts.push({
      id:Date.now(),
      user:user,
      title:title,
      content:content,
      date:new Date().toLocaleString("es-PE")
    });
    showModal("Publicado","La publicación fue guardada correctamente.","success");
  }

  savePosts(posts);
  resetPostForm();
  renderPosts();
});

function renderPosts(){
  const user=getSession();
  const posts=getPosts().filter(post=>post.user===user).reverse();

  postList.innerHTML="";

  if(posts.length===0){
    postList.innerHTML="<p>No tienes publicaciones registradas todavía.</p>";
    return;
  }

  posts.forEach(post=>{
    const card=document.createElement("div");
    card.className="post-card";

    card.innerHTML=`
      <h3>${post.title}</h3>
      <span class="date">${post.date}</span>
      <p>${post.content.substring(0,130)}...</p>
      <div class="post-actions">
        <button class="btn btn-primary" onclick="viewPost(${post.id})">Ver</button>
        <button class="btn btn-success" onclick="editPost(${post.id})">Editar</button>
        <button class="btn btn-danger" onclick="openDeleteModal(${post.id})">Eliminar</button>
      </div>
    `;

    postList.appendChild(card);
  });
}

function viewPost(id){
  const post=getPosts().find(post=>post.id===id);
  if(!post)return;

  blogView.classList.add("hidden");
  detailView.classList.remove("hidden");

  detailTitle.textContent=post.title;
  detailDate.textContent=post.date;
  detailContent.textContent=post.content;
}

function editPost(id){
  const post=getPosts().find(post=>post.id===id);
  if(!post)return;

  postId.value=post.id;
  postTitle.value=post.title;
  postContent.value=post.content;

  formTitle.textContent="Editar publicación";
  cancelEditBtn.classList.remove("hidden");

  window.scrollTo({top:0,behavior:"smooth"});
}

function openDeleteModal(id){
  deleteId=id;
  confirmModal.classList.remove("hidden");
}

confirmDeleteBtn.addEventListener("click",function(){
  if(deleteId===null)return;

  let posts=getPosts();
  posts=posts.filter(post=>post.id!==deleteId);

  savePosts(posts);
  renderPosts();

  confirmModal.classList.add("hidden");
  deleteId=null;

  showModal("Eliminado","La publicación fue eliminada correctamente.","success");
});

cancelDeleteBtn.addEventListener("click",function(){
  confirmModal.classList.add("hidden");
  deleteId=null;
});

function resetPostForm(){
  postForm.reset();
  postId.value="";
  formTitle.textContent="Nueva publicación";
  cancelEditBtn.classList.add("hidden");
}

cancelEditBtn.addEventListener("click",resetPostForm);

backBtn.addEventListener("click",function(){
  detailView.classList.add("hidden");
  blogView.classList.remove("hidden");
});

function loadTheme(){
  const theme=localStorage.getItem("theme")||"light";

  if(theme==="dark"){
    document.body.classList.add("dark");
    themeBtnAuth.textContent="☀️";
    themeBtnBlog.textContent="☀️ Claro";
  }else{
    document.body.classList.remove("dark");
    themeBtnAuth.textContent="🌙";
    themeBtnBlog.textContent="🌙 Oscuro";
  }
}

function toggleTheme(){
  document.body.classList.toggle("dark");

  if(document.body.classList.contains("dark")){
    localStorage.setItem("theme","dark");
  }else{
    localStorage.setItem("theme","light");
  }

  loadTheme();
}

themeBtnAuth.addEventListener("click",toggleTheme);
themeBtnBlog.addEventListener("click",toggleTheme);

loadTheme();

if(getSession()){
  showBlog();
}else{
  showAuth();
}