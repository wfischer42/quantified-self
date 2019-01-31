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
      let newView = e.currentTarget.dataset.path;
      localStorage.setItem('view', newView);
      let path = "../" + e.currentTarget.dataset.path + ".html";
      $("#content").load(path, function(){
        presentViewData();
      });
    });
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
