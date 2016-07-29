;(function() {
/*
 * require-ajax-views v1.0
 * https://github.com/Pyco7/django-ajax-views
 * Copyright (c) 2016 Emanuel Hafner
 * Licensed under the MIT License
 */
var cs, cs_manager, cs_app, cs_middleware, cs_view, cs_plugins_filterview;
(function (global, factory) {
  if (typeof jQuery === 'undefined') {
    throw new Error('Ajax views requires jQuery.');
  }
  define(['jquery'], factory);
}(this, function ($) {
  'use strict';
  cs = {
    load: function (id) {
      throw new Error('Dynamic load not allowed: ' + id);
    }
  };
  // Generated by CoffeeScript 1.7.1
  (function () {
    var __indexOf = [].indexOf || function (item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item)
          return i;
      }
      return -1;
    };
    cs_manager = function () {
      var ViewManager;
      return ViewManager = function () {
        var Manager, _instance;
        function ViewManager() {
        }
        _instance = null;
        ViewManager.get = function (cfg) {
          return _instance != null ? _instance : _instance = new Manager(cfg);
        };
        Manager = function () {
          function Manager(cfg) {
            this.cfg = cfg;
            this.userMiddleware = {};
            if (!this.cfg) {
              throw 'View manager can not be initialized without config.';
            }
          }
          Manager.prototype.getJsonCfg = function (response) {
            if (response == null) {
              response = null;
            }
            if (response) {
              return $.parseJSON($(response).find(this.cfg.cfgNode).html());
            } else {
              return $.parseJSON($(this.cfg.cfgNode).html());
            }
          };
          Manager.prototype.getViewTypeMethod = function (viewType) {
            switch (false) {
            case viewType !== 'formView':
              return '_onFormLoad';
            case viewType !== 'detailView':
              return '_onDetailLoad';
            case viewType !== 'listView':
              return '_onListLoad';
            default:
              return null;
            }
          };
          Manager.prototype.getModuleName = function (viewName) {
            var mixin, views, _ref;
            _ref = this.cfg.mixins;
            for (mixin in _ref) {
              views = _ref[mixin];
              if (__indexOf.call(views, viewName) >= 0) {
                return this.cfg.mixinPath + mixin;
              }
            }
            return this.cfg.viewPath + viewName;
          };
          Manager.prototype.requireModule = function (jsonCfg, callback) {
            var errorFunc, moduleName, viewFunc;
            this.debugInfo(jsonCfg);
            if (jsonCfg.ajax_view) {
              moduleName = this.getModuleName(jsonCfg.view_name);
              viewFunc = function (Module) {
                return callback(Module);
              };
              errorFunc = function (_this) {
                return function (error) {
                  if (_this.cfg.debug) {
                    return console.log('Debug: no module ' + moduleName + ' defined');
                  }
                };
              }(this);
              return require([this.cfg.modulePrefix + moduleName], viewFunc, errorFunc);
            } else {
              return callback(cs_view);
            }
          };
          Manager.prototype.debugInfo = function (jsonCfg) {
            if (jsonCfg == null) {
              jsonCfg = {};
            }
            if (this.cfg.debug) {
              if (jsonCfg.ajax_view) {
                console.log('Debug view:     init ' + jsonCfg.view_name + ' view');
              } else {
                console.log('Debug view:     no ajax view loaded');
              }
              return console.log('Debug response:', jsonCfg);
            }
          };
          Manager.prototype.updateView = function (scope, animate) {
            if (animate == null) {
              animate = true;
            }
            if (animate) {
              return $(this.cfg.ajaxNode).html($(scope).find(this.cfg.ajaxNode).html()).fadeIn('fast');
            } else {
              return $(this.cfg.ajaxNode).html($(scope).find(this.cfg.ajaxNode).html());
            }
          };
          Manager.prototype.updateModal = function (modalId, scope) {
            return $(modalId).find(this.cfg.modalNode).replaceWith($(scope).find(this.cfg.modalNode));
          };
          return Manager;
        }();
        return ViewManager;
      }();
    }();
  }.call(this));
  // Generated by CoffeeScript 1.7.1
  (function () {
    cs_app = function (ViewManager) {
      var AjaxApp;
      return AjaxApp = function () {
        function AjaxApp() {
        }
        AjaxApp._cfg = {
          cfgNode: '#config',
          ajaxNode: '#ajax-content',
          modalNode: '.modal-dialog',
          viewPath: 'views/',
          mixinPath: 'mixins/',
          modulePrefix: '',
          middleware: 'middleware',
          debug: false,
          mixins: {}
        };
        AjaxApp.config = function (userCfg) {
          if (userCfg == null) {
            userCfg = {};
          }
          if ('cfgNode' in userCfg) {
            this._cfg.cfgNode = userCfg.cfgNode;
          }
          if ('ajaxNode' in userCfg) {
            this._cfg.ajaxNode = userCfg.ajaxNode;
          }
          if ('modalNode' in userCfg) {
            this._cfg.modalNode = userCfg.modalNode;
          }
          if ('viewPath' in userCfg) {
            this._cfg.viewPath = userCfg.viewPath + '/';
          }
          if ('mixinPath' in userCfg) {
            this._cfg.mixinPath = userCfg.mixinPath + '/';
          }
          if ('mixins' in userCfg) {
            this._cfg.mixins = userCfg.mixins;
          }
          if ('modulePrefix' in userCfg) {
            this._cfg.modulePrefix = userCfg.modulePrefix;
          }
          if ('middleware' in userCfg) {
            this._cfg.middleware = userCfg.middleware;
          }
          if ('debug' in userCfg) {
            return this._cfg.debug = userCfg.debug;
          } else if (typeof require === 'function' && typeof require.specified === 'function') {
            return this._cfg.debug = true;
          }
        };
        AjaxApp.init = function () {
          var jsonCfg, loadView, manager;
          manager = ViewManager.get(this._cfg);
          jsonCfg = manager.getJsonCfg();
          loadView = function () {
            return manager.requireModule(jsonCfg, function (View) {
              var Q, method, view;
              Q = function (selector) {
                return $(selector);
              };
              view = new View(Q, null);
              view.jsonCfg = jsonCfg;
              if (view.initMiddleware) {
                view.__onPageLoad();
                view.__onLoad();
                if (view._onPageLoad) {
                  view._onPageLoad();
                }
                if (view._onLoad) {
                  view._onLoad();
                }
                if (jsonCfg.init_view_type) {
                  method = manager.getViewTypeMethod(jsonCfg.init_view_type);
                  if (view[method]) {
                    view[method]();
                  }
                }
              }
              if (view.onPageLoad) {
                view.onPageLoad();
              }
              if (view.onLoad) {
                return view.onLoad();
              }
            });
          };
          if (this._cfg.middleware) {
            /* amdclean */
            return require([this._cfg.modulePrefix + this._cfg.middleware], function (middleware) {
              manager.userMiddleware = middleware;
              return loadView();
            });
          } else {
            return loadView();
          }
        };
        return AjaxApp;
      }();
    }(cs_manager);
  }.call(this));
  // Generated by CoffeeScript 1.7.1
  (function () {
    var __indexOf = [].indexOf || function (item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item)
          return i;
      }
      return -1;
    };
    cs_middleware = function () {
      var middleware;
      return middleware = {
        onPageLoad: function () {
          var preview_data, preview_model_form;
          if (__indexOf.call(location.href, '?') >= 0) {
            history.replaceState({}, null, location.href.split('?')[0]);
          }
          if (this.jsonCfg.preview_stage && this.jsonCfg.preview_stage === 2) {
            preview_data = {};
            preview_data['preview_stage'] = this.jsonCfg.preview_stage;
            preview_model_form = this.jsonCfg.preview_model_form;
            if (preview_model_form) {
              preview_data['preview_model_form'] = $(preview_model_form).formSerialize();
            }
            $('form[data-async]').ajaxForm({
              data: preview_data,
              success: function (_this) {
                return function (response) {
                  if (response.redirect != null) {
                    return location.href = response.redirect;
                  } else {
                    return console.log('replace form?');
                  }
                };
              }(this)
            });
            return $('.preview-back').click(function (_this) {
              return function (e) {
                e.preventDefault();
                return history.back();
              };
            }(this));
          }
        },
        onAjaxLoad: function () {
          var modalId;
          if (this.scopeName && this.scopeName.indexOf('#modal_nr') >= 0) {
            modalId = this.scopeName;
            this.Q('form[data-async]').ajaxForm({
              beforeSerialize: function (_this) {
                return function ($form, options) {
                  if (_this.onBeforeFormSerialize) {
                    return _this.onBeforeFormSerialize($form, options);
                  }
                };
              }(this),
              beforeSubmit: function (_this) {
                return function (arr, $form, options) {
                  if (_this.onBeforeFormSubmit) {
                    return _this.onBeforeFormSubmit(arr, $form, options);
                  }
                };
              }(this),
              success: function (_this) {
                return function (response) {
                  var key, value, _ref;
                  if (response.success) {
                    _this.jsonCache.reload_view = true;
                    if (response.json_cache != null) {
                      _ref = response.json_cache;
                      for (key in _ref) {
                        value = _ref[key];
                        _this.jsonCache[key] = value;
                      }
                    }
                    return $(modalId).modal('hide');
                  } else {
                    _this.jsonCfg = _this.manager.getJsonCfg(response);
                    _this.manager.updateModal(modalId, response);
                    return _this.loadAjaxView();
                  }
                };
              }(this)
            });
            $(modalId).find('form[data-async]').on('click', '.popover.confirmation a[data-apply=confirmation]', function (_this) {
              return function (e) {
                e.preventDefault();
                return $.get($(e.currentTarget).attr('href'), {}, function (response) {
                  var key, value, _ref;
                  if (response.success) {
                    _this.jsonCache.reload_view = true;
                    if (response.json_cache != null) {
                      _ref = response.json_cache;
                      for (key in _ref) {
                        value = _ref[key];
                        _this.jsonCache[key] = value;
                      }
                    }
                    return $(modalId).modal('hide');
                  } else {
                    throw 'Object deletion failed!';
                  }
                });
              };
            }(this));
            return $(modalId).on('hidden.bs.modal', function (_this) {
              return function (e) {
                var data, field, fieldNode, formNode, key, pk, subModalId, value, _ref, _ref1, _ref2;
                $(e.currentTarget).remove();
                if (_this.viewCache.modalNr) {
                  $('body').addClass('modal-open');
                  if (_this.jsonCache.reload_view) {
                    _ref = _this.jsonCache;
                    for (key in _ref) {
                      value = _ref[key];
                      _this.viewCache.jsonCache[key] = value;
                    }
                    if (_this.jsonCache && _this.manager.cfg.debug) {
                      console.log('jsonCache ->', _this.jsonCache);
                    }
                    subModalId = _this.viewCache.scopeName;
                    formNode = $(subModalId).find('form[data-async]');
                    if ($(formNode).length) {
                      _ref1 = _this.jsonCache.select_choice;
                      for (field in _ref1) {
                        pk = _ref1[field];
                        fieldNode = $(formNode).find('#id_' + field);
                        $(fieldNode).append('<option value="' + pk + '"></option>').trigger('chosen:updated');
                        $(fieldNode).val(pk).trigger('chosen:updated');
                      }
                      data = $(formNode).formSerialize() + '&form_data=true';
                      return $.get($(formNode).attr('action'), data, function (response) {
                        _this.manager.updateModal(subModalId, response);
                        return _this.viewCache.loadAjaxView();
                      });
                    } else {
                      return $.get(_this.viewCache.jsonCfg.full_url, {}, function (response) {
                        _this.manager.updateModal(subModalId, response);
                        return _this.viewCache.loadAjaxView();
                      });
                    }
                  }
                } else {
                  if (_this.jsonCache.reload_view) {
                    _ref2 = _this.jsonCache;
                    for (key in _ref2) {
                      value = _ref2[key];
                      _this.viewCache.jsonCache[key] = value;
                    }
                    if (_this.jsonCache && _this.manager.cfg.debug) {
                      console.log('jsonCache ->', _this.jsonCache);
                    }
                    if (_this.jsonCache.ajax_load) {
                      if (_this.viewCache.onAjaxLoad) {
                        return _this.viewCache.onAjaxLoad();
                      }
                    } else {
                      return _this.viewCache.initView();
                    }
                  }
                }
              };
            }(this));
          }
        },
        onLoad: function () {
          if (this.Q('.modal-link').length) {
            this.Q('.modal-link:not(a)').on('mouseup', function (e) {
              if (e.which === 2) {
                return window.open($(this).attr('href'));
              }
            });
            this.Q('.modal-link').click(function (_this) {
              return function (e) {
                e.preventDefault();
                return _this.requestModal($(e.currentTarget).attr('href'));
              };
            }(this));
          }
          if (this.Q('.modal-link-cfg').length) {
            return this.Q('.modal-link-cfg').click(function (_this) {
              return function (e) {
                e.preventDefault();
                return _this.requestModal($(e.currentTarget).attr('href'), _this.jsonCfg);
              };
            }(this));
          }
        }
      };
    }();
  }.call(this));
  // Generated by CoffeeScript 1.7.1
  (function () {
    var __indexOf = [].indexOf || function (item) {
      for (var i = 0, l = this.length; i < l; i++) {
        if (i in this && this[i] === item)
          return i;
      }
      return -1;
    };
    cs_view = function (ViewManager, appMiddleware) {
      var View;
      return View = function () {
        function View(Q, scopeName) {
          var method, name, _ref;
          this.Q = Q;
          this.scopeName = scopeName;
          this.manager = ViewManager.get();
          this.initMiddleware = true;
          this.viewCache = null;
          this.jsonCache = {};
          this.jsonCfg = {};
          this.modalNr = null;
          for (name in appMiddleware) {
            method = appMiddleware[name];
            this['__' + name] = method;
          }
          _ref = this.manager.userMiddleware;
          for (name in _ref) {
            method = _ref[name];
            this['_' + name] = method;
          }
        }
        View.prototype.loadAjaxView = function () {
          var method;
          if (this.initMiddleware) {
            this.__onAjaxLoad();
            this.__onLoad();
            if (this._onAjaxLoad) {
              this._onAjaxLoad();
            }
            if (this._onLoad) {
              this._onLoad();
            }
            if (this.jsonCfg.init_view_type) {
              method = this.manager.getViewTypeMethod(this.jsonCfg.init_view_type);
              if (this[method]) {
                this[method]();
              }
            }
          }
          if (this.onAjaxLoad) {
            this.onAjaxLoad();
          }
          if (this.onLoad) {
            return this.onLoad();
          }
        };
        View.prototype.getRequestData = function (urlKwargs, jsonData) {
          var key, value, _jsonData, _urlKwargs;
          _urlKwargs = this.getUrlKwargs ? this.getUrlKwargs() : {};
          $.extend(_urlKwargs, urlKwargs);
          for (key in _urlKwargs) {
            value = _urlKwargs[key];
            if (value == null) {
              delete _urlKwargs[key];
            }
          }
          _jsonData = this.getJsonData ? this.getJsonData() : {};
          $.extend(_jsonData, jsonData);
          for (key in _jsonData) {
            value = _jsonData[key];
            if (value == null) {
              delete _jsonData[key];
            }
          }
          return [
            _urlKwargs,
            _jsonData
          ];
        };
        View.prototype.initRequest = function (viewName, urlKwargs, jsonData, callback) {
          var url, _jsonData, _ref, _urlKwargs;
          _ref = this.getRequestData(urlKwargs, jsonData), _urlKwargs = _ref[0], _jsonData = _ref[1];
          if (this.manager.cfg.debug) {
            console.log('Debug request: ', _urlKwargs, _jsonData);
          }
          url = Urls[viewName](_urlKwargs);
          if (__indexOf.call(location.hash, '#') >= 0) {
            if (url) {
              url += location.hash;
            } else {
              url = location.hash;
            }
          }
          if (url) {
            history.replaceState({}, null, url);
          }
          return $.get(url, { 'json_cfg': JSON.stringify(_jsonData) }, function (response) {
            return callback(response);
          });
        };
        View.prototype.initView = function (_arg) {
          var animate, jsonData, urlKwargs, viewName, _ref;
          _ref = _arg != null ? _arg : {}, viewName = _ref.viewName, urlKwargs = _ref.urlKwargs, jsonData = _ref.jsonData, animate = _ref.animate;
          if (viewName == null) {
            viewName = this.jsonCfg.view_name;
          }
          if (urlKwargs == null) {
            urlKwargs = {};
          }
          if (jsonData == null) {
            jsonData = {};
          }
          if (animate == null) {
            animate = true;
          }
          return this.initRequest(viewName, urlKwargs, jsonData, function (_this) {
            return function (response) {
              _this.jsonCfg = _this.manager.getJsonCfg(response);
              if (_this.jsonCfg.ajax_load) {
                _this.manager.updateView(response, animate);
                _this.manager.debugInfo(_this.jsonCfg);
                return _this.loadAjaxView();
              } else {
                if (_this.manager.cfg.debug) {
                  console.log('this should only happen if user session has expired');
                }
                return location.reload();
              }
            };
          }(this));
        };
        View.prototype.requestView = function (_arg) {
          var animate, jsonData, module, pageLoad, urlKwargs, viewName, _jsonData, _ref, _ref1, _urlKwargs;
          _ref = _arg != null ? _arg : {}, viewName = _ref.viewName, urlKwargs = _ref.urlKwargs, jsonData = _ref.jsonData, pageLoad = _ref.pageLoad, animate = _ref.animate;
          if (viewName == null) {
            viewName = null;
          }
          if (urlKwargs == null) {
            urlKwargs = {};
          }
          if (jsonData == null) {
            jsonData = {};
          }
          if (pageLoad == null) {
            pageLoad = false;
          }
          if (animate == null) {
            animate = true;
          }
          if (animate) {
            $(this.manager.cfg.ajaxNode).fadeOut('fast');
          }
          if (!viewName) {
            return this.initView({
              urlKwargs: urlKwargs,
              jsonData: jsonData,
              animate: animate
            });
          } else if (pageLoad) {
            _ref1 = this.getRequestData(urlKwargs, jsonData), _urlKwargs = _ref1[0], _jsonData = _ref1[1];
            return location.href = Urls[viewName](_urlKwargs) + '?json_cfg=' + JSON.stringify(_jsonData);
          } else {
            module = this.manager.getModuleName(viewName);
            return require([this.manager.cfg.modulePrefix + module], function (_this) {
              return function (View) {
                var Q, view;
                Q = function (selector) {
                  return $(this.manager.cfg.ajaxNode).find(selector);
                };
                view = new View(Q, _this.manager.cfg.ajaxNode);
                return view.initView({
                  viewName: viewName,
                  urlKwargs: urlKwargs,
                  jsonData: jsonData,
                  animate: animate
                });
              };
            }(this));
          }
        };
        View.prototype.requestSnippet = function (_arg) {
          var callback, jsonData, urlKwargs, _ref;
          _ref = _arg != null ? _arg : {}, urlKwargs = _ref.urlKwargs, jsonData = _ref.jsonData, callback = _ref.callback;
          if (urlKwargs == null) {
            urlKwargs = {};
          }
          if (jsonData == null) {
            jsonData = {};
          }
          if (callback == null) {
            callback = null;
          }
          return this.initRequest(this.jsonCfg.view_name, urlKwargs, jsonData, function (_this) {
            return function (response) {
              if (callback) {
                return callback(response);
              }
            };
          }(this));
        };
        View.prototype.requestModal = function (href, jsonData) {
          var data;
          if (jsonData == null) {
            jsonData = null;
          }
          if (this.manager.cfg.debug) {
            console.log('Debug request: ', href, jsonData);
          }
          data = {
            'modal_id': '#modal_nr' + parseInt(this.modalNr + 1) || '#modal_nr1',
            'json_cfg': jsonData ? JSON.stringify(jsonData) : void 0
          };
          return $.get(href, data, function (_this) {
            return function (response) {
              var jsonCfg;
              $('body').append($(response).find('.modal')[0].outerHTML);
              $(data.modal_id).modal('toggle');
              jsonCfg = _this.manager.getJsonCfg(response);
              return _this.manager.requireModule(jsonCfg, function (View) {
                var Q, view;
                Q = function (selector) {
                  return $(data.modal_id).find(selector);
                };
                view = new View(Q, data.modal_id);
                view.viewCache = _this;
                view.modalNr = _this.modalNr + 1 || 1;
                view.jsonCfg = jsonCfg;
                return view.loadAjaxView();
              });
            };
          }(this));
        };
        View.prototype.initModalLinks = function (scope) {
          return $(scope).find('.modal-link').click(function (_this) {
            return function (e) {
              e.preventDefault();
              return _this.requestModal($(e.currentTarget).attr('href'));
            };
          }(this));
        };
        return View;
      }();
    }(cs_manager, cs_middleware);
  }.call(this));
  // Generated by CoffeeScript 1.7.1
  (function () {
    var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
          if (__hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      };
    cs_plugins_filterview = function (View) {
      var FilterView;
      return FilterView = function (_super) {
        __extends(FilterView, _super);
        function FilterView() {
          return FilterView.__super__.constructor.apply(this, arguments);
        }
        FilterView.prototype.getJsonData = function () {
          var selectedFilterIndex, sortIndex;
          selectedFilterIndex = this.jsonCfg.selected_filter_index;
          sortIndex = this.jsonCfg.sort_index;
          return {
            'selected_filter_index': selectedFilterIndex || selectedFilterIndex === 0 ? selectedFilterIndex : void 0,
            'selected_filter_values': this.jsonCfg.selected_filter_values ? this.jsonCfg.selected_filter_values : void 0,
            'sort_index': sortIndex || sortIndex === 0 ? sortIndex : void 0,
            'sort_order': sortIndex || sortIndex === 0 ? this.jsonCfg.sort_order : void 0
          };
        };
        FilterView.prototype.onPageLoad = function () {
          var requestSearchInput;
          if (localStorage.getItem('popover_hide_lock')) {
            localStorage.removeItem('popover_hide_lock');
          }
          $('body').click(function (e) {
            if ($('.popover').length) {
              if (!localStorage.getItem('popover_hide_lock')) {
                $('th[data-filter-index] > span:first-of-type').each(function () {
                  if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    return $(this).popover('hide');
                  }
                });
              }
              if (!$('.datepicker-dropdown').length) {
                return localStorage.removeItem('popover_hide_lock');
              }
            }
          });
          if ($('#default-search-form').length) {
            requestSearchInput = function (_this) {
              return function () {
                var res;
                if ($('#default-search-form #id_value').val()) {
                  _this.requestView({
                    jsonData: {
                      'selected_filter_index': $('#default-search-form #id_value').data('filter-index'),
                      'selected_filter_values': function () {
                        var _i, _len, _ref, _results;
                        _ref = $('.yourlabs-autocomplete span');
                        _results = [];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                          res = _ref[_i];
                          _results.push($(res).text());
                        }
                        return _results;
                      }()
                    }
                  });
                } else {
                  _this.requestView({
                    jsonData: {
                      'selected_filter_index': null,
                      'selected_filter_values': null
                    }
                  });
                }
                $('#default-search-form #id_value').val('');
                return $('.yourlabs-autocomplete').remove();
              };
            }(this);
            $('#default-search-form').submit(function () {
              requestSearchInput();
              return false;
            });
            $('#default-search-form #submit-search').click(function () {
              return requestSearchInput();
            });
            return $('#default-search-form #id_value').yourlabsAutocomplete().input.bind('selectChoice', function (e, choice, autocomplete) {
              return location.href = Urls[$(this).data('detail-view-name')](choice.attr('data-value'));
            });
          }
        };
        FilterView.prototype.onAjaxLoad = function () {
          var filterIndex;
          filterIndex = this.jsonCfg.selected_filter_index;
          if (filterIndex || filterIndex === 0) {
            return $('th[data-filter-index=\'' + filterIndex + '\']').find('> span:first-of-type').css('text-decoration', 'underline');
          }
        };
        FilterView.prototype.onLoad = function () {
          var popover_node;
          this.Q('.table-sort').click(function (_this) {
            return function (e) {
              var data, sort_order;
              data = { 'sort_index': $(e.currentTarget).parent().data('filter-index') };
              sort_order = $(e.currentTarget).data('sort');
              if (!sort_order || sort_order === 'None') {
                data['sort_order'] = 'asc';
              } else if (sort_order === 'asc') {
                data['sort_order'] = 'desc';
              } else {
                data = {
                  'sort_index': null,
                  'sort_order': null
                };
              }
              return _this.requestView({ jsonData: data });
            };
          }(this));
          popover_node = 'th[data-filter-index] > span:first-of-type';
          $(popover_node).popover({
            title: 'Filter Options <button type="button" class="close" aria-hidden="true">&times;</button>',
            html: true,
            content: '<i>Loading ...</i>',
            placement: 'bottom'
          });
          $(popover_node).on('shown.bs.popover', function (e) {
            return $('.popover-title button').click(function () {
              return $(e.currentTarget).popover('hide');
            });
          });
          return $(popover_node).on('show.bs.popover', function (_this) {
            return function (e) {
              var filterIndex, popover;
              popover = $(e.currentTarget).data('bs.popover');
              filterIndex = parseInt($(e.currentTarget).parent().data('filter-index'));
              return _this.requestSnippet({
                jsonData: {
                  'filter_index': filterIndex,
                  'ignore_selected_values': filterIndex !== _this.jsonCfg.selected_filter_index ? true : void 0
                },
                callback: function (response) {
                  var inputNode, scope;
                  scope = popover.tip().find('.popover-content');
                  $(scope).html(response);
                  $(scope).find('#filter_reset').click(function (e) {
                    return _this.requestView({
                      jsonData: {
                        'selected_filter_index': null,
                        'selected_filter_values': []
                      }
                    });
                  });
                  if ($(scope).find('.input-daterange').length) {
                    inputNode = $(scope).find('.input-daterange input').on('show', function () {
                      return localStorage.setItem('popover_hide_lock', true);
                    });
                    $(inputNode).datepicker({
                      format: 'yyyy-mm-dd',
                      autoclose: true,
                      calendarWeeks: true,
                      todayHighlight: true,
                      todayBtn: true,
                      weekStart: 1
                    });
                    return $(scope).find('#filter_submit').click(function (e) {
                      return _this.requestView({
                        jsonData: {
                          'selected_filter_index': filterIndex,
                          'selected_filter_values': {
                            'min_date': $(scope).find('.input-daterange input:first-of-type').val(),
                            'max_date': $(scope).find('.input-daterange input:last-of-type').val()
                          }
                        }
                      });
                    });
                  } else if ($(scope).find('input[type="radio"]').length) {
                    return $(scope).find('input:radio').change(function (e) {
                      var data, filterValue;
                      filterValue = $(e.currentTarget).val();
                      if (!filterValue || filterValue === 'all') {
                        data = {
                          'selected_filter_index': null,
                          'selected_filter_values': []
                        };
                      } else {
                        data = {
                          'selected_filter_index': filterIndex,
                          'selected_filter_values': filterValue
                        };
                      }
                      return _this.requestView({ jsonData: data });
                    });
                  } else {
                    $(scope).find('#select-all').click(function (e) {
                      return $(scope).find('input[type="checkbox"]').prop('checked', 'checked');
                    });
                    $(scope).find('#deselect-all').click(function (e) {
                      return $(scope).find('input[type="checkbox"]').prop('checked', false);
                    });
                    $(scope).find('input[type=text]').keyup(function (e) {
                      var searchString;
                      if (e.keyCode === 13) {
                        $('#filter_submit').click();
                        return;
                      }
                      searchString = e.currentTarget.value;
                      if (searchString != null ? searchString.length : void 0) {
                        $(scope).find('label.checkbox:containsCaseInsensitive(\'' + searchString + '\')').fadeIn('fast');
                        return $(scope).find('label.checkbox:not(:containsCaseInsensitive(\'' + searchString + '\'))').fadeOut('fast');
                      } else {
                        return $(scope).find('label.checkbox').fadeOut('fast');
                      }
                    });
                    return $(scope).find('#filter_submit').click(function (e) {
                      var data, values_list;
                      values_list = [];
                      $(scope).find('input[type="checkbox"]:checked:visible').each(function () {
                        return values_list.push($(this).val());
                      });
                      if (values_list.length === 0) {
                        data = {
                          'selected_filter_index': null,
                          'selected_filter_values': []
                        };
                      } else {
                        data = {
                          'selected_filter_index': filterIndex,
                          'selected_filter_values': values_list
                        };
                      }
                      return _this.requestView({ jsonData: data });
                    });
                  }
                }
              });
            };
          }(this));
        };
        return FilterView;
      }(View);
    }(cs_view);
  }.call(this));
  function extendjs(_super) {
    var __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
          if (__hasProp.call(parent, key))
            child[key] = parent[key];
        }
        function ctor() {
          this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
      };
    function JsView() {
      return JsView.__super__.constructor.apply(this, arguments);
    }
    __extends(JsView, _super);
    return JsView;
  }
  return {
    App: cs_app,
    View: cs_view,
    FilterView: cs_plugins_filterview,
    extendjs: extendjs
  };
}));
}());