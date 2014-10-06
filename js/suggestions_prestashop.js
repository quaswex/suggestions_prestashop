var dadataSuggestions = {
    configuration: {
        suggest_fio_field: 'sug-fio',
        suggest_address_field: 'sug-address',
        suggest_fio_label: 'Full Name',
        suggest_address_label: 'Full Address',
        DADATA_SUGGESTIONS_URL: '',
        DADATA_SUGGESTIONS_TOKEN: '',
        DADATA_SUGGESTIONS_TRIG_SEL_SPC: true,
        DADATA_SUGGESTIONS_COUNT: 10,
        DADATA_SUGGESTIONS_REGION_FIELD: 'id_state',
        DADATA_SUGGESTIONS_FIO: true,
        DADATA_SUGGESTIONS_ADDRESS: true
    },
    beforeSubmit: function (e) {
        var self = this;
        e.preventDefault();

        $("#"+dadataSuggestions.fieldMap.full_addr).removeAttr("disabled");
        $("#"+dadataSuggestions.fieldMap.city).removeAttr("disabled");
        $("#"+dadataSuggestions.fieldMap.region).removeAttr("disabled");
        $("#"+dadataSuggestions.fieldMap.postcode).removeAttr("disabled");
        $("#" + dadataSuggestions.fieldMap.name).parent().removeAttr("style");
        $("#" + dadataSuggestions.fieldMap.surname).parent().removeAttr("style");
        self.submit();
        return false; //is superfluous, but I put it here as a fallback

    },
    init: function () {
        var form_names = ['new_account_form','add_address'];
        form_names.forEach(function (value,index,a) {
            if ($("#"+value).length)  {
                $("#" + value).submit(dadataSuggestions.beforeSubmit);
                var subName = $("#" + value + " > input[type='submit']").attr("name");
                var subVal = $("#" + value + " > input[type='submit']").val();
                $("#" + value + " > fieldset").append('<input type="hidden" value="'+subVal+'" name="'+subName+'"></input>');
            }
        });
        if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_FIO && $("#"+dadataSuggestions.fieldMap.customer_name).length) {
            $("#" + dadataSuggestions.fieldMap.customer_name).parent().before(dadataSuggestions.generateInputHTML(dadataSuggestions.configuration.suggest_fio_field, dadataSuggestions.configuration.suggest_fio_label));
            $("#" + dadataSuggestions.fieldMap.customer_name).parent().attr("style", "display: none !important");
            $("#" + dadataSuggestions.fieldMap.customer_surname).parent().attr("style", "display: none !important");
            $("#" + dadataSuggestions.configuration.suggest_fio_field).suggestions({
                serviceUrl: dadataSuggestions.configuration.DADATA_SUGGESTIONS_URL,
                token: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TOKEN,
                triggerSelectOnSpace: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TRIG_SEL_SPC,
                count: dadataSuggestions.configuration.DADATA_SUGGESTIONS_COUNT,
                type: "NAME",
                onSelect: function (suggestion) {
                    dadataSuggestions.validateInputCustomerFIO(suggestion, dadataSuggestions.configuration.suggest_fio_field);
                }
            });
        }
        if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_FIO && $("#"+dadataSuggestions.fieldMap.name).length) {
            $("#" + dadataSuggestions.fieldMap.name).parent().before(dadataSuggestions.generateInputHTML(dadataSuggestions.configuration.suggest_fio_field, dadataSuggestions.configuration.suggest_fio_label));
            $("#" + dadataSuggestions.fieldMap.name).parent().attr("style", "display: none !important");
            $("#" + dadataSuggestions.fieldMap.surname).parent().attr("style", "display: none !important");
            $("#" + dadataSuggestions.configuration.suggest_fio_field).suggestions({
                serviceUrl: dadataSuggestions.configuration.DADATA_SUGGESTIONS_URL,
                token: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TOKEN,
                triggerSelectOnSpace: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TRIG_SEL_SPC,
                count: dadataSuggestions.configuration.DADATA_SUGGESTIONS_COUNT,
                type: "NAME",
                onSelect: function (suggestion) {
                    dadataSuggestions.validateInputFIO(suggestion, dadataSuggestions.configuration.suggest_fio_field);
                }
            });
        }
        if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_ADDRESS && $("#"+dadataSuggestions.fieldMap.full_addr).length) {
            $("#" + dadataSuggestions.fieldMap.full_addr).parent().before(dadataSuggestions.generateInputHTML(dadataSuggestions.configuration.suggest_address_field, dadataSuggestions.configuration.suggest_address_label));
            if (dadataSuggestions.configuration.DADATA_SUGGESTIONS_REGION_FIELD == 'id_state') {
                $("#" + dadataSuggestions.fieldMap.country).change(dadataSuggestions.changeCountryHandler).change();
            } else {
                delete dadataSuggestions.fieldMap.country;
                dadataSuggestions.fieldMap.region = dadataSuggestions.configuration.DADATA_SUGGESTIONS_REGION_FIELD;
            }
            $("#" + dadataSuggestions.configuration.suggest_address_field).suggestions({
                serviceUrl: dadataSuggestions.configuration.DADATA_SUGGESTIONS_URL,
                token: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TOKEN,
                triggerSelectOnSpace: dadataSuggestions.configuration.DADATA_SUGGESTIONS_TRIG_SEL_SPC,
                count: dadataSuggestions.configuration.DADATA_SUGGESTIONS_COUNT,
                type: "ADDRESS",
                onSelect: function (suggestion) {
                    dadataSuggestions.validateInputAddress(suggestion, dadataSuggestions.configuration.suggest_address_field);
                }
            });
        }
    },
    generateInputHTML: function (id,label) {
        var output = '<p class=\"required text\">';
        output += '<label for=\"'+ id +'\">'+ label +'<sup>*</sup></label>';
        output += '<input type=\"text\" id=\"'+ id +'\" class=\"text\">';
        output += '<span class=\"validity valid_blank\"></span>';
        output += '<span class=\"sample_text ex_blur\">&nbsp;</span>';
        output += '</p>';
        return output;
    },
    fieldMap: {
        'country':'id_country',
        'city':'city',
        'region':'id_state',
        'full_addr':'address1',
        'postcode':'postcode',
        'name':'firstname',
        'surname':'lastname',
        'customer_name':'customer_firstname',
        'customer_surname':'customer_lastname'
    },
    setValidField: function (id,valid) {
        if (id instanceof Array){
            id.map(function (data,index,array) {dadataSuggestions.setValidField(data,this);return data;},valid);
        } else {
            var el1 = $('#' + id);
            var el2 = $('#' + id + ' ~ .validity');
            switch (valid) {
                case 1:
                    el1.addClass('ok_field').removeClass('error_field');
                    el2.addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
                    break;
                case 0:
                    el1.removeClass('ok_field').addClass('error_field');
                    el2.removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
                    break;
                default:
                    el1.removeClass('ok_field').removeClass('error_field');
                    el2.removeClass('valid_ok').addClass('valid_blank').removeClass('valid_nok');
                    break;
            }
        }

    },
    validateInputAddress: function (suggestion,id) {
        dadataSuggestions.setValidField(id,(suggestion.data.house?1:0));
        if (!suggestion.data.city && !suggestion.data.settlement){
            $('#'+dadataSuggestions.fieldMap.city).val(suggestion.data.region).change().click();
        } else {
            $('#'+dadataSuggestions.fieldMap.city).val((suggestion.data.city?suggestion.data.city_type + ' ' + suggestion.data.city:'') +
                (suggestion.data.settlement?' ' + suggestion.data.settlement_type + ' ' + suggestion.data.settlement:'')).change().click();
        }
        if (dadataSuggestions.fieldMap.country) $('#'+dadataSuggestions.fieldMap.country).val(dadataSuggestions.getIdFromField(dadataSuggestions.fieldMap.country,suggestion.data.country)).change().click();
        $('#'+dadataSuggestions.fieldMap.full_addr).val($('#' + id).val()).change().click();
        $('#'+dadataSuggestions.fieldMap.region).val(dadataSuggestions.getIdFromField(dadataSuggestions.fieldMap.region,suggestion.data.region)).change().click();
        $('#'+dadataSuggestions.fieldMap.postcode).val(suggestion.data.postal_code).change().click().blur();
        dadataSuggestions.setValidField([dadataSuggestions.fieldMap.city,dadataSuggestions.fieldMap.country,dadataSuggestions.fieldMap.full_addr,dadataSuggestions.fieldMap.region,dadataSuggestions.fieldMap.postcode],1);
    },
    resetAddressFields: function () {
        dadataSuggestions.setValidField([dadataSuggestions.fieldMap.city,dadataSuggestions.fieldMap.country,dadataSuggestions.fieldMap.full_addr,dadataSuggestions.fieldMap.region,dadataSuggestions.fieldMap.postcode],-1);
    },
    validateInputCustomerFIO: function (suggestion,id) {
        dadataSuggestions.setValidField(id,(suggestion.data.name && suggestion.data.surname?1:0));
        $('#'+dadataSuggestions.fieldMap.customer_name).val((suggestion.data.name?suggestion.data.name:'') + (suggestion.data.patronymic?' ' + suggestion.data.patronymic:'')).blur();
        $('#'+dadataSuggestions.fieldMap.customer_surname).val((suggestion.data.surname?suggestion.data.surname:'')).blur();
    },
    validateInputFIO: function (suggestion,id) {
        dadataSuggestions.setValidField(id,(suggestion.data.name && suggestion.data.surname?1:0));
        $('#'+dadataSuggestions.fieldMap.name).val((suggestion.data.name?suggestion.data.name:'') + (suggestion.data.patronymic?' ' + suggestion.data.patronymic:'')).blur();
        $('#'+dadataSuggestions.fieldMap.surname).val((suggestion.data.surname?suggestion.data.surname:'')).blur();
    },
    getIdFromField: function (id, text) {
        return $('#' + id + ' option').filter(function () {return $(this).html().toLowerCase().search(text.toLowerCase())!=-1;}).val();
    },
    toggleAddressFields: function (isEnabled) {
        if (isEnabled) {
            $("#"+dadataSuggestions.fieldMap.full_addr).attr("disabled",true);
            $("#"+dadataSuggestions.fieldMap.city).attr("disabled",true);
            $("#"+dadataSuggestions.fieldMap.region).attr("disabled",true);
            $("#"+dadataSuggestions.fieldMap.postcode).attr("disabled",true);
            $("#sug-address").removeAttr("disabled");
        } else {
            $("#"+dadataSuggestions.fieldMap.full_addr).removeAttr("disabled");
            $("#"+dadataSuggestions.fieldMap.city).removeAttr("disabled");
            $("#"+dadataSuggestions.fieldMap.region).removeAttr("disabled");
            $("#"+dadataSuggestions.fieldMap.postcode).removeAttr("disabled");
            $("#sug-address").attr("disabled",true);
        }
        dadataSuggestions.resetAddressFields();
    },
    changeCountryHandler: function(e){
        if (dadataSuggestions.fieldMap.country)
        dadataSuggestions.toggleAddressFields($('#'+dadataSuggestions.fieldMap.country).val()==dadataSuggestions.getIdFromField(dadataSuggestions.fieldMap.country,'Россия'));
        else
        dadataSuggestions.toggleAddressFields(true);
    }

}