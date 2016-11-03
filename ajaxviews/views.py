import types

from django.forms.models import BaseModelFormSet
from django.http import HttpResponseRedirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

from .conf import settings
from .forms import DefaultFormHelper
from .plugins import PluginAdapter, AjaxPlugin, ListPlugin, DetailPlugin, FormPlugin, PreviewFormPlugin,\
    FormSetPlugin, DeletePlugin, CreateForm, UpdateForm


class ModelFormSet(BaseModelFormSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if len(self.forms) > 0:
            self.form_action = self.forms[0].helper.form_action
            self.render_form_actions = self.forms[0].render_form_actions()
            self.helper.layout = self.forms[0].helper.layout
            self.form = self.forms[0]

try:
    from extra_views import ModelFormSetView
except ImportError:
    ModelFormSetView = type('', (), {})
else:
    def get_form_kwargs(self):
        return {}
    # ModelFormSetView.get_form_kwargs = types.MethodType(lambda self: {}, ModelFormSetView)
    ModelFormSetView.get_form_kwargs = types.MethodType(get_form_kwargs, ModelFormSetView)
    ModelFormSetView.formset_class = ModelFormSet


class ViewFactory:
    _plugins = {
        'base': AjaxPlugin,
        'list': ListPlugin,
        'detail': DetailPlugin,
        'form': FormPlugin,
        'formset': FormSetPlugin,
        'formpreview': PreviewFormPlugin,
        'delete': DeletePlugin,
    }
    _extras = {
        'create': CreateForm,
        'update': UpdateForm,
        'preview': None,
    }

    def __init__(self, *args):
        self.name = 'base'
        self.extra_names = []
        if len(args) == 1:
            if args[0] not in self._plugins:
                raise LookupError('Plugin {} not supported!'.format(args[0]))
            self.name = args[0]
        elif len(args) > 1:
            for extra in args[1:]:
                if extra not in self._extras:
                    raise LookupError('Extension plugin {} not supported!'.format(extra))
            self.name = args[0]
            self.extra_names = args[1:]

    def create(self, view, super_call, **kwargs):
        instance = self._plugins[self.name](view, **kwargs)
        instance.super = super_call
        control_list = []
        for name in self.extra_names:
            extra = self._extras[name]()
            extra.plugin = instance
            extra.view = view
            extra.super = super_call
            control_list.append(extra)
        instance.extra = PluginAdapter(control_list)
        return instance


class GenericBaseView:
    """
    This is the core mixin that's used for all views to establish communication with the client side :class:`App`.

    It merges the optional URL parameters from the GET request with the keyword arguments retrieved from
    Django's URL conf into ``json_cfg``.

    :ivar bool ajax_view: Set to True if you have created a client side module associated with the view
        class that's inheriting from this mixin.
    :ivar dict json_cfg: Data parsed from incoming requests and returned in each response.
    """
    ajax_view = False

    def __init__(self, *args, **kwargs):
        self.json_cfg = {}
        self.ajax_view = kwargs.pop('ajax_view', self.ajax_view)
        if hasattr(self, 'plugin'):
            self._plugin = self.plugin.create(self, super(), **kwargs)
        else:
            self._plugin = ViewFactory().create(self, super(), **kwargs)
        if self._plugin.view_kwargs:
            kwargs.update(self._plugin.view_kwargs)
        super().__init__(*args, **kwargs)

    def dispatch(self, request, *args, **kwargs):
        self._plugin.dispatch(request, *args, **kwargs)
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        return self._plugin.get_context_data(context)


# noinspection PyUnresolvedReferences
class AjaxListView(GenericBaseView, ListView):
    """
    The ListView can be updated by calling :func:`View.requestView` from client side view class.

    :ivar int paginate_by: number of results in list by which to paginate.
    :ivar int filter_search_input_by: number of results in list view filters by which to display a search input.
    """
    plugin = ViewFactory('list')

    def get(self, request, *args, **kwargs):
        """
        Called for all GET requests

        :param request: request object
        :param args: positional url arguments
        :param kwargs: keyword url arguments
        """
        response = self._plugin.get(request, *args, **kwargs)
        return response or super().get(request, *args, **kwargs)

    def get_queryset(self, **kwargs):
        return self._plugin.get_queryset(**kwargs)


# noinspection PyUnresolvedReferences
class AjaxDetailView(GenericBaseView, DetailView):
    plugin = ViewFactory('detail')

    def get_queryset(self, **kwargs):
        return self._plugin.get_queryset(**kwargs)


# noinspection PyUnresolvedReferences
class BaseFormView(GenericBaseView):
    template_name = 'ajaxviews/generic_form.html'
    success_message = ''
    auto_delete_url = settings.AUTO_DELETE_URL

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self._plugin.post(request, *args, **kwargs)

    def get_form_kwargs(self, **kwargs):
        kwargs = super().get_form_kwargs(**kwargs)
        return self._plugin.get_form_kwargs(kwargs)

    def form_valid(self, form):
        return self._plugin.form_valid(form)

    def form_invalid(self, form):
        return self._plugin.form_invalid(form)

    def get_success_url(self):
        return self._plugin.get_success_url()

    def get_template_names(self):
        return self._plugin.get_template_names()


# noinspection PyUnresolvedReferences
class BaseFormSetView(GenericBaseView):
    template_name = 'ajaxviews/generic_form.html'
    success_message = ''
    auto_delete_url = False

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    # def post(self, request, *args, **kwargs):
    #     return self._plugin.post(request, *args, **kwargs)

    # def get_template_names(self):
    #     return self._plugin.get_template_names()

    # def get(self, request, *args, **kwargs):
    #     formset = self.construct_formset()
    #     return self.render_to_response(
    #         self.get_context_data(formset=formset),
    #         context=RequestContext(request),
    #     )

    def get_extra_form_kwargs(self):
        kwargs = super().get_extra_form_kwargs()
        kwargs.update(self.get_form_kwargs())
        return self._plugin.get_form_kwargs(kwargs)

    def get_formset(self):
        formset = super().get_formset()
        print('>>>', formset.form)
        formset.helper = DefaultFormHelper()
        formset.helper.form_tag = False
        return formset

    def formset_valid(self, formset):
        self._plugin.formset_valid(formset)
        return super().formset_valid(formset)

    # def formset_invalid(self, formset):
    #     return self.render_to_response(
    #         self.get_context_data(formset=formset),
    #         context=RequestContext(request),
    #     )

    def get_success_url(self):
        return self._plugin.get_success_url()

    # def render_to_response(self, context, **kwargs):
    #     pass


class CreateFormView(BaseFormView, CreateView):
    plugin = ViewFactory('form', 'create')

    # def __init__(self, **kwargs):
    #     form_class = kwargs.get('form_class') or getattr(self, 'form_class', None)
    #     if form_class and hasattr(form_class.Meta, 'success_url'):
    #         kwargs['success_url'] = getattr(form_class.Meta, 'success_url')
    #     super().__init__(**kwargs)


class UpdateFormView(BaseFormView, UpdateView):
    plugin = ViewFactory('form', 'update')


# noinspection PyUnresolvedReferences
class CreateFormSetView(BaseFormSetView, ModelFormSetView):
    plugin = ViewFactory('formset', 'create')


class UpdateFormSetView(BaseFormSetView, ModelFormSetView):
    plugin = ViewFactory('formset', 'update')


class PreviewCreateView(BaseFormView, CreateView):
    plugin = ViewFactory('formpreview', 'create')

    def get_form_class(self):
        return self._plugin.get_form_class()

    def process_preview(self, form):
        pass

    def done(self, form):
        self.object = form.save()
        return HttpResponseRedirect(self.get_success_url())


class PreviewUpdateView(BaseFormView, UpdateView):
    plugin = ViewFactory('formpreview', 'update')

    def get_form_class(self):
        return self._plugin.get_form_class()

    def process_preview(self, form):
        pass

    def done(self, form):
        self.object = form.save()
        return HttpResponseRedirect(self.get_success_url())


# noinspection PyUnresolvedReferences
class DeleteFormView(GenericBaseView, DeleteView):
    plugin = ViewFactory('delete')

    def get(self, request, *args, **kwargs):
        return self._plugin.get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        return self._plugin.post(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        return self._plugin.delete(request, *args, **kwargs)

    def get_success_url(self):
        return self._plugin.get_success_url()


class PreviewDeleteView(BaseFormView, DeleteView):
    plugin = ViewFactory('delete', 'preview')
