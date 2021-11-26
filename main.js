const recipeEl = document.querySelector("#recipe")
const popupEl = document.querySelector(".popup__container")
const popupCloseEl = document.querySelector("#popup__close")
const recipeDetails = document.querySelector("#recipe__details")
const searchBox = document.querySelector("#search")
const searchBtn = document.querySelector("#searchBtn")
const FavRecipeList = document.querySelector(".favRecipe__content")

async function getRandomRecipe() {
  try {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/random.php")
    if(!response) alert("Problem getting random recipe! Please re-load the page!")
    const randomRecipeData = await response.json()
    
    const randomRecipe = randomRecipeData.meals[0]

    addRecipe(randomRecipe, random = true)
  } catch (error) {
    alert(error.message)
  }
}
getRandomRecipe()

function addRecipe(recipe, random = false) {
  console.log(recipe)
  const meal = document.createElement("div")
  meal.classList.add("random__recipe__content")
  meal.innerHTML = `
    <div class="random__recipe__container">
      <div class="recipe__img">
        <img src="${recipe.strMealThumb}">
        ${random ?`<span>Random Recipe</span>` : ""}
      </div>
      <div class="recipe__content">
        <h4>${recipe.strMeal}</h4>
        <button type="submit" id="fav__btn"><i class="far fa-heart"></i></button>
      </div>
    </div>
  `
  recipeEl.appendChild(meal)

  // add to favorite
  const favBtn = meal.querySelector(".random__recipe__container .recipe__content #fav__btn")
  favBtn.addEventListener("click", () => {
    if (favBtn.classList.contains("active")) {
      removeDataFromFav(recipe.idMeal)
      favBtn.classList.remove("active")
    }else {
      setDataForFav(recipe.idMeal)
      favBtn.classList.add("active")
    }
    getDataForFav()
  })
  // for stay favorite button selected when recipe is already in favorite list
  const localStorageId = getDataForSet()
  localStorageId.map((id) => {
    let ids = id
    if (recipe.idMeal === ids) {
      favBtn.classList.add("active")
    }
  })

  // passing fetch recipe data
  meal.querySelector(".random__recipe__content .random__recipe__container").addEventListener("click",() => {
    popupMealDetails(recipe)
  })
}

function popupMealDetails(recipeData) {
  recipeDetails.innerHTML = ""
  const detailsEl = document.createElement("div")
  
  const ingredients = []
  for (let i = 1; i <= 20; i++) {
    if (recipeData["strIngredient" + i]) { 
      ingredients.push(`
        ${recipeData["strIngredient" + i]} - ${recipeData["strMeasure" + i]}
      `)
    }
  }

  detailsEl.innerHTML = `
    <h1>${recipeData.strMeal}</h1>
    <img src="${recipeData.strMealThumb}"/>
    <p>${recipeData.strInstructions}</p>
    <h2>Ingredients</h2>
    <ul>
      ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ul>
  `
  recipeDetails.appendChild(detailsEl)

  popupEl.classList.remove("hidden")
}

popupCloseEl.addEventListener("click",() => {
  popupEl.classList.add("hidden")
})

async function getRecipeBySearch(search) {
  try {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + search)
    if(!response) alert("Problem getting your search recipe! Please re-load the page!")
    const searchRecipeData = await response.json()
    
    const searchRecipe = searchRecipeData.meals

    return searchRecipe
  } catch  {
    alert("Problem getting your search recipe! Please re-load the page!")
  }
}

searchBtn.addEventListener("click", async () => {
  recipeEl.innerHTML = ""
  const searchItem = searchBox.value
  
  const recipe = await getRecipeBySearch(searchItem)
  
  recipe.forEach((searchRecipe) => addRecipe(searchRecipe))
})

async function getRecipeById(id) {
  try {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+ id)

    if(!response) alert("Problem getting recipe! Please re-load the page!")
    const idRecipeData = await response.json()
    
    const idRecipe = idRecipeData.meals[0]

    return idRecipe
    
  } catch {
    alert("Problem getting recipe! Please re-load the page!")
  }
}

function getDataForSet() {
  const recipeId = JSON.parse(localStorage.getItem("recipeId"))
  return recipeId === null ? [] : recipeId
}

function setDataForFav(recipeId) {
  const mealId= getDataForSet()

  localStorage.setItem("recipeId", JSON.stringify([...mealId, recipeId]))
}

function removeDataFromFav(recipeId) {
  const mealId = getDataForSet()
  
  localStorage.setItem("recipeId", JSON.stringify(mealId.filter((id) => id !== recipeId)))
}

async function getDataForFav() {
  FavRecipeList.innerHTML = ""
  const recipeId = getDataForSet()
  
  for (let i = 0; i < recipeId.length; i++) {
    const id = recipeId[i];
    const FavRecipe = await getRecipeById(id)
    addFavRecipe(FavRecipe)
  }
}
getDataForFav()

function addFavRecipe(data) {
  const li = document.createElement("li")
  li.innerHTML = `
    <img src="${data.strMealThumb}">
    <button class="clear"><i class="fas fa-times"></i></button>
  `
  const btn = li.querySelector(".clear")
  btn.addEventListener("click", () => {
    removeDataFromFav(data.idMeal)

    getDataForFav()
  })

  FavRecipeList.appendChild(li)  

  li.addEventListener("click", () => {
    popupMealDetails(data)
  })
}