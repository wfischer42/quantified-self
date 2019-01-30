import "./diary.scss";
import "./foods.scss";

let view = localStorage.getItem('view') || 'diary'

$("#content").load("../" + view + ".html");

$(document).ready(function() {
  initializeHandlers();
  presentViewData();
})

function appendFoods(foods) {
  sessionStorage.setItem('foods', JSON.stringify(foods))
  for (var i = 0; i < foods.length; i++) {
    var food = foods[i]
    $('#food-list').append(`
      <tr>
        <td>${food.name}</td>
        <td>${food.calories}</td>
        <td class="delete">
          <button class="delete-food" type="button" data-id="${food.id}">
            Delete
          </button>
        </td>
      </tr>
    `);
  }
}

function getFoods(){
  var foods = sessionStorage.getItem('foods')
  if (!foods) {
    fetch(`https://fast-meadow-36413.herokuapp.com/api/v1/foods`)
      .then(response => response.json())
      .then(foods => appendFoods(foods))
      .catch(error => console.error({ error }));
  } else {
    appendFoods(JSON.parse(foods))
  }
}

function initializeHandlers() {
  $("#content").on("click", ".change-views", function(e){
    let newView = e.currentTarget.dataset.path;
    localStorage.setItem('view', newView);
    let path = "../" + e.currentTarget.dataset.path + ".html";
    $("#content").load(path , function(){
      presentViewData();
    });
  });
}

function presentViewData() {
  if (view == "foods") {
    getFoods();
  }
}
