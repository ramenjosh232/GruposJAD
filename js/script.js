// script.js

// --- Firebase Configuración ---
const firebaseConfig = {
  apiKey: "AIzaSyBgCEhz1uGbBXVjtfYqarQAqziJk2qvMSI",
  authDomain: "programa-jad.firebaseapp.com",
  databaseURL: "https://programa-jad-default-rtdb.firebaseio.com",  // Asegúrate de que este URL es el correcto
  projectId: "programa-jad",
  storageBucket: "programa-jad.firebasestorage.app",
  messagingSenderId: "551308951860",
  appId: "1:551308951860:web:16411bc217860b041d6561",
  measurementId: "G-XGP6TW882L"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Número máximo de cupos por grupo
const maxCupos = 5;
let currentGroup = null;

// --- Funciones para Firebase ---

// Actualiza la disponibilidad de cupos en la vista de selección de grupos
function updateGroupAvailability() {
  const groups = ['agua', 'fuego', 'aire', 'tierra'];
  groups.forEach(group => {
    const ref = db.ref('registrations/' + group);
    ref.once('value').then(snapshot => {
      const count = snapshot.numChildren();
      document.getElementById('cupos-' + group).textContent = (maxCupos - count) + '/' + maxCupos;
    }).catch(error => {
      console.error("Error actualizando cupos para " + group + ": ", error);
    });
  });
}

// Muestra la vista seleccionada
function showView(viewId) {
  // Ocultar todas las vistas
  document.querySelectorAll('.view').forEach(view => {
    view.style.display = 'none';
  });
  // Mostrar la vista deseada
  document.getElementById(viewId).style.display = 'block';
  
  if (viewId === 'groupSelection') {
    updateGroupAvailability();
  }
  if (viewId === 'leaderPanel') {
    loadLeaderPanel();
  }
}

// Función para seleccionar un grupo y mostrar el formulario
function selectGroup(group) {
  console.log("selectGroup llamado con: " + group);
  const ref = db.ref('registrations/' + group);
  ref.once('value')
    .then(snapshot => {
      const count = snapshot.numChildren();
      console.log("Cupo actual para " + group + ": " + count);
      if (count >= maxCupos) {
        alert("Cupos completos para este grupo.");
        return;
      }
      currentGroup = group;
      document.getElementById('formTitle').textContent = 'Registro - Grupo ' + group.charAt(0).toUpperCase() + group.slice(1);
      showView('registrationFormView');
    })
    .catch(error => {
      console.error("Error en selectGroup: ", error);
    });
}

// Manejo del envío del formulario de registro
document.getElementById('registrationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!currentGroup) {
    alert("Selecciona un grupo primero.");
    return;
  }
  
  const newEntry = {
    nombre: document.getElementById('nombre').value,
    apellido: document.getElementById('apellido').value,
    edad: document.getElementById('edad').value,
    sexo: document.getElementById('sexo').value,
    lider: document.getElementById('lider').value
  };
  
  const ref = db.ref('registrations/' + currentGroup);
  ref.push(newEntry, function(error) {
    if (error) {
      document.getElementById('mensaje').textContent = "Error al registrar. Inténtalo de nuevo.";
    } else {
      document.getElementById('mensaje').textContent = "Registro exitoso.";
      document.getElementById('registrationForm').reset();
      updateGroupAvailability();
    }
  });
});

// Carga los registros en el Panel del Líder, actualizando en tiempo real
function loadLeaderPanel() {
  const groups = ['agua', 'fuego', 'aire', 'tierra'];
  groups.forEach(group => {
    const ref = db.ref('registrations/' + group);
    ref.on('value', snapshot => {
      const tbody = document.getElementById('leaderTableBody-' + group);
      tbody.innerHTML = ''; // Limpiar la tabla
      snapshot.forEach(childSnapshot => {
        const key = childSnapshot.key;
        const entry = childSnapshot.val();
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${entry.nombre}</td>
                        <td>${entry.apellido}</td>
                        <td>${entry.edad}</td>
                        <td>${entry.sexo}</td>
                        <td>${entry.lider}</td>
                        <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('${group}', '${key}')">Eliminar</button></td>`;
        tbody.appendChild(tr);
      });
    });
  });
}

// Función para eliminar un registro de Firebase
function deleteEntry(group, key) {
  const ref = db.ref('registrations/' + group + '/' + key);
  ref.remove()
    .then(() => {
      updateGroupAvailability();
    })
    .catch(error => {
      console.error("Error al eliminar registro:", error);
    });
}

// Función para verificar la contraseña antes de mostrar el Panel del Líder
function verifyPassword() {
  const password = prompt("Ingrese la contraseña para acceder al Panel del Líder:");
  if (password === "JADVERANO2025") {
    showView('leaderPanel');
  } else {
    alert("Contraseña incorrecta. Inténtelo de nuevo.");
  }
}

// Inicialización al cargar la página
window.onload = function() {
  showView('groupSelection');
  updateGroupAvailability();
};
