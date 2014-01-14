/**
  This route is used when listing a particular category's topics

  @class ListCategoryRoute
  @extends Discourse.Route
  @namespace Discourse
  @module Discourse
**/
Discourse.ListCategoryRoute = Discourse.FilteredListRoute.extend({

  model: function(params) {
    this.controllerFor('listTop').set('content', null);
    this.controllerFor('listCategories').set('content', null);
    return Discourse.Category.findBySlug(params.slug, params.parentSlug);
  },

  setupController: function(controller, category) {
    var listTopicsController = this.controllerFor('listTopics');
    if (listTopicsController) {
      var listContent = listTopicsController.get('content');
      if (listContent) {
        listContent.set('loaded', false);
      }
    }

    var listController = this.controllerFor('list'),
        categorySlug = Discourse.Category.slugFor(category),
        self = this,
        filter = this.get('filter') || "latest",
        url = "category/" + categorySlug + "/l/" + filter,
        params = {};

    if (this.get('noSubcategories')) {
      params.no_subcategories = true;
    }

    listController.setProperties({ filterMode: url, category: null });
    listController.load(url, params).then(function(topicList) {
      listController.setProperties({
        canCreateTopic: topicList.get('can_create_topic'),
        category: category
      });
      self.controllerFor('listTopics').setProperties({
        content: topicList,
        category: category
      });
      Discourse.FilteredListRoute.scrollToLastPosition();
    });
  }
});

Discourse.ListCategoryNoneRoute = Discourse.ListCategoryRoute.extend({ noSubcategories: true });

_.each(Discourse.TopList.PERIODS, function(period) {
  Discourse["ListTop" + period.capitalize() + "CategoryRoute"] = Discourse.ListCategoryRoute.extend({ filter: "top/" + period });
  Discourse["ListTop" + period.capitalize() + "CategoryNoneRoute"] = Discourse.ListCategoryRoute.extend({ filter: "top/" + period, noSubcategories: true });
});
