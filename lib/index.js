import "./history.scss";
import "./foods.scss";

let state = {};
state.diaryDate = new Date(sessionStorage.getItem('diaryDate')) || new Date()

let view = localStorage.getItem('view') || 'foods'
const fadeTime = 150;

let editing;

const apiUrl = "https://quantified-self-api-1.herokuapp.com/api/v1/"

$(document).ready(function() {
  $("#content").load(`../${view}.html`, function() {
    initializeHandlers();
    presentViewData();
  });
})

function configureDateInput(){
  var formattedDate = formatDate(state.diaryDate)
  var formattedToday = formatDate(new Date())
  $('#diary-date').val(formattedDate).prop("max", formattedToday).change(function(){
    var newDate = new Date($('#diary-date').val())
    newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset())
    sessionStorage.setItem('diaryDate', newDate )
    state.diaryDate = newDate;
    refreshMeals();
  });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function cancelFoodEdit(){
  if(editing) { showFoodRow(editing); }
}

function appendFood(food) {
  $('#food-list tr:last').after(`
    <tr id="food-entry-${food.id}" class="food-row" data-id="${food.id}">
    </tr>
  `).promise().done(showFoodRow(food));
}

function showFoodEditForm(food) {
  editing = food;
  $(`#food-entry-${food.id}`).html(`
    <form class="food-edit-form">
      <td>
        <input id="name-edit-${food.id}" class="food-edit" type="text" name="food-name" placeholder="${food.name}" />
        </td>
      <td>
        <input id="calorie-edit-${food.id}" class="food-edit" type="number" name="calories" placeholder="${food.calories}" min="0" max="1000" />
      </td>
      <td>
        <button id="save-edit-${food.id}" type="submit">
        <span class="fas fa-check"></span>
        </button>
      </td>
      <td>
        <button id="cancel-edit-${food.id}" type="reset">
        <span class="fa fa-close"></span>
        </button>
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
    <td class="food-cell">${food.name}</td>
    <td class="food-cell">${food.calories}</td>
    <td class="edit">
      <button id="edit-food-${food.id}" type="button" >
      <span class="fas fa-pen"></span>
      </button>
    </td>
    <td class="delete">
      <button id="delete-food-${food.id}" type="button" >
      <span class="fas fa-trash"></span>
      </button>
    </td>
  `);
  $(`#delete-food-${food.id}`).click(function(event){
    disselectFoodRows();
    fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/foods/${food.id}`, { method: "delete"
    }).then(response => removeFoodRow(food.id))
      .catch(error => console.error(error));
  });

  $(`#edit-food-${food.id}`).click(function(event){
    disselectFoodRows();
    event.stopPropagation();
    if(editing) { showFoodRow(editing); }
    showFoodEditForm(food);
  });
}

function showMealFoodRow(mealId, food) {
  if (food.id != null){
    $(`#meal-${mealId}-table tr:last`).after(`
      <tr>
        <td>${food.name}</td>
        <td>${food.calories}</td>
        <td class="delete">
          <button class="del-mealfood" type="button" data-mealid="${mealId}" data-foodid="${food.id}">
            Delete
          </button>
        </td>
      </tr>
      `)
  } else {
    $(`#meal-${mealId}-table`).after(`Nothing added yet...`)
  }
}

function deleteMealFood(mealId, foodId){
  return fetch(apiUrl + 'meals/' + mealId + "/foods/" + foodId, {
    method: "delete"
  }).catch(error => console.error(error));
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

function getMeals(){
  return fetch(`https://quantified-self-api-1.herokuapp.com/api/v1/meals`)
    .then(response => response.json())
}

function appendMeals(meals) {
  var calorieCount = 0
  for (var i = 0; i < meals.length; i++) {
    calorieCount += mealCalories(meals[i])
    $('#add-selection-buttons').append(`
      <button id="meal-${meals[i].id}-add-food" class="add-meal-food" data-id="${meals[i].id}" disabled>${meals[i].name}</button>
      `);

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
          for (var j = 0; j < meals[i].foods.length; j++) {
            showMealFoodRow(meals[i].id, meals[i].foods[j]);
          }
        });
  }
  $('#meals-list input').after(`
    <div class="calorie-count">
      Total Calories for the Day: ${calorieCount}
    </div>
  `)
}

function mealCalories(meal) {
  var cals = 0
  for (var i = 0; i < meal.foods.length; i++) {
    if (meal.foods[i] != null){
      cals += meal.foods[i].calories
    }
  }
  return cals
}

function refreshMeals() {
  $('#add-selection-buttons').html('')
  $('#meals-list h2').nextAll().remove()
  getMeals()
    .then(meals => filterMealsByDate(meals))
    .then(meals => appendMeals(meals))
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

  $('#content').on("click", ".food-edit", function(event) {
    event.stopPropagation();
    disselectFoodRows();
  })

  $('#content').on("click", ".food-cell", function(event) {
    var row = event.currentTarget.parentElement
    toggleFoodRow(row)

  })

  $('#content').on("click", "button.add-meal-food", function(event){
    var mealId = event.currentTarget.dataset["id"]
    var rows = $('.selected-row')
    disselectFoodRows();
    for (var i = 0; i < rows.length; i++) {
      var foodId = rows[i].dataset['id']
      if ((i + 1) == rows.length){
        postFoodToMeal(mealId, foodId).then(a => refreshMeals());
      } else {
        postFoodToMeal(mealId, foodId);
      }
    }
  });

  $('#content').on("click", 'button.del-mealfood', function(event){
      var ids = event.currentTarget.dataset
      deleteMealFood(ids["mealid"], ids["foodid"])
      $(`button.del-mealfood[data-mealid="${ids['mealid']}"][data-foodid="${ids['foodid']}"]`).parents('tr').remove()

      if ($(`#meal-${ids["mealid"]}-table tr`).length == 1){
        $(`#meal-${ids["mealid"]}-table`).after(`Nothing added yet...`)
      }
    })

  $(document).click(function(event){
    cancelFoodEdit();
  })
}

function postFoodToMeal(mealId, foodId) {
  return fetch(apiUrl + 'meals/' + mealId + '/foods/' + foodId, {
    method: 'POST'
  }).then(response => response.json())
    .catch(error => console.log(error));
}

function toggleFoodRow(row) {
  if ($(row).hasClass('selected-row')){
    $(row).removeClass('selected-row')
  } else {
    $(row).addClass('selected-row')
  }
  toggleSelectorButtons()
}

function disselectFoodRows(){
  $('.selected-row').removeClass('selected-row')
  toggleSelectorButtons()
}

function toggleSelectorButtons(){
  if ($('.selected-row').length){
    $('button.add-meal-food').prop("disabled",false);
  } else {
    $('button.add-meal-food').prop("disabled",true);
  }
}

function filterMealsByDate(meals){

  var date = formatDate(state.diaryDate)

  var processedMeals = meals.filter(function (el) {
    return el.date.slice(0,10) == date;
  });

  if (processedMeals.length) {
    return processedMeals;
  } else {
    var mealNames = ["Breakfast", "Lunch", "Dinner", "Snacks"]
    var promises = []
    for (var i = 0; i < mealNames.length; i++) {
      promises[i] = createMealForDate(mealNames[i], date)
    }
    Promise.all(promises).then(refreshMeals)
  }
}

function createMealForDate(name, date) {
  var meal = {name: name, date: date}
  return fetch(apiUrl + 'meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(meal)
  }).then(response => response.json())
    .catch(error => console.log(error));
}

function showAddSelectionButton(id, name){
  $('#add-selection-buttons').append(`
    <button id="meal-${meals[i].id}-add-food" class="add-meal-food" data-id="${meals[i].id}" disabled>${meals[i].name}</button>
    `);
}

function presentViewData() {
  switch (view) {
    case 'foods':
      getMeals()
        .then(meals => filterMealsByDate(meals))
        .then(meals => appendMeals(meals))
        .then(configureDateInput())
        .then(response => $('#content').fadeIn(fadeTime))
        .catch(error => console.error({ error }));
      getFoods();
      break;
    case 'history':
      getMeals()
        .then(meals => presentHistory(meals))
        .then(response => $('#content').fadeIn(fadeTime))
        .catch(error => console.error({ error }));
    default:
      $('#content').fadeIn(fadeTime);
  }
}

function presentHistory(meals){
  var sorted = meals.sort(function(a,b) {
    if (b.date > a.date) {
      return 1
    } else {
      return -1
    }
  })
  var groupedMeals = meals.groupBy('date')
  for (var date in groupedMeals){
    var newDate = new Date(date)
    newDate.setMinutes(newDate.getMinutes() + newDate.getTimezoneOffset())
    var dateString = newDate.toLocaleDateString();
    var cals = totalCalories(groupedMeals[date])
    var pct = Math.floor(cals/2000.0 * 100)
    var bg = "gr"
    if (pct > 100) {
      bg = "rd"
    }
    $('#meal-history').append(`
      <div class="day-row">
        ${dateString} - ${cals} calories
        <div class="progress-bar ${bg}" style="width: ${pct}%"></div>
      </div>
      `)
    // $('#meal-history').append(`
    //   <div class="day-row">
    //   ${dateString}: ${cals}
    //   </div>
    //   `)
    // console.log(dateString)
    // console.log(cals)
  }
}

function totalCalories(meals){
  return meals.reduce(function(calories, meal) {
    calories += mealCalories(meal)
    return calories
  }, 0)
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

// Experimenting with some stuff
// Add a function to the Array prototype that takes a 'property' parm
Array.prototype.groupBy = function(property) {
  // implement an inject(reduce) pattern on the original object
  // The first param is the function to call on each element
  // which itself takes the accumulator and the element as arguments.
  // The second param {} is the initial value for the accumulator.
  return this.reduce(function(groups, item) {
    // The key for each group is the value of the property passed in
    const groupKey = item[property]
    // If there are no values stored for that group key, initialize an empty group
    groups[groupKey] = groups[groupKey] || []
    // Then add the item to that group
    groups[groupKey].push(item)
    // And return the group accumulator in its final state.
    return groups
  }, {})
}
