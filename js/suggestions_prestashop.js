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
        if (valid) {
            $('#'+id).addClass('ok_field');
            $('#'+id+' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');

        }

    },
    validateInputAddress: function (suggestion,id) {
        if (suggestion.data.house) {
            $('#' + id).addClass('ok_field').removeClass('error_field');
            $('#' + id + ' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        } else {
            $('#' + id).removeClass('ok_field').addClass('error_field');
            $('#' + id + ' ~ .validity').removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
        }
        $('#postcode').val(suggestion.data.postal_code).change();
        if (!suggestion.data.city && !suggestion.data.settlement){
            $('#city').val(suggestion.data.region).change();
        } else {
            $('#city').val((suggestion.data.city?suggestion.data.city_type + ' ' + suggestion.data.city:'') +
                (suggestion.data.settlement?' ' + suggestion.data.settlement_type + ' ' + suggestion.data.settlement:'')).change();
        }
        $('#id_country').val(this.getIdFromField('id_country',suggestion.data.country)).change();
        $('#address1').val($('#' + id).val()).change();
        $('#id_state').val(this.getIdFromField('id_state',suggestion.date.region)).change();
        console.log(suggestion.data);

    },
    validateInputFIO: function (suggestion,id) {
        if (suggestion.data.name && suggestion.data.surname) {
            $('#' + id).addClass('ok_field').removeClass('error_field');
            $('#' + id + ' ~ .validity').addClass('valid_ok').removeClass('valid_blank').removeClass('valid_nok');
        } else {
            $('#' + id).removeClass('ok_field').addClass('error_field');
            $('#' + id + ' ~ .validity').removeClass('valid_ok').removeClass('valid_blank').addClass('valid_nok');
        }
        $('#firstname').val((suggestion.data.name?suggestion.data.name:'') + (suggestion.data.patronymic?' ' + suggestion.data.patronymic:''));
        $('#lastname').val((suggestion.data.surname?suggestion.data.surname:''));
    },
    getIdFromField: function (id, text) {
        return $('#' + id + ' option').filter(function () {return $(this).html().toLowerCase().search(text.toLowerCase())!=-1;}).val();
    }

}