
*****
Setup
*****

Installation
============

This package is available on `PyPI <https://pypi.python.org/pypi/django-ajax-views/>`_.

.. code-block:: bash

    $ pip install django-ajax-views

Dependencies
------------

- Django>=1.9
- django-require
- django-crispy-forms
- django-extra-views
- django-js-reverse
- django-jsonify
- django-guardian (optional)
- django-autocomplete-light==2.3.3 (optional)

Django settings
===============

Add :code:`ajaxviews` and dependencies to your :code:`INSTALLED_APPS` setting:

.. code-block:: python

    INSTALLED_APPS = [
        # required
        'ajaxviews',
        'require',
        'jsonify',
        'crispy_forms',
        'django_js_reverse',
        # optional
        'guardian',
        'autocomplete_light',
    ]

Options
-------

django-ajax-views
^^^^^^^^^^^^^^^^^

- :code:`DEFAULT_PAGINATE_BY`

    Default: :code:`30`

    If you use pagination for your *list views* you can override the default value.

- :code:`FILTER_SEARCH_INPUT_BY`

    Default: :code:`10`

    Number of results by which a search input field should be displayed for filter views.

django-require
^^^^^^^^^^^^^^

- :code:`JS_REVERSE_OUTPUT_PATH`

    Default: :code:`'static/django_js_reverse/'`

    Output path of the :code:`reverse.js` file which is generated by Django management
    command :code:`collectstatic_js_reverse`.

Configure RequireJS
===================

.. code-block:: javascript
   :caption: main.js
   :name: requirejs main file
   :linenos:

    (function () {

      require.config({
        paths: {
          'cs': '/path/to/require-cs/cs',
          'coffee-script': '/path/to/coffeescript/extras/coffee-script',
          ajaxviews: '/path/to/require-ajax-views/dist/ajaxviews',
          domReady: '/path/to/domReady/domReady',
          jquery: '/path/to/jquery/dist/jquery',
          bootstrap: '/path/to/bootstrap/dist/js/bootstrap.min',
          urlreverse: '/path/to/django_js_reverse/reverse'
        }
      });

      require(['domReady!', 'ajaxviews'], function (ajaxviews) {
        var App = ajaxviews.App;

        App.config({
          middleware: 'middleware'
        });

        App.init();
      });

    })();

..
    Develop Settings
    ----------------

    - :code:`REQUIRE_BUILD_PROFILE`

        Default: :code:`False`

    - :code:`REQUIRE_STANDALONE_MODULES`

        Default: .. code-block:: python
            'main': {
                'out': '{}.main-built.js'.format(STATIC_JS_HASH),
                'build_profile': '../../main.build.js',
            }


    Production Settings
    -------------------