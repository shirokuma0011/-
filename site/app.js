const USER_KEY = 'demo_users';
const ITEM_KEY = 'demo_items';
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  updateNav();
  loadItems();
  document.getElementById('add-item-form').addEventListener('submit', addItem);
  document.getElementById('login-form').addEventListener('submit', login);
});

function loadUser() {
  currentUser = JSON.parse(localStorage.getItem('current_user'));
}

function saveUsers(users) {
  localStorage.setItem(USER_KEY, JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USER_KEY) || '[]');
}

function updateNav() {
  const nav = document.getElementById('user-nav');
  nav.innerHTML = '';
  if (currentUser) {
    nav.innerHTML = `${currentUser} <button onclick="logout()">ログアウト</button> ` +
      `<button onclick="showAddItem()">出品</button> ` +
      `<button onclick="loadItems()">すべて</button> ` +
      `<button onclick="showMyItems()">マイ商品</button>`;
  } else {
    nav.innerHTML = '<button onclick="showLogin()">ログイン</button>';
  }
}

function showLogin() {
  document.getElementById('login-modal').classList.remove('hidden');
}

function closeLogin() {
  document.getElementById('login-modal').classList.add('hidden');
}

function login(e) {
  e.preventDefault();
  const name = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  let users = getUsers();
  if (!users.find(u => u.name === name)) {
    users.push({ name, pass });
    saveUsers(users);
  }
  const user = users.find(u => u.name === name && u.pass === pass);
  if (user) {
    currentUser = user.name;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    closeLogin();
    updateNav();
  } else {
    alert('ログイン失敗');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('current_user');
  updateNav();
}

function showAddItem() {
  if (!currentUser) return;
  document.getElementById('add-item-section').classList.remove('hidden');
}

function addItem(e) {
  e.preventDefault();
  if (!currentUser) {
    alert('ログインしてください');
    return;
  }
  const title = document.getElementById('item-title').value;
  const desc = document.getElementById('item-desc').value;
  const price = document.getElementById('item-price').value;
  const file = document.getElementById('item-image').files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = reader.result;
    const items = getItems();
    items.push({ id: Date.now(), title, desc, price, img, seller: currentUser, sold: false });
    saveItems(items);
    loadItems();
    document.getElementById('add-item-form').reset();
    document.getElementById('add-item-section').classList.add('hidden');
  };
  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onload();
  }
}

function saveItems(items) {
  localStorage.setItem(ITEM_KEY, JSON.stringify(items));
}

function getItems() {
  return JSON.parse(localStorage.getItem(ITEM_KEY) || '[]');
}

function loadItems(filter = '', seller = null) {
  const items = getItems().filter(i =>
    i.title.includes(filter) && (!seller || i.seller === seller)
  );
  const container = document.getElementById('items');
  container.innerHTML = '';
  for (const item of items) {
    const div = document.createElement('div');
    div.className = 'item';
    let action = '';
    if (item.seller === currentUser) {
      action = `<button onclick="deleteItem(${item.id})">削除</button>`;
    } else {
      action = `<button ${item.sold ? 'disabled' : ''} onclick="buyItem(${item.id})">${item.sold ? '売り切れ' : '購入'}</button>`;
    }
    div.innerHTML = `
      <img src="${item.img || ''}" alt="">
      <div>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
        <p>¥${item.price}</p>
        <p>出品者: ${item.seller}</p>
        ${action}
      </div>`;
    container.appendChild(div);
  }
}

function buyItem(id) {
  if (!currentUser) {
    alert('ログインしてください');
    return;
  }
  const items = getItems();
  const item = items.find(i => i.id === id);
  if (item && !item.sold) {
    item.sold = true;
    item.buyer = currentUser;
    saveItems(items);
    loadItems();
    alert('購入が完了しました (実際の決済は行われません)');
  }
}

function searchItems() {
  const query = document.getElementById('search').value;
  loadItems(query);
}

function showMyItems() {
  if (!currentUser) return;
  loadItems('', currentUser);
}

function deleteItem(id) {
  const items = getItems().filter(i => i.id !== id);
  saveItems(items);
  loadItems();
}
