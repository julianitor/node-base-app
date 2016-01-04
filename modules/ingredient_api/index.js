var express = require('express');
/**
 * Returns the Ingredient API module
 * @param {Object} webapp            Express module
 * @param {Object} ingredientService DB access for ingredients
 * @param {Object} httpSecurity      Express security middleware
 * @param {Object} config            Configuration
 */
function IngredientAPIFactory(webapp, ingredientService, httpSecurity, config){
  var app = webapp.app;

  function getIngredient(req, res, next, ingredientId){
    if(!ingredientId){
      res.status(404).end();
    }
    else {
      ingredientService.getById(ingredientId).then(ingredient => {
        if(!ingredient){
          return res.status(404).end();
        }
        req.ingredient = ingredient;
        next();
      });
    }
  }

  function validateIngredient(data){
    var errors = [];
    if(!data.name || data.name.toString().trim().length === 0){
      errors.push({ field: 'name', message: 'Ingredient must have a name'});
    }
    if(!data.cost || isNaN(parseFloat(data.cost))){
      errors.push({ field: 'cost', message: 'Ingredient must have a valid floating-point cost'});
    }
    if(!data.stock || isNaN(parseInt(data.stock))){
      errors.push({ field: 'stock', message: 'Ingredient must have a valid integer stock'});
    }

    return errors;
  }

  function getAll(req, res){
    console.log('Ingredients.getAll');
    ingredientService.getAll().then(ingredients => {
      res.send({
        type: 'ingredients',
        success: true,
        data: ingredients
      });
    })
    .catch(err => {
      console.log('Ingredient API error', err);
      res.status(500).end();
    })
  }

  function getById(req, res){
    res.send({
      type: 'ingredient',
      success: true,
      data: req.ingredient
    });
  }

  function create(req, res){
    var postData = {
      name: req.body.name,
      cost: req.body.cost,
      stock: req.body.stock
    }

    var errors = validateIngredient(postData);
    if(errors.length){
      res.status(406).send({
        type: 'ingredient',
        success: false,
        errors: errors
      })
    }
    else {
      ingredientService.create(postData)
    }
  }

  function update(req, res){

  }

  function deleteById(req, res){

  }


  //all routes are secure

  app.param('ingredientId', getIngredient);
  app.get('/api/ingredients', httpSecurity.requireToken, getAll);
  app.get('/api/ingredients/:ingredientId', httpSecurity.requireToken, getById);
  app.post('/api/ingredients', httpSecurity.requireToken, create);
  app.put('/api/ingredients/:ingredientId', httpSecurity.requireToken, update);
  app.delete('/api/ingredients/:ingredientId', httpSecurity.requireToken, deleteById);
  //app.use('/api', router);

  console.log('Ingredient API attached');

  return {}

}

module.exports = IngredientAPIFactory;