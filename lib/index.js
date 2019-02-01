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

function appendFood(food) {
  $('#food-list').append(`
    <tr id="food-entry-${food.id}">
      <td>${food.name}</td>
      <td>${food.calories}</td>
      <td class="delete">
        <button id="delete-food-${food.id}" type="button" >
          Delete
        </button>
      </td>
    </tr>
  `);

  $(`#delete-food-${food.id}`).click(function(){
    fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods/${food.id}`, { method: "delete"
    }).then(response => removeFoodRow(food.id))
      .catch(error => console.error(error));
  });
}

function appendFoods(foods) {
  console.log(foods);
  for (var i = 0; i < foods.length; i++) {
    var food = foods[i]
    appendFood(food)
  }
}

function setDeleteFoodHandler(){
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

function removeFoodRow(id) {
  $(`#food-entry-${id}`).remove();
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
    // If the "food" form has no blank values
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
  fetch('https://quantified-self-api-1.herokuapp.com/api/v1/foods/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food)
  }).then(response => response.json())
    .then(raw => {
      if (food.id = raw['id']) {
        appendFood(food);
        setDeleteFoodHandler();
      }
    })
    .catch(error => console.log(error));
}
