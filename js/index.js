// Define Backend API URL
const API_URL = 'https://dev.ericfu.work';

function formatDoB(dateOfBirth) {
  let dob = new Date(dateOfBirth);
  return (
    dob.getFullYear() +
    '-' +
    ('0' + (dob.getMonth() + 1)).slice(-2) +
    '-' +
    ('0' + dob.getDate()).slice(-2)
  );
}

// index.js
document.addEventListener('DOMContentLoaded', () => {
  var sidenav = document.querySelectorAll('.sidenav');
  M.Sidenav.init(sidenav, {});

  var datePicker = document.querySelectorAll('.datepicker');
  M.Datepicker.init(datePicker, { format: 'yyyy-mm-dd' });

  const path = window.location.pathname;

  if (path.includes('/index.html')) {
    fetch(`${API_URL}/patients`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let tableRows;

        data.Items.forEach((d) => {
          tableRows += `
        <tr>
          <td>${d.firstName}</td>
          <td>${d.lastName}</td>
          <td>${formatDoB(d.dateOfBirth)}</td>
          <td>${d.address} ${d.city} ${d.country}</td>
          <th><a class="waves-effect waves-light btn" onclick="view_patient('${d.id}')">View</a>
          </th>
          <th><a class="waves-effect waves-light btn" onclick="delete_patient('${
            d.id
          }')">Delete</a></th>
      `;
        });
        $('.patients tbody').append(tableRows);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  if (path.includes('view.html')) {
    const id = window.location.search.split('=')[1];

    $.get(`${API_URL}/patients/${id}`)
      .fail(function (data) {
        console.log(data.responseText);
        alert('Get patient failed, Something went wrong, please try again');
        location.replace('index.html');
      })
      .done(function (data) {
        // In case there's no data, redirect to home page.
        if (data.Items.length == 0) {
          alert(`No Patient with id ${id}`);
          location.replace('index.html');
        }
        console.log(data.Items[0]);
        Object.keys(data.Items[0]).forEach((key) => {
          const element = document.getElementById(key);
          if (element) {
            element.value =
              key === 'dateOfBirth' ? formatDoB(data.Items[0][key]) : data.Items[0][key];
          }
        });

        // Initiate label style
        M.updateTextFields();

        // Set update_patient function to form with Patient id
        document
          .getElementById('update_patients_form')
          .addEventListener('submit', function (event) {
            event.preventDefault();
            update_patient(id);
          });
      });
  }

  if (path.includes('/add.html')) {
    document.getElementById('add_patients_form').addEventListener('submit', function (event) {
      event.preventDefault();
      add_patient();
    });
  }
});

// Redirect to view.html
function view_patient(id) {
  location.replace(`view.html?id=${id}`);
}

// Add Patient handler
function add_patient() {
  console.log('add_patient');
  const ids = ['firstName', 'lastName', 'dateOfBirth', 'address', 'city', 'country'];
  const patient = {};

  ids.forEach((id) => {
    patient[id] = document.getElementById(id).value;
  });

  $.post(`${API_URL}/patients`, patient)
    .fail(function (data) {
      console.log(data.responseText);
      alert('Add Patient: Something went wrong, please check logs or try again');
    })
    .done(function (data) {
      alert('Success');
      location.replace('index.html');
    });
}

function update_patient(patientId) {
  const ids = ['firstName', 'lastName', 'dateOfBirth', 'address', 'city', 'country'];
  const patient = {};

  ids.forEach((id) => {
    patient[id] = document.getElementById(id).value;
  });

  $.ajax({
    url: `${API_URL}/patients/${patientId}`,
    type: 'PUT',
    data: patient,
    success: function (data) {
      alert('Success');
      location.replace('index.html');
    },
    error: function (data) {
      console.log(data.responseText);
      alert('Something went wrong, please check logs or try again');
    }
  });
}

// Delete Patient handler
function delete_patient(id) {
  if (confirm('Are you sure you want to delete this patient?')) {
    $.ajax({
      url: `${API_URL}/patients/${id}`,
      type: 'DELETE',
      success: function (data) {
        console.log(data);
        location.replace('index.html');
      }
    }).fail(function (data) {
      console.log(data.responseText);
      alert('Something went wrong, please refresh and try again');
    });
  } else {
    return false;
  }
}
