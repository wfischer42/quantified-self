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
    fetch('https://fast-meadow-36413.herokuapp.com/api/v1/foods')
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

  $("#content").on("click", "#add-food-btn", function(e){
    e.preventDefault();
    var food = { name: $("[name='food-name']").val(),
                 calories: $("[name='calories']").val() }
                 debugger;
    // If "food" has no blank values
    if (!Object.values(food).includes("")) {
      addFood(food);
    }
  });
}

function presentViewData() {
  if (view == "foods") {
    getFoods();
  }
}

function addFood(food) {
  // Can't finish until the route is working
  fetch('https://fast-meadow-36413.herokuapp.com/api/v1/foods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: food
  }).then(response => console.log(response))
}
