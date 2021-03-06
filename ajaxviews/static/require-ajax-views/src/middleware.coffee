define ->
  middleware =
    onPageLoad: ->
      if @jsonCfg.preview_model_form
        $('<input>').attr({
          type: 'hidden'
          name: 'preview_model_form'
          value: $(@jsonCfg.preview_model_form).formSerialize()
        }).appendTo('form[data-async]')

      $('.url-history-back').click (e) =>
        e.preventDefault()
        history.back()

    onAjaxLoad: ->
      if @scopeName and @scopeName.indexOf('#modal_nr') >= 0
        modalId = @scopeName
#        ajaxData = {}
#        if @jsonCfg.preview_model_form
#          ajaxData['preview_model_form'] = $(@jsonCfg.preview_model_form).formSerialize()
#        if @jsonCfg.preview_stage
#          ajaxData['preview_stage'] = @jsonCfg.preview_stage

        @Q('form[data-async]').ajaxForm
#          data: ajaxData
          beforeSerialize: ($form, options) =>
            @onBeforeFormSerialize($form, options) if @onBeforeFormSerialize?
          beforeSubmit: (arr, $form, options) =>
            @onBeforeFormSubmit(arr, $form, options) if @onBeforeFormSubmit?
          success: (response) =>
            if response.success
              @jsonCache.reload_view = true
              if response.json_cache?
                @jsonCache[key] = value for key, value of response.json_cache
              $(modalId).modal('hide')
            else
              @jsonCfg = @_manager.getJsonCfg(response)
              @_manager.updateModal(modalId, response)
              @_loadAjaxView()

        $(modalId).find('form[data-async]').on 'click', '.popover.confirmation a[data-apply=confirmation]', (e) =>
          e.preventDefault()
          $.get $(e.currentTarget).attr('href'), {}, (response) =>
            if response.success
              @jsonCache.reload_view = true
              if response.json_cache?
                @jsonCache[key] = value for key, value of response.json_cache
              $(modalId).modal('hide')
            else
              throw 'Object deletion failed!'

        $(modalId).on 'hidden.bs.modal', (e) =>
          $(e.currentTarget).remove()

          @viewCache.jsonCache[key] = value for key, value of @jsonCache
          console.log('jsonCache ->', @jsonCache) if @jsonCache.length and @_manager.cfg.debug

          if @jsonCache.auto_select_choice?
            delete @viewCache.jsonCache.auto_select_choice
            select = @jsonCache.auto_select_choice
            if @viewCache.scopeName
              form = $(@viewCache.scopeName).find('form[data-async]')
            else
              form = $('form[data-async]')
            fieldNode = $(form).find("#id_#{select.field}")
            $(fieldNode).append("""<option value="#{select.pk}">#{select.text}</option>""")
            $(fieldNode).val(select.pk).trigger('chosen:updated')
          else if @viewCache.modalNr
            $('body').addClass('modal-open')

            if @jsonCache.reload_view
              subModalId = @viewCache.scopeName
              formNode = $(subModalId).find('form[data-async]')

              if $(formNode).length
                data = $(formNode).formSerialize() + '&form_data=true'
                $.get $(formNode).attr('action'), data, (response) =>
                  @_manager.updateModal(subModalId, response)
                  @viewCache._loadAjaxView()
              else
                $.get @viewCache.jsonCfg.full_url, {}, (response) =>
                  @_manager.updateModal(subModalId, response)
                  @viewCache._loadAjaxView()
          else if @jsonCache.reload_view
            if @jsonCache.ajax_load
              @viewCache.onAjaxLoad() if @viewCache.onAjaxLoad
            else
              @viewCache._initView()

    onLoad: ->
      window.view = @ if @_manager.cfg.debug

      if location.search and location.search.indexOf('next=') < 0
        history.replaceState({}, null, location.href.split('?')[0])

      if @Q('.modal-link').length
        @Q('.modal-link:not(a)').on 'mouseup', (e) ->
          window.open($(this).attr('href')) if e.which == 2

        @Q('.modal-link').click (e) =>
          e.preventDefault()
          @requestModal($(e.currentTarget).attr('href'))

      if @Q('.modal-link-cfg').length
        @Q('.modal-link-cfg').click (e) =>
          e.preventDefault()
          @requestModal($(e.currentTarget).attr('href'), @jsonCfg)

#        @Q('.modal-reload').click (e) =>
#          e.preventDefault()
#          $.get $(e.currentTarget).attr('href'), {'modal_id': modalId}, (response) =>
#            @_manager.initModalCfg(modalId.replace('#', '#reload'), response)
#            @_manager.updateModal(modalId, response)
#            $(modalId).find('form[data-async]').append('<input type="hidden" name="modal_reload" value="true" />')
#            @_manager.initView(scope: modalId)
#
#            # $(modal_id).find('[data-dismiss="modal"]').click (e) =>
#            $(modalId).find('.cancel-btn').click (e) =>
#              e.preventDefault()
#              e.stopPropagation()
#              url = $(modalId).find('form[data-async]').attr('action').replace('edit', 'detail')
#              $.get url, {'modal_reload': true}, (response) =>
#                @_manager.removeModalCfg(modalId.replace('#', '#reload'))
#                @_manager.updateModal(modalId, response)
#                @_manager.initView(scope: modalId)
