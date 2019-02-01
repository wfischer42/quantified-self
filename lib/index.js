import "./diary.scss";
import "./foods.scss";

let view = localStorage.getItem('view') || 'foods'
const fadeTime = 150;


$(document).ready(function() {
  $("#content").load("../" + view + ".html", function() {
    initializeHandlers();
    presentViewData();
  });
})

function deleteFood(id){
  console.log("deleting");
}

function appendFoods(foods) {
  console.log(foods);
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
  $(".delete-food").click(function(e) {
    var id = e.currentTarget.dataset.id;
    fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods/${id}`, { method: "delete"
    }).then(response => removeFoodRow(e))
      .catch(error => console.error(error));
  })
}

function getFoods() {
  fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods`)
    .then(response => response.json())
    .then(foods => appendFoods(foods))
    .then(response => $('#content').fadeIn(fadeTime))
    .catch(error => console.error({ error }));
}

function removeFoodRow(e) {
  $(e.currentTarget).parents('tr').remove();
}

function initializeHandlers() {
  $("#content").on("click", ".change-views", function(e){
    $("#content").fadeOut(fadeTime, function() {
      view = e.currentTarget.dataset.path;
      localStorage.setItem('view', view);
      let path = "../" + view + ".html";
      $("#content").load(path, function(){
        presentViewData();
      });
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
  switch (view) {
    case 'foods':
      getFoods();
      break;
    default:
      $('#content').fadeIn(fadeTime);
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
