import "./diary.scss";
import "./foods.scss";

let view = localStorage.getItem('view') || 'foods'
const fadeTime = 150;

let editing;

$(document).ready(function() {
  $("#content").load(`../${view}.html`, function() {
    initializeHandlers();
    presentViewData();
  });
})

function deleteFood(id){
  console.log("deleting");
}

function appendFood(food) {
  $('#food-list tr:last').after(`
    <tr id="food-entry-${food.id}" class="food-row">
    </tr>
  `).promise().done(showFoodRow(food));
}

function showFoodEditForm(food) {
  editing = food;
  $(`#food-entry-${food.id}`).html(`
    <form class="food-edit-form">
      <td>
        <input id="name-edit-${food.id}" type="text" name="food-name" placeholder="${food.name}" />
        </td>
      <td>
        <input id="calorie-edit-${food.id}" type="number" name="calories" placeholder="${food.calories}" min="0" max="1000" />
      </td>
      <td>
        <button id="save-edit-${food.id}" type="submit">Done</button>
      </td>
      <td>
        <button id="cancel-edit-${food.id}" type="reset">Cancel</button>
      </td>
    </form>
    `).promise().done(function() {
      $(`#name-edit-${food.id}`).focus();
      $(`#save-edit-${food.id}`).click(function(){
        updateFood(food);
      });
      $(`#cancel-edit-${food.id}`).click(function(){
        showFoodRow(food);
      });
      $(`#name-edit-${food.id}, #calorie-edit-${food.id}`)
        .keyup(function(event) {
          if (event.keyCode === 13) {
            updateFood(food);
          }
        });
    });
}

function updateFood(food) {
  var foodChange = false;
  if ($(`#name-edit-${food.id}`).val()){
    foodChange = true;
    food.name = $(`#name-edit-${food.id}`).val()
  }
  if ($(`#calorie-edit-${food.id}`).val()){
    foodChange = true;
    food.calories = $(`#calorie-edit-${food.id}`).val();
  }
  if (foodChange == true) {
    updateChangedFood(food);
  } else {
    showFoodRow(food);
  }
}

function updateChangedFood(food) {
  delete food.created_at;
  delete food.updated_at;
  fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods/${food.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(food)
  }).then(response => response.json())
    .then(food => showFoodRow(food['food']))
    .catch(error => console.error({ error }));
}

function showFoodRow(food) {
  $(`#food-entry-${food.id}`).html(`
    <td>${food.name}</td>
    <td>${food.calories}</td>
    <td class="edit">
      <button id="edit-food-${food.id}" type="button" >
      Edit
      </button>
    </td>
    <td class="delete">
      <button id="delete-food-${food.id}" type="button" >
        Delete
      </button>
    </td>
  `);
  $(`#delete-food-${food.id}`).click(function(){
    fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods/${food.id}`, { method: "delete"
    }).then(response => removeFoodRow(food.id))
      .catch(error => console.error(error));
  });

  $(`#edit-food-${food.id}`).click(function(){
    if(editing) { showFoodRow(editing); }
    showFoodEditForm(food);
  });
}

function showMealFoodRow(meal_id, food) {
  $(`#meal-${meal_id}-table tr:last`).after(`
  <tr>
    <td>${food.name}</td>
    <td>${food.calories}</td>
    <td class="delete">
      <button id="delete-meal-food-${food.id}" type="button" >
        Delete
      </button>
    </td>
  </tr>
  `).promise().done();
}

function appendFoods(foods) {
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

function getMeals() {
  fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/meals`)
    .then(response => response.json())
    .then(meals => appendMeals(meals))
    .then(response => $('#content').fadeIn(fadeTime))
    .catch(error => console.error({ error }));
}

function getMeals(){
  return fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/meals`)
    .then(response => response.json())
}

function appendMeals(meals) {
  for (var i in meals) {
    $('#meals-list').append(`
      <div id='meal-${meals[i].id}'>
        <h3>${meals[i].name}</h3>
        <table class="meal-list" id="meal-${meals[i].id}-table">
          <tr>
            <th class="name-header">Food</th>
            <th class="calories-header">Calories</th>
            <th class="button-header"></th>
          </tr>
        </table>
      </div>
      `).promise().done(function(){
          for (var j in meals[i].foods){
            showMealFoodRow(meals[i].id, meals[i].foods[j]);
          }
        });
  }
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
    if (!Object.values(food).includes("")) {
      addFood(food);
    }
  });

  $("#content").on("keyup", "#filter-input", function() {
    var filterString = $("#filter-input").val().toLowerCase();
    if (filterString != "") {
      $('.food-row').each(function() {
        var foodString = $(this).children('td').first().html().toLowerCase()
        if (!foodString.startsWith(filterString)) {
          $(this).hide();
        } else {
          $(this).show();
        }
      });
    } else {
      $('.food-row').show();
    }
  });

  $("#content").on("click", "#clear-filter-btn", function() {
    $('.food-row').show();
  });
}

function filterMealsByDate(meals, date){
  date = date.toLocaleDateString()
  return meals.filter(function (el) {
    return (new Date(el.date)).toLocaleDateString() == date;
  });
}

function presentViewData() {
  switch (view) {
    case 'foods':
      getMeals()
        .then(meals => filterMealsByDate(meals, new Date("2/5/2019")))
        .then(meals => appendMeals(meals))
        .then(response => $('#content').fadeIn(fadeTime))
        .catch(error => console.error({ error }));
      getFoods();
      break;
    case 'diary':
      getMeals();
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
