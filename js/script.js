// Configura Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgCEhz1uGbBXVjtfYqarQAqziJk2qvMSI",
  authDomain: "programa-jad.firebaseapp.com",
  projectId: "programa-jad",
  storageBucket: "programa-jad.appspot.com",
  messagingSenderId: "551308951860",
  appId: "1:551308951860:web:16411bc217860b041d6561"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let selectedGroup = "";

function showView(viewId) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");

  if (viewId === "groupSelection") loadGroups();
  if (viewId === "leaderPanel") loadLeaderPanel();
}

function verifyPassword() {
  const password = prompt("Ingrese la contraseña para acceder al Panel del Líder:");
  if (password === "JADVERANO2025") {
    showView('leaderPanel');
  } else {
    alert("Contraseña incorrecta.");
  }
}

function loadGroups() {
  const container = document.getElementById("groupCards");
  container.innerHTML = "";
  db.ref("groups").once("value", snapshot => {
    const groups = snapshot.val();
    for (let group in groups) {
      const data = groups[group];
      const disponibles = data.cupos - (data.registros ? Object.keys(data.registros).length : 0);
      container.innerHTML += `
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <h5>${data.nombre || group}</h5>
              <p><strong>Sector:</strong> ${data.municipio || "No asignado"}</p>
              <p><strong>Hora:</strong> ${data.hora || "No definida"}</p>
              <p><strong>Libro:</strong> ${data.libro || "No definido"}</p>
              <p><strong>Cupos disponibles:</strong> ${disponibles}</p>
              <button class="btn btn-primary" onclick="selectGroup('${group}')"
                ${disponibles <= 0 ? "disabled" : ""}>Unirse</button>
            </div>
          </div>
        </div>`;
    }
  });
}

function selectGroup(group) {
  selectedGroup = group;
  document.getElementById("selectedGroupName").textContent = group;
  showView("registrationForm");
}

function submitForm(e) {
  e.preventDefault();
  const data = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    edad: document.getElementById("edad").value,
    sexo: document.getElementById("sexo").value,
    telefono: document.getElementById("telefono").value
  };
  db.ref(`groups/${selectedGroup}/registros`).push(data, () => {
    alert("Registro exitoso");
    // Resetear el formulario para limpiar los campos
    document.querySelector("#registrationForm form").reset();
    showView("groupSelection");
  });
}

function loadLeaderPanel() {
  const configDiv = document.getElementById("leaderConfig");
  const tablesDiv = document.getElementById("leaderTables");
  configDiv.innerHTML = "";
  tablesDiv.innerHTML = "";

  db.ref("groups").once("value", snapshot => {
    const groups = snapshot.val();

    for (let group in groups) {
      const g = groups[group];

      // Config editable (incluyendo el campo "nombre")
      configDiv.innerHTML += `
        <div class="mb-4 card p-3">
          <h4>Configuración de: ${g.nombre || group}</h4>
          <div class="mb-2">
            <label>Nombre del grupo:</label>
            <input class="form-control" value="${g.nombre || ""}" onchange="updateGroupField('${group}', 'nombre', this.value)">
          </div>
          <div class="mb-2">
            <label>Sector:</label>
            <input class="form-control" value="${g.municipio || ""}" onchange="updateGroupField('${group}', 'municipio', this.value)">
          </div>
          <div class="mb-2">
            <label>Hora:</label>
            <input class="form-control" value="${g.hora || ""}" onchange="updateGroupField('${group}', 'hora', this.value)">
          </div>
          <div class="mb-2">
            <label>Libro:</label>
            <input class="form-control" value="${g.libro || ""}" onchange="updateGroupField('${group}', 'libro', this.value)">
          </div>
          <div class="mb-2">
            <label>Cupos:</label>
            <input type="number" class="form-control" value="${g.cupos || 0}" onchange="updateGroupField('${group}', 'cupos', this.value)">
          </div>
        </div>`;

      // Tabla de registros
      const registros = g.registros || {};
      let rows = "";
      for (let id in registros) {
        const r = registros[id];
        rows += `<tr>
          <td>${r.nombre}</td>
          <td>${r.apellido}</td>
          <td>${r.edad}</td>
          <td>${r.sexo}</td>
          <td>${r.telefono}</td>
          <td><button class="btn btn-sm btn-danger" onclick="removeUser('${group}', '${id}')">Eliminar</button></td>
        </tr>`;
      }

      tablesDiv.innerHTML += `
        <div class="mt-5">
          <h5>${g.nombre || group}</h5>
          <table class="table table-bordered">
            <thead><tr><th>Nombre</th><th>Apellido</th><th>Edad</th><th>Sexo</th><th>Teléfono</th><th>Acciones</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }
  });
}

function updateGroupField(group, field, value) {
  db.ref(`groups/${group}/${field}`).set(value, () => {
    if (field === 'nombre') loadLeaderPanel();
  });
}

function removeUser(group, id) {
  if (confirm("¿Eliminar este registro?")) {
    db.ref(`groups/${group}/registros/${id}`).remove(() => {
      loadLeaderPanel();
    });
  }
}

window.onload = () => {
  showView("groupSelection");
};
