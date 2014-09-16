var dadataSuggestions = {
    generateInputHTML: function (id,label) {
        var output = '<p class=\"required text\">';
        output += '<label for=\"'+ id +'\">'+ label +'<sup>*</sup></label>';
        output += '<input type=\"text\" id=\"'+ id +'\" class=\"text\">';
        output += '<span class=\"validity valid_blank\"></span>';
        output += '<span class=\"sample_text ex_blur\">&nbsp;</span>';
        output += '</p>';
        return output;
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
            $('#city').val(suggestion.data.region).change().click();
        } else {
            $('#city').val((suggestion.data.city?suggestion.data.city_type + ' ' + suggestion.data.city:'') +
                (suggestion.data.settlement?' ' + suggestion.data.settlement_type + ' ' + suggestion.data.settlement:'')).change().click();
        }
        $('#id_country').val(dadataSuggestions.getIdFromField('id_country',suggestion.data.country)).change().click();
        $('#address1').val($('#' + id).val()).change().click();
        $('#id_state').val(dadataSuggestions.getIdFromField('id_state',suggestion.data.region)).change().click();
        $('#postcode').val(suggestion.data.postal_code).change().click();
        dadataSuggestions.setValidField(['city','id_country','address1','id_state','postcode'],1);
    },
    resetAddressFields: function () {
        dadataSuggestions.setValidField(['city','id_country','address1','id_state','postcode'],-1);
    },
    validateInputFIO: function (suggestion,id) {
        dadataSuggestions.setValidField(id,(suggestion.data.name && suggestion.data.surname?1:0));
        $('#firstname').val((suggestion.data.name?suggestion.data.name:'') + (suggestion.data.patronymic?' ' + suggestion.data.patronymic:''));
        $('#lastname').val((suggestion.data.surname?suggestion.data.surname:''));
    },
    getIdFromField: function (id, text) {
        return $('#' + id + ' option').filter(function () {return $(this).html().toLowerCase().search(text.toLowerCase())!=-1;}).val();
    },
    toggleAddressFields: function (isEnabled) {
        if (isEnabled) {
            $("#address1").attr("disabled",true);
            $("#city").attr("disabled",true);
            $("#id_state").attr("disabled",true);
            $("#postcode").attr("disabled",true);
            $("#sug-address").removeAttr("disabled");
        } else {
            $("#address1").removeAttr("disabled");
            $("#city").removeAttr("disabled");
            $("#id_state").removeAttr("disabled");
            $("#postcode").removeAttr("disabled");
            $("#sug-address").attr("disabled",true);
        }
        dadataSuggestions.resetAddressFields();
    },
    changeCountryHandler: function(e){
        dadataSuggestions.toggleAddressFields($('#id_country').val()==dadataSuggestions.getIdFromField('id_country','Россия'));
    }

}